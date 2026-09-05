import { DashboardResumen } from '../types/dashboard.types';

const API_BASE = '/api/dashboard';

export class DashboardService {
  static async obtenerStats(): Promise<DashboardResumen> {
    try {
      const res = await fetch(`${API_BASE}/stats`);
      if (!res.ok) throw new Error('Error al obtener estadísticas del dashboard');
      return await res.json();
    } catch {
      // Fallback por defecto si no responde el backend
      return {
        vehiculosParqueados: 0,
        capacidadTotal: 50,
        ingresosHoy: 0,
        gastosHoy: 0,
        balanceHoy: 0,
        totalMovimientosHoy: 0,
        cajaAbierta: true,
        metodosPago: { efectivo: 0, yape: 0, plin: 0, tarjeta: 0 },
        ultimasEntradas: [],
        ultimasSalidas: []
      };
    }
  }
}
