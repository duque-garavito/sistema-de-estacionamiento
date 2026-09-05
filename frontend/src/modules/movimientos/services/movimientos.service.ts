import { Movimiento, EntradaDTO, SalidaDTO } from '../types/movimiento.types';
import { getAuthHeaders } from '@core/utils/authHeaders';

// Mock initial state for demonstration / standalone UI development
const mockMovimientos: Movimiento[] = [
  {
    id: 'MOV-1001',
    codigoTicket: 'TKT-001001',
    placa: 'ABC-123',
    tipoVehiculo: 'Auto',
    color: 'Plata',
    marcaModelo: 'Toyota Yaris',
    propietarioDni: '12345678',
    propietarioNombre: 'Juan Pérez',
    fechaEntrada: new Date(Date.now() - 1000 * 60 * 60 * 26).toISOString(),
    tarifaDiaAplicada: 10.0,
    momentoPago: 'SALIDA',
    estado: 'Activo',
    ubicacion: 'A-12',
  },
  {
    id: 'MOV-1002',
    codigoTicket: 'TKT-001002',
    placa: 'XYZ-987',
    tipoVehiculo: 'Camioneta',
    color: 'Negro',
    marcaModelo: 'Nissan Frontier',
    propietarioDni: '87654321',
    propietarioNombre: 'Maria Gómez',
    fechaEntrada: new Date(Date.now() - 1000 * 60 * 45).toISOString(),
    tarifaDiaAplicada: 15.0,
    momentoPago: 'SALIDA',
    estado: 'Activo',
    ubicacion: 'B-04',
  },
];

export class MovimientosService {
  static async obtenerActivos(): Promise<Movimiento[]> {
    try {
      const res = await fetch('/api/movimientos/activos', { headers: getAuthHeaders() });
      if (!res.ok) throw new Error('Error al conectar con la API');
      return await res.json();
    } catch {
      return mockMovimientos.filter((m) => m.estado === 'Activo');
    }
  }

  static async registrarEntrada(dto: EntradaDTO): Promise<Movimiento> {
    try {
      const res = await fetch('/api/movimientos/entrada', {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify(dto),
      });
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || 'Error al registrar entrada');
      }
      return await res.json();
    } catch (error: any) {
      if (error.message && error.message.includes('ya se encuentra registrado')) {
        throw error;
      }
      const tarifaDia = dto.tipoVehiculo === 'Camioneta' ? 15 : dto.tipoVehiculo === 'Moto' ? 5 : 10;
      const nuevo: Movimiento = {
        id: `MOV-${Math.floor(1000 + Math.random() * 9000)}`,
        codigoTicket: `TKT-${Math.floor(100000 + Math.random() * 900000)}`,
        placa: dto.placa.toUpperCase(),
        tipoVehiculo: dto.tipoVehiculo,
        color: dto.color,
        marcaModelo: dto.marcaModelo,
        propietarioDni: dto.propietarioDni,
        propietarioNombre: dto.propietarioNombre,
        fechaEntrada: new Date().toISOString(),
        tarifaDiaAplicada: tarifaDia,
        momentoPago: dto.momentoPago || 'SALIDA',
        estado: 'Activo',
        ubicacion: dto.ubicacion || 'General',
      };
      mockMovimientos.unshift(nuevo);
      return nuevo;
    }
  }

  static async registrarSalida(dto: SalidaDTO): Promise<Movimiento> {
    try {
      const res = await fetch('/api/movimientos/salida', {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify(dto),
      });
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || 'Error al registrar salida');
      }
      return await res.json();
    } catch {
      const mov = mockMovimientos.find((m) => m.id === dto.movimientoId);
      if (!mov) throw new Error('Movimiento no encontrado');
      mov.fechaSalida = new Date().toISOString();
      mov.estado = 'Completado';

      const entradaDate = new Date(mov.fechaEntrada);
      const salidaDate = new Date(mov.fechaSalida);

      const esMismoDia = (
        entradaDate.getFullYear() === salidaDate.getFullYear() &&
        entradaDate.getMonth() === salidaDate.getMonth() &&
        entradaDate.getDate() === salidaDate.getDate()
      );

      let dias = 1;
      if (!esMismoDia) {
        const startMidnight = new Date(entradaDate.getFullYear(), entradaDate.getMonth(), entradaDate.getDate()).getTime();
        const endMidnight = new Date(salidaDate.getFullYear(), salidaDate.getMonth(), salidaDate.getDate()).getTime();
        const diffDaysCalendar = Math.round((endMidnight - startMidnight) / (1000 * 60 * 60 * 24));
        dias = Math.max(1, diffDaysCalendar + 1);
      }

      mov.diasCobrados = dias;
      if (mov.momentoPago === 'ENTRADA') {
        mov.totalPagar = 0;
      } else {
        mov.totalPagar = (dias * mov.tarifaDiaAplicada) - (dto.descuento || 0);
      }

      return mov;
    }
  }

  static async obtenerHistorial(placa?: string): Promise<Movimiento[]> {
    try {
      const url = placa ? `/api/movimientos/historial?placa=${encodeURIComponent(placa)}` : '/api/movimientos/historial';
      const res = await fetch(url, { headers: getAuthHeaders() });
      if (!res.ok) throw new Error('Error al consultar historial');
      return await res.json();
    } catch {
      if (placa) {
        return mockMovimientos.filter((m) => m.placa.toUpperCase().includes(placa.toUpperCase()));
      }
      return mockMovimientos;
    }
  }

  static async actualizarInfoMovimiento(id: string, dto: Partial<Movimiento>): Promise<Movimiento> {
    try {
      const res = await fetch(`/api/movimientos/${id}`, {
        method: 'PUT',
        headers: getAuthHeaders(),
        body: JSON.stringify(dto),
      });
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || 'Error al actualizar información');
      }
      return await res.json();
    } catch {
      const mov = mockMovimientos.find((m) => m.id === id);
      if (!mov) throw new Error('Movimiento no encontrado');
      if (dto.color !== undefined) mov.color = dto.color;
      if (dto.marcaModelo !== undefined) mov.marcaModelo = dto.marcaModelo;
      if (dto.propietarioDni !== undefined) mov.propietarioDni = dto.propietarioDni;
      if (dto.propietarioNombre !== undefined) mov.propietarioNombre = dto.propietarioNombre;
      if (dto.observaciones !== undefined) mov.observaciones = dto.observaciones;
      return mov;
    }
  }
}
