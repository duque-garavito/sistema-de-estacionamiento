import { FC, useState } from 'react';
import { TicketEntradaData } from '../types/ticket.types';
import { Printer, Download, Sliders } from 'lucide-react';
import { Button } from '@core/design-system/Button';
import { TicketsService } from '../services/tickets.service';

interface TicketEntradaTermicoProps {
  ticket: TicketEntradaData;
}

export const TicketEntradaTermico: FC<TicketEntradaTermicoProps> = ({ ticket }) => {
  const [ancho, setAncho] = useState<'80mm' | '58mm'>('80mm');
  const est = ticket.establecimiento;

  const widthPx = ancho === '58mm' ? '220px' : '300px';
  const fontSize = ancho === '58mm' ? '0.75rem' : '0.85rem';

  const generateHtml = () => `
    <!DOCTYPE html>
    <html>
      <head>
        <title>Ticket Entrada ${ticket.codigoTicket}</title>
        <style>
          @page { margin: 0; size: ${ancho} auto; }
          body {
            font-family: 'Courier New', Courier, monospace;
            width: ${ancho === '58mm' ? '200px' : '280px'};
            margin: 0 auto;
            padding: 10px 5px;
            font-size: ${ancho === '58mm' ? '10px' : '12px'};
            color: #000;
            line-height: 1.3;
          }
          .text-center { text-align: center; }
          .bold { font-weight: bold; }
          .divider { border-bottom: 1px dashed #000; margin: 6px 0; }
          .flex-between { display: flex; justify-content: space-between; align-items: center; }
          .plate { font-size: 1.4em; font-weight: bold; border: 2px solid #000; padding: 4px 8px; text-align: center; margin: 4px 0; }
          @media print { body { width: 100%; padding: 0; } }
        </style>
      </head>
      <body>
        <div class="text-center">
          <h3 style="margin: 0;">${est.nombreComercial || 'COCHERA CENTRAL'}</h3>
          <div>${est.razonSocial}</div>
          <div>RUC: ${est.ruc}</div>
          <div>${est.direccion}</div>
          <div>Tel: ${est.telefono}</div>
          <div class="divider"></div>
          <div class="bold" style="font-size: 1.1em;">TICKET DE INGRESO / PARQUEO</div>
          <div class="bold">${ticket.codigoTicket}</div>
        </div>

        <div class="divider"></div>

        <div class="text-center">
          <div>PLACA VEHÍCULO</div>
          <div class="plate">${ticket.placa}</div>
        </div>

        <div class="divider"></div>

        <div>
          <div class="flex-between"><span>Tipo:</span> <span class="bold">${ticket.tipoVehiculo}</span></div>
          ${ticket.marcaModelo ? `<div class="flex-between"><span>Marca/Modelo:</span> <span>${ticket.marcaModelo}</span></div>` : ''}
          ${ticket.color ? `<div class="flex-between"><span>Color:</span> <span>${ticket.color}</span></div>` : ''}
          <div class="flex-between"><span>Fecha Entrada:</span> <span>${new Date(ticket.fechaEntrada).toLocaleDateString()}</span></div>
          <div class="flex-between"><span>Hora Entrada:</span> <span class="bold">${new Date(ticket.fechaEntrada).toLocaleTimeString()}</span></div>
          <div class="flex-between"><span>Tarifa Día:</span> <span class="bold">S/ ${(ticket.tarifaDiaAplicada ?? 0).toFixed(2)}</span></div>
          <div class="flex-between"><span>Pago al:</span> <span>${ticket.momentoPago}</span></div>
          ${ticket.ubicacion ? `<div class="flex-between"><span>Ubicación:</span> <span>${ticket.ubicacion}</span></div>` : ''}
          <div class="flex-between"><span>Atendido por:</span> <span>${ticket.usuarioIngreso}</span></div>
          ${ticket.observaciones ? `<div style="margin-top: 4px;"><span>Obs: ${ticket.observaciones}</span></div>` : ''}
        </div>

        <div class="divider"></div>

        <div class="text-center">
          <p style="margin: 4px 0;">${est.leyendaTicket || '¡Gracias por su preferencia! Conserve este ticket para retirar su vehículo.'}</p>
        </div>

        <script>
          window.onload = function() {
            window.print();
            setTimeout(function() { window.close(); }, 600);
          };
        </script>
      </body>
    </html>
  `;

  const handlePrintThermal = () => {
    TicketsService.imprimirTicketTermicoHTML(generateHtml(), ancho);
  };

  const handleDownloadPDF = () => {
    TicketsService.descargarPDF(ticket, true);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '16px', width: '100%' }}>
      {/* Selector de Ancho */}
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
          <span>Formato Impresora:</span>
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

      {/* Tarjeta de Ticket Térmico en pantalla */}
      <div style={{
        width: widthPx,
        background: '#ffffff',
        color: '#000000',
        fontFamily: "'Courier New', Courier, monospace",
        padding: '16px',
        borderRadius: 'var(--radius-sm)',
        boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
        fontSize,
        lineHeight: 1.3,
        transition: 'width 0.2s ease'
      }}>
        <div style={{ textAlign: 'center' }}>
          <strong style={{ fontSize: '1.1em', display: 'block' }}>{est.nombreComercial || 'COCHERA CENTRAL'}</strong>
          <small style={{ fontSize: '0.85em', display: 'block' }}>{est.razonSocial}</small>
          <small style={{ fontSize: '0.85em', display: 'block' }}>RUC: {est.ruc}</small>
          <small style={{ fontSize: '0.85em', display: 'block' }}>{est.direccion}</small>
          <div style={{ borderBottom: '1px dashed #000', margin: '8px 0' }} />
          <strong style={{ fontSize: '1.05em' }}>TICKET DE INGRESO</strong>
          <div style={{ fontWeight: 800 }}>{ticket.codigoTicket}</div>
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
            {ticket.placa}
          </div>
        </div>

        <div style={{ borderBottom: '1px dashed #000', margin: '8px 0' }} />

        <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
            <span>Tipo:</span> <strong>{ticket.tipoVehiculo}</strong>
          </div>
          {ticket.marcaModelo && (
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span>Modelo:</span> <span>{ticket.marcaModelo}</span>
            </div>
          )}
          {ticket.color && (
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span>Color:</span> <span>{ticket.color}</span>
            </div>
          )}
          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
            <span>Ingreso:</span> <span>{new Date(ticket.fechaEntrada).toLocaleString()}</span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
            <span>Tarifa Día:</span> <strong>S/ {(ticket.tarifaDiaAplicada ?? 0).toFixed(2)}</strong>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
            <span>Operador:</span> <span>{ticket.usuarioIngreso}</span>
          </div>
        </div>

        <div style={{ borderBottom: '1px dashed #000', margin: '8px 0' }} />

        <div style={{ textAlign: 'center', fontSize: '0.8em' }}>
          <p style={{ margin: '2px 0' }}>{est.leyendaTicket}</p>
        </div>
      </div>

      <div style={{ display: 'flex', gap: '8px', width: '100%' }}>
        <Button variant="secondary" onClick={handleDownloadPDF} icon={<Download size={18} />} style={{ flex: 1 }}>
          PDF
        </Button>
        <Button variant="primary" onClick={handlePrintThermal} icon={<Printer size={18} />} style={{ flex: 2 }}>
          Imprimir Térmico ({ancho})
        </Button>
      </div>
    </div>
  );
};
