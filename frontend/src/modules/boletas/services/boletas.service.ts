import { Boleta, EmpresaConfig, EmitirComprobanteDTO } from '../types/boleta.types';
import { ConfiguracionService } from '@modules/configuracion/services/configuracion.service';

const API_BASE = 'http://localhost:4000/api/boletas';

export class BoletasService {
  private static defaultEmpresa: EmpresaConfig = {
    id: 1,
    ruc: '20123456789',
    razonSocial: 'ESTACIONAMIENTO COCHERA CENTRAL S.A.C.',
    nombreComercial: 'Cochera Central',
    direccion: 'Av. Principal 123, Miraflores, Lima',
    telefono: '(01) 456-7890',
    serieBoleta: 'B001',
    correlativoBoleta: 101,
    serieFactura: 'F001',
    correlativoFactura: 51,
    leyendaTicket: '¡Gracias por su preferencia! Conserve este ticket para retirar su vehículo.',
  };

  static async getEmpresaConfig(): Promise<EmpresaConfig> {
    try {
      const config = await ConfiguracionService.obtenerConfiguracion();
      if (config) return config;
    } catch {
      // Backend offline fallback
    }
    return this.defaultEmpresa;
  }

  static async updateEmpresaConfig(config: Partial<EmpresaConfig>): Promise<EmpresaConfig> {
    try {
      const updated = await ConfiguracionService.actualizarConfiguracion(config);
      if (updated) return updated;
    } catch {
      // Backend offline fallback
    }
    this.defaultEmpresa = { ...this.defaultEmpresa, ...config };
    return this.defaultEmpresa;
  }

  static async emitirComprobante(dto: EmitirComprobanteDTO): Promise<Boleta> {
    try {
      const res = await fetch(`${API_BASE}/emitir`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(dto),
      });
      if (res.ok) {
        const json = await res.json();
        if (json.success && json.data) return json.data;
      }
    } catch {
      // Backend offline fallback
    }

    // Fallback local local calculation
    const diffMs = new Date(dto.fechaSalida).getTime() - new Date(dto.fechaIngreso).getTime();
    const minsTotales = Math.floor(Math.max(0, diffMs) / (1000 * 60));
    const horas = Math.floor(minsTotales / 60);
    const mins = minsTotales % 60;
    const tiempoTotalFormatted = `${horas}h ${mins}m`;

    const subtotal = parseFloat((dto.total / 1.18).toFixed(2));
    const igv = parseFloat((dto.total - subtotal).toFixed(2));

    const tipo = dto.tipoComprobante || 'TICKET';
    let numeroTicket = `TKT-${Math.floor(100000 + Math.random() * 900000)}`;
    let serie = 'T001';
    let correlativo = 1;

    if (tipo === 'BOLETA') {
      serie = this.defaultEmpresa.serieBoleta;
      correlativo = this.defaultEmpresa.correlativoBoleta;
      numeroTicket = `${serie}-${String(correlativo).padStart(6, '0')}`;
      this.defaultEmpresa.correlativoBoleta += 1;
    } else if (tipo === 'FACTURA') {
      serie = this.defaultEmpresa.serieFactura;
      correlativo = this.defaultEmpresa.correlativoFactura;
      numeroTicket = `${serie}-${String(correlativo).padStart(6, '0')}`;
      this.defaultEmpresa.correlativoFactura += 1;
    }

