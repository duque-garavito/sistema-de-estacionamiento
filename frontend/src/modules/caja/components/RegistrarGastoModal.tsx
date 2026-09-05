import { useState, FC, FormEvent } from 'react';
import { Modal } from '@core/design-system/Modal';
import { Button } from '@core/design-system/Button';
import { Input } from '@core/design-system/Input';
import { RegistrarGastoDTO } from '../types/caja.types';
import { TrendingDown, Save } from 'lucide-react';

interface RegistrarGastoModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (dto: RegistrarGastoDTO) => Promise<void>;
}

export const RegistrarGastoModal: FC<RegistrarGastoModalProps> = ({ isOpen, onClose, onSubmit }) => {
  const [descripcion, setDescripcion] = useState('');
  const [monto, setMonto] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError('');

    const descClean = descripcion.trim();
    const montoNum = parseFloat(monto);

    if (!descClean) {
      setError('La descripción del gasto es obligatoria.');
      return;
    }

    if (isNaN(montoNum) || montoNum <= 0) {
      setError('El monto del gasto debe ser un número positivo mayor a S/ 0.00.');
      return;
    }

    setLoading(true);
    try {
      await onSubmit({
        descripcion: descClean,
        monto: montoNum,
        usuarioId: 1,
        usuarioNombre: 'Administrador',
      });
      setDescripcion('');
      setMonto('');
      onClose();
    } catch (err: any) {
      setError(err.message || 'Error al registrar gasto');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Registrar Gasto de Caja">
      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
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

        <div className="input-group">
          <label className="input-label">Descripción del Gasto *</label>
          <textarea
            className="input-field"
            rows={3}
            placeholder="ej. Compra de foco de iluminación / Reparación de portón"
            value={descripcion}
            onChange={(e) => setDescripcion(e.target.value)}
            required
            autoFocus
            style={{ resize: 'vertical' }}
          />
        </div>

        <Input
          label="Monto (S/) *"
          type="number"
          step="0.50"
          min="0.10"
          placeholder="ej. 15.00"
          value={monto}
          onChange={(e) => setMonto(e.target.value)}
          required
          icon={<TrendingDown size={18} color="var(--accent-danger)" />}
        />

        <div style={{ display: 'flex', gap: '10px', marginTop: '12px' }}>
          <Button type="button" variant="secondary" onClick={onClose} style={{ flex: 1 }}>
            Cancelar
          </Button>
          <Button type="submit" variant="danger" isLoading={loading} icon={<Save size={18} />} style={{ flex: 1 }}>
            Registrar Egreso
          </Button>
        </div>
      </form>
    </Modal>
  );
};
