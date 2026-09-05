import {
  CajaResumen,
  Gasto,
  RegistrarGastoDTO,
  RecaudadorItem,
  CajaDetalle,
  HistorialDiaCaja,
} from '../types/caja.types';
import { getAuthHeaders } from '@core/utils/authHeaders';

export class CajaService {
  static async obtenerResumen(fecha?: string): Promise<CajaResumen> {
    try {
      const q = fecha ? `?fecha=${fecha}` : '';
      const res = await fetch(`/api/caja/resumen${q}`, { headers: getAuthHeaders() });
      if (!res.ok) throw new Error('Error al obtener resumen de caja');
      return await res.json();
    } catch {
      return {
        fecha: fecha || new Date().toISOString().split('T')[0],
        ingresos: { efectivo: 30.0, yape: 15.0, plin: 0, tarjeta: 0, total: 45.0 },
        gastos: { total: 15.0 },
        balanceNeto: 30.0,
        totalMovimientosCobrados: 3,
      };
    }
  }

  static async registrarGasto(dto: RegistrarGastoDTO): Promise<Gasto> {
    const res = await fetch('/api/caja/gastos', {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(dto),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.error || 'Error de autorización al registrar gasto');
    }
    return await res.json();
  }

  static async obtenerGastos(fecha?: string): Promise<Gasto[]> {
    try {
      const q = fecha ? `?fecha=${fecha}` : '';
      const res = await fetch(`/api/caja/gastos${q}`, { headers: getAuthHeaders() });
      if (!res.ok) throw new Error('Error al obtener gastos');
      return await res.json();
    } catch {
      return [
        {
          id: 1,
          descripcion: 'Compra de papel térmico para tickets',
          monto: 15.0,
          usuarioId: 1,
          usuarioNombre: 'Administrador',
          fechaHora: new Date().toISOString(),
        },
      ];
    }
  }

  static async obtenerRecaudadores(fecha?: string): Promise<RecaudadorItem[]> {
    try {
      const q = fecha ? `?fecha=${fecha}` : '';
      const res = await fetch(`/api/caja/recaudadores${q}`, { headers: getAuthHeaders() });
      if (!res.ok) throw new Error('Error al obtener recaudadores');
      return await res.json();
    } catch {
      return [
        { usuarioId: 1, usuarioNombre: 'Operador Entrada', totalCobrado: 20.0, cantidadOperaciones: 2 },
        { usuarioId: 2, usuarioNombre: 'Operador Salida', totalCobrado: 25.0, cantidadOperaciones: 1 },
      ];
    }
  }

  static async obtenerDetalle(fecha?: string): Promise<CajaDetalle> {
    try {
      const q = fecha ? `?fecha=${fecha}` : '';
      const res = await fetch(`/api/caja/detalle${q}`, { headers: getAuthHeaders() });
      if (!res.ok) throw new Error('Error al obtener detalle de caja');
      return await res.json();
    } catch {
      return {
        fecha: fecha || new Date().toISOString().split('T')[0],
        movimientos: [
          {
            id: '1',
            codigoTicket: 'TKT-001001',
            placa: 'ABC-123',
            tipoVehiculo: 'Auto',
            momentoPago: 'ENTRADA',
            metodoPago: 'Efectivo',
            importe: 10.0,
            operadorNombre: 'Operador Entrada',
            fechaHoraRealPago: new Date().toISOString(),
          },
        ],
        gastos: [
          {
            id: 1,
            descripcion: 'Compra de papel térmico para tickets',
            monto: 15.0,
            usuarioId: 1,
            usuarioNombre: 'Administrador',
            fechaHora: new Date().toISOString(),
          },
        ],
      };
    }
  }

  static async obtenerHistorial(dias: number = 30): Promise<HistorialDiaCaja[]> {
    try {
      const res = await fetch(`/api/caja/historial?dias=${dias}`, { headers: getAuthHeaders() });
      if (!res.ok) throw new Error('Error al obtener historial');
      return await res.json();
    } catch {
      return [];
    }
  }
}
