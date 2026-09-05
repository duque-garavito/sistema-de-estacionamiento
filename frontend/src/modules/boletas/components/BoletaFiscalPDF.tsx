import { FC } from 'react';
import { Boleta, EmpresaConfig } from '../types/boleta.types';
import { Download, Building2, UserCheck } from 'lucide-react';
import { Button } from '@core/design-system/Button';
import { BoletasService } from '../services/boletas.service';

interface BoletaFiscalPDFProps {
  boleta: Boleta;
  empresa: EmpresaConfig;
}

export const BoletaFiscalPDF: FC<BoletaFiscalPDFProps> = ({ boleta, empresa }) => {
  const handleDescargarPDF = () => {
    BoletasService.descargarBoletaPDF(boleta, empresa);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', width: '100%' }}>
      {/* Vista Previa Documento Fiscal */}
      <div style={{
        background: '#ffffff',
        color: '#1e293b',
        borderRadius: 'var(--radius-md)',
        padding: '24px',
        border: '1px solid var(--border-subtle)',
        boxShadow: 'var(--shadow-md)',
        fontFamily: 'system-ui, sans-serif'
      }}>
        {/* Cabecera Fiscal */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 220px', gap: '20px', borderBottom: '2px solid #e2e8f0', paddingBottom: '16px' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#1e3a8a', fontWeight: 800, fontSize: '1.1rem' }}>
              <Building2 size={20} />
              <span>{empresa.razonSocial}</span>
            </div>
            <div style={{ fontSize: '0.85rem', color: '#64748b', marginTop: '4px', lineHeight: 1.4 }}>
              <div><strong>Nombre Comercial:</strong> {empresa.nombreComercial}</div>
              <div><strong>RUC:</strong> {empresa.ruc}</div>
              <div><strong>Dirección:</strong> {empresa.direccion}</div>
              <div><strong>Teléfono:</strong> {empresa.telefono}</div>
            </div>
          </div>

          <div style={{
            border: '2px solid #1e3a8a',
            borderRadius: 'var(--radius-sm)',
            padding: '12px',
            textAlign: 'center',
            background: '#f8fafc'
          }}>
            <div style={{ fontSize: '0.8rem', fontWeight: 700, color: '#475569' }}>R.U.C. {empresa.ruc}</div>
            <div style={{ fontSize: '1.05rem', fontWeight: 800, color: '#1e3a8a', textTransform: 'uppercase', margin: '4px 0' }}>
              {boleta.tipoComprobante === 'TICKET' ? 'COMPROBANTE COMERCIAL' : boleta.tipoComprobante + ' ELECTRÓNICA'}
            </div>
            <div style={{ fontSize: '1.1rem', fontWeight: 800, color: '#dc2626' }}>{boleta.numeroTicket}</div>
          </div>
        </div>

        {/* Cliente Datos */}
        <div style={{ background: '#f8fafc', padding: '12px 16px', borderRadius: 'var(--radius-sm)', margin: '16px 0', border: '1px solid #cbd5e1' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.9rem', fontWeight: 700, color: '#334155', marginBottom: '8px' }}>
            <UserCheck size={16} />
            <span>Datos del Cliente / Adquirente</span>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', fontSize: '0.85rem', color: '#475569' }}>
            <div><strong>Cliente:</strong> {boleta.clienteNombre}</div>
            <div><strong>Doc ({boleta.clienteTipoDoc}):</strong> {boleta.clienteNumDoc}</div>
            <div><strong>Fecha Emisión:</strong> {new Date(boleta.fechaEmision).toLocaleString()}</div>
            <div><strong>Método de Pago:</strong> {boleta.metodoPago}</div>
          </div>
        </div>

        {/* Tabla Desglose */}
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.85rem', marginBottom: '16px' }}>
          <thead>
            <tr style={{ background: '#1e3a8a', color: '#ffffff' }}>
              <th style={{ padding: '8px', textAlign: 'left', borderRadius: '4px 0 0 0' }}>Placa</th>
              <th style={{ padding: '8px', textAlign: 'left' }}>Descripción</th>
              <th style={{ padding: '8px', textAlign: 'center' }}>Tiempo</th>
              <th style={{ padding: '8px', textAlign: 'right', borderRadius: '0 4px 0 0' }}>Importe</th>
            </tr>
          </thead>
          <tbody>
            <tr style={{ borderBottom: '1px solid #e2e8f0' }}>
              <td style={{ padding: '10px 8px', fontWeight: 800 }}>{boleta.placa}</td>
              <td style={{ padding: '10px 8px' }}>Servicio Estacionamiento ({boleta.tipoVehiculo})</td>
              <td style={{ padding: '10px 8px', textAlign: 'center' }}>{boleta.tiempoTotalFormatted}</td>
              <td style={{ padding: '10px 8px', textAlign: 'right', fontWeight: 700 }}>S/ {boleta.total.toFixed(2)}</td>
            </tr>
          </tbody>
        </table>

        {/* Totales IGV */}
        <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
          <div style={{ width: '240px', display: 'flex', flexDirection: 'column', gap: '4px', fontSize: '0.85rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span>Op. Gravada:</span> <span>S/ {boleta.subtotal.toFixed(2)}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span>IGV (18%):</span> <span>S/ {boleta.igv.toFixed(2)}</span>
            </div>
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              fontSize: '1.05rem',
              fontWeight: 800,
              background: '#1e3a8a',
              color: '#ffffff',
              padding: '6px 10px',
              borderRadius: 'var(--radius-sm)',
              marginTop: '4px'
            }}>
              <span>TOTAL:</span> <span>S/ {boleta.total.toFixed(2)}</span>
            </div>
          </div>
        </div>
      </div>

      <Button variant="primary" onClick={handleDescargarPDF} icon={<Download size={18} />} style={{ width: '100%' }}>
        Exportar / Imprimir Comprobante Fiscal (PDF)
      </Button>
    </div>
  );
};
