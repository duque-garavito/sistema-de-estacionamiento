import React, { useEffect } from 'react';
import { CheckCircle2, AlertCircle, Info, X } from 'lucide-react';

export interface ToastMessage {
  id: string;
  type: 'success' | 'error' | 'info';
  title: string;
  message?: string;
}

interface ToastProps {
  toasts: ToastMessage[];
  onClose: (id: string) => void;
}

export const ToastNotificationContainer: React.FC<ToastProps> = ({ toasts, onClose }) => {
  return (
    <div style={{
      position: 'fixed',
      bottom: '24px',
      right: '24px',
      zIndex: 9999,
      display: 'flex',
      flexDirection: 'column',
      gap: '10px',
      maxWidth: '380px',
      width: '100%'
    }}>
      {toasts.map((toast) => (
        <ToastItem key={toast.id} toast={toast} onClose={() => onClose(toast.id)} />
      ))}
    </div>
  );
};

const ToastItem: React.FC<{ toast: ToastMessage; onClose: () => void }> = ({ toast, onClose }) => {
  useEffect(() => {
    const timer = setTimeout(() => {
      onClose();
    }, 4000);
    return () => clearTimeout(timer);
  }, [onClose]);

  const getStyle = () => {
    switch (toast.type) {
      case 'success':
        return {
          bg: 'var(--bg-secondary)',
          border: '1px solid var(--accent-success)',
          color: 'var(--accent-success)',
          icon: <CheckCircle2 size={20} />
        };
      case 'error':
        return {
          bg: 'var(--bg-secondary)',
          border: '1px solid var(--accent-danger)',
          color: 'var(--accent-danger)',
          icon: <AlertCircle size={20} />
        };
      case 'info':
      default:
        return {
          bg: 'var(--bg-secondary)',
          border: '1px solid var(--accent-primary)',
          color: 'var(--accent-primary)',
          icon: <Info size={20} />
        };
    }
  };

  const style = getStyle();

  return (
    <div style={{
      background: style.bg,
      border: style.border,
      padding: '12px 16px',
      borderRadius: 'var(--radius-md)',
      boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.5)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      gap: '12px',
      animation: 'slideInRight 0.25s ease-out'
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
        <div style={{ color: style.color }}>{style.icon}</div>
        <div>
          <strong style={{ display: 'block', fontSize: '0.85rem', color: 'var(--text-primary)' }}>{toast.title}</strong>
          {toast.message && <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>{toast.message}</span>}
        </div>
      </div>
      <button
        type="button"
        onClick={onClose}
        style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', padding: '2px' }}
      >
        <X size={16} />
      </button>
    </div>
  );
};
