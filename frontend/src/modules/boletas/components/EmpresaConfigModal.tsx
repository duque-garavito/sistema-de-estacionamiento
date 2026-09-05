import { FC, useState, useEffect } from 'react';
import { EmpresaConfig } from '../types/boleta.types';
import { Modal } from '@core/design-system/Modal';
import { Input } from '@core/design-system/Input';
import { Button } from '@core/design-system/Button';
import { ConfiguracionService } from '@modules/configuracion/services/configuracion.service';
import { Save, FileSpreadsheet, CheckCircle2 } from 'lucide-react';

interface EmpresaConfigModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSaved?: (config: EmpresaConfig) => void;
}

export const EmpresaConfigModal: FC<EmpresaConfigModalProps> = ({ isOpen, onClose, onSaved }) => {
  const [formData, setFormData] = useState<EmpresaConfig>({
    id: 1,
    ruc: '1008048033',
    razonSocial: 'Servicio de Cochera',
    nombreComercial: 'La cochera',
    direccion: 'A.H. 05 de FEBRERO Mz A1 LOTE S/N - PAITA',
    telefono: '961936073',
    serieBoleta: 'B001',
    correlativoBoleta: 1,
    serieFactura: 'F001',
    correlativoFactura: 1,
    leyendaTicket: '¡Gracias por su preferencia!',
  });

  const [saving, setSaving] = useState(false);
  const [successMessage, setSuccessMessage] = useState(false);

  useEffect(() => {
    if (isOpen) {
      ConfiguracionService.obtenerConfiguracion().then((config) => {
        setFormData(config);
      });
    }
  }, [isOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const updated = await ConfiguracionService.actualizarConfiguracion(formData);
      setFormData(updated);
      setSuccessMessage(true);
      if (onSaved) onSaved(updated);
      setTimeout(() => {
        setSuccessMessage(false);
        onClose();
      }, 1200);
    } catch (err: any) {
      alert(err.message || 'Error al guardar configuración');
    } finally {
      setSaving(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Configuración de Datos Fiscales de la Cochera">
      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
        {successMessage && (
          <div style={{
            background: 'var(--accent-glow)',
            border: '1px solid var(--accent-success)',
            color: 'var(--accent-success)',
            padding: '10px 14px',
            borderRadius: 'var(--radius-md)',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            fontSize: '0.9rem',
            fontWeight: 600
          }}>
            <CheckCircle2 size={18} />
            <span>Datos fiscales guardados correctamente</span>
          </div>
        )}

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
          <Input
            label="RUC de Empresa (11 dígitos)"
            value={formData.ruc}
            onChange={(e) => setFormData({ ...formData, ruc: e.target.value })}
            placeholder="Ej. 20123456789"
            required
            maxLength={11}
          />
          <Input
            label="Razón Social"
            value={formData.razonSocial}
            onChange={(e) => setFormData({ ...formData, razonSocial: e.target.value })}
            placeholder="Ej. COCHERA CENTRAL S.A.C."
            required
          />
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
          <Input
            label="Nombre Comercial"
            value={formData.nombreComercial}
            onChange={(e) => setFormData({ ...formData, nombreComercial: e.target.value })}
            placeholder="Ej. Cochera Central"
          />
          <Input
            label="Teléfono / Contacto"
            value={formData.telefono}
            onChange={(e) => setFormData({ ...formData, telefono: e.target.value })}
            placeholder="Ej. (01) 456-7890"
          />
        </div>

        <Input
          label="Dirección del Establecimiento"
          value={formData.direccion}
          onChange={(e) => setFormData({ ...formData, direccion: e.target.value })}
          placeholder="Ej. Av. Principal 123, Lima"
          required
        />

        <div style={{
          borderTop: '1px solid var(--border-subtle)',
          paddingTop: '12px',
          display: 'flex',
          flexDirection: 'column',
          gap: '12px'
        }}>
          <span style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', gap: '6px' }}>
            <FileSpreadsheet size={16} /> Series y Correlativos de Comprobante
          </span>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
            <Input
              label="Serie Boleta (SUNAT)"
              value={formData.serieBoleta}
              onChange={(e) => setFormData({ ...formData, serieBoleta: e.target.value })}
              placeholder="B001"
            />
            <Input
              label="Correlativo Inicial Boleta"
              type="number"
              value={formData.correlativoBoleta}
              onChange={(e) => setFormData({ ...formData, correlativoBoleta: Number(e.target.value) })}
            />
          </div>
        </div>

        <div className="input-group">
          <label className="input-label">Leyenda / Pie de Página del Ticket</label>
          <textarea
            className="input-field"
            rows={2}
            value={formData.leyendaTicket}
            onChange={(e) => setFormData({ ...formData, leyendaTicket: e.target.value })}
            placeholder="Mensaje de agradecimiento o cláusula..."
          />
        </div>

        <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end', marginTop: '8px' }}>
          <Button variant="secondary" type="button" onClick={onClose}>
            Cancelar
          </Button>
          <Button variant="primary" type="submit" disabled={saving} icon={<Save size={18} />}>
            {saving ? 'Guardando...' : 'Guardar Configuración'}
          </Button>
        </div>
      </form>
    </Modal>
  );
};
