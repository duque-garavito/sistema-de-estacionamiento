import { useState, FC, FormEvent } from 'react';
import { Card } from '@core/design-system/Card';
import { Input } from '@core/design-system/Input';
import { Button } from '@core/design-system/Button';
import { AuthService } from '../services/auth.service';
import { Lock, Mail, Car } from 'lucide-react';

interface LoginFormProps {
  onSuccess: () => void;
}

export const LoginForm: FC<LoginFormProps> = ({ onSuccess }) => {
  const [email, setEmail] = useState('admin@cochera.com');
  const [password, setPassword] = useState('123456');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      await AuthService.login({ email, password_hash: password });
      onSuccess();
    } catch (err: any) {
      setError(err.message || 'Error de autenticación');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ maxWidth: '400px', margin: '60px auto' }}>
      <Card title="Ingreso al Sistema" subtitle="Control de Acceso Cochera Central">
        <div style={{ textAlign: 'center', marginBottom: '20px' }}>
          <div style={{
            background: 'linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%)',
            width: '56px',
            height: '56px',
            borderRadius: '50%',
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#fff',
            marginBottom: '12px'
          }}>
            <Car size={30} />
          </div>
        </div>

        {error && (
          <div style={{
            background: 'var(--accent-danger-bg)',
            color: 'var(--accent-danger)',
            padding: '10px 14px',
            borderRadius: 'var(--radius-md)',
            fontSize: '0.85rem',
            marginBottom: '16px'
          }}>
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          <Input
            label="Correo Electrónico"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            icon={<Mail size={18} />}
            required
          />
          <Input
            label="Contraseña"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            icon={<Lock size={18} />}
            required
          />

          <Button type="submit" variant="primary" isLoading={loading} style={{ marginTop: '12px' }}>
            Iniciar Sesión
          </Button>
        </form>
      </Card>
    </div>
  );
};
