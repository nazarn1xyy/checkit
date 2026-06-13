// Admin credentials — DEMO ONLY, not production-safe
export const ADMIN_USERNAME = 'admin';
export const ADMIN_PASSWORD = 'admin';

export function isAdminCredentials(login: string, password: string): boolean {
  return login === ADMIN_USERNAME && password === ADMIN_PASSWORD;
}
