import { Request, Response } from 'express';
import { ListaNegraService } from '../services/lista-negra.service.js';

const listaNegraService = new ListaNegraService();

export class ListaNegraController {
  static async obtenerLista(req: Request, res: Response) {
    try {
      const lista = await listaNegraService.obtenerVehiculosRestringidos();
      res.json(lista);
    } catch (error: any) {
      res.status(500).json({ error: error.message || 'Error al obtener Lista Negra' });
    }
  }

  static async verificarPlaca(req: Request, res: Response) {
    try {
      const { placa } = req.params;
      const restr = await listaNegraService.esPlacaRestringida(placa);
      res.json({ restringido: Boolean(restr), datos: restr });
    } catch (error: any) {
      res.status(500).json({ error: error.message || 'Error al verificar placa' });
    }
  }

  static async agregar(req: Request, res: Response) {
    try {
      const nuevo = await listaNegraService.agregarAListaNegra(req.body);
      res.status(201).json(nuevo);
    } catch (error: any) {
      res.status(400).json({ error: error.message || 'Error al agregar a Lista Negra' });
    }
  }

  static async retirar(req: Request, res: Response) {
    try {
      const { placa } = req.params;
      await listaNegraService.retirarDeListaNegra(placa);
      res.json({ mensaje: `La placa ${placa} ha sido retirada de la Lista Negra` });
    } catch (error: any) {
      res.status(400).json({ error: error.message || 'Error al retirar de Lista Negra' });
    }
  }
}
