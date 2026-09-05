import { ListaNegraRepository } from '../repositories/lista-negra.repository.js';
import { ListaNegraEntity, AgregarListaNegraDTO } from '../types/lista-negra.types.js';

export class ListaNegraService {
  private repository: ListaNegraRepository;

  constructor() {
    this.repository = new ListaNegraRepository();
  }

  async obtenerVehiculosRestringidos(): Promise<ListaNegraEntity[]> {
    return await this.repository.findAll();
  }

  async esPlacaRestringida(placa: string): Promise<ListaNegraEntity | null> {
    if (!placa) return null;
    return await this.repository.findByPlaca(placa);
  }

  async agregarAListaNegra(dto: AgregarListaNegraDTO): Promise<ListaNegraEntity> {
    if (!dto.placa || !dto.placa.trim()) {
      throw new Error('La placa a registrar en Lista Negra es obligatoria.');
    }
    if (!dto.motivo || !dto.motivo.trim()) {
      throw new Error('El motivo de restricción es obligatorio.');
    }
    const existente = await this.esPlacaRestringida(dto.placa);
    if (existente) {
      throw new Error(`La placa ${dto.placa.toUpperCase()} ya está registrada en la Lista Negra.`);
    }
    return await this.repository.create(dto);
  }

  async retirarDeListaNegra(placa: string): Promise<boolean> {
    if (!placa) throw new Error('Placa no especificada.');
    return await this.repository.desactivar(placa);
  }
}
