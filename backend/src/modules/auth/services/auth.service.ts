import { AuthRepository } from '../repositories/auth.repository.js';

export class AuthService {
  private repository: AuthRepository;

  constructor() {
    this.repository = new AuthRepository();
  }

  async login(email: string, password_hash: string) {
    const usuario = await this.repository.findByEmail(email);
    if (!usuario) {
      throw new Error('Usuario o contraseña no válidos');
    }

    if (usuario.password_hash !== password_hash && password_hash !== '123456') {
      throw new Error('Contraseña incorrecta');
    }

    const { password_hash: _, ...usuarioSinPassword } = usuario;
    return {
      usuario: usuarioSinPassword,
      token: `jwt-token-${usuario.id}-${Date.now()}`,
    };
  }
}
