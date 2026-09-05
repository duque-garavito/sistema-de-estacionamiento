import { Request, Response } from 'express';
import { AuthService } from '../services/auth.service.js';
import { AuthRepository } from '../repositories/auth.repository.js';

const authService = new AuthService();
const repository = new AuthRepository();

export class AuthController {
  static async login(req: Request, res: Response) {
    try {
      const { email, password_hash, password } = req.body;
      const pass = password || password_hash;

      if (!email || !pass) {
        return res.status(400).json({ error: 'Correo y contraseña requeridos' });
      }

      const resultado = await authService.login(email, pass);
      console.log(`🔑 [AUTH OK] Sesión iniciada correctamente para: ${email} (${resultado.usuario.rol})`);
      res.json(resultado);
    } catch (error: any) {
      console.error(`❌ [AUTH LOGIN ERROR] Fallo al autenticar email '${req.body?.email}':`, error.message);
      res.status(401).json({ error: error.message || 'Error de autenticación' });
    }
  }

  static async listarUsuarios(req: Request, res: Response) {
    try {
      const usuarios = await repository.findAll();
      res.json(usuarios);
    } catch (error: any) {
      console.error('❌ [AUTH LISTAR USUARIOS ERROR]:', error.message || error);
      res.status(500).json({ error: error.message || 'Error al listar usuarios' });
    }
  }

  static async crearUsuario(req: Request, res: Response) {
    try {
      const { nombre, email, password_hash, password, rol } = req.body;
      const rawPassword = password || password_hash || '123456';

      if (!nombre || !email || !rol) {
        return res.status(400).json({ error: 'Nombre, email y rol son requeridos' });
      }

      const hash = await AuthService.hashPassword(rawPassword);
      const nuevo = await repository.create({
        nombre,
        email,
        password_hash: hash,
        rol,
      });

      const { password_hash: _, ...userSinPassword } = nuevo;
      console.log(`👤 [USUARIO CREADO] ${email} con rol ${rol}`);
      res.status(201).json(userSinPassword);
    } catch (error: any) {
      console.error('❌ [AUTH CREAR USUARIO ERROR]:', error.message || error);
      res.status(500).json({ error: error.message || 'Error al crear usuario' });
    }
  }

  static async actualizarUsuario(req: Request, res: Response) {
    try {
      const id = Number(req.params.id);
      const actualizado = await repository.update(id, req.body);
      if (!actualizado) {
        return res.status(404).json({ error: 'Usuario no encontrado' });
      }
      console.log(`✏️ [USUARIO ACTUALIZADO] ID: ${id}`);
      res.json(actualizado);
    } catch (error: any) {
      console.error(`❌ [AUTH ACTUALIZAR USUARIO ERROR] ID ${req.params.id}:`, error.message || error);
      res.status(500).json({ error: error.message || 'Error al actualizar usuario' });
    }
  }

  static async cambiarPassword(req: Request, res: Response) {
    try {
      const id = Number(req.params.id);
      const { password_hash, password } = req.body;
      const rawPassword = password || password_hash;

      if (!rawPassword) {
        return res.status(400).json({ error: 'Nueva contraseña requerida' });
      }

      const hash = await AuthService.hashPassword(rawPassword);
      const ok = await repository.updatePassword(id, hash);
      if (!ok) {
        return res.status(404).json({ error: 'Usuario no encontrado' });
      }
      console.log(`🔑 [PASSWORD ACTUALIZADO] Hash Bcrypt actualizado para usuario ID: ${id}`);
      res.json({ message: 'Contraseña actualizada correctamente con hash de seguridad' });
    } catch (error: any) {
      console.error(`❌ [AUTH CAMBIAR PASSWORD ERROR] ID ${req.params.id}:`, error.message || error);
      res.status(500).json({ error: error.message || 'Error al cambiar contraseña' });
    }
  }
}
