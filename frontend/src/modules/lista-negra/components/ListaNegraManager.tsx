import { useState, useEffect, FC, FormEvent } from 'react';
import { Card } from '@core/design-system/Card';
import { Table, Column } from '@core/design-system/Table';
import { Button } from '@core/design-system/Button';
import { Input } from '@core/design-system/Input';
import { Modal } from '@core/design-system/Modal';
import { VehiculoListaNegra } from '../types/lista-negra.types';
import { ListaNegraService } from '../services/lista-negra.service';
import { ShieldAlert, Plus, Trash2, AlertTriangle } from 'lucide-react';

export const ListaNegraManager: FC = () => {
  const [lista, setLista] = useState<VehiculoListaNegra[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [placa, setPlaca] = useState('');
  const [motivo, setMotivo] = useState('');
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const cargarLista = async () => {
    setLoading(true);
    const data = await ListaNegraService.obtenerLista();
    setLista(data);
    setLoading(false);
  };

  useEffect(() => {
    cargarLista();
  }, []);

  const handleAgregar = async (e: FormEvent) => {
    e.preventDefault();
    if (!placa.trim() || !motivo.trim()) return;
    setSaving(true);
    setError('');
    try {
      await ListaNegraService.agregar({
        placa: placa.toUpperCase(),
        motivo,
        registradoPor: 'Administrador',
      });
      setPlaca('');
      setMotivo('');
      setIsModalOpen(false);
      await cargarLista();
    } catch (err: any) {
      setError(err.message || 'Error al registrar vehículo en Lista Negra');
    } finally {
      setSaving(false);
    }
  };

  const handleRetirar = async (placaItem: string) => {
    if (!confirm(`¿Está seguro de retirar la placa ${placaItem} de la Lista Negra?`)) return;
    try {
      await ListaNegraService.retirar(placaItem);
      await cargarLista();
    } catch (err: any) {
      alert(err.message || 'Error al retirar vehículo');
    }
  };

  const columns: Column<VehiculoListaNegra>[] = [
    {
      header: 'Placa Restringida',
      cell: (item) => (
        <span className="plate-tag" style={{ border: '2px solid #ef4444', background: '#fee2e2', color: '#991b1b' }}>
          {item.placa}
        </span>
      ),
    },
    {
      header: 'Motivo de Restricción',
      cell: (item) => (
        <span style={{ color: 'var(--text-primary)', fontWeight: 500 }}>
          {item.motivo}
        </span>
      ),
    },
    {
      header: 'Registrado Por',
      cell: (item) => item.registradoPor || 'Administrador',
    },
    {
      header: 'Fecha Registro',
      cell: (item) => item.creadoEn ? new Date(item.creadoEn).toLocaleDateString() : 'Reciente',
    },
    {
      header: 'Acción',
      cell: (item) => (
        <Button
          variant="danger"
          style={{ padding: '6px 12px', fontSize: '0.8rem' }}
          onClick={() => handleRetirar(item.placa)}
          icon={<Trash2 size={14} />}
        >
          Retirar Restricción
        </Button>
      ),
    },
  ];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      <Card
        title="Lista Negra de Vehículos Restringidos"
        subtitle="Los vehículos en esta lista tendrán prohibido el ingreso al sistema de parqueo"
        action={
          <Button
            variant="danger"
            onClick={() => setIsModalOpen(true)}
            icon={<Plus size={18} />}
          >
            Agregar Placa a Lista Negra
          </Button>
        }
      >
        {loading ? (
          <p style={{ color: 'var(--text-secondary)' }}>Cargando vehículos restringidos...</p>
        ) : (
          <Table
            columns={columns}
            data={lista}
            keyExtractor={(item) => item.id}
            emptyMessage="No hay vehículos en la Lista Negra actualmente"
          />
        )}
      </Card>

      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Agregar Vehículo a Lista Negra"
      >
        <form onSubmit={handleAgregar} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {error && (
            <div style={{
              background: 'var(--accent-danger-bg)',
              color: 'var(--accent-danger)',
              border: '1px solid rgba(239, 68, 68, 0.3)',
              padding: '10px 14px',
              borderRadius: 'var(--radius-md)',
              fontSize: '0.85rem',
              fontWeight: 600
            }}>
              ⚠️ {error}
            </div>
          )}

          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', background: 'var(--accent-danger-bg)', padding: '12px', borderRadius: 'var(--radius-md)', color: 'var(--accent-danger)', fontSize: '0.85rem' }}>
            <AlertTriangle size={20} />
            <span>Un vehículo registrado en la Lista Negra no podrá ingresar bajo ninguna circunstancia.</span>
          </div>

          <Input
            label="Placa a Restringir *"
            placeholder="ej. BAD-666"
            value={placa}
            onChange={(e) => setPlaca(e.target.value.toUpperCase())}
            required
            maxLength={8}
            autoFocus
          />

          <div className="input-group">
            <label className="input-label">Motivo de Restricción *</label>
            <textarea
              className="input-field"
              rows={3}
              placeholder="Describa el motivo (ej. Falta de pago, vehículo robado, daño a instalaciones...)"
              value={motivo}
              onChange={(e) => setMotivo(e.target.value)}
              required
              style={{ resize: 'vertical' }}
            />
          </div>

          <div style={{ display: 'flex', gap: '10px', marginTop: '12px' }}>
            <Button type="button" variant="secondary" onClick={() => setIsModalOpen(false)} style={{ flex: 1 }}>
              Cancelar
            </Button>
            <Button type="submit" variant="danger" isLoading={saving} icon={<ShieldAlert size={18} />} style={{ flex: 1 }}>
              Restringir Vehículo
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
