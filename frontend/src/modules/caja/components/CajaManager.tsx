import { useState, FC } from 'react';
import { Card } from '@core/design-system/Card';
import { Button } from '@core/design-system/Button';
import { Table, Column } from '@core/design-system/Table';
import { useCaja } from '../hooks/useCaja';
import { CajaResumenComponent } from './CajaResumen';
import { GastosList } from './GastosList';
import { RegistrarGastoModal } from './RegistrarGastoModal';
import { RecaudadoresList } from './RecaudadoresList';
import { CajaDetalleComponent } from './CajaDetalle';
import { HistorialDiaCaja } from '../types/caja.types';
import { Calendar, Plus, RefreshCw, Layers, History, DollarSign, Users, FileText } from 'lucide-react';

export const CajaManager: FC = () => {
  const {
    fecha,
    setFecha,
    resumen,
    gastos,
    recaudadores,
    detalle,
    historial,
    loading,
    refetch,
    registrarGasto,
  } = useCaja();

  const [activeSubTab, setActiveSubTab] = useState<'resumen' | 'gastos' | 'recaudadores' | 'detalle' | 'historial'>('resumen');
  const [isGastoModalOpen, setIsGastoModalOpen] = useState(false);

  const historialColumns: Column<HistorialDiaCaja>[] = [
    {
      header: 'Fecha',
      cell: (item) => (
        <span style={{ fontWeight: 700, color: 'var(--text-primary)' }}>
          {item.fecha}
        </span>
      ),
    },
    {
      header: 'Efectivo (S/)',
      cell: (item) => `S/ ${item.efectivo.toFixed(2)}`,
    },
    {
      header: 'Yape (S/)',
      cell: (item) => `S/ ${item.yape.toFixed(2)}`,
    },
    {
      header: 'Plin (S/)',
      cell: (item) => `S/ ${item.plin.toFixed(2)}`,
    },
    {
      header: 'Tarjeta (S/)',
      cell: (item) => `S/ ${item.tarjeta.toFixed(2)}`,
    },
    {
      header: 'Ingresos Totales (S/)',
      cell: (item) => (
        <strong style={{ color: 'var(--accent-success)' }}>
          S/ {item.ingresosTotal.toFixed(2)}
        </strong>
      ),
    },
    {
      header: 'Gastos (S/)',
      cell: (item) => (
        <span style={{ color: 'var(--accent-danger)' }}>
          - S/ {item.gastosTotal.toFixed(2)}
        </span>
      ),
    },
    {
      header: 'Balance Neto (S/)',
      cell: (item) => (
        <strong style={{ color: item.balanceNeto >= 0 ? 'var(--accent-primary)' : 'var(--accent-danger)', fontSize: '0.95rem' }}>
          S/ {item.balanceNeto.toFixed(2)}
        </strong>
      ),
    },
  ];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      {/* Barra de Control de Fecha y Botón de Registro de Gastos */}
      <Card title="Control y Arqueo Diario de Caja" subtitle="Seleccione la fecha de consulta para auditar ingresos por método y gastos">
        <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between', gap: '12px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <Calendar size={20} color="var(--accent-primary)" />
            <span style={{ fontWeight: 600, color: 'var(--text-secondary)' }}>Fecha Seleccionada:</span>
            <input
              type="date"
              className="input-field"
              value={fecha}
              onChange={(e) => setFecha(e.target.value)}
              style={{ width: 'auto', padding: '8px 12px' }}
            />
            <Button variant="secondary" onClick={refetch} icon={<RefreshCw size={16} />} style={{ padding: '8px 12px' }}>
              Actualizar
            </Button>
          </div>

          <Button
            variant="danger"
            onClick={() => setIsGastoModalOpen(true)}
            icon={<Plus size={18} />}
          >
            Registrar Gasto de Caja
          </Button>
        </div>
      </Card>

      {/* Navegación por Pestañas Internas de Caja */}
      <div style={{ display: 'flex', gap: '8px', borderBottom: '1px solid var(--border-subtle)', paddingBottom: '8px', overflowX: 'auto' }}>
        {[
          { id: 'resumen', label: 'Resumen Diario', icon: DollarSign },
          { id: 'recaudadores', label: 'Desglose Operadores', icon: Users },
          { id: 'gastos', label: 'Registro de Gastos', icon: Layers },
          { id: 'detalle', label: 'Auditoría Detallada', icon: FileText },
          { id: 'historial', label: 'Historial 30 Días', icon: History },
        ].map((tab) => {
          const Icon = tab.icon;
          const isActive = activeSubTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveSubTab(tab.id as any)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                padding: '10px 16px',
                borderRadius: 'var(--radius-md)',
                border: 'none',
                background: isActive ? 'var(--accent-primary)' : 'var(--bg-card)',
                color: isActive ? '#ffffff' : 'var(--text-secondary)',
                fontWeight: 600,
                fontSize: '0.85rem',
                cursor: 'pointer',
                transition: 'all var(--transition-fast)'
              }}
            >
              <Icon size={16} />
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* Renderizado según Pestaña Interna */}
      {loading ? (
        <p style={{ color: 'var(--text-secondary)' }}>Cargando datos de caja desde MySQL...</p>
      ) : (
        <>
          {activeSubTab === 'resumen' && resumen && <CajaResumenComponent resumen={resumen} />}

          {activeSubTab === 'recaudadores' && (
            <Card title="Recaudación por Operador" subtitle="Desglose de cobros atribuidos a cada personal de entrada o salida">
              <RecaudadoresList recaudadores={recaudadores} />
            </Card>
          )}

          {activeSubTab === 'gastos' && (
            <Card title="Lista de Egresos / Gastos" subtitle={`Gastos registrados para el día ${fecha}`}>
              <GastosList gastos={gastos} />
            </Card>
          )}

          {activeSubTab === 'detalle' && detalle && (
            <Card title="Auditoría Detallada de Caja" subtitle={`Historial de cobros y egresos en orden cronológico real (${fecha})`}>
              <CajaDetalleComponent detalle={detalle} />
            </Card>
          )}

          {activeSubTab === 'historial' && (
            <Card title="Historial Consolidado de 30 Días" subtitle="Consulta de balance diario desde la base de datos MySQL">
              <Table
                columns={historialColumns}
                data={historial}
                keyExtractor={(item) => item.fecha}
                emptyMessage="No hay registros históricos disponibles"
              />
            </Card>
          )}
        </>
      )}

      {/* Modal para Registrar Gastos */}
      <RegistrarGastoModal
        isOpen={isGastoModalOpen}
        onClose={() => setIsGastoModalOpen(false)}
        onSubmit={registrarGasto}
      />
    </div>
  );
};
