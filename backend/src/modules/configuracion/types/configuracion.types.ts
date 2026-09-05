export type FormatoTicket = '80mm' | '58mm';

export interface EmpresaConfigEntity {
  id: number;
  ruc: string;
  razonSocial: string;
  nombreComercial: string;
  direccion: string;
  telefono: string;
  serieBoleta: string;
  correlativoBoleta: number;
  serieFactura: string;
  correlativoFactura: number;
  leyendaTicket: string;
  capacidadTotal: number;
  formatoTicket: FormatoTicket;
  toleranciaMinutos: number;
}

export interface ActualizarConfigDTO {
  ruc?: string;
  razonSocial?: string;
  nombreComercial?: string;
  direccion?: string;
  telefono?: string;
  serieBoleta?: string;
  correlativoBoleta?: number;
  serieFactura?: string;
  correlativoFactura?: number;
  leyendaTicket?: string;
  capacidadTotal?: number;
  formatoTicket?: FormatoTicket;
  toleranciaMinutos?: number;
}
