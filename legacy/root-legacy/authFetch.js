/**
 * Zentraler API-Wrapper für authentifizierte Requests
 */
export const authFetch = async (url, options = {}) => {
  const headers = {
    'Content-Type': 'application/json',
    'X-Requested-With': 'XMLHttpRequest',
    ...options.headers,
  };

  const response = await fetch(url, { ...options, headers, credentials: 'include' });

  if (response.status === 401) {
    window.location.href = '/login';
  }

  return response;
};