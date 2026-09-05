import { TicketEntradaData, TicketSalidaData } from '../types/ticket.types';

const API_BASE = '/api/movimientos';

export class TicketsService {
  static async obtenerTicketEntrada(movimientoId: string): Promise<TicketEntradaData | null> {
    try {
      const res = await fetch(`${API_BASE}/${movimientoId}/ticket-entrada`);
      if (res.ok) {
        const json = await res.json();
        if (json.success && json.data) return json.data;
      }
    } catch {
      // Fallback para modo offline / demo
    }
    return {
      codigoTicket: `TKT-${Math.floor(100000 + Math.random() * 900000)}`,
      placa: 'ABC-123',
      tipoVehiculo: 'Auto',
      color: 'Plata',
      marcaModelo: 'Toyota Yaris',
      fechaEntrada: new Date().toISOString(),
      horaEntrada: new Date().toLocaleTimeString(),
      tarifaDiaAplicada: 10.0,
      momentoPago: 'SALIDA',
      metodoPago: 'Efectivo',
      usuarioIngreso: 'Operador Entrada',
      ubicacion: 'General',
      observaciones: 'Sin observaciones',
      establecimiento: {
        nombreComercial: 'Cochera Central',
        razonSocial: 'ESTACIONAMIENTO COCHERA CENTRAL S.A.C.',
        ruc: '20123456789',
        direccion: 'Av. Principal 123, Miraflores, Lima',
        telefono: '(01) 456-7890',
        leyendaTicket: '¡Gracias por su preferencia! Conserve este ticket para retirar su vehículo.',
      },
    };
  }

  static async obtenerTicketSalida(movimientoId: string): Promise<TicketSalidaData | null> {
    try {
      const res = await fetch(`${API_BASE}/${movimientoId}/ticket-salida`);
      if (res.ok) {
        const json = await res.json();
        if (json.success && json.data) return json.data;
      }
    } catch {
      // Fallback para modo offline / demo
    }
    return {
      codigoTicket: `TKT-${Math.floor(100000 + Math.random() * 900000)}`,
      placa: 'ABC-123',
      tipoVehiculo: 'Auto',
      fechaEntrada: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString(),
      fechaSalida: new Date().toISOString(),
      diasCobrados: 1,
      tarifaDiaAplicada: 10.0,
      totalPagar: 10.0,
      momentoPago: 'SALIDA',
      metodoPago: 'Efectivo',
      usuarioSalida: 'Operador Salida',
      establecimiento: {
        nombreComercial: 'Cochera Central',
        razonSocial: 'ESTACIONAMIENTO COCHERA CENTRAL S.A.C.',
        ruc: '20123456789',
        direccion: 'Av. Principal 123, Miraflores, Lima',
        telefono: '(01) 456-7890',
        leyendaTicket: '¡Gracias por su preferencia! Conserve este ticket para retirar su vehículo.',
      },
    };
  }

  static imprimirTicketTermicoHTML(htmlContent: string, _ancho: '80mm' | '58mm' = '80mm'): void {
    const ventana = window.open('', '_blank', 'width=380,height=600');
    if (!ventana) return;

    ventana.document.write(htmlContent);
    ventana.document.close();
  }

