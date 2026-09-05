export interface TicketEstablecimientoInfo {
  nombreComercial: string;
  razonSocial: string;
  ruc: string;
  direccion: string;
  telefono: string;
  leyendaTicket: string;
}

export interface TicketEntradaData {
  codigoTicket: string;
  placa: string;
  tipoVehiculo: string;
  color?: string;
  marcaModelo?: string;
  propietarioDni?: string;
  propietarioNombre?: string;
  fechaEntrada: string;
  horaEntrada: string;
  tarifaDiaAplicada: number;
  momentoPago: 'ENTRADA' | 'SALIDA';
  metodoPago?: string;
  usuarioIngreso: string;
  ubicacion?: string;
  observaciones?: string;
  establecimiento: TicketEstablecimientoInfo;
}

export interface TicketSalidaData {
  codigoTicket: string;
  placa: string;
  tipoVehiculo: string;
  fechaEntrada: string;
  fechaSalida: string;
  diasCobrados: number;
  tarifaDiaAplicada: number;
  totalPagar: number;
  momentoPago: 'ENTRADA' | 'SALIDA';
  metodoPago: string;
  usuarioSalida: string;
  establecimiento: TicketEstablecimientoInfo;
}
