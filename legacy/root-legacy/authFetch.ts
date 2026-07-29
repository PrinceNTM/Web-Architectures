/**
 * Gemeinsamer Fetch-Wrapper für authentifizierte Anfragen.
 * Nutzt Cookie-basierte Authentifizierung und schützt State-Changes via Custom-Header.
 */
export async function authFetch(url: string, options: RequestInit = {}) {
  const headers = {
    'Content-Type': 'application/json',
    'X-Requested-With': 'XMLHttpRequest',
    ...options.headers,
  } as Record<string, string>;

  const response = await fetch(url, {
    ...options,
    headers,
    credentials: 'include',
  });

  if (response.status === 401) {
    window.location.href = '/login'
  }

  return response;
}