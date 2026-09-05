import React from 'react';
import { useAuth, UserRole } from '../context/AuthContext';
import { Shield } from 'lucide-react';


export const UserRoleSelector: React.FC = () => {
  const { user, setRole } = useAuth();

  const getRoleBadgeStyle = (rol: UserRole) => {
    switch (rol) {
      case 'ADMIN':
        return { background: 'rgba(147, 51, 234, 0.2)', color: '#c084fc', border: '1px solid rgba(168, 85, 247, 0.4)' };
      case 'CAJERO':
        return { background: 'rgba(234, 179, 8, 0.2)', color: '#eab308', border: '1px solid rgba(234, 179, 8, 0.4)' };
      case 'OPERADOR':
      default:
        return { background: 'rgba(34, 197, 94, 0.2)', color: '#4ade80', border: '1px solid rgba(34, 197, 94, 0.4)' };
    }
  };

  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', background: 'var(--bg-primary)', padding: '6px 12px', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-subtle)' }}>
      <Shield size={16} color="var(--accent-primary)" />
      <div style={{ display: 'flex', flexDirection: 'column' }}>
        <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)', fontWeight: 600 }}>USUARIO ACTIVO</span>
        <strong style={{ fontSize: '0.82rem', color: 'var(--text-primary)' }}>{user.nombre}</strong>
      </div>

      <select
        value={user.rol}
        onChange={(e) => setRole(e.target.value as UserRole)}
        style={{
          ...getRoleBadgeStyle(user.rol),
          padding: '4px 8px',
          borderRadius: 'var(--radius-sm)',
          fontSize: '0.75rem',
          fontWeight: 700,
          cursor: 'pointer',
          outline: 'none',
          marginLeft: '4px'
        }}
        title="Cambiar rol activo para pruebas de permisos"
      >
        <option value="ADMIN" style={{ background: 'var(--bg-secondary)', color: 'var(--text-primary)' }}>👑 ADMIN</option>
        <option value="OPERADOR" style={{ background: 'var(--bg-secondary)', color: 'var(--text-primary)' }}>🚗 OPERADOR</option>
        <option value="CAJERO" style={{ background: 'var(--bg-secondary)', color: 'var(--text-primary)' }}>💵 CAJERO</option>
      </select>
    </div>
  );
};
