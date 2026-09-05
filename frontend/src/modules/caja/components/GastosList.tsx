import { FC } from 'react';
import { Table, Column } from '@core/design-system/Table';
import { Gasto } from '../types/caja.types';

interface GastosListProps {
  gastos: Gasto[];
}

export const GastosList: FC<GastosListProps> = ({ gastos }) => {
  const columns: Column<Gasto>[] = [
    {
      header: 'Descripción del Gasto',
      cell: (item) => (
        <span style={{ fontWeight: 600, color: 'var(--text-primary)' }}>
          {item.descripcion}
        </span>
      ),
    },
    {
      header: 'Monto (S/)',
      cell: (item) => (
        <strong style={{ color: 'var(--accent-danger)', fontSize: '0.95rem' }}>
          - S/ {item.monto.toFixed(2)}
        </strong>
      ),
    },
    {
      header: 'Registrado Por',
      cell: (item) => item.usuarioNombre || 'Administrador',
    },
    {
      header: 'Fecha / Hora',
      cell: (item) => new Date(item.fechaHora).toLocaleString([], { dateStyle: 'short', timeStyle: 'short' }),
    },
  ];

  return (
    <Table
      columns={columns}
      data={gastos}
      keyExtractor={(item) => item.id}
      emptyMessage="No hay egresos o gastos registrados en esta fecha"
    />
  );
};
