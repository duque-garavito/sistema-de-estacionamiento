import { useState, useEffect, useCallback } from 'react';
import {
  CajaResumen,
  Gasto,
  RecaudadorItem,
  CajaDetalle,
  HistorialDiaCaja,
  RegistrarGastoDTO,
} from '../types/caja.types';
import { CajaService } from '../services/caja.service';

export function useCaja(fechaInicial?: string) {
  const [fecha, setFecha] = useState<string>(fechaInicial || new Date().toISOString().split('T')[0]);
  const [resumen, setResumen] = useState<CajaResumen | null>(null);
  const [gastos, setGastos] = useState<Gasto[]>([]);
  const [recaudadores, setRecaudadores] = useState<RecaudadorItem[]>([]);
  const [detalle, setDetalle] = useState<CajaDetalle | null>(null);
  const [historial, setHistorial] = useState<HistorialDiaCaja[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string>('');

  const cargarDatos = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const [rData, gData, recData, dData, hData] = await Promise.all([
        CajaService.obtenerResumen(fecha),
        CajaService.obtenerGastos(fecha),
        CajaService.obtenerRecaudadores(fecha),
        CajaService.obtenerDetalle(fecha),
        CajaService.obtenerHistorial(30),
      ]);
      setResumen(rData);
      setGastos(gData);
      setRecaudadores(recData);
      setDetalle(dData);
      setHistorial(hData);
    } catch (err: any) {
      setError(err.message || 'Error al cargar información de caja');
    } finally {
      setLoading(false);
    }
  }, [fecha]);

  useEffect(() => {
    cargarDatos();
  }, [cargarDatos]);

  const registrarGasto = async (dto: RegistrarGastoDTO) => {
    await CajaService.registrarGasto(dto);
    await cargarDatos();
  };

  return {
    fecha,
    setFecha,
    resumen,
    gastos,
    recaudadores,
    detalle,
    historial,
    loading,
    error,
    refetch: cargarDatos,
    registrarGasto,
  };
}
