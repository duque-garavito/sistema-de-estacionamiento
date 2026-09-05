export interface ListaNegraEntity {
  id: number;
  placa: string;
  motivo: string;
  activo: boolean;
  registradoPor: string;
  creadoEn?: Date;
}

export interface AgregarListaNegraDTO {
  placa: string;
  motivo: string;
  registradoPor?: string;
}
