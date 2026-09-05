import {
  EmpresaConfig,
  Usuario,
  CrearUsuarioDTO,
  ActualizarUsuarioDTO,
} from '../types/configuracion.types';

export class ConfiguracionService {
  private static getHeaders() {
    const role = localStorage.getItem('app_user_role') || 'ADMIN';
    return {
      'Content-Type': 'application/json',
      'x-user-role': role,
    };
  }

  static async obtenerConfiguracion(): Promise<EmpresaConfig> {
    try {
      const res = await fetch('/api/configuracion', { headers: this.getHeaders() });
      if (!res.ok) throw new Error('Error al consultar configuración');
      return await res.json();
    } catch {
      return {
        id: 1,
        ruc: '20123456789',
        razonSocial: 'ESTACIONAMIENTO COCHERA CENTRAL S.A.C.',
        nombreComercial: 'Cochera Central',
        direccion: 'Av. Principal 123, Miraflores, Lima',
        telefono: '(01) 456-7890',
        serieBoleta: 'B001',
        correlativoBoleta: 1,
        serieFactura: 'F001',
        correlativoFactura: 1,
        leyendaTicket: '¡Gracias por su preferencia! Conserve este ticket para retirar su vehículo.',
        capacidadTotal: 50,
        formatoTicket: '80mm',
        toleranciaMinutos: 10,
      };
    }
  }

  static async actualizarConfiguracion(data: Partial<EmpresaConfig>): Promise<EmpresaConfig> {
    const res = await fetch('/api/configuracion', {
      method: 'PUT',
      headers: this.getHeaders(),
      body: JSON.stringify(data),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.error || 'Error al actualizar configuración');
    }
    return await res.json();
  }

  static async obtenerUsuarios(): Promise<Usuario[]> {
    try {
      const res = await fetch('/api/auth/usuarios', { headers: this.getHeaders() });
      if (!res.ok) throw new Error('Error al listar usuarios');
      return await res.json();
    } catch {
      return [
        { id: 1, nombre: 'Juan Pérez (Admin)', email: 'admin@cocheracentral.pe', rol: 'ADMIN', estado: 1 },
        { id: 2, nombre: 'Carlos Ruiz (Cajero)', email: 'cajero@cocheracentral.pe', rol: 'CAJERO', estado: 1 },
        { id: 3, nombre: 'María López (Operador)', email: 'operador@cocheracentral.pe', rol: 'OPERADOR', estado: 1 },
      ];
    }
  }

  static async crearUsuario(dto: CrearUsuarioDTO): Promise<Usuario> {
    const res = await fetch('/api/auth/usuarios', {
      method: 'POST',
      headers: this.getHeaders(),
      body: JSON.stringify(dto),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.error || 'Error al crear usuario');
    }
    return await res.json();
  }

  static async actualizarUsuario(id: number, dto: ActualizarUsuarioDTO): Promise<Usuario> {
    const res = await fetch(`/api/auth/usuarios/${id}`, {
      method: 'PUT',
      headers: this.getHeaders(),
      body: JSON.stringify(dto),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.error || 'Error al actualizar usuario');
    }
    return await res.json();
  }

  static async cambiarPassword(id: number, password_hash: string): Promise<void> {
    const res = await fetch(`/api/auth/usuarios/${id}/password`, {
      method: 'PUT',
      headers: this.getHeaders(),
      body: JSON.stringify({ password_hash }),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.error || 'Error al cambiar contraseña');
    }
  }
}
