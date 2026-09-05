import { FC, useState, useEffect } from 'react';
import { Card } from '@core/design-system/Card';
import { Table, Column } from '@core/design-system/Table';
import { Button } from '@core/design-system/Button';
import { Input } from '@core/design-system/Input';
import { Modal } from '@core/design-system/Modal';
import { Movimiento } from '../types/movimiento.types';
import { MovimientosService } from '../services/movimientos.service';
import { Search, Car, Calendar, ShieldCheck, Printer, LogOut, Edit3, History, User, CheckCircle2 } from 'lucide-react';

interface VehiculosManagerProps {
  movimientosActivos: Movimiento[];
  onSalidaSelect: (movimiento: Movimiento) => void;
  onVerTicket: (movimiento: Movimiento) => void;
  onDataChanged: () => Promise<void>;
}

export const VehiculosManager: FC<VehiculosManagerProps> = ({
  movimientosActivos,
  onSalidaSelect,
  onVerTicket,
  onDataChanged,
}) => {
  const [tab, setTab] = useState<'activos' | 'historial'>('activos');
  const [filtro, setFiltro] = useState('');
  const [historialList, setHistorialList] = useState<Movimiento[]>([]);
  const [loadingHistorial, setLoadingHistorial] = useState(false);

  // Modal Edición Informativa
  const [editingMov, setEditingMov] = useState<Movimiento | null>(null);
  const [editColor, setEditColor] = useState('');
  const [editMarca, setEditMarca] = useState('');
  const [editDni, setEditDni] = useState('');
  const [editNombre, setEditNombre] = useState('');
  const [editObs, setEditObs] = useState('');
  const [savingEdit, setSavingEdit] = useState(false);

  // Modal Historial por Placa Específica
  const [historyPlaca, setHistoryPlaca] = useState<string | null>(null);
  const [placaVisitas, setPlacaVisitas] = useState<Movimiento[]>([]);

  const cargarHistorial = async () => {
    setLoadingHistorial(true);
    try {
      const data = await MovimientosService.obtenerHistorial();
      setHistorialList(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingHistorial(false);
    }
  };

  useEffect(() => {
    if (tab === 'historial') {
      cargarHistorial();
    }
  }, [tab]);

  const handleOpenEdit = (mov: Movimiento) => {
    setEditingMov(mov);
    setEditColor(mov.color || '');
    setEditMarca(mov.marcaModelo || '');
    setEditDni(mov.propietarioDni || '');
    setEditNombre(mov.propietarioNombre || '');
    setEditObs(mov.observaciones || '');
  };

  const handleSaveEdit = async () => {
    if (!editingMov) return;
    setSavingEdit(true);
    try {
      await MovimientosService.actualizarInfoMovimiento(editingMov.id, {
        color: editColor,
        marcaModelo: editMarca,
        propietarioDni: editDni,
        propietarioNombre: editNombre,
        observaciones: editObs,
      });
      setEditingMov(null);
      await onDataChanged();
      if (tab === 'historial') {
        await cargarHistorial();
      }
    } catch (err: any) {
      alert(err.message || 'Error al guardar cambios');
    } finally {
      setSavingEdit(false);
    }
  };

  const handleOpenPlacaVisitas = async (placa: string) => {
    setHistoryPlaca(placa);
    try {
      const data = await MovimientosService.obtenerHistorial(placa);
      setPlacaVisitas(data);
    } catch {
      setPlacaVisitas([]);
    }
  };

  const calcularDiasTranscurridos = (fechaEntradaStr: string) => {
    const entrada = new Date(fechaEntradaStr);
    const ahora = new Date();
    const startMidnight = new Date(entrada.getFullYear(), entrada.getMonth(), entrada.getDate()).getTime();
    const endMidnight = new Date(ahora.getFullYear(), ahora.getMonth(), ahora.getDate()).getTime();
    const diffDaysCalendar = Math.round((endMidnight - startMidnight) / (1000 * 60 * 60 * 24));
    return `${Math.max(1, diffDaysCalendar + 1)} días`;
  };

  const dataActual = tab === 'activos' ? movimientosActivos : historialList;

  const dataFiltrada = dataActual.filter((m) => {
    const query = filtro.trim().toLowerCase();
    if (!query) return true;
    return (
      m.placa.toLowerCase().includes(query) ||
      (m.propietarioNombre && m.propietarioNombre.toLowerCase().includes(query)) ||
      (m.propietarioDni && m.propietarioDni.toLowerCase().includes(query)) ||
      (m.codigoTicket && m.codigoTicket.toLowerCase().includes(query))
    );
  });

  const columns: Column<Movimiento>[] = [
    {
      header: 'Placa / Código',
      cell: (item) => (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
          <button
            type="button"
            onClick={() => handleOpenPlacaVisitas(item.placa)}
            style={{
              background: 'none',
              border: 'none',
              padding: 0,
              cursor: 'pointer',
              textAlign: 'left'
            }}
            title="Ver historial de visitas de esta placa"
          >
            <span className="plate-tag">{item.placa}</span>
          </button>
          <small style={{ color: 'var(--text-muted)', fontSize: '0.75rem', fontWeight: 600 }}>
            {item.codigoTicket}
          </small>
        </div>
      ),
    },
    {
      header: 'Vehículo / Propietario',
      cell: (item) => (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
          <span style={{ display: 'flex', alignItems: 'center', gap: '6px', fontWeight: 600 }}>
            <Car size={15} color="var(--accent-primary)" />
            {item.tipoVehiculo} {item.marcaModelo ? `(${item.marcaModelo})` : ''}
          </span>
          {item.propietarioNombre && (
            <small style={{ color: 'var(--text-secondary)', fontSize: '0.75rem' }}>
              👤 {item.propietarioNombre} {item.propietarioDni ? `- DNI ${item.propietarioDni}` : ''}
            </small>
          )}
        </div>
      ),
    },
    {
      header: 'Entrada / Salida',
      cell: (item) => (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '2px', fontSize: '0.8rem' }}>
          <span>🟢 In: {new Date(item.fechaEntrada).toLocaleString([], { dateStyle: 'short', timeStyle: 'short' })}</span>
          {item.fechaSalida ? (
            <span style={{ color: 'var(--text-muted)' }}>🔴 Out: {new Date(item.fechaSalida).toLocaleString([], { dateStyle: 'short', timeStyle: 'short' })}</span>
          ) : (
            <span style={{ color: 'var(--accent-warning)', fontWeight: 600 }}>⏳ En Parqueo</span>
          )}
        </div>
      ),
    },
    {
      header: 'Permanencia',
      cell: (item) => (
        <span style={{ display: 'flex', alignItems: 'center', gap: '4px', color: item.estado === 'Activo' ? 'var(--accent-warning)' : 'var(--text-secondary)', fontWeight: 600 }}>
          <Calendar size={14} />
          {item.estado === 'Activo' ? calcularDiasTranscurridos(item.fechaEntrada) : `${item.diasCobrados || 1} día(s)`}
        </span>
      ),
    },
    {
      header: 'Tarifa / Total',
      cell: (item) => (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '2px', fontSize: '0.85rem' }}>
          <span>Tarifa: S/ {item.tarifaDiaAplicada.toFixed(2)}/d</span>
          {item.estado === 'Completado' && (
            <strong style={{ color: 'var(--accent-success)' }}>
              Total: S/ {(item.totalPagar ?? item.tarifaDiaAplicada).toFixed(2)}
            </strong>
          )}
        </div>
      ),
    },
    {
      header: 'Estado Pago',
      cell: (item) => (
        <span className={`badge ${item.momentoPago === 'ENTRADA' ? 'badge-success' : (item.estado === 'Completado' ? 'badge-info' : 'badge-warning')}`}>
          {item.momentoPago === 'ENTRADA' ? <ShieldCheck size={12} /> : null}
          {item.momentoPago === 'ENTRADA' ? 'Pagado Entrada' : (item.estado === 'Completado' ? 'Pagado Salida' : 'Pendiente Salida')}
        </span>
      ),
    },
    {
      header: 'Acciones',
      cell: (item) => (
        <div style={{ display: 'flex', gap: '4px' }}>
          <Button
            variant="secondary"
            style={{ padding: '4px 8px', fontSize: '0.75rem' }}
            onClick={() => onVerTicket(item)}
            icon={<Printer size={13} />}
            title="Ver / Imprimir Ticket"
          >
            Ticket
          </Button>

          <Button
            variant="secondary"
            style={{ padding: '4px 8px', fontSize: '0.75rem' }}
            onClick={() => handleOpenEdit(item)}
            icon={<Edit3 size={13} />}
            title="Editar datos del vehículo"
          >
            Info
          </Button>

          {item.estado === 'Activo' && (
            <Button
              variant={item.momentoPago === 'ENTRADA' ? 'secondary' : 'danger'}
              style={{ padding: '4px 8px', fontSize: '0.75rem' }}
              onClick={() => onSalidaSelect(item)}
              icon={<LogOut size={13} />}
            >
              {item.momentoPago === 'ENTRADA' ? 'Salida' : 'Cobrar'}
            </Button>
          )}
        </div>
      ),
    },
  ];

  return (
    <>
      <Card
        title="Gestión de Vehículos & Parqueo"
        subtitle={`Viendo ${dataFiltrada.length} registro(s)`}
        action={
          <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
            <div style={{ display: 'flex', background: 'var(--bg-primary)', padding: '4px', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-subtle)' }}>
              <button
                type="button"
                onClick={() => setTab('activos')}
                style={{
                  padding: '6px 12px',
                  borderRadius: 'var(--radius-sm)',
                  border: 'none',
                  background: tab === 'activos' ? 'var(--accent-primary)' : 'transparent',
                  color: tab === 'activos' ? '#fff' : 'var(--text-secondary)',
                  fontWeight: 600,
                  fontSize: '0.8rem',
                  cursor: 'pointer'
                }}
              >
                Parqueo Activo ({movimientosActivos.length})
              </button>
              <button
                type="button"
                onClick={() => setTab('historial')}
                style={{
                  padding: '6px 12px',
                  borderRadius: 'var(--radius-sm)',
                  border: 'none',
                  background: tab === 'historial' ? 'var(--accent-primary)' : 'transparent',
                  color: tab === 'historial' ? '#fff' : 'var(--text-secondary)',
                  fontWeight: 600,
                  fontSize: '0.8rem',
                  cursor: 'pointer'
                }}
              >
                Historial Completo
              </button>
            </div>

            <div style={{ width: '220px' }}>
              <Input
                placeholder="Placa, DNI o Nombre..."
                value={filtro}
                onChange={(e) => setFiltro(e.target.value)}
                icon={<Search size={16} />}
              />
            </div>
          </div>
        }
      >
        <Table
          columns={columns}
          data={dataFiltrada}
          keyExtractor={(item) => item.id}
          emptyMessage={loadingHistorial ? 'Cargando registros...' : 'No se encontraron registros de vehículos'}
        />
      </Card>

      {/* Modal Edición Informativa de Vehículo */}
      <Modal
        isOpen={Boolean(editingMov)}
        onClose={() => setEditingMov(null)}
        title={`Editar Información / Placa ${editingMov?.placa}`}
      >
        {editingMov && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
            <div style={{ background: 'var(--bg-primary)', padding: '12px', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-subtle)', fontSize: '0.85rem' }}>
              <div><strong>Ticket:</strong> {editingMov.codigoTicket}</div>
              <div><strong>Tarifa Snapshot:</strong> S/ {editingMov.tarifaDiaAplicada.toFixed(2)} / día (No editable)</div>
              <div><strong>Ingreso:</strong> {new Date(editingMov.fechaEntrada).toLocaleString()}</div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
              <Input
                label="Marca / Modelo"
                placeholder="ej. Toyota Yaris"
                value={editMarca}
                onChange={(e) => setEditMarca(e.target.value)}
              />
              <Input
                label="Color / Ubicación"
                placeholder="ej. Rojo / A-04"
                value={editColor}
                onChange={(e) => setEditColor(e.target.value)}
              />
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
              <Input
                label="DNI Propietario"
                placeholder="ej. 12345678"
                value={editDni}
                onChange={(e) => setEditDni(e.target.value)}
                icon={<User size={16} />}
              />
              <Input
                label="Nombre Propietario"
                placeholder="ej. Juan Pérez"
                value={editNombre}
                onChange={(e) => setEditNombre(e.target.value)}
              />
            </div>

            <Input
              label="Observaciones"
              placeholder="Detalles informativos adicionales..."
              value={editObs}
              onChange={(e) => setEditObs(e.target.value)}
            />

            <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end', marginTop: '10px' }}>
              <Button variant="secondary" onClick={() => setEditingMov(null)}>
                Cancelar
              </Button>
              <Button variant="primary" onClick={handleSaveEdit} isLoading={savingEdit} icon={<CheckCircle2 size={16} />}>
                Guardar Cambios Informáticos
              </Button>
            </div>
          </div>
        )}
      </Modal>

      {/* Modal Historial Completo por Placa */}
      <Modal
        isOpen={Boolean(historyPlaca)}
        onClose={() => setHistoryPlaca(null)}
        title={`Historial de Visitas / Placa: ${historyPlaca}`}
      >
        {historyPlaca && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', background: 'var(--bg-primary)', padding: '12px 16px', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-subtle)' }}>
              <div>
                <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Visitas Registradas</span>
                <h4 style={{ fontSize: '1.2rem', fontWeight: 800, color: 'var(--accent-primary)' }}>{placaVisitas.length} parqueos</h4>
              </div>
              <div>
                <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Recaudado Acumulado</span>
                <h4 style={{ fontSize: '1.2rem', fontWeight: 800, color: 'var(--accent-success)' }}>
                  S/ {placaVisitas.reduce((acc, v) => acc + (v.totalPagar ?? v.tarifaDiaAplicada), 0).toFixed(2)}
                </h4>
              </div>
            </div>

            <div style={{ maxHeight: '350px', overflowY: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.85rem' }}>
                <thead>
                  <tr style={{ background: 'var(--bg-primary)', textAlign: 'left', borderBottom: '1px solid var(--border-subtle)' }}>
                    <th style={{ padding: '8px' }}>Ticket</th>
                    <th style={{ padding: '8px' }}>Ingreso</th>
                    <th style={{ padding: '8px' }}>Salida</th>
                    <th style={{ padding: '8px' }}>Días</th>
                    <th style={{ padding: '8px' }}>Monto</th>
                  </tr>
                </thead>
                <tbody>
                  {placaVisitas.map((v) => (
                    <tr key={v.id} style={{ borderBottom: '1px solid var(--border-subtle)' }}>
                      <td style={{ padding: '8px', fontWeight: 600 }}>{v.codigoTicket}</td>
                      <td style={{ padding: '8px' }}>{new Date(v.fechaEntrada).toLocaleDateString()}</td>
                      <td style={{ padding: '8px' }}>{v.fechaSalida ? new Date(v.fechaSalida).toLocaleDateString() : 'En Parqueo'}</td>
                      <td style={{ padding: '8px' }}>{v.diasCobrados || 1} d</td>
                      <td style={{ padding: '8px', fontWeight: 700, color: 'var(--accent-success)' }}>
                        S/ {(v.totalPagar ?? v.tarifaDiaAplicada).toFixed(2)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <Button variant="secondary" onClick={() => setHistoryPlaca(null)} icon={<History size={16} />}>
              Cerrar Historial
            </Button>
          </div>
        )}
      </Modal>
    </>
  );
};
