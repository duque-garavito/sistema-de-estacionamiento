export type RangoFechaTipo = 'hoy' | 'ayer' | 'semana' | 'mes' | 'personalizado';

export interface FiltrosReporte {
  rango: RangoFechaTipo;
  fechaInicio?: string;
  fechaFin?: string;
}

export interface ReporteIngresos {
  totalRecaudado: number;
  totalOperaciones: number;
  metodosPago: {
    efectivo: number;
    yape: number;
    plin: number;
    tarjeta: number;
  };
  promedioTicket: number;
  ingresosPorDia: { fecha: string; monto: number; cantidad: number }[];
}

export interface ReporteVehiculos {
  totalAtendidos: number;
  entradasRegistradas: number;
  salidasRegistradas: number;
  actualmenteParqueados: number;
  placasFrecuentes: { placa: string; visitas: number; totalGasto: number; tipoVehiculo: string }[];
}

export interface ReporteOperador {
  operador: string;
  entradasRegistradas: number;
  salidasRegistradas: number;
  cobrosRealizados: number;
  totalRecaudado: number;
  metodosPago: { efectivo: number; yape: number; plin: number; tarjeta: number };
}

export interface ReporteCajaBalance {
  ingresosTotales: number;
  desgloseIngresos: { efectivo: number; yape: number; plin: number; tarjeta: number };
  gastosTotales: number;
  balanceNeto: number;
  gastosDetalle: { id: number; descripcion: string; monto: number; usuarioNombre: string; fechaHora: string }[];
}

export interface RegistroAuditoria {
  id: string;
  codigoTicket: string;
  placa: string;
  tipoVehiculo: string;
  accion: string;
  usuario: string;
  monto: number;
  metodoPago: string;
  fechaHora: string;
}
