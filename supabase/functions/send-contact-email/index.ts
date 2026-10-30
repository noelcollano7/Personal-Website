import { createClient } from 'npm:@supabase/supabase-js@2'

const allowedOrigins = (Deno.env.get('CONTACT_ALLOWED_ORIGINS') ?? '')
  .split(',')
  .map((origin) => origin.trim())
  .filter(Boolean)

const corsHeaders = (origin: string) => ({
  'Access-Control-Allow-Origin': origin,
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  Vary: 'Origin',
})

const jsonResponse = (status: number, body: Record<string, unknown>, origin: string) =>
  new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders(origin), 'Content-Type': 'application/json' },
  })

const isValidEmail = (email: string) =>
  email.length <= 254 && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)

Deno.serve(async (request) => {
  const origin = request.headers.get('origin') ?? ''
  if (!origin || !allowedOrigins.includes(origin)) {
    return new Response('Origin not allowed', { status: 403 })
  }

  if (request.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders(origin) })
  }

  if (request.method !== 'POST') {
    return jsonResponse(405, { error: 'Method not allowed' }, origin)
  }

  const supabaseUrl = Deno.env.get('SUPABASE_URL')
  const serviceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')
  if (!supabaseUrl || !serviceRoleKey) {
    console.error('Contact submission function is missing Supabase configuration.')
    return jsonResponse(500, { error: 'Contact form is not configured.' }, origin)
  }

  const contentLength = request.headers.get('content-length')
  if (contentLength && Number(contentLength) > 8192) {
    return jsonResponse(413, { error: 'Request is too large.' }, origin)
  }

  if (!request.headers.get('content-type')?.includes('application/json')) {
    return jsonResponse(415, { error: 'Expected a JSON request.' }, origin)
  }

  const reader = request.body?.getReader()
  if (!reader) {
    return jsonResponse(400, { error: 'Request body is required.' }, origin)
  }

  const chunks: Uint8Array[] = []
  let totalBytes = 0
  while (true) {
    const { done, value } = await reader.read()
    if (done) break
    totalBytes += value.byteLength
    if (totalBytes > 8192) {
      await reader.cancel()
      return jsonResponse(413, { error: 'Request is too large.' }, origin)
    }
    chunks.push(value)
  }

  const bodyBytes = new Uint8Array(totalBytes)
  let offset = 0
  for (const chunk of chunks) {
    bodyBytes.set(chunk, offset)
    offset += chunk.byteLength
  }

  let payload: unknown
  try {
    payload = JSON.parse(new TextDecoder().decode(bodyBytes))
  } catch {
    return jsonResponse(400, { error: 'Invalid JSON request.' }, origin)
  }

  if (!payload || typeof payload !== 'object' || Array.isArray(payload)) {
    return jsonResponse(400, { error: 'Invalid contact form submission.' }, origin)
  }

  const form = payload as Record<string, unknown>
  const name = typeof form.name === 'string' ? form.name.trim() : ''
  const email = typeof form.email === 'string' ? form.email.trim() : ''
  const subject = typeof form.subject === 'string' ? form.subject.trim() : ''
  const message = typeof form.message === 'string' ? form.message.trim() : ''
  const website = typeof form.website === 'string' ? form.website.trim() : ''

  if (website) {
    return jsonResponse(202, { saved: true }, origin)
  }

  if (
    name.length < 1 ||
    name.length > 120 ||
    !isValidEmail(email) ||
    subject.length < 1 ||
    subject.length > 200 ||
    message.length < 15 ||
    message.length > 5000
  ) {
    return jsonResponse(400, { error: 'Please provide valid contact form fields.' }, origin)
  }

  const clientIp =
    request.headers.get('cf-connecting-ip') ??
    request.headers.get('x-forwarded-for')?.split(',')[0].trim() ??
    request.headers.get('x-real-ip')

  if (!clientIp) {
    console.error('Contact submission rejected because the client IP was unavailable.')
    return jsonResponse(400, { error: 'Unable to process this submission.' }, origin)
  }

  const hmacKey = await crypto.subtle.importKey(
    'raw',
    new TextEncoder().encode(serviceRoleKey),
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign'],
  )
  const ipHash = await crypto.subtle.sign(
    'HMAC',
    hmacKey,
    new TextEncoder().encode(clientIp),
  )
  const ipHashHex = Array.from(new Uint8Array(ipHash), (byte) =>
    byte.toString(16).padStart(2, '0'),
  ).join('')

  const supabase = createClient(supabaseUrl, serviceRoleKey, {
    auth: { autoRefreshToken: false, persistSession: false },
  })

  const { data: allowed, error: rateLimitError } = await supabase.rpc(
    'consume_contact_rate_limit',
    { p_ip_hash: ipHashHex },
  )

  if (rateLimitError) {
    console.error('Contact rate limit check failed:', rateLimitError.message)
    return jsonResponse(500, { error: 'Unable to process this submission.' }, origin)
  }
  if (!allowed) {
    return jsonResponse(429, { error: 'Too many submissions. Please try again later.' }, origin)
  }

  const { error: insertError } = await supabase.from('contact_messages').insert({
    name,
    email,
    subject,
    message,
    website: '',
  })

  if (insertError) {
    console.error('Contact message could not be saved:', insertError.message)
    return jsonResponse(500, { error: 'Unable to save your message.' }, origin)
  }

  return jsonResponse(200, { saved: true }, origin)
})
