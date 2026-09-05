import React, { ReactNode } from 'react';
import { useAuth, UserRole } from '../context/AuthContext';
import { ShieldAlert } from 'lucide-react';

interface RoleGuardProps {
  allowedRoles: UserRole[];
  children: ReactNode;
  fallback?: ReactNode;
}

export const RoleGuard: React.FC<RoleGuardProps> = ({ allowedRoles, children, fallback }) => {
  const { hasPermission } = useAuth();

  if (!hasPermission(allowedRoles)) {
    if (fallback !== undefined) {
      return <>{fallback}</>;
    }

    return (
      <div style={{
        padding: '32px 24px',
        textAlign: 'center',
        background: 'var(--bg-secondary)',
        borderRadius: 'var(--radius-lg)',
        border: '1px solid var(--border-subtle)',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: '12px',
        maxWidth: '480px',
        margin: '40px auto'
      }}>
        <div style={{
          background: 'rgba(239, 68, 68, 0.15)',
          padding: '12px',
          borderRadius: '50%',
          color: '#ef4444'
        }}>
          <ShieldAlert size={36} />
        </div>
        <h3 style={{ fontSize: '1.1rem', color: 'var(--text-primary)', margin: 0 }}>Acceso Restringido</h3>
        <p style={{ fontSize: '0.88rem', color: 'var(--text-muted)', margin: 0, lineHeight: 1.5 }}>
          Tu rol actual no tiene los permisos suficientes para acceder a este módulo.
          Contacta al administrador del sistema si necesitas elevación de permisos.
        </p>
      </div>
    );
  }

  return <>{children}</>;
};
