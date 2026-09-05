import { FC } from 'react';
import { Card } from '@core/design-system/Card';
import { CajaResumen as ICajaResumen } from '../types/caja.types';
import { DollarSign, Smartphone, CreditCard, TrendingDown, Wallet, ArrowUpRight } from 'lucide-react';

interface CajaResumenProps {
  resumen: ICajaResumen;
}

export const CajaResumenComponent: FC<CajaResumenProps> = ({ resumen }) => {
  const { ingresos, gastos, balanceNeto, totalMovimientosCobrados } = resumen;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '16px' }}>
        {/* Total Ingresos */}
        <Card title="Ingresos Totales" subtitle={`${totalMovimientosCobrados} operaciones cobradas`}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <span style={{ fontSize: '1.8rem', fontWeight: 800, color: 'var(--accent-success)' }}>
              S/ {ingresos.total.toFixed(2)}
            </span>
            <div style={{ padding: '12px', background: 'var(--accent-success-bg)', borderRadius: 'var(--radius-md)', color: 'var(--accent-success)' }}>
              <ArrowUpRight size={24} />
            </div>
          </div>
        </Card>

        {/* Total Gastos */}
        <Card title="Egresos / Gastos" subtitle="Gastos del día registrados">
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <span style={{ fontSize: '1.8rem', fontWeight: 800, color: 'var(--accent-danger)' }}>
              S/ {gastos.total.toFixed(2)}
            </span>
            <div style={{ padding: '12px', background: 'var(--accent-danger-bg)', borderRadius: 'var(--radius-md)', color: 'var(--accent-danger)' }}>
              <TrendingDown size={24} />
            </div>
          </div>
        </Card>

        {/* Balance Neto */}
        <Card title="Balance Neto del Día" subtitle="Ingresos Totales - Gastos">
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <span style={{ fontSize: '1.8rem', fontWeight: 800, color: balanceNeto >= 0 ? 'var(--accent-primary)' : 'var(--accent-danger)' }}>
              S/ {balanceNeto.toFixed(2)}
            </span>
            <div style={{ padding: '12px', background: 'var(--accent-glow)', borderRadius: 'var(--radius-md)', color: 'var(--accent-primary)' }}>
              <Wallet size={24} />
            </div>
          </div>
        </Card>
      </div>

      {/* Desglose por Método de Pago */}
      <Card title="Desglose por Métodos de Pago" subtitle="Recaudación separada por cada medio de cobro">
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '12px' }}>
          <div style={{ background: 'var(--bg-primary)', padding: '14px', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-subtle)', display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div style={{ padding: '10px', background: 'rgba(34, 197, 94, 0.15)', color: '#22c55e', borderRadius: 'var(--radius-md)' }}>
              <DollarSign size={20} />
            </div>
            <div>
              <small style={{ color: 'var(--text-muted)', display: 'block' }}>Efectivo</small>
              <strong style={{ fontSize: '1.1rem', color: 'var(--text-primary)' }}>S/ {ingresos.efectivo.toFixed(2)}</strong>
            </div>
          </div>

          <div style={{ background: 'var(--bg-primary)', padding: '14px', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-subtle)', display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div style={{ padding: '10px', background: 'rgba(168, 85, 247, 0.15)', color: '#a855f7', borderRadius: 'var(--radius-md)' }}>
              <Smartphone size={20} />
            </div>
            <div>
              <small style={{ color: 'var(--text-muted)', display: 'block' }}>Yape</small>
              <strong style={{ fontSize: '1.1rem', color: 'var(--text-primary)' }}>S/ {ingresos.yape.toFixed(2)}</strong>
            </div>
          </div>

          <div style={{ background: 'var(--bg-primary)', padding: '14px', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-subtle)', display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div style={{ padding: '10px', background: 'rgba(6, 182, 212, 0.15)', color: '#06b6d4', borderRadius: 'var(--radius-md)' }}>
              <Smartphone size={20} />
            </div>
            <div>
              <small style={{ color: 'var(--text-muted)', display: 'block' }}>Plin</small>
              <strong style={{ fontSize: '1.1rem', color: 'var(--text-primary)' }}>S/ {ingresos.plin.toFixed(2)}</strong>
            </div>
          </div>

          <div style={{ background: 'var(--bg-primary)', padding: '14px', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-subtle)', display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div style={{ padding: '10px', background: 'rgba(59, 130, 246, 0.15)', color: '#3b82f6', borderRadius: 'var(--radius-md)' }}>
              <CreditCard size={20} />
            </div>
            <div>
              <small style={{ color: 'var(--text-muted)', display: 'block' }}>Tarjeta</small>
              <strong style={{ fontSize: '1.1rem', color: 'var(--text-primary)' }}>S/ {ingresos.tarjeta.toFixed(2)}</strong>
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
};
