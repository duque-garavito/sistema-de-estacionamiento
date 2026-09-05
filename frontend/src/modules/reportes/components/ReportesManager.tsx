import React, { useState, useEffect } from 'react';
import { Card } from '@core/design-system/Card';
import { Button } from '@core/design-system/Button';
import { Table } from '@core/design-system/Table';
import { Input } from '@core/design-system/Input';
import { SkeletonLoader } from '@core/design-system/SkeletonLoader';
import { ReportesService } from '../services/reportes.service';
import { exportarACSV, imprimirVistaReporte } from '../utils/exportUtils';
import {
  FiltrosReporte,
  RangoFechaTipo,
  ReporteIngresos,
  ReporteVehiculos,
  ReporteOperador,
  ReporteCajaBalance,
  RegistroAuditoria,
} from '../types/reportes.types';
import {
  DollarSign,
  Car,
  Users,
  ShieldCheck,
  Download,
  Printer,
  Calendar,
  Wallet,
  ArrowUpRight,
  ArrowDownRight,
  Search
} from 'lucide-react';

export const ReportesManager: React.FC = () => {
  const [tab, setTab] = useState<'ingresos' | 'vehiculos' | 'operadores' | 'caja' | 'auditoria'>('ingresos');
  const [filtros, setFiltros] = useState<FiltrosReporte>({
    rango: 'hoy',
    fechaInicio: new Date().toISOString().split('T')[0],
    fechaFin: new Date().toISOString().split('T')[0],
  });

  const [loading, setLoading] = useState(false);
  const [dataIngresos, setDataIngresos] = useState<ReporteIngresos | null>(null);
  const [dataVehiculos, setDataVehiculos] = useState<ReporteVehiculos | null>(null);
  const [dataOperadores, setDataOperadores] = useState<ReporteOperador[]>([]);
  const [dataCaja, setDataCaja] = useState<ReporteCajaBalance | null>(null);
  const [dataAuditoria, setDataAuditoria] = useState<RegistroAuditoria[]>([]);
  const [filtroAuditoria, setFiltroAuditoria] = useState('');

  const cargarReportes = async () => {
    setLoading(true);
    try {
      if (tab === 'ingresos') {
        const res = await ReportesService.obtenerIngresos(filtros);
        setDataIngresos(res);
      } else if (tab === 'vehiculos') {
        const res = await ReportesService.obtenerVehiculos(filtros);
        setDataVehiculos(res);
      } else if (tab === 'operadores') {
        const res = await ReportesService.obtenerOperadores(filtros);
        setDataOperadores(res);
      } else if (tab === 'caja') {
        const res = await ReportesService.obtenerCajaBalance(filtros);
        setDataCaja(res);
      } else if (tab === 'auditoria') {
        const res = await ReportesService.obtenerAuditoria(filtros);
        setDataAuditoria(res);
      }
    } catch (err) {
      console.error('Error al cargar reporte:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    cargarReportes();
  }, [tab, filtros.rango, filtros.fechaInicio, filtros.fechaFin]);

  const handleExportCSV = () => {
    if (tab === 'ingresos' && dataIngresos) {
      exportarACSV(
        `Reporte_Ingresos_${filtros.rango}`,
        ['Fecha', 'Monto (S/)', 'Cantidad Operaciones'],
        dataIngresos.ingresosPorDia.map((d) => [d.fecha, d.monto, d.cantidad])
      );
    } else if (tab === 'vehiculos' && dataVehiculos) {
      exportarACSV(
        `Reporte_Vehiculos_${filtros.rango}`,
        ['Placa', 'Tipo Vehículo', 'Visitas', 'Total Gasto (S/)'],
        dataVehiculos.placasFrecuentes.map((p) => [p.placa, p.tipoVehiculo, p.visitas, p.totalGasto])
      );
    } else if (tab === 'operadores') {
      exportarACSV(
        `Reporte_Operadores_${filtros.rango}`,
        ['Operador', 'Entradas', 'Salidas', 'Cobros', 'Total Recaudado (S/)', 'Efectivo', 'Yape', 'Plin', 'Tarjeta'],
        dataOperadores.map((o) => [
          o.operador,
          o.entradasRegistradas,
          o.salidasRegistradas,
          o.cobrosRealizados,
          o.totalRecaudado,
          o.metodosPago.efectivo,
          o.metodosPago.yape,
          o.metodosPago.plin,
          o.metodosPago.tarjeta,
        ])
      );
    } else if (tab === 'caja' && dataCaja) {
      exportarACSV(
        `Reporte_Caja_Balance_${filtros.rango}`,
        ['Fecha/Gasto', 'Descripción / Tipo', 'Monto (S/)', 'Registrado Por'],
        [
          ['Ingresos Totales', 'Facturación Operativa', dataCaja.ingresosTotales, 'Sistema'],
          ['Efectivo', 'Método Pago', dataCaja.desgloseIngresos.efectivo, '-'],
          ['Yape', 'Método Pago', dataCaja.desgloseIngresos.yape, '-'],
          ['Plin', 'Método Pago', dataCaja.desgloseIngresos.plin, '-'],
          ['Tarjeta', 'Método Pago', dataCaja.desgloseIngresos.tarjeta, '-'],
          ['Gastos Totales', 'Egresos Operativos', dataCaja.gastosTotales, '-'],
          ['BALANCE NETO', 'Resultado Final', dataCaja.balanceNeto, '-'],
          ...dataCaja.gastosDetalle.map((g) => [g.fechaHora, g.descripcion, -g.monto, g.usuarioNombre]),
        ]
      );
    } else if (tab === 'auditoria') {
      exportarACSV(
        `Reporte_Auditoria_${filtros.rango}`,
        ['Ticket', 'Placa', 'Tipo Vehículo', 'Acción', 'Usuario', 'Monto', 'Método Pago', 'Fecha Hora'],
        dataAuditoria.map((a) => [
          a.codigoTicket,
          a.placa,
          a.tipoVehiculo,
          a.accion,
          a.usuario,
          a.monto,
          a.metodoPago,
          new Date(a.fechaHora).toLocaleString(),
        ])
      );
    }
  };

  const handlePrint = () => {
    imprimirVistaReporte(`Reporte de ${tab.toUpperCase()} (${filtros.rango.toUpperCase()})`, 'area-impresion-reporte');
  };

  const rangosConfig: { key: RangoFechaTipo; label: string }[] = [
    { key: 'hoy', label: 'Hoy' },
    { key: 'ayer', label: 'Ayer' },
    { key: 'semana', label: 'Esta Semana' },
    { key: 'mes', label: 'Este Mes' },
    { key: 'personalizado', label: 'Personalizado' },
  ];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      {/* Top Filter Bar & Export Actions */}
      <Card>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
          {/* Selector de Rango de Fechas */}
          <div style={{ display: 'flex', gap: '8px', alignItems: 'center', flexWrap: 'wrap' }}>
            <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '6px' }}>
              <Calendar size={16} color="var(--accent-primary)" /> Período:
            </span>
            <div style={{ display: 'flex', background: 'var(--bg-primary)', padding: '4px', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-subtle)' }}>
              {rangosConfig.map((r) => (
                <button
                  key={r.key}
                  type="button"
                  onClick={() => setFiltros({ ...filtros, rango: r.key })}
                  style={{
                    padding: '6px 12px',
                    borderRadius: 'var(--radius-sm)',
                    border: 'none',
                    background: filtros.rango === r.key ? 'var(--accent-primary)' : 'transparent',
                    color: filtros.rango === r.key ? '#fff' : 'var(--text-secondary)',
                    fontWeight: 600,
                    fontSize: '0.8rem',
                    cursor: 'pointer'
                  }}
                >
                  {r.label}
                </button>
              ))}
            </div>

            {filtros.rango === 'personalizado' && (
              <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                <Input
                  type="date"
                  value={filtros.fechaInicio}
                  onChange={(e) => setFiltros({ ...filtros, fechaInicio: e.target.value })}
                  style={{ padding: '4px 8px', fontSize: '0.8rem' }}
                />
                <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>a</span>
                <Input
                  type="date"
                  value={filtros.fechaFin}
                  onChange={(e) => setFiltros({ ...filtros, fechaFin: e.target.value })}
                  style={{ padding: '4px 8px', fontSize: '0.8rem' }}
                />
              </div>
            )}
          </div>

          {/* Botones de Exportación */}
          <div style={{ display: 'flex', gap: '10px' }}>
            <Button variant="secondary" onClick={handleExportCSV} icon={<Download size={16} />}>
              Exportar CSV
            </Button>
            <Button variant="secondary" onClick={handlePrint} icon={<Printer size={16} />}>
              Imprimir / PDF
            </Button>
          </div>
        </div>
      </Card>

      {/* Tabs Principales de Reporte */}
      <div style={{ display: 'flex', gap: '8px', borderBottom: '1px solid var(--border-subtle)', paddingBottom: '4px' }}>
        {[
          { id: 'ingresos', label: '8.1 Reporte de Ingresos', icon: DollarSign },
          { id: 'vehiculos', label: '8.2 Reporte de Vehículos', icon: Car },
          { id: 'operadores', label: '8.3 Rendimiento Operadores', icon: Users },
          { id: 'caja', label: '8.4 Caja & Balance Neto', icon: Wallet },
          { id: 'auditoria', label: '8.6 Auditoría de Operaciones', icon: ShieldCheck },
        ].map((t) => {
          const Icon = t.icon;
          const isActive = tab === t.id;
          return (
            <button
              key={t.id}
              onClick={() => setTab(t.id as any)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                padding: '10px 16px',
                borderRadius: 'var(--radius-md) var(--radius-md) 0 0',
                border: 'none',
                background: isActive ? 'var(--accent-primary)' : 'var(--bg-secondary)',
                color: isActive ? '#ffffff' : 'var(--text-secondary)',
                fontWeight: isActive ? 700 : 500,
                cursor: 'pointer',
                fontSize: '0.88rem'
              }}
            >
              <Icon size={16} />
              {t.label}
            </button>
          );
        })}
      </div>

      {/* Printable Body Content Area */}
      <div id="area-impresion-reporte">
        {loading ? (
          <SkeletonLoader count={4} />
        ) : (
          <>
            {/* 8.1 REPORTE DE INGRESOS */}
            {tab === 'ingresos' && dataIngresos && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                {/* KPIs Resumen */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '16px' }}>
                  <Card>
                    <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 700 }}>Total Recaudado</span>
                    <h3 style={{ fontSize: '1.6rem', fontWeight: 800, color: 'var(--accent-success)', margin: '4px 0' }}>
                      S/ {dataIngresos.totalRecaudado.toFixed(2)}
                    </h3>
                    <small style={{ color: 'var(--text-muted)', fontSize: '0.75rem' }}>{dataIngresos.totalOperaciones} transacción(es)</small>
                  </Card>

                  <Card>
                    <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 700 }}>Efectivo en Caja</span>
                    <h3 style={{ fontSize: '1.4rem', fontWeight: 800, color: 'var(--text-primary)', margin: '4px 0' }}>
                      S/ {dataIngresos.metodosPago.efectivo.toFixed(2)}
                    </h3>
                  </Card>

                  <Card>
                    <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 700 }}>Billeteras (Yape / Plin)</span>
                    <h3 style={{ fontSize: '1.4rem', fontWeight: 800, color: '#a855f7', margin: '4px 0' }}>
                      S/ {(dataIngresos.metodosPago.yape + dataIngresos.metodosPago.plin).toFixed(2)}
                    </h3>
                    <small style={{ color: 'var(--text-muted)' }}>Yape: S/ {dataIngresos.metodosPago.yape} | Plin: S/ {dataIngresos.metodosPago.plin}</small>
                  </Card>

                  <Card>
                    <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 700 }}>Tarjeta POS</span>
                    <h3 style={{ fontSize: '1.4rem', fontWeight: 800, color: 'var(--accent-primary)', margin: '4px 0' }}>
                      S/ {dataIngresos.metodosPago.tarjeta.toFixed(2)}
                    </h3>
                  </Card>
                </div>

                {/* Desglose Diario Tabla */}
                <Card title="Ingresos Agrupados por Fecha" subtitle="Desglose detallado por día del periodo">
                  <Table
                    columns={[
                      { header: 'Fecha', cell: (i) => <strong>{i.fecha}</strong> },
                      { header: 'Transacciones', cell: (i) => <span>{i.cantidad} cobro(s)</span> },
                      {
                        header: 'Monto Recaudado',
                        cell: (i) => (
                          <strong style={{ color: 'var(--accent-success)' }}>
                            S/ {i.monto.toFixed(2)}
                          </strong>
                        ),
                      },
                    ]}
                    data={dataIngresos.ingresosPorDia}
                    keyExtractor={(i) => i.fecha}
                  />
                </Card>
              </div>
            )}

            {/* 8.2 REPORTE DE VEHÍCULOS */}
            {tab === 'vehiculos' && dataVehiculos && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '16px' }}>
                  <Card>
                    <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 700 }}>Vehículos Atendidos</span>
                    <h3 style={{ fontSize: '1.6rem', fontWeight: 800, color: 'var(--accent-primary)', margin: '4px 0' }}>
                      {dataVehiculos.totalAtendidos}
                    </h3>
                  </Card>
                  <Card>
                    <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 700 }}>Entradas</span>
                    <h3 style={{ fontSize: '1.4rem', fontWeight: 800, color: 'var(--accent-success)', margin: '4px 0' }}>
                      🟢 {dataVehiculos.entradasRegistradas}
                    </h3>
                  </Card>
                  <Card>
                    <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 700 }}>Salidas</span>
                    <h3 style={{ fontSize: '1.4rem', fontWeight: 800, color: 'var(--accent-warning)', margin: '4px 0' }}>
                      🔴 {dataVehiculos.salidasRegistradas}
                    </h3>
                  </Card>
                  <Card>
                    <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 700 }}>Parqueados Ahora</span>
                    <h3 style={{ fontSize: '1.4rem', fontWeight: 800, color: 'var(--text-primary)', margin: '4px 0' }}>
                      🚗 {dataVehiculos.actualmenteParqueados}
                    </h3>
                  </Card>
                </div>

                <Card title="Top 10 Placas Más Frecuentes" subtitle="Vehículos con mayor recurrencia e historial acumulado">
                  <Table
                    columns={[
                      { header: 'Placa', cell: (p) => <span className="plate-tag">{p.placa}</span> },
                      { header: 'Tipo Vehículo', cell: (p) => p.tipoVehiculo },
                      { header: 'Total Visitas', cell: (p) => <strong style={{ color: 'var(--accent-primary)' }}>{p.visitas} parqueos</strong> },
                      { header: 'Gasto Acumulado', cell: (p) => <strong style={{ color: 'var(--accent-success)' }}>S/ {p.totalGasto.toFixed(2)}</strong> },
                    ]}
                    data={dataVehiculos.placasFrecuentes}
                    keyExtractor={(p) => p.placa}
                  />
                </Card>
              </div>
            )}

            {/* 8.3 REPORTE DE OPERADORES */}
            {tab === 'operadores' && (
              <Card title="Reporte de Rendimiento por Operador / Recaudador" subtitle="Control de productividad y cobros realizados">
                <Table
                  columns={[
                    { header: 'Operador / Personal', cell: (o) => <strong>👤 {o.operador}</strong> },
                    { header: 'Entradas', cell: (o) => <span>🟢 {o.entradasRegistradas}</span> },
                    { header: 'Salidas', cell: (o) => <span>🔴 {o.salidasRegistradas}</span> },
                    { header: 'Total Cobros', cell: (o) => <strong>{o.cobrosRealizados} transacciones</strong> },
                    { header: 'Total Recaudado', cell: (o) => <strong style={{ color: 'var(--accent-success)' }}>S/ {o.totalRecaudado.toFixed(2)}</strong> },
                    {
                      header: 'Canales de Pago',
                      cell: (o) => (
                        <small style={{ color: 'var(--text-secondary)' }}>
                          💵 Efec: S/ {o.metodosPago.efectivo} | 📱 Yape: S/ {o.metodosPago.yape} | 💳 Tarj: S/ {o.metodosPago.tarjeta}
                        </small>
                      ),
                    },
                  ]}
                  data={dataOperadores}
                  keyExtractor={(o) => o.operador}
                  emptyMessage="No se registraron movimientos de operadores en este rango."
                />
              </Card>
            )}

            {/* 8.4 CAJA & BALANCE NETO */}
            {tab === 'caja' && dataCaja && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '16px' }}>
                  <Card>
                    <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 700 }}>Ingresos Totales</span>
                    <h3 style={{ fontSize: '1.6rem', fontWeight: 800, color: 'var(--accent-success)', margin: '4px 0', display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <ArrowUpRight size={22} /> S/ {dataCaja.ingresosTotales.toFixed(2)}
                    </h3>
                  </Card>
                  <Card>
                    <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 700 }}>Egresos (Gastos Operativos)</span>
                    <h3 style={{ fontSize: '1.6rem', fontWeight: 800, color: 'var(--accent-danger)', margin: '4px 0', display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <ArrowDownRight size={22} /> S/ {dataCaja.gastosTotales.toFixed(2)}
                    </h3>
                  </Card>
                  <Card>
                    <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 700 }}>Balance Neto del Periodo</span>
                    <h3 style={{ fontSize: '1.6rem', fontWeight: 800, color: dataCaja.balanceNeto >= 0 ? 'var(--accent-success)' : 'var(--accent-danger)', margin: '4px 0' }}>
                      S/ {dataCaja.balanceNeto.toFixed(2)}
                    </h3>
                  </Card>
                </div>

                <Card title="Detalle de Egresos y Gastos en el Periodo">
                  <Table
                    columns={[
                      { header: 'Descripción del Gasto', cell: (g) => <strong>{g.descripcion}</strong> },
                      { header: 'Monto', cell: (g) => <strong style={{ color: 'var(--accent-danger)' }}>- S/ {g.monto.toFixed(2)}</strong> },
                      { header: 'Registrado por', cell: (g) => g.usuarioNombre },
                      { header: 'Fecha Hora', cell: (g) => new Date(g.fechaHora).toLocaleString() },
                    ]}
                    data={dataCaja.gastosDetalle}
                    keyExtractor={(g) => String(g.id)}
                    emptyMessage="No hay gastos registrados en este periodo"
                  />
                </Card>
              </div>
            )}

            {/* 8.6 AUDITORÍA DE OPERACIONES */}
            {tab === 'auditoria' && (
              <Card
                title="Trazabilidad & Logs de Auditoría Operativa"
                subtitle="Registro histórico inmutable de eventos de parqueo y cobros"
                action={
                  <div style={{ width: '220px' }}>
                    <Input
                      placeholder="Filtrar por placa o ticket..."
                      value={filtroAuditoria}
                      onChange={(e) => setFiltroAuditoria(e.target.value)}
                      icon={<Search size={16} />}
                    />
                  </div>
                }
              >
                <Table
                  columns={[
                    { header: 'Acción', cell: (a) => <span className={`badge ${a.accion === 'REGISTRO_ENTRADA' ? 'badge-success' : 'badge-info'}`}>{a.accion}</span> },
                    { header: 'Ticket / Placa', cell: (a) => (
                      <div>
                        <strong>{a.codigoTicket}</strong>
                        <div className="plate-tag" style={{ display: 'inline-block', marginLeft: '6px' }}>{a.placa}</div>
                      </div>
                    )},
                    { header: 'Vehículo', cell: (a) => a.tipoVehiculo },
                    { header: 'Usuario Operador', cell: (a) => <span>👤 {a.usuario}</span> },
                    { header: 'Monto / Pago', cell: (a) => (
                      <div>
                        <strong style={{ color: a.monto > 0 ? 'var(--accent-success)' : 'var(--text-muted)' }}>
                          S/ {a.monto.toFixed(2)}
                        </strong>
                        <small style={{ display: 'block', color: 'var(--text-secondary)' }}>{a.metodoPago}</small>
                      </div>
                    )},
                    { header: 'Fecha y Hora', cell: (a) => new Date(a.fechaHora).toLocaleString() },
                  ]}
                  data={dataAuditoria.filter((a) => {
                    if (!filtroAuditoria.trim()) return true;
                    const q = filtroAuditoria.toLowerCase();
                    return a.placa.toLowerCase().includes(q) || a.codigoTicket.toLowerCase().includes(q) || a.usuario.toLowerCase().includes(q);
                  })}
                  keyExtractor={(a) => String(a.id)}
                  emptyMessage="No hay eventos registrados en la auditoría para este periodo."
                />
              </Card>
            )}
          </>
        )}
      </div>
    </div>
  );
};