  static descargarPDF(ticket: TicketEntradaData | TicketSalidaData, esEntrada: boolean): void {
    const ventana = window.open('', '_blank', 'width=800,height=900');
    if (!ventana) return;

    const est = ticket.establecimiento;
    const isEntrada = esEntrada;

    const htmlContent = `
      <!DOCTYPE html>
      <html>
        <head>
          <title>TICKET ${ticket.codigoTicket}</title>
          <style>
            @page { size: A4; margin: 15mm; }
            body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; padding: 24px; color: #1e293b; background: #fff; }
            .header-table { width: 100%; margin-bottom: 20px; border-collapse: collapse; }
            .company-title { font-size: 22px; font-weight: 800; color: #1e3a8a; }
            .ticket-badge { border: 2px solid #1e3a8a; border-radius: 8px; padding: 12px; text-align: center; background: #f8fafc; }
            .badge-title { font-weight: 800; font-size: 16px; color: #1e3a8a; }
            .badge-number { font-weight: 800; font-size: 20px; color: #dc2626; margin-top: 4px; }
            .plate-box { text-align: center; border: 2px solid #000; border-radius: 6px; padding: 10px; margin: 20px 0; background: #f8fafc; }
            .plate-number { font-size: 28px; font-weight: 900; letter-spacing: 2px; }
            .data-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; font-size: 14px; margin-bottom: 20px; border: 1px solid #e2e8f0; padding: 16px; border-radius: 8px; }
            .total-row { font-size: 18px; font-weight: 800; background: #1e3a8a; color: #fff; padding: 12px; border-radius: 6px; display: flex; justify-content: space-between; }
            .footer { margin-top: 30px; text-align: center; font-size: 12px; color: #64748b; border-top: 1px solid #e2e8f0; padding-top: 12px; }
            @media print { .no-print { display: none; } }
          </style>
        </head>
        <body>
          <div class="no-print" style="margin-bottom: 16px; text-align: right;">
            <button onclick="window.print()" style="background: #1e3a8a; color: white; border: none; padding: 10px 20px; border-radius: 6px; cursor: pointer; font-weight: bold;">Imprimir / Guardar PDF</button>
          </div>

          <table class="header-table">
            <tr>
              <td>
                <div class="company-title">${est.nombreComercial || 'COCHERA CENTRAL'}</div>
                <div>${est.razonSocial}</div>
                <div>RUC: ${est.ruc} | Tel: ${est.telefono}</div>
                <div>${est.direccion}</div>
              </td>
              <td style="width: 220px;">
                <div class="ticket-badge">
                  <div class="badge-title">${isEntrada ? 'TICKET DE ENTRADA' : 'TICKET DE SALIDA'}</div>
                  <div class="badge-number">${ticket.codigoTicket}</div>
                </div>
              </td>
            </tr>
          </table>

          <div class="plate-box">
            <span style="font-size: 12px; text-transform: uppercase; color: #475569;">Vehículo Registrado</span>
            <div class="plate-number">${ticket.placa}</div>
          </div>

          <div class="data-grid">
            <div><strong>Tipo Vehículo:</strong> ${ticket.tipoVehiculo}</div>
            <div><strong>Momento Pago:</strong> ${ticket.momentoPago}</div>
            <div><strong>Fecha Ingreso:</strong> ${new Date((ticket as any).fechaEntrada).toLocaleString()}</div>
            ${!isEntrada ? `<div><strong>Fecha Salida:</strong> ${new Date((ticket as TicketSalidaData).fechaSalida).toLocaleString()}</div>` : ''}
            ${(ticket as TicketEntradaData).marcaModelo ? `<div><strong>Marca / Modelo:</strong> ${(ticket as TicketEntradaData).marcaModelo}</div>` : ''}
            ${(ticket as TicketEntradaData).color ? `<div><strong>Color:</strong> ${(ticket as TicketEntradaData).color}</div>` : ''}
            <div><strong>Tarifa por Día:</strong> S/ ${ticket.tarifaDiaAplicada.toFixed(2)} / día</div>
            ${!isEntrada ? `<div><strong>Días Cobrados:</strong> ${(ticket as TicketSalidaData).diasCobrados} día(s)</div>` : ''}
            <div><strong>Atendido por:</strong> ${isEntrada ? (ticket as TicketEntradaData).usuarioIngreso : (ticket as TicketSalidaData).usuarioSalida}</div>
          </div>

          ${!isEntrada ? `
            <div class="total-row" style="${ticket.momentoPago === 'ENTRADA' ? 'background: #059669;' : ''}">
              <span>${ticket.momentoPago === 'ENTRADA' ? 'PAGADO AL INGRESAR:' : 'TOTAL COBRADO:'}</span>
              <span>S/ ${ticket.momentoPago === 'ENTRADA' ? ticket.tarifaDiaAplicada.toFixed(2) : (ticket as TicketSalidaData).totalPagar.toFixed(2)}</span>
            </div>
          ` : `
            <div class="total-row" style="background: #059669;">
              <span>ESTADO DE REGISTRO:</span>
              <span>PARQUEO ACTIVO</span>
            </div>
          `}

          <div class="footer">
            <p>${est.leyendaTicket}</p>
            <small>Generado el ${new Date().toLocaleString()}</small>
          </div>
        </body>
      </html>
    `;

    ventana.document.write(htmlContent);
    ventana.document.close();
  }
}
