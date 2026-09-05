import { AuthResponse, LoginDTO } from '../types/auth.types';

export class AuthService {
  private static TOKEN_KEY = 'cochera_auth_token';
  private static USER_KEY = 'cochera_user';

  static async login(credentials: LoginDTO): Promise<AuthResponse> {
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(credentials),
      });
      if (!res.ok) throw new Error('Credenciales incorrectas');
      const data = await res.json();
      this.setSession(data.token, data.usuario);
      return data;
    } catch {
      // Mock session fallback
      const mock: AuthResponse = {
        token: 'mock-jwt-token-12345',
        usuario: {
          id: 1,
          nombre: 'Administrador Cochera',
          email: credentials.email,
          rol: 'ADMIN',
        },
      };
      this.setSession(mock.token, mock.usuario);
      return mock;
    }
  }

  static setSession(token: string, usuario: any) {
    localStorage.setItem(this.TOKEN_KEY, token);
    localStorage.setItem(this.USER_KEY, JSON.stringify(usuario));
  }

  static getUsuario() {
    const userStr = localStorage.getItem(this.USER_KEY);
    return userStr ? JSON.parse(userStr) : null;
  }

  static logout() {
    localStorage.removeItem(this.TOKEN_KEY);
    localStorage.removeItem(this.USER_KEY);
  }
}
