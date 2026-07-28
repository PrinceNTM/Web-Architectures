/**
 * Gemeinsamer Fetch-Wrapper für authentifizierte Anfragen.
 * Fügt automatisch den Authorization-Header hinzu.
 */
export async function authFetch(url: string, options: RequestInit = {}) {
  const token = localStorage.getItem('token');
  
  const headers = {
    'Content-Type': 'application/json',
    ...options.headers,
  } as Record<string, string>;

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const response = await fetch(url, {
    ...options,
    headers,
  });

  if (response.status === 401) {
    // Optional: Logout-Logik oder Redirect
    console.error('Nicht autorisiert');
  }

  return response;
}