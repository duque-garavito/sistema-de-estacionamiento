import { FC, useState, useEffect } from 'react';
import { Boleta, EmpresaConfig, TipoComprobante, TipoDocumentoCliente } from '../types/boleta.types';
import { CheckCircle, Printer, FileText, User } from 'lucide-react';
import { Button } from '@core/design-system/Button';
import { TicketTermico } from './TicketTermico';
import { BoletaFiscalPDF } from './BoletaFiscalPDF';
import { BoletasService } from '../services/boletas.service';

interface BoletaPreviewProps {
  boleta: Boleta;
  onDone: () => void;
}

export const BoletaPreview: FC<BoletaPreviewProps> = ({ boleta: boletaInicial, onDone }) => {
  const [empresa, setEmpresa] = useState<EmpresaConfig>({
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
    leyendaTicket: '¡Gracias por su preferencia!',
  });

  const [activeTab, setActiveTab] = useState<'termico' | 'fiscal'>('termico');
  const [tipoComprobante, setTipoComprobante] = useState<TipoComprobante>(boletaInicial.tipoComprobante || 'TICKET');
  const [clienteTipoDoc, setClienteTipoDoc] = useState<TipoDocumentoCliente>(boletaInicial.clienteTipoDoc || 'VARIOS');
  const [clienteNumDoc, setClienteNumDoc] = useState(boletaInicial.clienteNumDoc || '-');
  const [clienteNombre, setClienteNombre] = useState(boletaInicial.clienteNombre || 'CLIENTE VARIOS');
  const [boletaActual, setBoletaActual] = useState<Boleta>(boletaInicial);

  useEffect(() => {
    BoletasService.getEmpresaConfig().then(setEmpresa);
  }, []);

  const handleTipoChange = async (nuevoTipo: TipoComprobante) => {
    setTipoComprobante(nuevoTipo);
    const dtoTipoDoc = nuevoTipo === 'FACTURA' ? 'RUC' : nuevoTipo === 'BOLETA' ? 'DNI' : 'VARIOS';
    const dtoNombre = nuevoTipo === 'FACTURA' ? 'RAZON SOCIAL S.A.C.' : nuevoTipo === 'BOLETA' ? 'CLIENTE PARTICULAR' : 'CLIENTE VARIOS';

    setClienteTipoDoc(dtoTipoDoc);
    setClienteNombre(dtoNombre);

    // Re-emitir o recalcular serie y correlativo
    const boletaActualizada = await BoletasService.emitirComprobante({
      movimientoId: boletaInicial.movimientoId || undefined,
      placa: boletaInicial.placa,
      tipoVehiculo: boletaInicial.tipoVehiculo,
      fechaIngreso: boletaInicial.fechaIngreso,
      fechaSalida: boletaInicial.fechaSalida,
      total: boletaInicial.total,
      metodoPago: boletaInicial.metodoPago,
      tipoComprobante: nuevoTipo,
      clienteTipoDoc: dtoTipoDoc,
      clienteNumDoc: dtoTipoDoc === 'VARIOS' ? '-' : clienteNumDoc,
      clienteNombre: dtoNombre,
    });

    setBoletaActual(boletaActualizada);
  };

  const handleAplicarDatosCliente = async () => {
    const boletaActualizada = await BoletasService.emitirComprobante({
      movimientoId: boletaInicial.movimientoId || undefined,
      placa: boletaInicial.placa,
      tipoVehiculo: boletaInicial.tipoVehiculo,
      fechaIngreso: boletaInicial.fechaIngreso,
      fechaSalida: boletaInicial.fechaSalida,
      total: boletaInicial.total,
      metodoPago: boletaInicial.metodoPago,
      tipoComprobante,
      clienteTipoDoc,
      clienteNumDoc,
      clienteNombre,
    });
    setBoletaActual(boletaActualizada);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '20px', width: '100%' }}>
      {/* Header Exitoso */}
      <div style={{ textAlign: 'center', color: 'var(--accent-success)' }}>
        <CheckCircle size={44} />
        <h3 style={{ fontSize: '1.3rem', marginTop: '6px', color: 'var(--text-primary)' }}>¡Cobro Registrado!</h3>
        <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>N° Comprobante: {boletaActual.numeroTicket}</p>
      </div>

      {/* Selector de Tipo de Comprobante (Ticket vs Boleta vs Factura) */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(3, 1fr)',
        gap: '8px',
        width: '100%',
        background: 'var(--bg-primary)',
        padding: '6px',
        borderRadius: 'var(--radius-md)',
        border: '1px solid var(--border-subtle)'
      }}>
        {(['TICKET', 'BOLETA', 'FACTURA'] as const).map((tipo) => (
          <button
            key={tipo}
            type="button"
            onClick={() => handleTipoChange(tipo)}
            style={{
              padding: '8px 12px',
              borderRadius: 'var(--radius-sm)',
              border: 'none',
              background: tipoComprobante === tipo ? 'var(--accent-primary)' : 'transparent',
              color: tipoComprobante === tipo ? '#ffffff' : 'var(--text-secondary)',
              fontWeight: tipoComprobante === tipo ? 700 : 500,
              fontSize: '0.85rem',
              cursor: 'pointer',
              transition: 'all 0.15s ease'
            }}
          >
            {tipo === 'TICKET' ? 'Ticket Interno' : tipo === 'BOLETA' ? 'Boleta Fiscal' : 'Factura Fiscal'}
          </button>
        ))}
      </div>

      {/* Formulario Datos de Cliente si es Boleta o Factura */}
      {tipoComprobante !== 'TICKET' && (
        <div style={{
          width: '100%',
          background: 'var(--bg-primary)',
          padding: '14px',
          borderRadius: 'var(--radius-md)',
          border: '1px solid var(--border-subtle)',
          display: 'flex',
          flexDirection: 'column',
          gap: '10px'
        }}>
          <div style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: '6px' }}>
            <User size={16} color="var(--accent-primary)" />
            <span>Datos para {tipoComprobante}</span>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '120px 1fr', gap: '8px' }}>
            <input
              className="input-field"
              value={clienteNumDoc}
              onChange={(e) => setClienteNumDoc(e.target.value)}
              placeholder={tipoComprobante === 'FACTURA' ? 'RUC' : 'DNI'}
            />
            <input
              className="input-field"
              value={clienteNombre}
              onChange={(e) => setClienteNombre(e.target.value)}
              placeholder="Nombre / Razón Social"
            />
          </div>
          <Button variant="secondary" onClick={handleAplicarDatosCliente} style={{ fontSize: '0.8rem', padding: '6px 12px' }}>
            Actualizar Datos Comprobante
          </Button>
        </div>
      )}

      {/* Navegación Dual: Vista Térmica vs Vista Fiscal PDF */}
      <div style={{ display: 'flex', gap: '8px', borderBottom: '1px solid var(--border-subtle)', width: '100%', paddingBottom: '8px' }}>
        <button
          type="button"
          onClick={() => setActiveTab('termico')}
          style={{
            flex: 1,
            padding: '8px 12px',
            border: 'none',
            borderBottom: activeTab === 'termico' ? '2px solid var(--accent-primary)' : '2px solid transparent',
            background: 'transparent',
            color: activeTab === 'termico' ? 'var(--text-primary)' : 'var(--text-muted)',
            fontWeight: activeTab === 'termico' ? 700 : 500,
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '8px'
          }}
        >
          <Printer size={18} />
          <span>Ticket Térmico (80mm/58mm)</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('fiscal')}
          style={{
            flex: 1,
            padding: '8px 12px',
            border: 'none',
            borderBottom: activeTab === 'fiscal' ? '2px solid var(--accent-primary)' : '2px solid transparent',
            background: 'transparent',
            color: activeTab === 'fiscal' ? 'var(--text-primary)' : 'var(--text-muted)',
            fontWeight: activeTab === 'fiscal' ? 700 : 500,
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '8px'
          }}
        >
          <FileText size={18} />
          <span>Comprobante Fiscal (PDF)</span>
        </button>
      </div>

      {/* Renderizado según Tab */}
      {activeTab === 'termico' ? (
        <TicketTermico boleta={boletaActual} empresa={empresa} />
      ) : (
        <BoletaFiscalPDF boleta={boletaActual} empresa={empresa} />
      )}

      <div style={{ width: '100%', paddingTop: '8px', borderTop: '1px solid var(--border-subtle)' }}>
        <Button variant="secondary" onClick={onDone} style={{ width: '100%' }}>
          Finalizar y Volver a Control de Parqueo
        </Button>
      </div>
    </div>
  );
};
