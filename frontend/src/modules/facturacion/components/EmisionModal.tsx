import React, { useState } from 'react';
import { Modal } from '@core/design-system/Modal';
import { Button } from '@core/design-system/Button';
import { Input } from '@core/design-system/Input';
import { FacturacionService } from '../services/facturacion.service';
import { ComprobanteFiscal, TipoComprobanteFiscal, TipoDocCliente } from '../types/facturacion.types';
import { FileText, ShieldCheck, AlertCircle, RefreshCw, QrCode, CheckCircle2 } from 'lucide-react';

interface EmisionModalProps {
  isOpen: boolean;
  onClose: () => void;
  movimientoId?: number;
  totalMonto?: number;
  metodoPago?: string;
  onEmitidoSuccess?: (cpe: ComprobanteFiscal) => void;
}

export const EmisionModal: React.FC<EmisionModalProps> = ({
  isOpen,
  onClose,
  movimientoId,
  totalMonto = 10.0,
  metodoPago = 'Efectivo',
  onEmitidoSuccess,
}) => {
  const tipoComprobante: TipoComprobanteFiscal = '03'; // Exclusivamente Boleta de Venta Electrónica (03)
  const [clienteTipoDoc, setClienteTipoDoc] = useState<TipoDocCliente>('0');
  const [clienteNumDoc, setClienteNumDoc] = useState('');
  const [clienteNombre, setClienteNombre] = useState('CLIENTES VARIOS');
  const clienteDireccion = '';
  const [loading, setLoading] = useState(false);
  const [cpeResult, setCpeResult] = useState<ComprobanteFiscal | null>(null);



  const handleEmitir = async () => {
    setLoading(true);
    try {
      const cpe = await FacturacionService.emitir({
        movimientoId,
        tipoComprobante,
        clienteTipoDoc,
        clienteNumDoc: clienteTipoDoc === '0' ? '-' : clienteNumDoc,
        clienteNombre: clienteTipoDoc === '0' ? 'CLIENTES VARIOS' : clienteNombre,
        clienteDireccion,
        total: totalMonto,
        metodoPago,
      });

      setCpeResult(cpe);
      if (onEmitidoSuccess) onEmitidoSuccess(cpe);
    } catch (err: any) {
      alert(err.message || 'Error al emitir comprobante');
    } finally {
      setLoading(false);
    }
  };

  const baseGravada = parseFloat((totalMonto / 1.18).toFixed(2));
  const igvMonto = parseFloat((totalMonto - baseGravada).toFixed(2));

  return (
    <Modal
      isOpen={isOpen}
      onClose={() => {
        setCpeResult(null);
        onClose();
      }}
      title="Emisión de Comprobante Electrónico (SUNAT UBL 2.1)"
    >
      {cpeResult ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div style={{
            background: cpeResult.estadoSunat === 'ACEPTADO' ? 'rgba(34, 197, 94, 0.12)' : (cpeResult.estadoSunat === 'PENDIENTE' ? 'rgba(234, 179, 8, 0.12)' : 'rgba(239, 68, 68, 0.12)'),
            padding: '16px',
            borderRadius: 'var(--radius-md)',
            border: '1px solid var(--border-subtle)',
            display: 'flex',
            alignItems: 'center',
            gap: '12px'
          }}>
            {cpeResult.estadoSunat === 'ACEPTADO' && <ShieldCheck size={32} color="var(--accent-success)" />}
            {cpeResult.estadoSunat === 'PENDIENTE' && <RefreshCw size={32} color="var(--accent-warning)" />}
            {cpeResult.estadoSunat === 'RECHAZADO' && <AlertCircle size={32} color="var(--accent-danger)" />}
            <div>
              <h4 style={{ margin: 0, fontSize: '1.1rem', fontWeight: 800 }}>
                {cpeResult.tipoComprobante === '01' ? 'Factura' : 'Boleta'} {cpeResult.serie}-{String(cpeResult.correlativo).padStart(8, '0')}
              </h4>
              <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                Estado: <strong>{cpeResult.estadoSunat}</strong> - {cpeResult.mensajeRespuestaSunat}
              </span>
            </div>
          </div>

          <div style={{ background: 'var(--bg-primary)', padding: '14px', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-subtle)', fontSize: '0.85rem', display: 'flex', flexDirection: 'column', gap: '6px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span>Cliente:</span> <strong>{cpeResult.clienteNombre} ({cpeResult.clienteNumDoc})</strong>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span>Base Imponible:</span> <span>S/ {cpeResult.opGravadas.toFixed(2)}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span>IGV (18%):</span> <span>S/ {cpeResult.igv.toFixed(2)}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', borderTop: '1px solid var(--border-subtle)', paddingTop: '6px' }}>
              <span>Total Comprobante:</span> <strong style={{ color: 'var(--accent-success)', fontSize: '1rem' }}>S/ {cpeResult.total.toFixed(2)}</strong>
            </div>
          </div>

          {cpeResult.digestValue && (
            <div style={{ background: 'var(--bg-secondary)', padding: '10px', borderRadius: 'var(--radius-sm)', fontSize: '0.75rem', wordBreak: 'break-all' }}>
              <strong>DigestValue (Hash XML):</strong> {cpeResult.digestValue}
            </div>
          )}

          {cpeResult.codigoQr && (
            <div style={{ display: 'flex', gap: '10px', alignItems: 'center', background: 'var(--bg-primary)', padding: '10px', borderRadius: 'var(--radius-md)' }}>
              <QrCode size={40} color="var(--accent-primary)" />
              <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', wordBreak: 'break-all' }}>
                <strong>Cadena QR (RS N° 113-2018/SUNAT):</strong>
                <div>{cpeResult.codigoQr}</div>
              </div>
            </div>
          )}

          <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '10px' }}>
            <Button variant="primary" onClick={() => { setCpeResult(null); onClose(); }} icon={<CheckCircle2 size={16} />}>
              Cerrar y Volver
            </Button>
          </div>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {/* Selector Tipo Comprobante (Enfocado exclusivamente en Boleta Electrónica 03) */}
          <div className="input-group">
            <label className="input-label">Tipo de Comprobante Fiscal</label>
            <div style={{
              padding: '12px 16px',
              borderRadius: 'var(--radius-md)',
              border: '2px solid var(--accent-primary)',
              background: 'var(--accent-glow)',
              color: '#ffffff',
              fontWeight: 700,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              fontSize: '0.95rem'
            }}>
              <span>📄 Boleta de Venta Electrónica (Serie B001)</span>
              <span className="badge badge-success" style={{ fontSize: '0.7rem' }}>SUNAT UBL 2.1</span>
            </div>
          </div>

          {/* Formulario Cliente Boleta */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <div className="input-group">
              <label className="input-label">Identificación del Consumidor</label>
              <select
                value={clienteTipoDoc}
                onChange={(e) => {
                  const val = e.target.value as TipoDocCliente;
                  setClienteTipoDoc(val);
                  if (val === '0') {
                    setClienteNombre('CLIENTES VARIOS');
                    setClienteNumDoc('-');
                  } else {
                    setClienteNombre('');
                    setClienteNumDoc('');
                  }
                }}
                style={{ width: '100%', padding: '10px', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-subtle)', background: 'var(--bg-primary)', color: 'var(--text-primary)' }}
              >
                <option value="0">CLIENTES VARIOS (Sin DNI/RUC)</option>
                <option value="1">DNI (Persona Natural)</option>
                <option value="6">RUC (Persona Jurídica)</option>
              </select>
            </div>

            {clienteTipoDoc !== '0' && (
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '10px' }}>
                <Input
                  label="Número Documento"
                  placeholder="DNI o RUC"
                  value={clienteNumDoc}
                  onChange={(e) => setClienteNumDoc(e.target.value)}
                />
                <Input
                  label="Nombre Completo"
                  placeholder="Nombre o Razón Social"
                  value={clienteNombre}
                  onChange={(e) => setClienteNombre(e.target.value)}
                />
              </div>
            )}
          </div>

          {/* Desglose Financiero */}
          <div style={{ background: 'var(--bg-primary)', padding: '12px', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-subtle)', fontSize: '0.85rem', display: 'flex', flexDirection: 'column', gap: '4px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span>Base Imponible Gravada (Cat. 10):</span> <span>S/ {baseGravada.toFixed(2)}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span>IGV (18%):</span> <span>S/ {igvMonto.toFixed(2)}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', borderTop: '1px solid var(--border-subtle)', paddingTop: '4px', fontWeight: 700 }}>
              <span>Total Comprobante:</span> <strong style={{ color: 'var(--accent-success)' }}>S/ {totalMonto.toFixed(2)}</strong>
            </div>
          </div>

          <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end', marginTop: '10px' }}>
            <Button variant="secondary" onClick={onClose}>Cancelar</Button>
            <Button variant="primary" onClick={handleEmitir} isLoading={loading} icon={<FileText size={16} />}>
              Emitir Comprobante a SUNAT
            </Button>
          </div>
        </div>
      )}
    </Modal>
  );
};
