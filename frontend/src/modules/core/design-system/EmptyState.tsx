import React, { ReactNode } from 'react';
import { Inbox } from 'lucide-react';

interface EmptyStateProps {
  title?: string;
  description?: string;
  icon?: ReactNode;
  action?: ReactNode;
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  title = 'Sin información disponible',
  description = 'No se encontraron registros en el sistema.',
  icon,
  action,
}) => {
  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '40px 20px',
      textAlign: 'center',
      background: 'var(--bg-primary)',
      borderRadius: 'var(--radius-md)',
      border: '1px border-dashed var(--border-subtle)',
      gap: '12px'
    }}>
      <div style={{
        background: 'var(--bg-secondary)',
        padding: '16px',
        borderRadius: '50%',
        color: 'var(--text-muted)'
      }}>
        {icon || <Inbox size={32} />}
      </div>
      <div>
        <h4 style={{ fontSize: '1.05rem', fontWeight: 700, color: 'var(--text-primary)', margin: '0 0 4px 0' }}>
          {title}
        </h4>
        <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', margin: 0 }}>
          {description}
        </p>
      </div>
      {action && <div style={{ marginTop: '8px' }}>{action}</div>}
    </div>
  );
};
