import { createHash } from 'node:crypto'
import { isIP } from 'node:net'
import { Ratelimit } from '@upstash/ratelimit'
import { Redis } from '@upstash/redis'
import { gateway } from '@ai-sdk/gateway'
import {
  convertToModelMessages,
  safeValidateUIMessages,
  streamText,
} from 'ai'

const MAX_REQUEST_BYTES = 32 * 1024
const MAX_MESSAGES = 20
const MAX_INPUT_CHARACTERS = 12_000
const DEFAULT_MODEL = 'google/gemini-2.5-flash-lite'
const DEFAULT_SYSTEM_PROMPT =
  'You are an assistant for a personal portfolio. The owner reports customer service experience with Comcast and Xfinity, an undergraduate Mechanical Engineering background, and AI development and automation skills. Only state details present in this instruction or the additional portfolio context. Never invent work history, dates, titles, qualifications, certifications, projects, services, pricing, or availability. If asked for information not provided, say it is not available yet and suggest contacting the owner.'

class PayloadTooLargeError extends Error {}

let chatRateLimiter: Ratelimit | undefined

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

function getChatRateLimiter(): Ratelimit | undefined {
  const url = process.env.UPSTASH_REDIS_REST_URL?.trim()
  const token = process.env.UPSTASH_REDIS_REST_TOKEN?.trim()
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
  const visitorIp = request.headers.get('x-real-ip')
  if (!visitorIp || !isIP(visitorIp)) {
    return jsonError(503, 'Request protection is temporarily unavailable.')
  }

  try {
    const limiter = getChatRateLimiter()
    if (!limiter) {
      return jsonError(503, 'Request protection is not configured.')
    }

    const identifier = createHash('sha256').update(visitorIp).digest('hex')
    const result = await limiter.limit(identifier)
    if (result.reason === 'timeout') {
      return jsonError(503, 'Request protection is temporarily unavailable.')
    }

    if (!result.success) {
      const retryAfter = Math.max(1, Math.ceil((result.reset - Date.now()) / 1000))
      return jsonError(429, 'Too many chat requests. Please try again later.', {
        'Retry-After': String(retryAfter),
      })
    }
  } catch {
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

  if (!process.env.AI_GATEWAY_API_KEY?.trim()) {
    return jsonError(503, 'The chat service is not configured yet.')
  }

  try {
    const modelMessages = await convertToModelMessages(messages)
    const result = streamText({
      model: gateway(process.env.AI_MODEL?.trim() || DEFAULT_MODEL),
      system: `${DEFAULT_SYSTEM_PROMPT}\n\nAdditional portfolio context and instructions:\n${process.env.CHATBOT_SYSTEM_PROMPT?.trim() || 'No additional portfolio context has been configured.'}`,
      messages: modelMessages,
      maxOutputTokens: 512,
      abortSignal: request.signal,
    })

    return result.toUIMessageStreamResponse({
      onError: () => 'The AI service is temporarily unavailable. Please try again later.',
    })
  } catch {
    if (request.signal.aborted) {
      return new Response(null, { status: 499 })
    }
    return jsonError(502, 'The AI service is temporarily unavailable.')
  }
}

export default { fetch: handler }
