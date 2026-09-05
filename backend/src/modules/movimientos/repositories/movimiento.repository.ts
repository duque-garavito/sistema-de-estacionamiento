import { dbPool } from '../../../core/config/database.js';
import { MovimientoEntity, RegistrarEntradaDTO } from '../types/movimiento.types.js';

export class MovimientoRepository {
  private static memoryStore: MovimientoEntity[] = [
    {
      id: '1',
      codigoTicket: 'TKT-001001',
      placa: 'ABC-123',
      tipoVehiculo: 'Auto',
      color: 'Plata',
      marcaModelo: 'Toyota Yaris',
      propietarioDni: '12345678',
      propietarioNombre: 'Juan Pérez',
      fechaEntrada: new Date(Date.now() - 1000 * 60 * 60 * 26), // ~1 día y 2 horas
      tarifaDiaAplicada: 10.0,
      diasCobrados: 2,
      totalPagar: 20.0,
      momentoPago: 'SALIDA',
      metodoPago: 'Efectivo',
      usuarioIngreso: 'Operador Entrada',
      estado: 'Activo',
      ubicacion: 'A-12',
    },
    {
      id: '2',
      codigoTicket: 'TKT-001002',
      placa: 'XYZ-987',
      tipoVehiculo: 'Camioneta',
      color: 'Negro',
      marcaModelo: 'Nissan Frontier',
      propietarioDni: '87654321',
      propietarioNombre: 'Maria Gómez',
      fechaEntrada: new Date(Date.now() - 1000 * 60 * 120),
      tarifaDiaAplicada: 15.0,
      diasCobrados: 1,
      totalPagar: 15.0,
      momentoPago: 'SALIDA',
      metodoPago: 'Yape',
      usuarioIngreso: 'Operador Entrada',
      estado: 'Activo',
      ubicacion: 'B-04',
    },
  ];

  async findActivos(): Promise<MovimientoEntity[]> {
    try {
      const [rows] = await dbPool.query(
        'SELECT * FROM movimientos WHERE estado = ? ORDER BY fecha_entrada DESC',
        ['Activo']
      );
      if (Array.isArray(rows) && rows.length > 0) {
        return rows.map((r: any) => ({
          id: String(r.id),
          codigoTicket: r.codigo_ticket,
          placa: r.placa,
          tipoVehiculo: r.tipo_vehiculo,
          color: r.color,
          marcaModelo: r.marca_modelo,
          propietarioDni: r.propietario_dni,
          propietarioNombre: r.propietario_nombre,
          fechaEntrada: new Date(r.fecha_entrada),
          fechaSalida: r.fecha_salida ? new Date(r.fecha_salida) : undefined,
          tarifaDiaAplicada: Number(r.tarifa_dia_aplicada || 10.0),
          diasCobrados: r.dias_cobrados ? Number(r.dias_cobrados) : undefined,
          totalPagar: r.total_pagar !== null ? Number(r.total_pagar) : undefined,
          momentoPago: r.momento_pago || 'SALIDA',
          metodoPago: r.metodo_pago || 'Efectivo',
          usuarioIngreso: r.usuario_ingreso || 'Operador Entrada',
          usuarioSalida: r.usuario_salida,
          estado: r.estado,
          ubicacion: r.ubicacion,
          observaciones: r.observaciones,
        }));
      }
    } catch {
      // Fallback local
    }
    return MovimientoRepository.memoryStore.filter((m) => m.estado === 'Activo');
  }

  async findByPlacaActiva(placa: string): Promise<MovimientoEntity | null> {
    const placaClean = placa.trim().toUpperCase();
    try {
      const [rows] = await dbPool.query(
        'SELECT * FROM movimientos WHERE UPPER(placa) = ? AND estado = ? LIMIT 1',
        [placaClean, 'Activo']
      );
      if (Array.isArray(rows) && rows.length > 0) {
        const r: any = rows[0];
        return {
          id: String(r.id),
          codigoTicket: r.codigo_ticket,
          placa: r.placa,
          tipoVehiculo: r.tipo_vehiculo,
          color: r.color,
          marcaModelo: r.marca_modelo,
          propietarioDni: r.propietario_dni,
          propietarioNombre: r.propietario_nombre,
          fechaEntrada: new Date(r.fecha_entrada),
          fechaSalida: r.fecha_salida ? new Date(r.fecha_salida) : undefined,
          tarifaDiaAplicada: Number(r.tarifa_dia_aplicada || 10.0),
          diasCobrados: r.dias_cobrados ? Number(r.dias_cobrados) : undefined,
          totalPagar: r.total_pagar !== null ? Number(r.total_pagar) : undefined,
          momentoPago: r.momento_pago || 'SALIDA',
          metodoPago: r.metodo_pago || 'Efectivo',
          usuarioIngreso: r.usuario_ingreso || 'Operador Entrada',
          usuarioSalida: r.usuario_salida,
          estado: r.estado,
          ubicacion: r.ubicacion,
          observaciones: r.observaciones,
        };
      }
    } catch {
      // Fallback local
    }
    const encontrada = MovimientoRepository.memoryStore.find(
      (m) => m.placa.toUpperCase() === placaClean && m.estado === 'Activo'
    );
    return encontrada || null;
  }

