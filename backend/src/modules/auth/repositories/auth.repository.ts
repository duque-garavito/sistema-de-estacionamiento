import { dbPool } from '../../../core/config/database.js';

export interface UsuarioEntity {
  id: number;
  nombre: string;
  email: string;
  password_hash: string;
  rol: 'ADMIN' | 'OPERADOR' | 'CAJERO';
  estado: number;
  creado_en?: string;
}

export class AuthRepository {
  async findByEmail(email: string): Promise<UsuarioEntity | null> {
    const [rows]: any = await dbPool.query('SELECT * FROM usuarios WHERE email = ? AND estado = 1', [email]);
    if (Array.isArray(rows) && rows.length > 0) {
      return rows[0] as UsuarioEntity;
    }
    return null;
  }

  async findAll(): Promise<UsuarioEntity[]> {
    const [rows]: any = await dbPool.query('SELECT id, nombre, email, rol, estado, creado_en FROM usuarios ORDER BY id ASC');
    if (Array.isArray(rows)) {
      return rows as UsuarioEntity[];
    }
    return [];
  }

  async create(data: { nombre: string; email: string; password_hash: string; rol: 'ADMIN' | 'OPERADOR' | 'CAJERO' }): Promise<UsuarioEntity> {
    const [res]: any = await dbPool.query(
      'INSERT INTO usuarios (nombre, email, password_hash, rol, estado) VALUES (?, ?, ?, ?, 1)',
      [data.nombre, data.email, data.password_hash, data.rol]
    );
    return {
      id: res.insertId,
      nombre: data.nombre,
      email: data.email,
      password_hash: data.password_hash,
      rol: data.rol,
      estado: 1,
      creado_en: new Date().toISOString(),
    };
  }

  async update(id: number, data: { nombre?: string; email?: string; rol?: 'ADMIN' | 'OPERADOR' | 'CAJERO'; estado?: number }): Promise<UsuarioEntity | null> {
    await dbPool.query(
      'UPDATE usuarios SET nombre = COALESCE(?, nombre), email = COALESCE(?, email), rol = COALESCE(?, rol), estado = COALESCE(?, estado) WHERE id = ?',
      [data.nombre || null, data.email || null, data.rol || null, data.estado !== undefined ? data.estado : null, id]
    );

    const [rows]: any = await dbPool.query('SELECT id, nombre, email, rol, estado, creado_en FROM usuarios WHERE id = ?', [id]);
    if (Array.isArray(rows) && rows.length > 0) {
      return rows[0] as UsuarioEntity;
    }
    return null;
  }

  async updatePassword(id: number, newHash: string): Promise<boolean> {
    const [res]: any = await dbPool.query('UPDATE usuarios SET password_hash = ? WHERE id = ?', [newHash, id]);
    return res.affectedRows > 0;
  }
}
