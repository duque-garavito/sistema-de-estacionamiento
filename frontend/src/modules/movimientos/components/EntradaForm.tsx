import { useState, FC, FormEvent, useEffect } from 'react';
import { Button } from '@core/design-system/Button';
import { Input } from '@core/design-system/Input';
import { EntradaDTO, TipoVehiculo, MomentoPago } from '../types/movimiento.types';
import { ListaNegraService } from '@modules/lista-negra/services/lista-negra.service';
import { LogIn, Car, Bike, Truck, User, ShieldAlert } from 'lucide-react';

interface EntradaFormProps {
  onSubmit: (dto: EntradaDTO) => Promise<void>;
}

export const EntradaForm: FC<EntradaFormProps> = ({ onSubmit }) => {
  const [placa, setPlaca] = useState('');
  const [tipoVehiculo, setTipoVehiculo] = useState<TipoVehiculo>('Auto');
  const [marcaModelo, setMarcaModelo] = useState('');
  const [color, setColor] = useState('');
  const [propietarioDni, setPropietarioDni] = useState('');
  const [propietarioNombre, setPropietarioNombre] = useState('');
  const [momentoPago, setMomentoPago] = useState<MomentoPago>('SALIDA');
  const [ubicacion, setUbicacion] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Verificación de Lista Negra
  const [isBlacklisted, setIsBlacklisted] = useState(false);
  const [blacklistMotivo, setBlacklistMotivo] = useState('');

  useEffect(() => {
    const checkPlaca = async () => {
      if (placa.trim().length >= 3) {
        const res = await ListaNegraService.verificarPlaca(placa);
        if (res.restringido) {
          setIsBlacklisted(true);
          setBlacklistMotivo(res.datos?.motivo || 'Vehículo registrado en Lista Negra');
        } else {
          setIsBlacklisted(false);
          setBlacklistMotivo('');
        }
      } else {
        setIsBlacklisted(false);
        setBlacklistMotivo('');
      }
    };
    checkPlaca();
  }, [placa]);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!placa.trim() || isBlacklisted) return;
    setLoading(true);
    setError('');
    try {
      await onSubmit({
        placa: placa.toUpperCase(),
        tipoVehiculo,
        marcaModelo,
        color,
        propietarioDni,
        propietarioNombre,
        ubicacion,
        momentoPago,
      });
      setPlaca('');
      setMarcaModelo('');
      setColor('');
      setPropietarioDni('');
      setPropietarioNombre('');
      setUbicacion('');
      setIsBlacklisted(false);
      setBlacklistMotivo('');
    } catch (err: any) {
      setError(err.message || 'Error al registrar ingreso');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
      {error && (
        <div style={{
          background: 'var(--accent-danger-bg)',
          color: 'var(--accent-danger)',
          border: '1px solid rgba(239, 68, 68, 0.3)',
          padding: '10px 14px',
          borderRadius: 'var(--radius-md)',
          fontSize: '0.85rem',
          fontWeight: 600
        }}>
          ⚠️ {error}
        </div>
      )}

      {isBlacklisted && (
        <div style={{
          background: 'rgba(239, 68, 68, 0.2)',
          border: '2px solid var(--accent-danger)',
          color: 'var(--accent-danger)',
          padding: '14px',
          borderRadius: 'var(--radius-md)',
          display: 'flex',
          gap: '12px',
          alignItems: 'center'
        }}>
          <ShieldAlert size={28} />
          <div>
            <strong style={{ display: 'block', fontSize: '0.95rem' }}>INGRESO BLOQUEADO — LISTA NEGRA</strong>
            <span style={{ fontSize: '0.8rem' }}>Motivo: {blacklistMotivo}</span>
          </div>
        </div>
      )}

      <Input
        label="Placa del Vehículo *"
        placeholder="ej. ABC-123"
        value={placa}
        onChange={(e) => setPlaca(e.target.value.toUpperCase())}
        required
        maxLength={8}
        autoFocus
      />

      <div className="input-group">
        <label className="input-label">Tipo de Vehículo</label>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '8px' }}>
          {(['Auto', 'Camioneta', 'Moto'] as TipoVehiculo[]).map((tipo) => (
            <button
              type="button"
              key={tipo}
              onClick={() => setTipoVehiculo(tipo)}
              style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '4px',
                padding: '10px',
                borderRadius: 'var(--radius-md)',
                border: tipoVehiculo === tipo ? '2px solid var(--accent-primary)' : '1px solid var(--border-subtle)',
                background: tipoVehiculo === tipo ? 'var(--accent-glow)' : 'var(--bg-primary)',
                color: tipoVehiculo === tipo ? '#ffffff' : 'var(--text-secondary)',
                cursor: 'pointer',
                fontWeight: 600,
                fontSize: '0.85rem'
              }}
            >
              {tipo === 'Auto' && <Car size={18} />}
              {tipo === 'Camioneta' && <Truck size={18} />}
              {tipo === 'Moto' && <Bike size={18} />}
              {tipo}
            </button>
          ))}
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
        <Input
          label="DNI Propietario"
          placeholder="ej. 12345678"
          value={propietarioDni}
          onChange={(e) => setPropietarioDni(e.target.value)}
          maxLength={12}
          icon={<User size={16} />}
        />
        <Input
          label="Nombre Propietario"
          placeholder="ej. Juan Pérez"
          value={propietarioNombre}
          onChange={(e) => setPropietarioNombre(e.target.value)}
        />
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
        <Input
          label="Marca / Modelo"
          placeholder="ej. Toyota Yaris"
          value={marcaModelo}
          onChange={(e) => setMarcaModelo(e.target.value)}
        />
        <Input
          label="Color / Ubicación"
          placeholder="ej. Placa A-01"
          value={color}
          onChange={(e) => setColor(e.target.value)}
        />
      </div>

      <div className="input-group">
        <label className="input-label">Momento de Pago</label>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
          <button
            type="button"
            onClick={() => setMomentoPago('SALIDA')}
            style={{
              padding: '8px',
              borderRadius: 'var(--radius-md)',
              border: momentoPago === 'SALIDA' ? '2px solid var(--accent-primary)' : '1px solid var(--border-subtle)',
              background: momentoPago === 'SALIDA' ? 'var(--accent-glow)' : 'var(--bg-primary)',
              color: momentoPago === 'SALIDA' ? '#fff' : 'var(--text-secondary)',
              fontSize: '0.85rem',
              fontWeight: 600,
              cursor: 'pointer'
            }}
          >
            Pago a la Salida
          </button>
          <button
            type="button"
            onClick={() => setMomentoPago('ENTRADA')}
            style={{
              padding: '8px',
              borderRadius: 'var(--radius-md)',
              border: momentoPago === 'ENTRADA' ? '2px solid var(--accent-success)' : '1px solid var(--border-subtle)',
              background: momentoPago === 'ENTRADA' ? 'var(--accent-success-bg)' : 'var(--bg-primary)',
              color: momentoPago === 'ENTRADA' ? 'var(--accent-success)' : 'var(--text-secondary)',
              fontSize: '0.85rem',
              fontWeight: 600,
              cursor: 'pointer'
            }}
          >
            Cobrado en Entrada
          </button>
        </div>
      </div>

      <Button
        type="submit"
        variant="primary"
        isLoading={loading}
        disabled={isBlacklisted}
        icon={<LogIn size={18} />}
      >
        {isBlacklisted ? 'Vehículo en Lista Negra (Bloqueado)' : 'Registrar Ingreso (Por Día)'}
      </Button>
    </form>
  );
};
