export type FormatoTicket = '80mm' | '58mm';
export type UserRole = 'ADMIN' | 'OPERADOR' | 'CAJERO';

export interface EmpresaConfig {
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

export interface Usuario {
  id: number;
  nombre: string;
  email: string;
  rol: UserRole;
  estado: number;
  creado_en?: string;
}

export interface CrearUsuarioDTO {
  nombre: string;
  email: string;
  password_hash: string;
  rol: UserRole;
}

export interface ActualizarUsuarioDTO {
  nombre?: string;
  email?: string;
  rol?: UserRole;
  estado?: number;
}
