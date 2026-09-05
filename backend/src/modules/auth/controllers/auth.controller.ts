import { Request, Response } from 'express';
import { AuthService } from '../services/auth.service.js';
import { AuthRepository } from '../repositories/auth.repository.js';

const authService = new AuthService();
const repository = new AuthRepository();

export class AuthController {
  static async login(req: Request, res: Response) {
    try {
      const { email, password_hash } = req.body;
      if (!email || !password_hash) {
        return res.status(400).json({ error: 'Correo y contraseña requeridos' });
      }
      const resultado = await authService.login(email, password_hash);
      res.json(resultado);
    } catch (error: any) {
      res.status(401).json({ error: error.message || 'Error de autenticación' });
    }
  }

  static async listarUsuarios(req: Request, res: Response) {
    try {
      const usuarios = await repository.findAll();
      res.json(usuarios);
    } catch (error: any) {
      res.status(500).json({ error: error.message || 'Error al listar usuarios' });
    }
  }

  static async crearUsuario(req: Request, res: Response) {
    try {
      const { nombre, email, password_hash, rol } = req.body;
      if (!nombre || !email || !rol) {
        return res.status(400).json({ error: 'Nombre, email y rol son requeridos' });
      }
      const nuevo = await repository.create({
        nombre,
        email,
        password_hash: password_hash || '123456',
        rol,
      });
      res.status(201).json(nuevo);
    } catch (error: any) {
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
      res.json(actualizado);
    } catch (error: any) {
      res.status(500).json({ error: error.message || 'Error al actualizar usuario' });
    }
  }

  static async cambiarPassword(req: Request, res: Response) {
    try {
      const id = Number(req.params.id);
      const { password_hash } = req.body;
      if (!password_hash) {
        return res.status(400).json({ error: 'Nueva contraseña requerida' });
      }
      const ok = await repository.updatePassword(id, password_hash);
      if (!ok) {
        return res.status(404).json({ error: 'Usuario no encontrado' });
      }
      res.json({ message: 'Contraseña actualizada correctamente' });
    } catch (error: any) {
      res.status(500).json({ error: error.message || 'Error al cambiar contraseña' });
    }
  }
}
