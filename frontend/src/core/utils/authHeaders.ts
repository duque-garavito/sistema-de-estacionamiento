export function getAuthHeaders(): Record<string, string> {
  const token = localStorage.getItem('cochera_auth_token');
  const role = localStorage.getItem('app_user_role') || 'ADMIN';
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    'x-user-role': role,
  };
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }
  return headers;
}
