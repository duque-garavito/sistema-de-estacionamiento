export interface VehiculoListaNegra {
  id: number;
  placa: string;
  motivo: string;
  activo: boolean;
  registradoPor: string;
  creadoEn?: string;
}

export interface AgregarListaNegraDTO {
  placa: string;
  motivo: string;
  registradoPor?: string;
}