    return {
      id: `BOL-${Date.now()}`,
      numeroTicket,
      movimientoId: dto.movimientoId,
      tipoComprobante: tipo,
      serie,
      correlativo,
      clienteTipoDoc: dto.clienteTipoDoc || (tipo === 'FACTURA' ? 'RUC' : tipo === 'BOLETA' ? 'DNI' : 'VARIOS'),
      clienteNumDoc: dto.clienteNumDoc || '-',
      clienteNombre: dto.clienteNombre || (tipo === 'FACTURA' ? 'EMPRESA EJEMPLO S.A.C.' : 'CLIENTE VARIOS'),
      clienteDireccion: dto.clienteDireccion || '',
      placa: dto.placa.toUpperCase(),
      tipoVehiculo: dto.tipoVehiculo,
      fechaIngreso: dto.fechaIngreso,
      fechaSalida: dto.fechaSalida,
      tiempoTotalFormatted,
      subtotal,
      igv,
      total: parseFloat(dto.total.toFixed(2)),
      metodoPago: dto.metodoPago,
      cajero: dto.cajero || 'Operador Caja #1',
      fechaEmision: new Date().toISOString(),
    };
  }

  static imprimirTicketTermico(boleta: Boleta, empresa: EmpresaConfig, ancho: '80mm' | '58mm' = '80mm'): void {
    const widthPx = ancho === '58mm' ? '200px' : '280px';
    const fontSize = ancho === '58mm' ? '10px' : '12px';

    const ventanaImpresion = window.open('', '_blank', 'width=400,height=650');
    if (!ventanaImpresion) return;

    const htmlContent = `
      <!DOCTYPE html>
      <html>
        <head>
          <title>Ticket ${boleta.numeroTicket}</title>
          <style>
            @page {
              margin: 0;
              size: ${ancho} auto;
            }
            body {
              font-family: 'Courier New', Courier, monospace;
              width: ${widthPx};
              margin: 0 auto;
              padding: 10px 5px;
              font-size: ${fontSize};
              color: #000;
              line-height: 1.3;
            }
            .text-center { text-align: center; }
            .bold { font-weight: bold; }
            .divider { border-bottom: 1px dashed #000; margin: 6px 0; }
            .flex-between { display: flex; justify-content: space-between; align-items: center; }
            .plate { font-size: 1.4em; font-weight: bold; border: 1px solid #000; padding: 2px 6px; text-align: center; margin: 4px 0; }
            .total { font-size: 1.3em; font-weight: bold; margin-top: 6px; border-top: 2px solid #000; padding-top: 4px; }
            @media print {
              body { width: 100%; padding: 0; }
            }
          </style>
        </head>
        <body>
          <div class="text-center">
            <h3 style="margin:0 0 2px 0;">${empresa.nombreComercial || 'COCHERA CENTRAL'}</h3>
            <div>${empresa.razonSocial}</div>
            <div>RUC: ${empresa.ruc}</div>
            <div>${empresa.direccion}</div>
            <div>Teléf: ${empresa.telefono}</div>
            <div class="divider"></div>
            <div class="bold" style="font-size: 1.1em;">
              ${boleta.tipoComprobante === 'TICKET' ? 'TICKET DE PARQUEO' : boleta.tipoComprobante}
            </div>
            <div class="bold">${boleta.numeroTicket}</div>
          </div>
          
          <div class="divider"></div>
          
          <div class="text-center">
            <div>PLACA DE VEHÍCULO</div>
            <div class="plate">${boleta.placa}</div>
          </div>
          
          <div class="divider"></div>
          
          <div>
            <div class="flex-between"><span>Tipo Vehículo:</span> <span class="bold">${boleta.tipoVehiculo}</span></div>
            <div class="flex-between"><span>Ingreso:</span> <span>${new Date(boleta.fechaIngreso).toLocaleString()}</span></div>
            <div class="flex-between"><span>Salida:</span> <span>${new Date(boleta.fechaSalida).toLocaleString()}</span></div>
            <div class="flex-between"><span>Tiempo Total:</span> <span class="bold">${boleta.tiempoTotalFormatted}</span></div>
            <div class="flex-between"><span>Atendido por:</span> <span>${boleta.cajero}</span></div>
          </div>

          <div class="divider"></div>

          <div>
            <div class="flex-between"><span>Subtotal:</span> <span>S/ ${boleta.subtotal.toFixed(2)}</span></div>
            <div class="flex-between"><span>IGV (18%):</span> <span>S/ ${boleta.igv.toFixed(2)}</span></div>
            <div class="flex-between"><span>Método Pago:</span> <span class="bold">${boleta.metodoPago}</span></div>
            <div class="flex-between total"><span>TOTAL:</span> <span>S/ ${boleta.total.toFixed(2)}</span></div>
          </div>

          <div class="divider"></div>

          <div class="text-center" style="font-size: 0.9em;">
            <p style="margin: 4px 0;">${empresa.leyendaTicket || '¡Gracias por su visita!'}</p>
            <small>${new Date(boleta.fechaEmision).toLocaleString()}</small>
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

    ventanaImpresion.document.write(htmlContent);
    ventanaImpresion.document.close();
  }

  static descargarBoletaPDF(boleta: Boleta, empresa: EmpresaConfig): void {
    const ventana = window.open('', '_blank', 'width=800,height=900');
    if (!ventana) return;

    const htmlContent = `
      <!DOCTYPE html>
      <html>
        <head>
          <title>${boleta.tipoComprobante} ${boleta.numeroTicket}</title>
          <style>
            @page { size: A4; margin: 15mm; }
            body {
              font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
              color: #1e293b;
              margin: 0;
              padding: 24px;
              background: #fff;
            }
            .header-table { width: 100%; border-collapse: collapse; margin-bottom: 20px; }
            .header-table td { vertical-align: top; }
            .company-name { font-size: 20px; font-weight: 800; color: #1e3a8a; margin-bottom: 4px; }
            .company-info { font-size: 13px; color: #475569; line-height: 1.4; }
            .doc-box {
              border: 2px solid #1e3a8a;
              border-radius: 8px;
              padding: 16px;
              text-align: center;
              background: #f8fafc;
            }
            .doc-title { font-size: 16px; font-weight: 800; color: #1e3a8a; text-transform: uppercase; }
            .doc-number { font-size: 18px; font-weight: 700; color: #dc2626; margin-top: 6px; }
            .client-box {
              border: 1px solid #cbd5e1;
              border-radius: 6px;
              padding: 14px;
              margin-bottom: 20px;
              background: #f8fafc;
              font-size: 13px;
            }
            .client-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 8px; }
            .detail-table { width: 100%; border-collapse: collapse; margin-bottom: 20px; font-size: 13px; }
            .detail-table th { background: #1e3a8a; color: #ffffff; padding: 10px; text-align: left; font-weight: 600; }
            .detail-table td { padding: 12px 10px; border-bottom: 1px solid #e2e8f0; }
            .totals-table { width: 300px; margin-left: auto; border-collapse: collapse; font-size: 13px; }
            .totals-table td { padding: 6px 12px; }
            .totals-table .total-row { font-size: 16px; font-weight: 800; background: #1e3a8a; color: #fff; }
            .footer-notes { margin-top: 40px; border-top: 1px solid #e2e8f0; padding-top: 16px; font-size: 12px; color: #64748b; text-align: center; }
            @media print {
              body { padding: 0; }
              .no-print { display: none; }
            }
          </style>
        </head>
        <body>
          <div class="no-print" style="margin-bottom: 16px; text-align: right;">
            <button onclick="window.print()" style="background: #1e3a8a; color: white; border: none; padding: 10px 20px; border-radius: 6px; cursor: pointer; font-weight: bold;">Imprimir / Guardar en PDF</button>
          </div>

          <table class="header-table">
            <tr>
              <td style="width: 60%;">
                <div class="company-name">${empresa.razonSocial}</div>
                <div class="company-info">
                  <strong>Nombre Comercial:</strong> ${empresa.nombreComercial}<br/>
                  <strong>RUC:</strong> ${empresa.ruc}<br/>
                  <strong>Dirección:</strong> ${empresa.direccion}<br/>
                  <strong>Teléfono:</strong> ${empresa.telefono}
                </div>
              </td>
              <td style="width: 40%;">
                <div class="doc-box">
                  <div style="font-weight: 700; font-size: 14px;">R.U.C. ${empresa.ruc}</div>
                  <div class="doc-title">${boleta.tipoComprobante === 'TICKET' ? 'COMPROBANTE DE PAGO' : boleta.tipoComprobante + ' ELECTRÓNICA'}</div>
                  <div class="doc-number">${boleta.numeroTicket}</div>
                </div>
              </td>
            </tr>
          </table>

          <div class="client-box">
            <div class="client-grid">
              <div><strong>Cliente / Razón Social:</strong> ${boleta.clienteNombre}</div>
              <div><strong>${boleta.clienteTipoDoc}:</strong> ${boleta.clienteNumDoc}</div>
              <div><strong>Fecha de Emisión:</strong> ${new Date(boleta.fechaEmision).toLocaleString()}</div>
              <div><strong>Forma de Pago:</strong> ${boleta.metodoPago}</div>
              ${boleta.clienteDireccion ? `<div style="grid-column: span 2;"><strong>Dirección:</strong> ${boleta.clienteDireccion}</div>` : ''}
            </div>
          </div>

          <table class="detail-table">
            <thead>
              <tr>
                <th>Placa</th>
                <th>Descripción Servicio</th>
                <th>Ingreso / Salida</th>
                <th>Tiempo</th>
                <th style="text-align: right;">Importe</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td><strong>${boleta.placa}</strong></td>
                <td>Servicio de Parqueo / Estacionamiento (${boleta.tipoVehiculo})</td>
                <td>${new Date(boleta.fechaIngreso).toLocaleTimeString()} - ${new Date(boleta.fechaSalida).toLocaleTimeString()}</td>
                <td>${boleta.tiempoTotalFormatted}</td>
                <td style="text-align: right; font-weight: 700;">S/ ${boleta.total.toFixed(2)}</td>
              </tr>
            </tbody>
          </table>

          <table class="totals-table">
            <tr>
              <td>Op. Gravada:</td>
              <td style="text-align: right;">S/ ${boleta.subtotal.toFixed(2)}</td>
            </tr>
            <tr>
              <td>I.G.V. (18%):</td>
              <td style="text-align: right;">S/ ${boleta.igv.toFixed(2)}</td>
            </tr>
            <tr class="total-row">
              <td>IMPORTE TOTAL:</td>
              <td style="text-align: right;">S/ ${boleta.total.toFixed(2)}</td>
            </tr>
          </table>

          <div class="footer-notes">
            <p>${empresa.leyendaTicket}</p>
            <p>Cajero Atendió: ${boleta.cajero} | Documento emitido en conformidad con la normativa de comprobantes.</p>
          </div>
        </body>
      </html>
    `;

    ventana.document.write(htmlContent);
    ventana.document.close();
  }
}
