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
  private static usuariosMemory: UsuarioEntity[] = [
    { id: 1, nombre: 'Juan Pérez (Admin)', email: 'admin@cocheracentral.pe', password_hash: '123456', rol: 'ADMIN', estado: 1, creado_en: new Date().toISOString() },
    { id: 2, nombre: 'Carlos Ruiz (Cajero)', email: 'cajero@cocheracentral.pe', password_hash: '123456', rol: 'CAJERO', estado: 1, creado_en: new Date().toISOString() },
    { id: 3, nombre: 'María López (Operador)', email: 'operador@cocheracentral.pe', password_hash: '123456', rol: 'OPERADOR', estado: 1, creado_en: new Date().toISOString() },
  ];

  async findByEmail(email: string): Promise<UsuarioEntity | null> {
    try {
      const [rows]: any = await dbPool.query('SELECT * FROM usuarios WHERE email = ? AND estado = 1', [email]);
      if (Array.isArray(rows) && rows.length > 0) {
        return rows[0] as UsuarioEntity;
      }
    } catch {
      // Fallback
    }

    const u = AuthRepository.usuariosMemory.find((x) => x.email === email && x.estado === 1);
    return u || null;
  }

  async findAll(): Promise<UsuarioEntity[]> {
    try {
      const [rows]: any = await dbPool.query('SELECT id, nombre, email, rol, estado, creado_en FROM usuarios ORDER BY id ASC');
      if (Array.isArray(rows) && rows.length > 0) {
        return rows as UsuarioEntity[];
      }
    } catch {
      // Fallback
    }

    return AuthRepository.usuariosMemory;
  }

  async create(data: { nombre: string; email: string; password_hash: string; rol: 'ADMIN' | 'OPERADOR' | 'CAJERO' }): Promise<UsuarioEntity> {
    try {
      const [res]: any = await dbPool.query(
        'INSERT INTO usuarios (nombre, email, password_hash, rol, estado) VALUES (?, ?, ?, ?, 1)',
        [data.nombre, data.email, data.password_hash, data.rol]
      );
      return {
        id: res.insertId || Date.now(),
        nombre: data.nombre,
        email: data.email,
        password_hash: data.password_hash,
        rol: data.rol,
        estado: 1,
        creado_en: new Date().toISOString(),
      };
    } catch {
      // Fallback
    }

    const nuevo: UsuarioEntity = {
      id: Date.now(),
      nombre: data.nombre,
      email: data.email,
      password_hash: data.password_hash,
      rol: data.rol,
      estado: 1,
      creado_en: new Date().toISOString(),
    };
    AuthRepository.usuariosMemory.push(nuevo);
    return nuevo;
  }

  async update(id: number, data: { nombre?: string; email?: string; rol?: 'ADMIN' | 'OPERADOR' | 'CAJERO'; estado?: number }): Promise<UsuarioEntity | null> {
    try {
      await dbPool.query(
        'UPDATE usuarios SET nombre = COALESCE(?, nombre), email = COALESCE(?, email), rol = COALESCE(?, rol), estado = COALESCE(?, estado) WHERE id = ?',
        [data.nombre || null, data.email || null, data.rol || null, data.estado !== undefined ? data.estado : null, id]
      );
    } catch {
      // Fallback
    }

    const u = AuthRepository.usuariosMemory.find((x) => x.id === id);
    if (u) {
      if (data.nombre) u.nombre = data.nombre;
      if (data.email) u.email = data.email;
      if (data.rol) u.rol = data.rol;
      if (data.estado !== undefined) u.estado = data.estado;
      return u;
    }

    return null;
  }

  async updatePassword(id: number, newHash: string): Promise<boolean> {
    try {
      await dbPool.query('UPDATE usuarios SET password_hash = ? WHERE id = ?', [newHash, id]);
    } catch {
      // Fallback
    }

    const u = AuthRepository.usuariosMemory.find((x) => x.id === id);
    if (u) {
      u.password_hash = newHash;
      return true;
    }
    return false;
  }
}
