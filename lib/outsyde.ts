// All calls go through Next.js API proxy — never expose backend URL to browser

const BASE = '/api'

async function request<T>(
  method: string,
  path: string,
  body?: unknown,
  extraHeaders?: Record<string, string>,
  retry = true
): Promise<{ data: T }> {
  const token = typeof window !== 'undefined' ? localStorage.getItem('outsyde_access_token') : null
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...extraHeaders,
  }

  const res = await fetch(`${BASE}${path}`, {
    method,
    headers,
    credentials: 'include',
    ...(body !== undefined ? { body: JSON.stringify(body) } : {}),
  })

  if (res.status === 401 && retry) {
    try {
      await fetch(`${BASE}/auth/refresh`, { method: 'POST', credentials: 'include' })
      return request<T>(method, path, body, extraHeaders, false)
    } catch {
      throw new Error('Unauthorized')
    }
  }

  if (!res.ok) {
    const err = await res.json().catch(() => ({})) as Record<string, string>
    throw Object.assign(new Error(err.message ?? err.error ?? 'Request failed'), {
      response: { status: res.status, data: err },
    })
  }

  const data = (await res.json()) as T
  return { data }
}

export const outsydeClient = {
  get: <T>(path: string, options?: { headers?: Record<string, string> }) =>
    request<T>('GET', path, undefined, options?.headers),
  post: <T>(path: string, body?: unknown, options?: { headers?: Record<string, string> }) =>
    request<T>('POST', path, body, options?.headers),
  patch: <T>(path: string, body?: unknown) =>
    request<T>('PATCH', path, body),
  delete: <T>(path: string) =>
    request<T>('DELETE', path),
}
