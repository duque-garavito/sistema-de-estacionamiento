import { FC } from 'react';
import { Table, Column } from '@core/design-system/Table';
import { CajaDetalle as ICajaDetalle } from '../types/caja.types';
import { LogIn, LogOut } from 'lucide-react';

interface CajaDetalleProps {
  detalle: ICajaDetalle;
}

interface AuditRow {
  id: string;
  tipo: 'INGRESO' | 'GASTO';
  ticketPlaca: string;
  concepto: string;
  momentoPago: string;
  metodoPago: string;
  monto: number;
  operador: string;
  fechaHora: string;
}

export const CajaDetalleComponent: FC<CajaDetalleProps> = ({ detalle }) => {
  const { movimientos, gastos } = detalle;

  const rows: AuditRow[] = [
    ...movimientos.map((m) => ({
      id: `MOV-${m.id}`,
      tipo: 'INGRESO' as const,
      ticketPlaca: `${m.codigoTicket} / ${m.placa}`,
      concepto: `Cobro Parqueo ${m.tipoVehiculo}`,
      momentoPago: m.momentoPago,
      metodoPago: m.metodoPago,
      monto: m.importe,
      operador: m.operadorNombre,
      fechaHora: m.fechaHoraRealPago,
    })),
    ...gastos.map((g) => ({
      id: `GAS-${g.id}`,
      tipo: 'GASTO' as const,
      ticketPlaca: 'EGRESO DE CAJA',
      concepto: g.descripcion,
      momentoPago: 'GASTO',
      metodoPago: 'Efectivo',
      monto: -g.monto,
      operador: g.usuarioNombre,
      fechaHora: g.fechaHora,
    })),
  ].sort((a, b) => new Date(b.fechaHora).getTime() - new Date(a.fechaHora).getTime());

  const columns: Column<AuditRow>[] = [
    {
      header: 'Ticket / Identificador',
      cell: (item) => (
        <span style={{ fontWeight: 700, color: 'var(--text-primary)' }}>
          {item.ticketPlaca}
        </span>
      ),
    },
    {
      header: 'Concepto / Vehículo',
      cell: (item) => item.concepto,
    },
    {
      header: 'Momento de Pago',
      cell: (item) => (
        <span className={`badge ${item.tipo === 'GASTO' ? 'badge-danger' : item.momentoPago === 'ENTRADA' ? 'badge-success' : 'badge-warning'}`}>
          {item.tipo === 'GASTO' && <TrendingDownIcon size={12} />}
          {item.momentoPago === 'ENTRADA' && <LogIn size={12} />}
          {item.momentoPago === 'SALIDA' && <LogOut size={12} />}
          {item.tipo === 'GASTO' ? 'Gasto Operativo' : item.momentoPago === 'ENTRADA' ? 'Cobrado Entrada' : 'Cobrado Salida'}
        </span>
      ),
    },
    {
      header: 'Medio de Pago',
      cell: (item) => item.metodoPago,
    },
    {
      header: 'Importe (S/)',
      cell: (item) => (
        <strong style={{ color: item.monto >= 0 ? 'var(--accent-success)' : 'var(--accent-danger)', fontSize: '0.95rem' }}>
          {item.monto >= 0 ? `+ S/ ${item.monto.toFixed(2)}` : `- S/ ${Math.abs(item.monto).toFixed(2)}`}
        </strong>
      ),
    },
    {
      header: 'Operador Responsable',
      cell: (item) => item.operador,
    },
    {
      header: 'Fecha / Hora Real',
      cell: (item) => new Date(item.fechaHora).toLocaleString([], { dateStyle: 'short', timeStyle: 'short' }),
    },
  ];

  return (
    <Table
      columns={columns}
      data={rows}
      keyExtractor={(item) => item.id}
      emptyMessage="No existen registros auditable de movimientos o gastos en esta fecha"
    />
  );
};

const TrendingDownIcon: FC<{ size?: number }> = ({ size = 12 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <polyline points="23 18 13.5 8.5 8.5 13.5 1 6" />
    <polyline points="17 18 23 18 23 12" />
  </svg>
);
