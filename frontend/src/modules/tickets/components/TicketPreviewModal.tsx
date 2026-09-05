import { FC, useState, useEffect } from 'react';
import { Modal } from '@core/design-system/Modal';
import { TicketEntradaData, TicketSalidaData } from '../types/ticket.types';
import { TicketEntradaTermico } from './TicketEntradaTermico';
import { TicketSalidaTermico } from './TicketSalidaTermico';
import { TicketsService } from '../services/tickets.service';
import { Button } from '@core/design-system/Button';

interface TicketPreviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  movimientoId?: string;
  tipoTicket: 'entrada' | 'salida';
  initialData?: TicketEntradaData | TicketSalidaData | null;
}

export const TicketPreviewModal: FC<TicketPreviewModalProps> = ({
  isOpen,
  onClose,
  movimientoId,
  tipoTicket,
  initialData,
}) => {
  const [ticketData, setTicketData] = useState<TicketEntradaData | TicketSalidaData | null>(initialData || null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isOpen) {
      if (initialData) {
        setTicketData(initialData);
      } else if (movimientoId) {
        setLoading(true);
        if (tipoTicket === 'entrada') {
          TicketsService.obtenerTicketEntrada(movimientoId).then((data) => {
            setTicketData(data);
            setLoading(false);
          });
        } else {
          TicketsService.obtenerTicketSalida(movimientoId).then((data) => {
            setTicketData(data);
            setLoading(false);
          });
        }
      }
    }
  }, [isOpen, movimientoId, tipoTicket, initialData]);

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={tipoTicket === 'entrada' ? 'Ticket de Ingreso a Cochera' : 'Ticket de Salida y Cobro'}
    >
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '16px', width: '100%' }}>
        {loading ? (
          <div style={{ padding: '24px', textAlign: 'center', color: 'var(--text-muted)' }}>
            Cargando ticket...
          </div>
        ) : ticketData ? (
          tipoTicket === 'entrada' ? (
            <TicketEntradaTermico ticket={ticketData as TicketEntradaData} />
          ) : (
            <TicketSalidaTermico ticket={ticketData as TicketSalidaData} />
          )
        ) : (
          <div style={{ padding: '24px', textAlign: 'center', color: 'var(--text-muted)' }}>
            No se encontraron datos del ticket.
          </div>
        )}

        <div style={{ width: '100%', borderTop: '1px solid var(--border-subtle)', paddingTop: '12px' }}>
          <Button variant="secondary" onClick={onClose} style={{ width: '100%' }}>
            Cerrar Ticket
          </Button>
        </div>
      </div>
    </Modal>
  );
};
