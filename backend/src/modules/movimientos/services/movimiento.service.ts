import { MovimientoRepository } from '../repositories/movimiento.repository.js';
import { TarifaService } from '../../tarifas/services/tarifa.service.js';
import { ListaNegraService } from '../../lista-negra/services/lista-negra.service.js';
import { BoletaRepository } from '../../boletas/repositories/boleta.repository.js';
import { RegistrarEntradaDTO, RegistrarSalidaDTO, MovimientoEntity, ActualizarInfoMovimientoDTO } from '../types/movimiento.types.js';

export class MovimientoService {
  private repository: MovimientoRepository;
  private tarifaService: TarifaService;
  private listaNegraService: ListaNegraService;
  private boletaRepository: BoletaRepository;

  constructor() {
    this.repository = new MovimientoRepository();
    this.tarifaService = new TarifaService();
    this.listaNegraService = new ListaNegraService();
    this.boletaRepository = new BoletaRepository();
  }

  async obtenerMovimientosActivos(): Promise<MovimientoEntity[]> {
    return await this.repository.findActivos();
  }

  async obtenerHistorialMovimientos(placa?: string): Promise<MovimientoEntity[]> {
    return await this.repository.findHistorial(placa);
  }

  async obtenerMovimientoPorId(id: string): Promise<MovimientoEntity> {
    const mov = await this.repository.findById(id);
    if (!mov) throw new Error('Movimiento no encontrado.');
    return mov;
  }

  async actualizarInfoMovimiento(id: string, dto: ActualizarInfoMovimientoDTO): Promise<MovimientoEntity> {
    const actualizado = await this.repository.updateInfoInformativa(id, dto);
    if (!actualizado) throw new Error('No se encontró el movimiento para actualizar.');
    return actualizado;
  }

  async registrarIngresoVehiculo(dto: RegistrarEntradaDTO): Promise<MovimientoEntity> {
    const placaClean = (dto.placa || '').trim().toUpperCase();
    if (!placaClean) {
      throw new Error('La placa del vehículo es obligatoria.');
    }

    // 1. VERIFICACIÓN LISTA NEGRA (Rechazo inmediato si la placa está restringida)
    const vehiculoRestringido = await this.listaNegraService.esPlacaRestringida(placaClean);
    if (vehiculoRestringido && vehiculoRestringido.activo) {
      throw new Error(
        `ATENCIÓN: El vehículo con placa ${placaClean} se encuentra en la LISTA NEGRA por el siguiente motivo: "${vehiculoRestringido.motivo}"`
      );
    }

    // 2. VERIFICACIÓN MOVIMIENTO ACTIVO (Rechazo si ya existe parqueo abierto)
    const existente = await this.repository.findByPlacaActiva(placaClean);
    if (existente) {
      throw new Error(`El vehículo con placa ${placaClean} ya se encuentra registrado en el parqueo.`);
    }

    // 3. CONSULTA OBLIGATORIA DE TARIFA VIGENTE DESDE MYSQL (Sin fallback a valores hardcodeados)
    const tarifaObj = await this.tarifaService.obtenerTarifaPorTipo(dto.tipoVehiculo);
    if (!tarifaObj || !tarifaObj.activo) {
      throw new Error(`No se encontró una tarifa activa para el tipo de vehículo '${dto.tipoVehiculo}'. Configure el tarifario en MySQL.`);
    }

    // 4. REGISTRAR E IMPRIMIR SNAPSHOT DE TARIFA APLICADA AL MOVIMIENTO
    return await this.repository.create(
      { ...dto, placa: placaClean },
      tarifaObj.precioDia
    );
  }

  async registrarSalidaVehiculo(dto: RegistrarSalidaDTO): Promise<MovimientoEntity> {
    const movimiento = await this.repository.findById(dto.movimientoId);
    if (!movimiento) {
      throw new Error('El registro de parqueo especificado no existe.');
    }

    const fechaSalida = new Date();
    
    // Delegar cálculo desacoplado con la TARIFA CONGELADA DE ENTRADA
    const calculo = await this.tarifaService.calcularCobroPorDia(
      new Date(movimiento.fechaEntrada),
      fechaSalida,
      movimiento.tarifaDiaAplicada,
      movimiento.momentoPago,
      dto.descuento || 0
    );

    const movimientoActualizado = await this.repository.updateSalida(
      dto.movimientoId,
      fechaSalida,
      calculo.totalPagar,
      calculo.diasCobrados,
      dto.metodoPago,
      dto.usuarioSalida || 'Operador Salida'
    );

    if (!movimientoActualizado) {
      throw new Error('No se pudo actualizar el estado de salida.');
    }

    return movimientoActualizado;
  }

  async obtenerTicketEntradaData(id: string) {
    const mov = await this.repository.findById(id);
    if (!mov) throw new Error('Movimiento no encontrado.');
    const empresa = await this.boletaRepository.getEmpresaConfig();
    const fEntrada = new Date(mov.fechaEntrada);

    return {
      codigoTicket: mov.codigoTicket,
      placa: mov.placa,
      tipoVehiculo: mov.tipoVehiculo,
      color: mov.color,
      marcaModelo: mov.marcaModelo,
      propietarioDni: mov.propietarioDni,
      propietarioNombre: mov.propietarioNombre,
      fechaEntrada: fEntrada.toISOString(),
      horaEntrada: fEntrada.toLocaleTimeString(),
      tarifaDiaAplicada: mov.tarifaDiaAplicada,
      momentoPago: mov.momentoPago,
      metodoPago: mov.metodoPago,
      usuarioIngreso: mov.usuarioIngreso || 'Operador Entrada',
      ubicacion: mov.ubicacion,
      observaciones: mov.observaciones,
      establecimiento: {
        nombreComercial: empresa.nombreComercial,
        razonSocial: empresa.razonSocial,
        ruc: empresa.ruc,
        direccion: empresa.direccion,
        telefono: empresa.telefono,
        leyendaTicket: empresa.leyendaTicket,
      },
    };
  }

  async obtenerTicketSalidaData(id: string) {
    const mov = await this.repository.findById(id);
    if (!mov) throw new Error('Movimiento no encontrado.');
    const empresa = await this.boletaRepository.getEmpresaConfig();

    return {
      codigoTicket: mov.codigoTicket,
      placa: mov.placa,
      tipoVehiculo: mov.tipoVehiculo,
      fechaEntrada: new Date(mov.fechaEntrada).toISOString(),
      fechaSalida: mov.fechaSalida ? new Date(mov.fechaSalida).toISOString() : new Date().toISOString(),
      diasCobrados: mov.diasCobrados || 1,
      tarifaDiaAplicada: mov.tarifaDiaAplicada,
      totalPagar: mov.totalPagar !== undefined && mov.totalPagar !== null ? mov.totalPagar : (mov.momentoPago === 'ENTRADA' ? 0 : mov.tarifaDiaAplicada),
      momentoPago: mov.momentoPago,
      metodoPago: mov.metodoPago || 'Efectivo',
      usuarioSalida: mov.usuarioSalida || 'Operador Salida',
      establecimiento: {
        nombreComercial: empresa.nombreComercial,
        razonSocial: empresa.razonSocial,
        ruc: empresa.ruc,
        direccion: empresa.direccion,
        telefono: empresa.telefono,
        leyendaTicket: empresa.leyendaTicket,
      },
    };
  }
}


