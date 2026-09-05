import { FC, useState } from 'react';
import { Boleta, EmpresaConfig } from '../types/boleta.types';
import { Printer, Sliders } from 'lucide-react';
import { Button } from '@core/design-system/Button';
import { BoletasService } from '../services/boletas.service';

interface TicketTermicoProps {
  boleta: Boleta;
  empresa: EmpresaConfig;
}

export const TicketTermico: FC<TicketTermicoProps> = ({ boleta, empresa }) => {
  const [ancho, setAncho] = useState<'80mm' | '58mm'>('80mm');

  const handleImprimir = () => {
    BoletasService.imprimirTicketTermico(boleta, empresa, ancho);
  };

  const containerWidth = ancho === '58mm' ? '220px' : '300px';

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '16px', width: '100%' }}>
      {/* Controles de Formato Térmico */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        width: '100%',
        background: 'var(--bg-primary)',
        padding: '10px 14px',
        borderRadius: 'var(--radius-md)',
        border: '1px solid var(--border-subtle)'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
          <Sliders size={16} />
          <span>Ancho Impresora Térmica:</span>
        </div>
        <div style={{ display: 'flex', gap: '6px' }}>
          {(['80mm', '58mm'] as const).map((size) => (
            <button
              key={size}
              type="button"
              onClick={() => setAncho(size)}
              style={{
                padding: '4px 10px',
                borderRadius: 'var(--radius-sm)',
                border: ancho === size ? '2px solid var(--accent-primary)' : '1px solid var(--border-subtle)',
                background: ancho === size ? 'var(--accent-glow)' : 'transparent',
                color: ancho === size ? '#fff' : 'var(--text-secondary)',
                fontWeight: 600,
                fontSize: '0.8rem',
                cursor: 'pointer'
              }}
            >
              {size}
            </button>
          ))}
        </div>
      </div>

      {/* Vista Previa Ticket Térmico estilo Vendedora POS */}
      <div style={{
        width: containerWidth,
        background: '#ffffff',
        color: '#000000',
        fontFamily: "'Courier New', Courier, monospace",
        padding: '16px',
        borderRadius: 'var(--radius-sm)',
        boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
        fontSize: ancho === '58mm' ? '0.75rem' : '0.85rem',
        lineHeight: 1.3,
        transition: 'width 0.2s ease'
      }}>
        <div style={{ textAlign: 'center' }}>
          <strong style={{ fontSize: '1.1em', display: 'block' }}>{empresa.nombreComercial || 'COCHERA CENTRAL'}</strong>
          <small style={{ fontSize: '0.85em', display: 'block' }}>{empresa.razonSocial}</small>
          <small style={{ fontSize: '0.85em', display: 'block' }}>RUC: {empresa.ruc}</small>
          <small style={{ fontSize: '0.85em', display: 'block' }}>{empresa.direccion}</small>
          <small style={{ fontSize: '0.85em', display: 'block' }}>Teléf: {empresa.telefono}</small>
          <div style={{ borderBottom: '1px dashed #000', margin: '8px 0' }} />
          <strong style={{ fontSize: '1.05em' }}>
            {boleta.tipoComprobante === 'TICKET' ? 'TICKET DE COBRO' : boleta.tipoComprobante}
          </strong>
          <div style={{ fontWeight: 800 }}>{boleta.numeroTicket}</div>
        </div>

        <div style={{ borderBottom: '1px dashed #000', margin: '8px 0' }} />

        <div style={{ textAlign: 'center', margin: '6px 0' }}>
          <span style={{ fontSize: '0.8em', textTransform: 'uppercase' }}>PLACA DE VEHÍCULO</span>
          <div style={{
            fontSize: '1.3em',
            fontWeight: 800,
            border: '2px solid #000',
            padding: '2px 8px',
            marginTop: '2px',
            display: 'inline-block',
            letterSpacing: '1px'
          }}>
            {boleta.placa}
          </div>
        </div>

        <div style={{ borderBottom: '1px dashed #000', margin: '8px 0' }} />

        <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
            <span>Tipo:</span> <strong>{boleta.tipoVehiculo}</strong>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
            <span>Ingreso:</span> <span>{new Date(boleta.fechaIngreso).toLocaleTimeString()}</span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
            <span>Salida:</span> <span>{new Date(boleta.fechaSalida).toLocaleTimeString()}</span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
            <span>Tiempo:</span> <strong>{boleta.tiempoTotalFormatted}</strong>
          </div>
        </div>

        <div style={{ borderBottom: '1px dashed #000', margin: '8px 0' }} />

        <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
            <span>Subtotal:</span> <span>S/ {boleta.subtotal.toFixed(2)}</span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
            <span>IGV (18%):</span> <span>S/ {boleta.igv.toFixed(2)}</span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
            <span>Método:</span> <strong>{boleta.metodoPago}</strong>
          </div>
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            fontSize: '1.2em',
            fontWeight: 800,
            borderTop: '2px solid #000',
            paddingTop: '6px',
            marginTop: '4px'
          }}>
            <span>TOTAL:</span> <span>S/ {boleta.total.toFixed(2)}</span>
          </div>
        </div>

        <div style={{ borderBottom: '1px dashed #000', margin: '8px 0' }} />

        <div style={{ textAlign: 'center', fontSize: '0.8em' }}>
          <p style={{ margin: '2px 0' }}>{empresa.leyendaTicket}</p>
          <small>{new Date(boleta.fechaEmision).toLocaleString()}</small>
        </div>
      </div>

      <Button variant="primary" onClick={handleImprimir} icon={<Printer size={18} />} style={{ width: '100%' }}>
        Imprimir Ticket Térmico ({ancho})
      </Button>
    </div>
  );
};
