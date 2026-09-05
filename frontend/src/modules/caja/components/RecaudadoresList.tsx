import { FC } from 'react';
import { Table, Column } from '@core/design-system/Table';
import { RecaudadorItem } from '../types/caja.types';
import { UserCheck } from 'lucide-react';

interface RecaudadoresListProps {
  recaudadores: RecaudadorItem[];
}

export const RecaudadoresList: FC<RecaudadoresListProps> = ({ recaudadores }) => {
  const columns: Column<RecaudadorItem>[] = [
    {
      header: 'Operador Recaudador',
      cell: (item) => (
        <span style={{ display: 'flex', alignItems: 'center', gap: '8px', fontWeight: 700 }}>
          <UserCheck size={16} color="var(--accent-primary)" />
          {item.usuarioNombre}
        </span>
      ),
    },
    {
      header: 'Operaciones Realizadas',
      cell: (item) => (
        <span className="badge badge-success">
          {item.cantidadOperaciones} cobro(s)
        </span>
      ),
    },
    {
      header: 'Total Recaudado (S/)',
      cell: (item) => (
        <strong style={{ color: 'var(--accent-success)', fontSize: '1rem' }}>
          S/ {item.totalCobrado.toFixed(2)}
        </strong>
      ),
    },
  ];

  return (
    <Table
      columns={columns}
      data={recaudadores}
      keyExtractor={(item) => String(item.usuarioId)}
      emptyMessage="No hay operaciones registradas por operadores en esta fecha"
    />
  );
};