  async findById(id: string): Promise<MovimientoEntity | null> {
    try {
      const [rows]: any = await dbPool.query(
        'SELECT * FROM movimientos WHERE id = ? OR codigo_ticket = ? LIMIT 1',
        [id, id]
      );
      if (Array.isArray(rows) && rows.length > 0) {
        const r = rows[0];
        return {
          id: String(r.id),
          codigoTicket: r.codigo_ticket,
          placa: r.placa,
          tipoVehiculo: r.tipo_vehiculo,
          color: r.color,
          marcaModelo: r.marca_modelo,
          propietarioDni: r.propietario_dni,
          propietarioNombre: r.propietario_nombre,
          fechaEntrada: new Date(r.fecha_entrada),
          fechaSalida: r.fecha_salida ? new Date(r.fecha_salida) : undefined,
          tarifaDiaAplicada: Number(r.tarifa_dia_aplicada || 10.0),
          diasCobrados: r.dias_cobrados ? Number(r.dias_cobrados) : undefined,
          totalPagar: r.total_pagar !== null ? Number(r.total_pagar) : undefined,
          momentoPago: r.momento_pago || 'SALIDA',
          metodoPago: r.metodo_pago || 'Efectivo',
          usuarioIngreso: r.usuario_ingreso || 'Operador Entrada',
          usuarioSalida: r.usuario_salida,
          estado: r.estado,
          ubicacion: r.ubicacion,
          observaciones: r.observaciones,
        };
      }
    } catch {
      // Fallback local
    }
    const found = MovimientoRepository.memoryStore.find((m) => m.id === id || m.codigoTicket === id);
    return found || null;
  }

