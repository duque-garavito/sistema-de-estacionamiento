import { useState, useEffect, FC } from 'react';
import { Card } from '@core/design-system/Card';
import { Table, Column } from '@core/design-system/Table';
import { Button } from '@core/design-system/Button';
import { Input } from '@core/design-system/Input';
import { Modal } from '@core/design-system/Modal';
import { Tarifa, TipoCobroTarifa } from '../types/tarifa.types';
import { TarifasService } from '../services/tarifas.service';
import { Settings, Save, CheckCircle2, Car, Bike, Truck } from 'lucide-react';

export const TarifasManager: FC = () => {
  const [tarifas, setTarifas] = useState<Tarifa[]>([]);
  const [editingTarifa, setEditingTarifa] = useState<Tarifa | null>(null);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');

  const cargarTarifas = async () => {
    setLoading(true);
    const data = await TarifasService.obtenerTarifas();
    setTarifas(data);
    setLoading(false);
  };

  useEffect(() => {
    cargarTarifas();
  }, []);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingTarifa) return;
    setSaving(true);
    setMessage('');
    try {
      await TarifasService.actualizarTarifa(editingTarifa);
      setMessage(`Tarifa para ${editingTarifa.tipoVehiculo} actualizada con éxito`);
      setEditingTarifa(null);
      await cargarTarifas();
    } catch (err: any) {
      alert(err.message || 'Error al guardar la tarifa');
    } finally {
      setSaving(false);
    }
  };

  const columns: Column<Tarifa>[] = [
    {
      header: 'Tipo de Vehículo',
      cell: (item) => (
        <span style={{ display: 'flex', alignItems: 'center', gap: '8px', fontWeight: 700 }}>
          {item.tipoVehiculo === 'Auto' && <Car size={18} color="var(--accent-primary)" />}
          {item.tipoVehiculo === 'Camioneta' && <Truck size={18} color="var(--accent-warning)" />}
          {item.tipoVehiculo === 'Moto' && <Bike size={18} color="var(--accent-success)" />}
          {item.tipoVehiculo}
        </span>
      ),
    },
    {
      header: 'Modalidad de Cobro',
      cell: (item) => (
        <span className={`badge ${item.tipoCobro === 'DIA' ? 'badge-success' : 'badge-warning'}`}>
          {item.tipoCobro === 'DIA' ? 'Por Bloque 24h (Día)' : 'Por Hora / Fracción'}
        </span>
      ),
    },
    {
      header: 'Precio por Día (24h)',
      cell: (item) => (
        <strong style={{ color: 'var(--accent-success)', fontSize: '1rem' }}>
          S/ {item.precioDia.toFixed(2)}
        </strong>
      ),
    },
    {
      header: 'Precio por Hora',
      cell: (item) => `S/ ${item.precioHora.toFixed(2)}`,
    },
    {
      header: 'Tolerancia',
      cell: (item) => `${item.toleranciaMinutos} minutos`,
    },
    {
      header: 'Estado',
      cell: (item) => (
        <span className={`badge ${item.activo ? 'badge-success' : 'badge-danger'}`}>
          {item.activo ? 'Activo' : 'Inactivo'}
        </span>
      ),
    },
    {
      header: 'Acciones',
      cell: (item) => (
        <Button
          variant="secondary"
          style={{ padding: '6px 12px', fontSize: '0.8rem' }}
          onClick={() => setEditingTarifa({ ...item })}
          icon={<Settings size={14} />}
        >
          Editar Configuración
        </Button>
      ),
    },
  ];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      <Card
        title="Configuración de Tarifario MySQL"
        subtitle="Administra los precios, regla de cobro por día (24h) u hora y tolerancia sin modificar código"
      >
        {message && (
          <div style={{
            background: 'var(--accent-success-bg)',
            color: 'var(--accent-success)',
            padding: '10px 14px',
            borderRadius: 'var(--radius-md)',
            marginBottom: '16px',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            fontWeight: 600
          }}>
            <CheckCircle2 size={18} /> {message}
          </div>
        )}

        {loading ? (
          <p style={{ color: 'var(--text-secondary)' }}>Cargando tarifario desde MySQL...</p>
        ) : (
          <Table
            columns={columns}
            data={tarifas}
            keyExtractor={(item) => item.id}
          />
        )}
      </Card>

      {/* Modal Edición de Tarifa */}
      <Modal
        isOpen={Boolean(editingTarifa)}
        onClose={() => setEditingTarifa(null)}
        title={`Configurar Tarifa / ${editingTarifa?.tipoVehiculo || ''}`}
      >
        {editingTarifa && (
          <form onSubmit={handleSave} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div className="input-group">
              <label className="input-label">Modalidad de Cobro</label>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                {(['DIA', 'HORA'] as TipoCobroTarifa[]).map((tipo) => (
                  <button
                    type="button"
                    key={tipo}
                    onClick={() => setEditingTarifa({ ...editingTarifa, tipoCobro: tipo })}
                    style={{
                      padding: '10px',
                      borderRadius: 'var(--radius-md)',
                      border: editingTarifa.tipoCobro === tipo ? '2px solid var(--accent-primary)' : '1px solid var(--border-subtle)',
                      background: editingTarifa.tipoCobro === tipo ? 'var(--accent-glow)' : 'var(--bg-primary)',
                      color: editingTarifa.tipoCobro === tipo ? '#fff' : 'var(--text-secondary)',
                      fontWeight: 700,
                      cursor: 'pointer'
                    }}
                  >
                    {tipo === 'DIA' ? '📅 Bloques de 24h (Día)' : '⏱️ Por Hora'}
                  </button>
                ))}
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
              <Input
                label="Precio por Día (S/)"
                type="number"
                step="0.50"
                value={editingTarifa.precioDia}
                onChange={(e) => setEditingTarifa({ ...editingTarifa, precioDia: parseFloat(e.target.value) || 0 })}
                required
              />
              <Input
                label="Precio por Hora (S/)"
                type="number"
                step="0.50"
                value={editingTarifa.precioHora}
                onChange={(e) => setEditingTarifa({ ...editingTarifa, precioHora: parseFloat(e.target.value) || 0 })}
                required
              />
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
              <Input
                label="Tolerancia Gratis (Minutos)"
                type="number"
                value={editingTarifa.toleranciaMinutos}
                onChange={(e) => setEditingTarifa({ ...editingTarifa, toleranciaMinutos: parseInt(e.target.value, 10) || 0 })}
                required
              />
              <Input
                label="Precio Fracción 15m (S/)"
                type="number"
                step="0.50"
                value={editingTarifa.fraccion15min}
                onChange={(e) => setEditingTarifa({ ...editingTarifa, fraccion15min: parseFloat(e.target.value) || 0 })}
              />
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginTop: '4px' }}>
              <input
                type="checkbox"
                id="tarifa-activa"
                checked={editingTarifa.activo}
                onChange={(e) => setEditingTarifa({ ...editingTarifa, activo: e.target.checked })}
                style={{ width: '18px', height: '18px', cursor: 'pointer' }}
              />
              <label htmlFor="tarifa-activa" style={{ fontWeight: 600, color: 'var(--text-primary)', cursor: 'pointer' }}>
                Habilitar esta tarifa en el sistema
              </label>
            </div>

            <div style={{ display: 'flex', gap: '10px', marginTop: '12px' }}>
              <Button type="button" variant="secondary" onClick={() => setEditingTarifa(null)} style={{ flex: 1 }}>
                Cancelar
              </Button>
              <Button type="submit" variant="primary" isLoading={saving} icon={<Save size={18} />} style={{ flex: 1 }}>
                Guardar en MySQL
              </Button>
            </div>
          </form>
        )}
      </Modal>
    </div>
  );
};
