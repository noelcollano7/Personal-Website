import { createHash } from 'node:crypto'
import { isIP } from 'node:net'
import { Ratelimit } from '@upstash/ratelimit'
import { Redis } from '@upstash/redis'
import { google } from '@ai-sdk/google'
import {
  convertToModelMessages,
  safeValidateUIMessages,
  streamText,
} from 'ai'

const MAX_REQUEST_BYTES = 32 * 1024
const MAX_MESSAGES = 20
const MAX_INPUT_CHARACTERS = 12_000
const DEFAULT_MODEL = 'gemini-3.5-flash-lite'
const DEFAULT_SYSTEM_PROMPT =
  'You are an assistant for a personal portfolio. The owner reports customer service experience with Comcast and Xfinity, an undergraduate Mechanical Engineering background, and AI development and automation skills. Only state details present in this instruction or the additional portfolio context. Never invent work history, dates, titles, qualifications, certifications, projects, services, pricing, or availability. If asked for information not provided, say it is not available yet and suggest contacting the owner.'

class PayloadTooLargeError extends Error {}

let chatRateLimiter: Ratelimit | undefined

function sanitizeDiagnosticText(value: string): string {
  return value
    .replace(/[\r\n\t]+/g, ' ')
    .replace(/https?:\/\/[^\s"'<>]+/gi, '[redacted-url]')
    .replace(/\b(bearer|basic)\s+[^\s,;]+/gi, '$1 [redacted]')
    .replace(
      /\b(authorization|x-api-key|api[_-]?key|token|secret|password|credential)\b\s*[:=]\s*["']?[^,\s;"']+/gi,
      '$1=[redacted]',
    )
    .replace(/\b(?:\d{1,3}\.){3}\d{1,3}\b/g, '[redacted-ip]')
    .replace(/\b(?:[a-f\d]{0,4}:){2,}[a-f\d:.]{0,}\b/gi, '[redacted-ip]')
    .replace(/\b[a-z\d_~+/=-]{32,}\b/gi, '[redacted-value]')
    .slice(0, 240)
}

function logDiagnostic(stage: string, error: unknown): void {
  const errorName = error instanceof Error ? error.name : 'UnknownError'
  const errorMessage =
    error instanceof Error ? error.message : 'A non-Error value was thrown.'

  console.error(`[api/chat] ${stage}`, {
    errorName: sanitizeDiagnosticText(errorName),
    errorMessage: sanitizeDiagnosticText(errorMessage),
  })
}

function getErrorStatus(error: unknown): number | undefined {
  if (typeof error !== 'object' || error === null) return undefined

  if ('statusCode' in error && typeof error.statusCode === 'number') {
    return error.statusCode
  }
  if ('status' in error && typeof error.status === 'number') {
    return error.status
  }
  return undefined
}

function logAiError(error: unknown): void {
  const status = getErrorStatus(error)
  const stage =
    status === 401 || status === 403
      ? 'google_gemini_authentication_or_permission_error'
      : status === 429
        ? 'google_gemini_rate_limit_or_quota_error'
        : status === 404
          ? 'google_gemini_model_unavailable_or_not_found'
        : 'google_gemini_provider_error'
  const errorName = error instanceof Error ? error.name : 'UnknownError'

  console.error(`[api/chat] ${stage}`, {
    errorName: sanitizeDiagnosticText(errorName),
    ...(status === undefined ? {} : { providerStatus: status }),
  })
}

function jsonError(
  status: number,
  message: string,
  headers?: HeadersInit,
): Response {
  return Response.json({ error: message }, { status, headers })
}

async function readJsonBody(request: Request): Promise<unknown> {
  const contentLength = request.headers.get('content-length')
  if (contentLength && Number(contentLength) > MAX_REQUEST_BYTES) {
    throw new PayloadTooLargeError()
  }

  const reader = request.body?.getReader()
  if (!reader) {
    throw new SyntaxError('Request body is empty.')
  }

  const chunks: Uint8Array[] = []
  let totalBytes = 0
  try {
    while (true) {
      const { done, value } = await reader.read()
      if (done) break
      if (totalBytes + value.byteLength > MAX_REQUEST_BYTES) {
        await reader.cancel()
        throw new PayloadTooLargeError()
      }
      chunks.push(value)
      totalBytes += value.byteLength
    }
  } finally {
    reader.releaseLock()
  }

  const bytes = new Uint8Array(totalBytes)
  let offset = 0
  for (const chunk of chunks) {
    bytes.set(chunk, offset)
    offset += chunk.byteLength
  }
  return JSON.parse(new TextDecoder('utf-8', { fatal: true }).decode(bytes)) as unknown
}

function getChatRateLimiter(
  url: string | undefined,
  token: string | undefined,
): Ratelimit | undefined {
  if (!url || !token) return undefined

  if (!chatRateLimiter) {
    chatRateLimiter = new Ratelimit({
      redis: new Redis({ url, token }),
      limiter: Ratelimit.slidingWindow(10, '10 m'),
      prefix: 'personal-website:chat',
      ephemeralCache: false,
      timeout: 5_000,
    })
  }

  return chatRateLimiter
}

async function rateLimitResponse(request: Request): Promise<Response | undefined> {
  const redisUrl = process.env.UPSTASH_REDIS_REST_URL?.trim()
  const redisToken = process.env.UPSTASH_REDIS_REST_TOKEN?.trim()
  console.info('[api/chat] Upstash configuration', {
    redisUrlConfigured: Boolean(redisUrl),
    redisTokenConfigured: Boolean(redisToken),
  })

  const visitorIp = request.headers.get('x-real-ip')
  if (!visitorIp || !isIP(visitorIp)) {
    logDiagnostic(
      'trusted_client_ip_unavailable',
      new Error('A valid trusted client IP was not provided.'),
    )
    return jsonError(503, 'Request protection is temporarily unavailable.')
  }

  try {
    const limiter = getChatRateLimiter(redisUrl, redisToken)
    if (!limiter) {
      logDiagnostic(
        'upstash_configuration_missing',
        new Error('Upstash Redis REST credentials are not configured.'),
      )
      return jsonError(503, 'Request protection is not configured.')
    }

    const identifier = createHash('sha256').update(visitorIp).digest('hex')
    const result = await limiter.limit(identifier)
    if (result.reason === 'timeout') {
      logDiagnostic(
        'upstash_rate_limit_timeout',
        new Error('The Upstash rate-limit request timed out.'),
      )
      return jsonError(503, 'Request protection is temporarily unavailable.')
    }

    if (!result.success) {
      const retryAfter = Math.max(1, Math.ceil((result.reset - Date.now()) / 1000))
      return jsonError(429, 'Too many chat requests. Please try again later.', {
        'Retry-After': String(retryAfter),
      })
    }
  } catch (error) {
    logDiagnostic('upstash_connection_or_rate_limit_error', error)
    return jsonError(503, 'Request protection is temporarily unavailable.')
  }
}

async function handler(request: Request): Promise<Response> {
  if (request.method !== 'POST') {
    return new Response('Method not allowed', {
      status: 405,
      headers: { Allow: 'POST' },
    })
  }

  if (request.signal.aborted) {
    return new Response(null, { status: 499 })
  }

  const rateLimitError = await rateLimitResponse(request)
  if (rateLimitError) return rateLimitError

  const contentType = request.headers.get('content-type')?.split(';', 1)[0].trim()
  if (contentType !== 'application/json') {
    return jsonError(415, 'Content-Type must be application/json.')
  }

  let body: unknown
  try {
    body = await readJsonBody(request)
  } catch (error) {
    if (request.signal.aborted) {
      return new Response(null, { status: 499 })
    }
    if (error instanceof PayloadTooLargeError) {
      return jsonError(413, 'Request body is too large.')
    }
    if (error instanceof SyntaxError || error instanceof TypeError) {
      return jsonError(400, 'Request body must contain valid JSON.')
    }
    return jsonError(400, 'Unable to read request body.')
  }

  if (
    typeof body !== 'object' ||
    body === null ||
    !('messages' in body) ||
    !Array.isArray(body.messages) ||
    body.messages.length === 0 ||
    body.messages.length > MAX_MESSAGES
  ) {
    return jsonError(
      400,
      `messages must contain between 1 and ${MAX_MESSAGES} conversation messages.`,
    )
  }

  const validation = await safeValidateUIMessages({ messages: body.messages })
  if (!validation.success) {
    return jsonError(400, 'Conversation messages are invalid.')
  }

  const messages = validation.data
  let inputCharacters = 0
  for (const message of messages) {
    if (
      message.role === 'system' ||
      message.parts.length === 0 ||
      message.parts.some(
        (part) => part.type !== 'text' || part.text.trim().length === 0,
      )
    ) {
      return jsonError(400, 'Only non-empty user and assistant text messages are supported.')
    }

    inputCharacters += message.parts.reduce(
      (total, part) => total + (part.type === 'text' ? part.text.length : 0),
      0,
    )
    if (inputCharacters > MAX_INPUT_CHARACTERS) {
      return jsonError(413, 'Conversation text is too large.')
    }
  }

  if (messages[messages.length - 1]?.role !== 'user') {
    return jsonError(400, 'The latest conversation message must be from the user.')
  }

  const googleApiKeyConfigured = Boolean(
    process.env.GOOGLE_GENERATIVE_AI_API_KEY?.trim(),
  )
  if (!googleApiKeyConfigured) {
    console.error('[api/chat] Google Gemini configuration', {
      googleApiKeyConfigured,
    })
    return jsonError(503, 'The chat service is not configured yet.')
  }

  try {
    const modelMessages = await convertToModelMessages(messages)
    const result = streamText({
      model: google(process.env.AI_MODEL?.trim() || DEFAULT_MODEL),
      system: `${DEFAULT_SYSTEM_PROMPT}\n\nAdditional portfolio context and instructions:\n${process.env.CHATBOT_SYSTEM_PROMPT?.trim() || 'No additional portfolio context has been configured.'}`,
      messages: modelMessages,
      maxOutputTokens: 512,
      abortSignal: request.signal,
      onError: ({ error }) => logAiError(error),
    })

    return result.toUIMessageStreamResponse({
      onError: () => 'The AI service is temporarily unavailable. Please try again later.',
    })
  } catch (error) {
    if (request.signal.aborted) {
      return new Response(null, { status: 499 })
    }
    logAiError(error)
    return jsonError(502, 'The AI service is temporarily unavailable.')
  }
}

export default { fetch: handler }
