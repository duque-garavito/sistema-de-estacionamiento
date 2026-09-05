import { FC } from 'react';
import { Card } from '@core/design-system/Card';
import { Car, DollarSign, TrendingUp, TrendingDown, Wallet, Smartphone, CreditCard } from 'lucide-react';
import { DashboardResumen } from '../types/dashboard.types';

interface DashboardStatsProps {
  stats: DashboardResumen;
}

export const DashboardStats: FC<DashboardStatsProps> = ({ stats }) => {
  const porcentajeOcupacion = Math.min(
    100,
    Math.round((stats.vehiculosParqueados / (stats.capacidadTotal || 50)) * 100)
  );

  const metodos = stats.metodosPago || { efectivo: 0, yape: 0, plin: 0, tarjeta: 0 };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      {/* Top 4 KPI Cards */}
      <div className="responsive-grid-4">
        {/* KPI 1: Ocupación */}
        <Card style={{ padding: '16px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div>
              <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', fontWeight: 700, letterSpacing: '0.5px' }}>
                DENTRO AHORA
              </span>
              <h3 style={{ fontSize: '1.6rem', fontWeight: 800, marginTop: '4px', color: 'var(--text-primary)' }}>
                {stats.vehiculosParqueados} / {stats.capacidadTotal || 50}
              </h3>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginTop: '4px' }}>
                <span style={{ fontSize: '0.75rem', color: 'var(--accent-primary)', fontWeight: 700 }}>
                  {porcentajeOcupacion}% ocupado
                </span>
              </div>
            </div>
            <div style={{ background: 'var(--accent-glow)', padding: '12px', borderRadius: 'var(--radius-md)', color: 'var(--accent-primary)' }}>
              <Car size={24} />
            </div>
          </div>
        </Card>

        {/* KPI 2: Ingresos Hoy */}
        <Card style={{ padding: '16px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div>
              <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', fontWeight: 700, letterSpacing: '0.5px' }}>
                INGRESOS DÍA
              </span>
              <h3 style={{ fontSize: '1.6rem', fontWeight: 800, marginTop: '4px', color: 'var(--accent-success)' }}>
                S/ {stats.ingresosHoy.toFixed(2)}
              </h3>
              <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                {stats.totalMovimientosHoy} operaciones
              </span>
            </div>
            <div style={{ background: 'var(--accent-success-bg)', padding: '12px', borderRadius: 'var(--radius-md)', color: 'var(--accent-success)' }}>
              <TrendingUp size={24} />
            </div>
          </div>
        </Card>

        {/* KPI 3: Gastos Hoy */}
        <Card style={{ padding: '16px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div>
              <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', fontWeight: 700, letterSpacing: '0.5px' }}>
                GASTOS DÍA
              </span>
              <h3 style={{ fontSize: '1.6rem', fontWeight: 800, marginTop: '4px', color: 'var(--accent-danger)' }}>
                S/ {(stats.gastosHoy || 0).toFixed(2)}
              </h3>
              <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Egresos de caja</span>
            </div>
            <div style={{ background: 'rgba(239, 68, 68, 0.15)', padding: '12px', borderRadius: 'var(--radius-md)', color: 'var(--accent-danger)' }}>
              <TrendingDown size={24} />
            </div>
          </div>
        </Card>

        {/* KPI 4: Balance Neto */}
        <Card style={{ padding: '16px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div>
              <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', fontWeight: 700, letterSpacing: '0.5px' }}>
                BALANCE NETO
              </span>
              <h3 style={{ fontSize: '1.6rem', fontWeight: 800, marginTop: '4px', color: (stats.balanceHoy || 0) >= 0 ? 'var(--accent-primary)' : 'var(--accent-danger)' }}>
                S/ {(stats.balanceHoy || stats.ingresosHoy - (stats.gastosHoy || 0)).toFixed(2)}
              </h3>
              <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Caja chica disponible</span>
            </div>
            <div style={{ background: 'var(--accent-glow)', padding: '12px', borderRadius: 'var(--radius-md)', color: 'var(--accent-primary)' }}>
              <DollarSign size={24} />
            </div>
          </div>
        </Card>
      </div>

      {/* Recaudación por Métodos de Pago */}
      <Card title="Recaudación por Método de Pago (Hoy)" subtitle="Desglose en tiempo real de cobranza">
        <div className="responsive-grid-4" style={{ marginTop: '12px' }}>
          <div style={{ background: 'var(--bg-primary)', padding: '14px', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-subtle)', display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div style={{ background: 'rgba(34, 197, 94, 0.15)', padding: '10px', borderRadius: 'var(--radius-sm)', color: '#22c55e' }}>
              <Wallet size={20} />
            </div>
            <div>
              <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', display: 'block', textTransform: 'uppercase', fontWeight: 600 }}>Efectivo</span>
              <strong style={{ fontSize: '1.1rem', color: 'var(--text-primary)' }}>S/ {metodos.efectivo.toFixed(2)}</strong>
            </div>
          </div>

          <div style={{ background: 'var(--bg-primary)', padding: '14px', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-subtle)', display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div style={{ background: 'rgba(168, 85, 247, 0.15)', padding: '10px', borderRadius: 'var(--radius-sm)', color: '#a855f7' }}>
              <Smartphone size={20} />
            </div>
            <div>
              <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', display: 'block', textTransform: 'uppercase', fontWeight: 600 }}>Yape</span>
              <strong style={{ fontSize: '1.1rem', color: 'var(--text-primary)' }}>S/ {metodos.yape.toFixed(2)}</strong>
            </div>
          </div>

          <div style={{ background: 'var(--bg-primary)', padding: '14px', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-subtle)', display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div style={{ background: 'rgba(6, 182, 212, 0.15)', padding: '10px', borderRadius: 'var(--radius-sm)', color: '#06b6d4' }}>
              <Smartphone size={20} />
            </div>
            <div>
              <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', display: 'block', textTransform: 'uppercase', fontWeight: 600 }}>Plin</span>
              <strong style={{ fontSize: '1.1rem', color: 'var(--text-primary)' }}>S/ {metodos.plin.toFixed(2)}</strong>
            </div>
          </div>

          <div style={{ background: 'var(--bg-primary)', padding: '14px', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-subtle)', display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div style={{ background: 'rgba(59, 130, 246, 0.15)', padding: '10px', borderRadius: 'var(--radius-sm)', color: '#3b82f6' }}>
              <CreditCard size={20} />
            </div>
            <div>
              <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', display: 'block', textTransform: 'uppercase', fontWeight: 600 }}>Tarjeta</span>
              <strong style={{ fontSize: '1.1rem', color: 'var(--text-primary)' }}>S/ {metodos.tarjeta.toFixed(2)}</strong>
            </div>
          </div>
        </div>
      </Card>

      {/* Operaciones Recientes (Tablas duales rápidas) */}
      {((stats.ultimasEntradas && stats.ultimasEntradas.length > 0) || (stats.ultimasSalidas && stats.ultimasSalidas.length > 0)) && (
        <div className="responsive-grid-2">
          {/* ÚLLTIMAS ENTRADAS */}
          <Card title="Últimos Ingresos" subtitle="Vehículos ingresados recientemente">
            <div style={{ marginTop: '10px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {(stats.ultimasEntradas || []).map((ent) => (
                <div key={ent.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 14px', background: 'var(--bg-primary)', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-subtle)' }}>
                  <div>
                    <strong style={{ fontSize: '0.95rem', color: 'var(--accent-primary)' }}>{ent.placa}</strong>
                    <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginLeft: '8px' }}>{ent.tipoVehiculo}</span>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', display: 'block' }}>
                      {new Date(ent.fechaEntrada).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                    <span className={`badge ${ent.momentoPago === 'ENTRADA' ? 'badge-success' : 'badge-warning'}`} style={{ fontSize: '0.7rem' }}>
                      {ent.momentoPago === 'ENTRADA' ? 'Pagado en Entrada' : 'Pendiente al Salir'}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </Card>

          {/* ÚLLTIMAS SALIDAS */}
          <Card title="Últimas Salidas & Cobros" subtitle="Cobros procesados recientemente">
            <div style={{ marginTop: '10px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {(stats.ultimasSalidas || []).map((sal) => (
                <div key={sal.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 14px', background: 'var(--bg-primary)', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-subtle)' }}>
                  <div>
                    <strong style={{ fontSize: '0.95rem', color: 'var(--text-primary)' }}>{sal.placa}</strong>
                    <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginLeft: '8px' }}>{sal.tipoVehiculo}</span>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <strong style={{ fontSize: '0.95rem', color: 'var(--accent-success)', display: 'block' }}>
                      S/ {sal.totalPagar.toFixed(2)} ({sal.metodoPago})
                    </strong>
                    <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                      {new Date(sal.fechaSalida).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </div>
      )}
    </div>
  );
};
