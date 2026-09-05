import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth, UserRole } from '../context/AuthContext';
import { Card } from '@core/design-system/Card';
import { Input } from '@core/design-system/Input';
import { Button } from '@core/design-system/Button';
import { Car, Lock, Mail, Eye, EyeOff, LogIn, AlertCircle } from 'lucide-react';
import { ROUTES } from '@routes/routes';

export const LoginPage: React.FC = () => {
  const { login } = useAuth();
  const navigate = useNavigate();

  const [email, setEmail] = useState('admin@cocheracentral.pe');
  const [password, setPassword] = useState('admin123');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    setLoading(true);

    try {
      await login(email, password);

      // Redireccionar al módulo principal asignado según el rol autenticado
      const savedUserStr = localStorage.getItem('cochera_user');
      let targetRoute = ROUTES.DASHBOARD;
      if (savedUserStr) {
        try {
          const u = JSON.parse(savedUserStr);
          if (u.rol === 'OPERADOR') {
            targetRoute = ROUTES.MOVIMIENTOS;
          } else if (u.rol === 'CAJERO') {
            targetRoute = ROUTES.CAJA;
          }
        } catch {
          // fallback
        }
      }

      navigate(targetRoute);
    } catch (err: any) {
      setErrorMsg(err.message || 'Error al iniciar sesión. Verifique sus credenciales.');
    } finally {
      setLoading(false);
    }
  };

  const handleQuickAccount = (role: UserRole) => {
    if (role === 'ADMIN') {
      setEmail('admin@cocheracentral.pe');
      setPassword('admin123');
    } else if (role === 'CAJERO') {
      setEmail('cajero@cocheracentral.pe');
      setPassword('cajero123');
    } else if (role === 'OPERADOR') {
      setEmail('operador@cocheracentral.pe');
      setPassword('operador123');
    }
  };

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      background: 'radial-gradient(circle at 50% 20%, #1e293b 0%, #0f172a 100%)',
      padding: '20px'
    }}>
      <div style={{ width: '100%', maxWidth: '440px' }}>
        {/* Brand Header */}
        <div style={{ textAlign: 'center', marginBottom: '24px' }}>
          <div style={{
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            background: 'linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%)',
            padding: '16px',
            borderRadius: '20px',
            boxShadow: '0 10px 25px rgba(59, 130, 246, 0.4)',
            marginBottom: '16px',
            color: '#ffffff'
          }}>
            <Car size={36} />
          </div>
          <h1 style={{ fontSize: '1.8rem', fontWeight: 800, color: 'var(--text-primary)', letterSpacing: '-0.5px', margin: 0 }}>
            COCHERA CENTRAL
          </h1>
          <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)', fontWeight: 500, display: 'block', marginTop: '4px' }}>
            Sistema Integrado de Gestión Operativa v1.0
          </span>
        </div>

        {/* Login Glassmorphism Form Card */}
        <Card>
          <div style={{ padding: '8px 4px' }}>
            <h2 style={{ fontSize: '1.25rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '6px' }}>
              Iniciar Sesión
            </h2>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '20px' }}>
              Ingrese su correo y contraseña para acceder al panel.
            </p>

            {errorMsg && (
              <div style={{
                background: 'rgba(239, 68, 68, 0.15)',
                border: '1px solid var(--accent-danger)',
                color: '#fca5a5',
                padding: '12px 16px',
                borderRadius: 'var(--radius-md)',
                marginBottom: '16px',
                display: 'flex',
                alignItems: 'center',
                gap: '10px',
                fontSize: '0.85rem'
              }}>
                <AlertCircle size={18} style={{ flexShrink: 0 }} />
                <span>{errorMsg}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div className="input-group">
                <label className="input-label" style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <Mail size={14} color="var(--accent-primary)" /> Correo Electrónico
                </label>
                <Input
                  type="email"
                  placeholder="ejemplo@cocheracentral.pe"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>

              <div className="input-group">
                <label className="input-label" style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <Lock size={14} color="var(--accent-primary)" /> Contraseña
                </label>
                <div style={{ position: 'relative' }}>
                  <Input
                    type={showPassword ? 'text' : 'password'}
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    style={{
                      position: 'absolute',
                      right: '12px',
                      top: '50%',
                      transform: 'translateY(-50%)',
                      background: 'none',
                      border: 'none',
                      color: 'var(--text-muted)',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center'
                    }}
                    tabIndex={-1}
                  >
                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
              </div>

              <Button
                type="submit"
                variant="primary"
                isLoading={loading}
                icon={<LogIn size={18} />}
                style={{ width: '100%', padding: '14px', fontSize: '1rem', marginTop: '8px' }}
              >
                Ingresar al Sistema
              </Button>
            </form>

            {/* Quick Demo Credentials Switcher */}
            <div style={{
              marginTop: '24px',
              paddingTop: '16px',
              borderTop: '1px solid var(--border-subtle)',
              fontSize: '0.8rem'
            }}>
              <span style={{ color: 'var(--text-muted)', display: 'block', marginBottom: '10px', textAlign: 'center' }}>
                Acceso Rápido de Prueba (Demo Cuentas):
              </span>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '8px' }}>
                <button
                  type="button"
                  onClick={() => handleQuickAccount('ADMIN')}
                  style={{
                    padding: '8px 4px',
                    borderRadius: 'var(--radius-sm)',
                    border: '1px solid var(--border-subtle)',
                    background: email === 'admin@cocheracentral.pe' ? 'var(--accent-primary)' : 'var(--bg-primary)',
                    color: email === 'admin@cocheracentral.pe' ? '#fff' : 'var(--text-secondary)',
                    fontWeight: 600,
                    cursor: 'pointer',
                    fontSize: '0.75rem'
                  }}
                >
                  👑 Admin
                </button>
                <button
                  type="button"
                  onClick={() => handleQuickAccount('CAJERO')}
                  style={{
                    padding: '8px 4px',
                    borderRadius: 'var(--radius-sm)',
                    border: '1px solid var(--border-subtle)',
                    background: email === 'cajero@cocheracentral.pe' ? 'var(--accent-warning)' : 'var(--bg-primary)',
                    color: email === 'cajero@cocheracentral.pe' ? '#fff' : 'var(--text-secondary)',
                    fontWeight: 600,
                    cursor: 'pointer',
                    fontSize: '0.75rem'
                  }}
                >
                  💵 Cajero
                </button>
                <button
                  type="button"
                  onClick={() => handleQuickAccount('OPERADOR')}
                  style={{
                    padding: '8px 4px',
                    borderRadius: 'var(--radius-sm)',
                    border: '1px solid var(--border-subtle)',
                    background: email === 'operador@cocheracentral.pe' ? 'var(--accent-success)' : 'var(--bg-primary)',
                    color: email === 'operador@cocheracentral.pe' ? '#fff' : 'var(--text-secondary)',
                    fontWeight: 600,
                    cursor: 'pointer',
                    fontSize: '0.75rem'
                  }}
                >
                  🚗 Operador
                </button>
              </div>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
};
