export interface DashboardStatsDTO {
  vehiculosParqueados: number;
  capacidadTotal: number;
  ingresosHoy: number;
  gastosHoy: number;
  balanceHoy: number;
  totalMovimientosHoy: number;
  cajaAbierta: boolean;
  metodosPago: {
    efectivo: number;
    yape: number;
    plin: number;
    tarjeta: number;
  };
  ultimasEntradas: {
    id: string;
    placa: string;
    tipoVehiculo: string;
    fechaEntrada: Date;
    momentoPago: string;
  }[];
  ultimasSalidas: {
    id: string;
    placa: string;
    tipoVehiculo: string;
    fechaSalida: Date;
    totalPagar: number;
    metodoPago: string;
  }[];
}
