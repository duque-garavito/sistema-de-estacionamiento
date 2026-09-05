import { dbPool } from '../../../core/config/database.js';
import { ListaNegraEntity, AgregarListaNegraDTO } from '../types/lista-negra.types.js';

export class ListaNegraRepository {
  private static memoryStore: ListaNegraEntity[] = [
    {
      id: 1,
      placa: 'BAD-666',
      motivo: 'Falta de pago recurrente y agresividad con el operador',
      activo: true,
      registradoPor: 'Administrador',
      creadoEn: new Date(Date.now() - 1000 * 60 * 60 * 24 * 5),
    },
  ];

  async findAll(): Promise<ListaNegraEntity[]> {
    try {
      const [rows] = await dbPool.query('SELECT * FROM lista_negra WHERE activo = 1 ORDER BY creado_en DESC');
      if (Array.isArray(rows) && rows.length > 0) {
        return rows.map((r: any) => ({
          id: r.id,
          placa: r.placa,
          motivo: r.motivo,
          activo: Boolean(r.activo),
          registradoPor: r.registrado_por,
          creadoEn: new Date(r.creado_en),
        }));
      }
    } catch {
      // Fallback local
    }
    return ListaNegraRepository.memoryStore.filter((l) => l.activo);
  }

  async findByPlaca(placa: string): Promise<ListaNegraEntity | null> {
    const placaClean = placa.trim().toUpperCase();
    try {
      const [rows] = await dbPool.query(
        'SELECT * FROM lista_negra WHERE UPPER(placa) = ? AND activo = 1 LIMIT 1',
        [placaClean]
      );
      if (Array.isArray(rows) && rows.length > 0) {
        const r: any = rows[0];
        return {
          id: r.id,
          placa: r.placa,
          motivo: r.motivo,
          activo: Boolean(r.activo),
          registradoPor: r.registrado_por,
          creadoEn: new Date(r.creado_en),
        };
      }
    } catch {
      // Fallback local
    }
    const encontrada = ListaNegraRepository.memoryStore.find(
      (l) => l.placa.toUpperCase() === placaClean && l.activo
    );
    return encontrada || null;
  }

  async create(dto: AgregarListaNegraDTO): Promise<ListaNegraEntity> {
    const placaClean = dto.placa.trim().toUpperCase();
    try {
      const [res]: any = await dbPool.query(
        'INSERT INTO lista_negra (placa, motivo, registrado_por) VALUES (?, ?, ?)',
        [placaClean, dto.motivo, dto.registradoPor || 'Administrador']
      );
      return {
        id: res.insertId || Date.now(),
        placa: placaClean,
        motivo: dto.motivo,
        activo: true,
        registradoPor: dto.registradoPor || 'Administrador',
        creadoEn: new Date(),
      };
    } catch {
      // Fallback local
    }
    const nuevo: ListaNegraEntity = {
      id: Date.now(),
      placa: placaClean,
      motivo: dto.motivo,
      activo: true,
      registradoPor: dto.registradoPor || 'Administrador',
      creadoEn: new Date(),
    };
    ListaNegraRepository.memoryStore.unshift(nuevo);
    return nuevo;
  }

  async desactivar(placa: string): Promise<boolean> {
    const placaClean = placa.trim().toUpperCase();
    try {
      await dbPool.query(
        'UPDATE lista_negra SET activo = 0 WHERE UPPER(placa) = ?',
        [placaClean]
      );
    } catch {
      // Fallback local
    }
    const item = ListaNegraRepository.memoryStore.find((l) => l.placa.toUpperCase() === placaClean);
    if (item) {
      item.activo = false;
      return true;
    }
    return true;
  }
}
