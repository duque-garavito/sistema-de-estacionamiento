import { AuthRepository } from '../repositories/auth.repository.js';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'cochera_jwt_secret_key_2026_secure';

export class AuthService {
  private repository: AuthRepository;

  constructor() {
    this.repository = new AuthRepository();
  }

  async login(email: string, passwordIngresada: string) {
    const usuario = await this.repository.findByEmail(email);
    if (!usuario) {
      throw new Error('Usuario o contraseña no válidos');
    }

    // Verificar contraseña con bcrypt (o fallback seguro si es texto plano preexistente)
    let passwordValida = false;
    if (usuario.password_hash.startsWith('$2a$') || usuario.password_hash.startsWith('$2b$')) {
      passwordValida = await bcrypt.compare(passwordIngresada, usuario.password_hash);
    } else {
      // Legacy check para contraseñas de migraciones antiguas
      passwordValida = usuario.password_hash === passwordIngresada;
    }

    if (!passwordValida) {
      throw new Error('Contraseña incorrecta');
    }

    // Generar JWT firmado de verdad con expiración de 24 horas
    const tokenPayload = {
      userId: usuario.id,
      userName: usuario.nombre,
      userRole: usuario.rol,
      email: usuario.email,
    };

    const token = jwt.sign(tokenPayload, JWT_SECRET, { expiresIn: '24h' });

    const { password_hash: _, ...usuarioSinPassword } = usuario;
    return {
      usuario: usuarioSinPassword,
      token,
    };
  }

  static async hashPassword(password: string): Promise<string> {
    return bcrypt.hash(password, 10);
  }
}
