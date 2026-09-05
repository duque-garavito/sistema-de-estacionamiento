import { FC } from 'react';
import { Table, Column } from '@core/design-system/Table';
import { Button } from '@core/design-system/Button';
import { Movimiento } from '../types/movimiento.types';
import { LogOut, Calendar, Car, ShieldCheck, Printer } from 'lucide-react';

interface VehiculosActivosProps {
  movimientos: Movimiento[];
  onSalidaSelect: (movimiento: Movimiento) => void;
  onVerTicket?: (movimiento: Movimiento) => void;
}

export const VehiculosActivos: FC<VehiculosActivosProps> = ({
  movimientos,
  onSalidaSelect,
  onVerTicket,
}) => {
  const calcularDiasTranscurridos = (fechaEntradaStr: string) => {
    const entrada = new Date(fechaEntradaStr);
    const ahora = new Date();

    const entradaYear = entrada.getFullYear();
    const entradaMonth = entrada.getMonth();
    const entradaDate = entrada.getDate();

    const ahoraYear = ahora.getFullYear();
    const ahoraMonth = ahora.getMonth();
    const ahoraDate = ahora.getDate();

    if (entradaYear === ahoraYear && entradaMonth === ahoraMonth && entradaDate === ahoraDate) {
      return '1 día (Hoy)';
    }

    const startMidnight = new Date(entradaYear, entradaMonth, entradaDate).getTime();
    const endMidnight = new Date(ahoraYear, ahoraMonth, ahoraDate).getTime();
    const diffDaysCalendar = Math.round((endMidnight - startMidnight) / (1000 * 60 * 60 * 24));
    return `${Math.max(1, diffDaysCalendar + 1)} días`;
  };

  const columns: Column<Movimiento>[] = [
    {
      header: 'Placa',
      cell: (item) => (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
          <span className="plate-tag">{item.placa}</span>
          {item.propietarioNombre && (
            <small style={{ color: 'var(--text-muted)', fontSize: '0.75rem' }}>
              👤 {item.propietarioNombre}
            </small>
          )}
        </div>
      ),
    },
    {
      header: 'Tipo',
      cell: (item) => (
        <span style={{ display: 'flex', alignItems: 'center', gap: '6px', fontWeight: 600 }}>
          <Car size={16} color="var(--accent-primary)" />
          {item.tipoVehiculo}
        </span>
      ),
    },
    {
      header: 'Fecha / Hora Ingreso',
      cell: (item) => new Date(item.fechaEntrada).toLocaleString([], { dateStyle: 'short', timeStyle: 'short' }),
    },
    {
      header: 'Permanencia (Días)',
      cell: (item) => (
        <span style={{ display: 'flex', alignItems: 'center', gap: '4px', color: 'var(--accent-warning)', fontWeight: 600 }}>
          <Calendar size={14} />
          {calcularDiasTranscurridos(item.fechaEntrada)}
        </span>
      ),
    },
    {
      header: 'Tarifa / Día',
      cell: (item) => {
        const tarifaDia = item.tarifaDiaAplicada ?? 10.0;
        return `S/ ${tarifaDia.toFixed(2)}`;
      },
    },
    {
      header: 'Estado Pago',
      cell: (item) => (
        <span className={`badge ${item.momentoPago === 'ENTRADA' ? 'badge-success' : 'badge-warning'}`}>
          {item.momentoPago === 'ENTRADA' ? <ShieldCheck size={12} /> : null}
          {item.momentoPago === 'ENTRADA' ? 'Pagado al Entrar' : 'Pendiente Salida'}
        </span>
      ),
    },
    {
      header: 'Acciones',
      cell: (item) => (
        <div style={{ display: 'flex', gap: '6px' }}>
          {onVerTicket && (
            <Button
              variant="secondary"
              style={{ padding: '6px 10px', fontSize: '0.8rem' }}
              onClick={() => onVerTicket(item)}
              icon={<Printer size={14} />}
            >
              Ticket
            </Button>
          )}
          <Button
            variant={item.momentoPago === 'ENTRADA' ? 'secondary' : 'danger'}
            style={{ padding: '6px 12px', fontSize: '0.8rem' }}
            onClick={() => onSalidaSelect(item)}
            icon={<LogOut size={14} />}
          >
            {item.momentoPago === 'ENTRADA' ? 'Salida' : 'Salida / Cobrar'}
          </Button>
        </div>
      ),
    },
  ];

  return (
    <Table
      columns={columns}
      data={movimientos}
      keyExtractor={(item) => item.id}
      emptyMessage="No hay vehículos parqueados actualmente"
    />
  );
};
