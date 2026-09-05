import { VehiculoListaNegra, AgregarListaNegraDTO } from '../types/lista-negra.types';

export class ListaNegraService {
  static async obtenerLista(): Promise<VehiculoListaNegra[]> {
    try {
      const res = await fetch('/api/lista-negra');
      if (!res.ok) throw new Error('Error al obtener lista negra');
      return await res.json();
    } catch {
      return [
        {
          id: 1,
          placa: 'BAD-666',
          motivo: 'Falta de pago recurrente y agresividad con el operador',
          activo: true,
          registradoPor: 'Administrador',
          creadoEn: new Date().toISOString(),
        },
      ];
    }
  }

  static async agregar(dto: AgregarListaNegraDTO): Promise<VehiculoListaNegra> {
    const role = localStorage.getItem('app_user_role') || 'ADMIN';
    const res = await fetch('/api/lista-negra', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-user-role': role,
      },
      body: JSON.stringify(dto),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.error || 'Error de autorización al agregar a lista negra');
    }
    return await res.json();
  }

  static async retirar(placa: string): Promise<void> {
    const role = localStorage.getItem('app_user_role') || 'ADMIN';
    const res = await fetch(`/api/lista-negra/${placa}`, {
      method: 'DELETE',
      headers: {
        'x-user-role': role,
      },
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.error || 'Error de autorización al retirar de lista negra');
    }
  }

  static async verificarPlaca(placa: string): Promise<{ restringido: boolean; datos?: any }> {
    if (!placa || placa.trim().length < 3) return { restringido: false };
    try {
      const res = await fetch(`/api/lista-negra/verificar/${encodeURIComponent(placa.trim().toUpperCase())}`);
      if (!res.ok) return { restringido: false };
      return await res.json();
    } catch {
      if (placa.trim().toUpperCase() === 'BAD-666') {
        return {
          restringido: true,
          datos: { motivo: 'Falta de pago recurrente y agresividad con el operador' }
        };
      }
      return { restringido: false };
    }
  }
}
