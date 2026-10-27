const request = async <T>(path: string, options: RequestInit = {}): Promise<T> => {
  const user = localStorage.getItem('websums_user');
  const token = user ? JSON.parse(user).token : null;
  const response = await fetch(path, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...(options.headers || {})
    }
  });
  const result = await response.json();
  if (!response.ok || !result.success) throw new Error(result.message || 'Request failed');
  return result.data as T;
};

export const apiGet = <T>(path: string) => request<T>(path);
export const apiPost = <T>(path: string, body: unknown) => request<T>(path, { method: 'POST', body: JSON.stringify(body) });
export const apiPatch = <T>(path: string, body: unknown) => request<T>(path, { method: 'PATCH', body: JSON.stringify(body) });
export const apiDelete = <T>(path: string) => request<T>(path, { method: 'DELETE' });
