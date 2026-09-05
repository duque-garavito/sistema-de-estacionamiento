import { Tarifa } from '../types/tarifa.types';

export class TarifasService {
  static async obtenerTarifas(): Promise<Tarifa[]> {
    try {
      const res = await fetch('/api/tarifas');
      if (!res.ok) throw new Error('Error al obtener tarifas');
      return await res.json();
    } catch {
      return [
        { id: 1, tipoVehiculo: 'Auto', tipoCobro: 'DIA', precioHora: 5.0, precioDia: 10.0, toleranciaMinutos: 10, fraccion15min: 1.5, activo: true },
        { id: 2, tipoVehiculo: 'Camioneta', tipoCobro: 'DIA', precioHora: 7.0, precioDia: 15.0, toleranciaMinutos: 10, fraccion15min: 2.0, activo: true },
        { id: 3, tipoVehiculo: 'Moto', tipoCobro: 'DIA', precioHora: 3.0, precioDia: 5.0, toleranciaMinutos: 10, fraccion15min: 1.0, activo: true },
        { id: 4, tipoVehiculo: 'Bicicleta', tipoCobro: 'DIA', precioHora: 1.5, precioDia: 3.0, toleranciaMinutos: 10, fraccion15min: 0.5, activo: true },
      ];
    }
  }

  static async actualizarTarifa(tarifa: Tarifa): Promise<Tarifa> {
    const role = localStorage.getItem('app_user_role') || 'ADMIN';
    const res = await fetch('/api/tarifas', {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'x-user-role': role,
      },
      body: JSON.stringify(tarifa),
    });

    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.error || 'Error de autorización o servidor al actualizar tarifa');
    }

    return await res.json();
  }
}