  async create(dto: RegistrarEntradaDTO, tarifaDia: number): Promise<MovimientoEntity> {
    const codigoTicket = `TKT-${Math.floor(100000 + Math.random() * 900000)}`;
    const fechaEntrada = new Date();
    const placaClean = dto.placa.trim().toUpperCase();

    try {
      const [res]: any = await dbPool.query(
        `INSERT INTO movimientos (
          codigo_ticket, placa, tipo_vehiculo, color, marca_modelo,
          propietario_dni, propietario_nombre, fecha_entrada, tarifa_dia_aplicada,
          dias_cobrados, total_pagar, momento_pago, metodo_pago, usuario_ingreso,
          estado, ubicacion, observaciones
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          codigoTicket,
          placaClean,
          dto.tipoVehiculo,
          dto.color || null,
          dto.marcaModelo || null,
          dto.propietarioDni || null,
          dto.propietarioNombre || null,
          fechaEntrada,
          tarifaDia,
          1,
          tarifaDia,
          dto.momentoPago || 'SALIDA',
          dto.metodoPago || 'Efectivo',
          dto.usuarioIngreso || 'Operador Entrada',
          'Activo',
          dto.ubicacion || 'General',
          dto.observaciones || null,
        ]
      );
      if (res && res.insertId) {
        const nuevoDB: MovimientoEntity = {
          id: String(res.insertId),
          codigoTicket,
          placa: placaClean,
          tipoVehiculo: dto.tipoVehiculo,
          color: dto.color,
          marcaModelo: dto.marcaModelo,
          propietarioDni: dto.propietarioDni,
          propietarioNombre: dto.propietarioNombre,
          fechaEntrada,
          tarifaDiaAplicada: tarifaDia,
          diasCobrados: 1,
          totalPagar: tarifaDia,
          momentoPago: dto.momentoPago || 'SALIDA',
          metodoPago: dto.metodoPago || 'Efectivo',
          usuarioIngreso: dto.usuarioIngreso || 'Operador Entrada',
          estado: 'Activo',
          ubicacion: dto.ubicacion || 'General',
          observaciones: dto.observaciones,
        };
        MovimientoRepository.memoryStore.unshift(nuevoDB);
        return nuevoDB;
      }
    } catch {
      // Fallback local
    }

    const nuevo: MovimientoEntity = {
      id: String(Date.now()),
      codigoTicket,
      placa: placaClean,
      tipoVehiculo: dto.tipoVehiculo,
      color: dto.color,
      marcaModelo: dto.marcaModelo,
      propietarioDni: dto.propietarioDni,
      propietarioNombre: dto.propietarioNombre,
      fechaEntrada,
      tarifaDiaAplicada: tarifaDia,
      diasCobrados: 1,
      totalPagar: tarifaDia,
      momentoPago: dto.momentoPago || 'SALIDA',
      metodoPago: dto.metodoPago || 'Efectivo',
      usuarioIngreso: dto.usuarioIngreso || 'Operador Entrada',
      estado: 'Activo',
      ubicacion: dto.ubicacion || 'General',
      observaciones: dto.observaciones,
    };
    MovimientoRepository.memoryStore.unshift(nuevo);
    return nuevo;
  }

  async updateSalida(
    id: string,
    fechaSalida: Date,
    totalPagar: number,
    diasCobrados: number,
    metodoPago?: string,
    usuarioSalida?: string
  ): Promise<MovimientoEntity | null> {
    try {
      await dbPool.query(
        `UPDATE movimientos
         SET fecha_salida = ?, total_pagar = ?, dias_cobrados = ?, metodo_pago = COALESCE(?, metodo_pago), usuario_salida = COALESCE(?, usuario_salida), estado = 'Completado'
         WHERE id = ? OR codigo_ticket = ?`,
        [fechaSalida, totalPagar, diasCobrados, metodoPago || null, usuarioSalida || null, id, id]
      );
    } catch {
      // Fallback local
    }

    const item = await this.findById(id);
    if (!item) return null;
    item.fechaSalida = fechaSalida;
    item.totalPagar = totalPagar;
    item.diasCobrados = diasCobrados;
    if (metodoPago) item.metodoPago = metodoPago;
    if (usuarioSalida) item.usuarioSalida = usuarioSalida;
    item.estado = 'Completado';
    return item;
  }

  async findHistorial(placa?: string): Promise<MovimientoEntity[]> {
    const placaClean = (placa || '').trim().toUpperCase();
    try {
      let sql = 'SELECT * FROM movimientos';
      const params: any[] = [];
      if (placaClean) {
        sql += ' WHERE UPPER(placa) LIKE ?';
        params.push(`%${placaClean}%`);
      }
      sql += ' ORDER BY fecha_entrada DESC LIMIT 100';
      const [rows] = await dbPool.query(sql, params);
      if (Array.isArray(rows) && rows.length > 0) {
        return rows.map((r: any) => ({
          id: String(r.id),
          codigoTicket: r.codigo_ticket,
          placa: r.placa,
          tipoVehiculo: r.tipo_vehiculo,
          color: r.color,
          marcaModelo: r.marca_modelo,
          propietarioDni: r.propietario_dni,
          propietarioNombre: r.propietario_nombre,
          fechaEntrada: new Date(r.fecha_entrada),
          fechaSalida: r.fecha_salida ? new Date(r.fecha_salida) : undefined,
          tarifaDiaAplicada: Number(r.tarifa_dia_aplicada || 10.0),
          diasCobrados: r.dias_cobrados ? Number(r.dias_cobrados) : undefined,
          totalPagar: r.total_pagar !== null ? Number(r.total_pagar) : undefined,
          momentoPago: r.momento_pago || 'SALIDA',
          metodoPago: r.metodo_pago || 'Efectivo',
          usuarioIngreso: r.usuario_ingreso || 'Operador Entrada',
          usuarioSalida: r.usuario_salida,
          estado: r.estado,
          ubicacion: r.ubicacion,
          observaciones: r.observaciones,
        }));
      }
    } catch {
      // Fallback local
    }

    let list = MovimientoRepository.memoryStore;
    if (placaClean) {
      list = list.filter((m) => m.placa.toUpperCase().includes(placaClean));
    }
    return list;
  }

  async updateInfoInformativa(
    id: string,
    dto: { color?: string; marcaModelo?: string; propietarioDni?: string; propietarioNombre?: string; ubicacion?: string; observaciones?: string }
  ): Promise<MovimientoEntity | null> {
    try {
      await dbPool.query(
        `UPDATE movimientos
         SET color = COALESCE(?, color),
             marca_modelo = COALESCE(?, marca_modelo),
             propietario_dni = COALESCE(?, propietario_dni),
             propietario_nombre = COALESCE(?, propietario_nombre),
             ubicacion = COALESCE(?, ubicacion),
             observaciones = COALESCE(?, observaciones)
         WHERE id = ? OR codigo_ticket = ?`,
        [
          dto.color || null,
          dto.marcaModelo || null,
          dto.propietarioDni || null,
          dto.propietarioNombre || null,
          dto.ubicacion || null,
          dto.observaciones || null,
          id,
          id,
        ]
      );
    } catch {
      // Fallback local
    }

    const item = await this.findById(id);
    if (!item) return null;
    if (dto.color !== undefined) item.color = dto.color;
    if (dto.marcaModelo !== undefined) item.marcaModelo = dto.marcaModelo;
    if (dto.propietarioDni !== undefined) item.propietarioDni = dto.propietarioDni;
    if (dto.propietarioNombre !== undefined) item.propietarioNombre = dto.propietarioNombre;
    if (dto.ubicacion !== undefined) item.ubicacion = dto.ubicacion;
    if (dto.observaciones !== undefined) item.observaciones = dto.observaciones;
    return item;
  }
}

