import React, { useState, useEffect } from 'react';
import { Card } from '@core/design-system/Card';
import { Button } from '@core/design-system/Button';
import { Input } from '@core/design-system/Input';
import { Modal } from '@core/design-system/Modal';
import { Table } from '@core/design-system/Table';
import { SkeletonLoader } from '@core/design-system/SkeletonLoader';
import { ConfiguracionService } from '../services/configuracion.service';
import { EmpresaConfig, Usuario, UserRole, FormatoTicket } from '../types/configuracion.types';
import {
  Building2,
  Car,
  Users,
  Printer,
  Plus,
  Edit3,
  Key,
  CheckCircle2,
  UserCheck,
  UserX,
  Clock
} from 'lucide-react';

interface ConfiguracionManagerProps {
  onConfigChanged?: () => void;
}

export const ConfiguracionManager: React.FC<ConfiguracionManagerProps> = ({ onConfigChanged }) => {
  const [tab, setTab] = useState<'empresa' | 'parqueo' | 'usuarios'>('empresa');
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  // Form Empresa & Cochera Config
  const [config, setConfig] = useState<EmpresaConfig>({
    id: 1,
    ruc: '20123456789',
    razonSocial: 'ESTACIONAMIENTO COCHERA CENTRAL S.A.C.',
    nombreComercial: 'Cochera Central',
    direccion: 'Av. Principal 123, Miraflores, Lima',
    telefono: '(01) 456-7890',
    serieBoleta: 'B001',
    correlativoBoleta: 1,
    serieFactura: 'F001',
    correlativoFactura: 1,
    leyendaTicket: '¡Gracias por su preferencia! Conserve este ticket para retirar su vehículo.',
    capacidadTotal: 50,
    formatoTicket: '80mm',
    toleranciaMinutos: 10,
  });

  // Lista de usuarios
  const [usuarios, setUsuarios] = useState<Usuario[]>([]);

  // Modales
  const [isCrearUserOpen, setIsCrearUserOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<Usuario | null>(null);
  const [pwdUser, setPwdUser] = useState<Usuario | null>(null);

  // Form Nuevo Usuario
  const [newUserNombre, setNewUserNombre] = useState('');
  const [newUserEmail, setNewUserEmail] = useState('');
  const [newUserPassword, setNewUserPassword] = useState('123456');
  const [newUserRol, setNewUserRol] = useState<UserRole>('OPERADOR');

  // Form Editar Usuario
  const [editNombre, setEditNombre] = useState('');
  const [editEmail, setEditEmail] = useState('');
  const [editRol, setEditRol] = useState<UserRole>('OPERADOR');

  // Form Password
  const [newPasswordVal, setNewPasswordVal] = useState('');

  const cargarDatos = async () => {
    setLoading(true);
    try {
      const [confData, userData] = await Promise.all([
        ConfiguracionService.obtenerConfiguracion(),
        ConfiguracionService.obtenerUsuarios(),
      ]);
      setConfig(confData);
      setUsuarios(userData);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    cargarDatos();
  }, []);

  const handleSaveConfig = async () => {
    setSaving(true);
    try {
      const res = await ConfiguracionService.actualizarConfiguracion(config);
      setConfig(res);
      alert('Configuración del sistema actualizada correctamente.');
      if (onConfigChanged) onConfigChanged();
    } catch (err: any) {
      alert(err.message || 'Error al guardar configuración');
    } finally {
      setSaving(false);
    }
  };

  const handleCrearUser = async () => {
    if (!newUserNombre.trim() || !newUserEmail.trim()) {
      alert('El nombre y el correo son obligatorios.');
      return;
    }
    setSaving(true);
    try {
      await ConfiguracionService.crearUsuario({
        nombre: newUserNombre,
        email: newUserEmail,
        password_hash: newUserPassword,
        rol: newUserRol,
      });
      setIsCrearUserOpen(false);
      setNewUserNombre('');
      setNewUserEmail('');
      setNewUserPassword('123456');
      setNewUserRol('OPERADOR');
      await cargarDatos();
    } catch (err: any) {
      alert(err.message || 'Error al crear usuario');
    } finally {
      setSaving(false);
    }
  };

  const handleOpenEditUser = (u: Usuario) => {
    setEditingUser(u);
    setEditNombre(u.nombre);
    setEditEmail(u.email);
    setEditRol(u.rol);
  };

  const handleSaveEditUser = async () => {
    if (!editingUser) return;
    setSaving(true);
    try {
      await ConfiguracionService.actualizarUsuario(editingUser.id, {
        nombre: editNombre,
        email: editEmail,
        rol: editRol,
      });
      setEditingUser(null);
      await cargarDatos();
    } catch (err: any) {
      alert(err.message || 'Error al editar usuario');
    } finally {
      setSaving(false);
    }
  };

  const handleToggleEstadoUser = async (u: Usuario) => {
    const nuevoEstado = u.estado === 1 ? 0 : 1;
    try {
      await ConfiguracionService.actualizarUsuario(u.id, { estado: nuevoEstado });
      await cargarDatos();
    } catch (err: any) {
      alert(err.message || 'Error al cambiar estado');
    }
  };

  const handleSavePassword = async () => {
    if (!pwdUser || !newPasswordVal.trim()) return;
    setSaving(true);
    try {
      await ConfiguracionService.cambiarPassword(pwdUser.id, newPasswordVal);
      alert(`Contraseña actualizada para ${pwdUser.nombre}`);
      setPwdUser(null);
      setNewPasswordVal('');
    } catch (err: any) {
      alert(err.message || 'Error al cambiar contraseña');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <SkeletonLoader count={4} />;
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      {/* Selector de Pestañas de Administración */}
      <div style={{ display: 'flex', gap: '8px', borderBottom: '1px solid var(--border-subtle)', paddingBottom: '4px' }}>
        {[
          { id: 'empresa', label: '🏢 Empresa & Ticket', icon: Building2 },
          { id: 'parqueo', label: '🚗 Parqueo & Impresión', icon: Car },
          { id: 'usuarios', label: '👥 Personal & Usuarios', icon: Users },
        ].map((t) => {
          const Icon = t.icon;
          const isActive = tab === t.id;
          return (
            <button
              key={t.id}
              onClick={() => setTab(t.id as any)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                padding: '10px 16px',
                borderRadius: 'var(--radius-md) var(--radius-md) 0 0',
                border: 'none',
                background: isActive ? 'var(--accent-primary)' : 'var(--bg-secondary)',
                color: isActive ? '#ffffff' : 'var(--text-secondary)',
                fontWeight: isActive ? 700 : 500,
                cursor: 'pointer',
                fontSize: '0.88rem'
              }}
            >
              <Icon size={16} />
              {t.label}
            </button>
          );
        })}
      </div>

      {/* PESTAÑA 1: DATOS DE EMPRESA */}
      {tab === 'empresa' && (
        <Card title="Datos de la Empresa & Información en Tickets" subtitle="Parámetros fiscales y comerciales que se imprimen en comprobantes">
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', marginTop: '12px' }}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '16px' }}>
              <Input
                label="RUC de Empresa"
                placeholder="20XXXXXXXXX"
                value={config.ruc}
                onChange={(e) => setConfig({ ...config, ruc: e.target.value })}
              />
              <Input
                label="Razón Social"
                placeholder="ej. ESTACIONAMIENTO COCHERA CENTRAL S.A.C."
                value={config.razonSocial}
                onChange={(e) => setConfig({ ...config, razonSocial: e.target.value })}
              />
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
              <Input
                label="Nombre Comercial"
                placeholder="ej. Cochera Central"
                value={config.nombreComercial}
                onChange={(e) => setConfig({ ...config, nombreComercial: e.target.value })}
              />
              <Input
                label="Teléfono de Contacto"
                placeholder="ej. (01) 456-7890"
                value={config.telefono}
                onChange={(e) => setConfig({ ...config, telefono: e.target.value })}
              />
            </div>

            <Input
              label="Dirección Física del Local / Cochera"
              placeholder="ej. Av. Principal 123, Miraflores, Lima"
              value={config.direccion}
              onChange={(e) => setConfig({ ...config, direccion: e.target.value })}
            />

            <div className="input-group">
              <label className="input-label">Leyenda / Pie del Ticket Térmico</label>
              <textarea
                value={config.leyendaTicket}
                onChange={(e) => setConfig({ ...config, leyendaTicket: e.target.value })}
                rows={3}
                style={{
                  width: '100%',
                  padding: '10px 14px',
                  borderRadius: 'var(--radius-md)',
                  border: '1px solid var(--border-subtle)',
                  background: 'var(--bg-primary)',
                  color: 'var(--text-primary)',
                  fontSize: '0.88rem',
                  fontFamily: 'inherit'
                }}
              />
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '10px' }}>
              <Button variant="primary" onClick={handleSaveConfig} isLoading={saving} icon={<CheckCircle2 size={16} />}>
                Guardar Configuración Fiscal
              </Button>
            </div>
          </div>
        </Card>
      )}

      {/* PESTAÑA 2: PARQUEO E IMPRESIÓN */}
      {tab === 'parqueo' && (
        <Card title="Configuración de Cochera & Formato de Ticket" subtitle="Capacidad total de parqueo y parámetros de impresora térmica">
          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', marginTop: '12px' }}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
              <Input
                type="number"
                label="Capacidad Total de Vehículos (Capacidad Máxima)"
                placeholder="ej. 50"
                value={String(config.capacidadTotal)}
                onChange={(e) => setConfig({ ...config, capacidadTotal: Number(e.target.value) || 50 })}
                icon={<Car size={16} />}
              />

              <Input
                type="number"
                label="Tolerancia de Salida (Minutos)"
                placeholder="ej. 10"
                value={String(config.toleranciaMinutos)}
                onChange={(e) => setConfig({ ...config, toleranciaMinutos: Number(e.target.value) || 10 })}
                icon={<Clock size={16} />}
              />
            </div>

            <div className="input-group">
              <label className="input-label" style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <Printer size={16} color="var(--accent-primary)" /> Formato de Impresora Térmica Predeterminado
              </label>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginTop: '4px' }}>
                {[
                  { key: '80mm', title: '80 mm (Estándar Punto de Venta)', desc: 'Ancho amplio con tipografía grande y código de barras legibilidad total' },
                  { key: '58mm', title: '58 mm (Compacto / Portátil)', desc: 'Formato angosto ideal para impresoras térmicas Bluetooth o portátiles' },
                ].map((f) => (
                  <button
                    key={f.key}
                    type="button"
                    onClick={() => setConfig({ ...config, formatoTicket: f.key as FormatoTicket })}
                    style={{
                      padding: '16px',
                      borderRadius: 'var(--radius-md)',
                      border: config.formatoTicket === f.key ? '2px solid var(--accent-primary)' : '1px solid var(--border-subtle)',
                      background: config.formatoTicket === f.key ? 'var(--accent-glow)' : 'var(--bg-primary)',
                      textAlign: 'left',
                      cursor: 'pointer'
                    }}
                  >
                    <strong style={{ fontSize: '0.95rem', color: config.formatoTicket === f.key ? '#fff' : 'var(--text-primary)', display: 'block' }}>
                      {f.title}
                    </strong>
                    <span style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', display: 'block', marginTop: '4px' }}>
                      {f.desc}
                    </span>
                  </button>
                ))}
              </div>
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '10px' }}>
              <Button variant="primary" onClick={handleSaveConfig} isLoading={saving} icon={<CheckCircle2 size={16} />}>
                Guardar Parámetros Operativos
              </Button>
            </div>
          </div>
        </Card>
      )}

      {/* PESTAÑA 3: GESTIÓN DE USUARIOS */}
      {tab === 'usuarios' && (
        <Card
          title="Gestión de Personal & Control de Usuarios"
          subtitle="Creación de cuentas, asignación de roles y control de acceso al sistema"
          action={
            <Button variant="primary" onClick={() => setIsCrearUserOpen(true)} icon={<Plus size={16} />}>
              Nuevo Usuario
            </Button>
          }
        >
          <Table
            columns={[
              {
                header: 'Personal / Nombre',
                cell: (u) => (
                  <div>
                    <strong>{u.nombre}</strong>
                    <small style={{ display: 'block', color: 'var(--text-muted)' }}>{u.email}</small>
                  </div>
                ),
              },
              {
                header: 'Rol Asignado',
                cell: (u) => (
                  <span className={`badge ${u.rol === 'ADMIN' ? 'badge-primary' : (u.rol === 'CAJERO' ? 'badge-warning' : 'badge-success')}`}>
                    {u.rol}
                  </span>
                ),
              },
              {
                header: 'Estado Cuenta',
                cell: (u) => (
                  <span className={`badge ${u.estado === 1 ? 'badge-success' : 'badge-danger'}`}>
                    {u.estado === 1 ? 'Activo' : 'Inactivo'}
                  </span>
                ),
              },
              {
                header: 'Acciones',
                cell: (u) => (
                  <div style={{ display: 'flex', gap: '6px' }}>
                    <Button variant="secondary" style={{ padding: '4px 8px', fontSize: '0.75rem' }} onClick={() => handleOpenEditUser(u)} icon={<Edit3 size={13} />}>
                      Editar
                    </Button>
                    <Button variant="secondary" style={{ padding: '4px 8px', fontSize: '0.75rem' }} onClick={() => { setPwdUser(u); setNewPasswordVal(''); }} icon={<Key size={13} />}>
                      Clave
                    </Button>
                    <Button
                      variant={u.estado === 1 ? 'danger' : 'secondary'}
                      style={{ padding: '4px 8px', fontSize: '0.75rem' }}
                      onClick={() => handleToggleEstadoUser(u)}
                      icon={u.estado === 1 ? <UserX size={13} /> : <UserCheck size={13} />}
                    >
                      {u.estado === 1 ? 'Desactivar' : 'Activar'}
                    </Button>
                  </div>
                ),
              },
            ]}
            data={usuarios}
            keyExtractor={(u) => String(u.id)}
          />
        </Card>
      )}

      {/* Modal Crear Usuario */}
      <Modal isOpen={isCrearUserOpen} onClose={() => setIsCrearUserOpen(false)} title="Registrar Nuevo Usuario">
        <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
          <Input label="Nombre Completo" placeholder="ej. Mario Gómez" value={newUserNombre} onChange={(e) => setNewUserNombre(e.target.value)} />
          <Input label="Correo Electrónico" placeholder="ej. mgomez@cocheracentral.pe" value={newUserEmail} onChange={(e) => setNewUserEmail(e.target.value)} />
          <Input label="Contraseña Inicial" type="password" value={newUserPassword} onChange={(e) => setNewUserPassword(e.target.value)} />

          <div className="input-group">
            <label className="input-label">Rol del Usuario</label>
            <select
              value={newUserRol}
              onChange={(e) => setNewUserRol(e.target.value as UserRole)}
              style={{ width: '100%', padding: '10px', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-subtle)', background: 'var(--bg-primary)', color: 'var(--text-primary)' }}
            >
              <option value="OPERADOR">🚗 OPERADOR (Entrada / Salida)</option>
              <option value="CAJERO">💵 CAJERO (Arqueo / Gastos / Comprobantes)</option>
              <option value="ADMIN">👑 ADMIN (Acceso Total)</option>
            </select>
          </div>

          <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end', marginTop: '10px' }}>
            <Button variant="secondary" onClick={() => setIsCrearUserOpen(false)}>Cancelar</Button>
            <Button variant="primary" onClick={handleCrearUser} isLoading={saving}>Crear Usuario</Button>
          </div>
        </div>
      </Modal>

      {/* Modal Editar Usuario */}
      <Modal isOpen={Boolean(editingUser)} onClose={() => setEditingUser(null)} title={`Editar Usuario: ${editingUser?.nombre}`}>
        {editingUser && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
            <Input label="Nombre Completo" value={editNombre} onChange={(e) => setEditNombre(e.target.value)} />
            <Input label="Correo Electrónico" value={editEmail} onChange={(e) => setEditEmail(e.target.value)} />

            <div className="input-group">
              <label className="input-label">Rol Asignado</label>
              <select
                value={editRol}
                onChange={(e) => setEditRol(e.target.value as UserRole)}
                style={{ width: '100%', padding: '10px', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-subtle)', background: 'var(--bg-primary)', color: 'var(--text-primary)' }}
              >
                <option value="OPERADOR">🚗 OPERADOR</option>
                <option value="CAJERO">💵 CAJERO</option>
                <option value="ADMIN">👑 ADMIN</option>
              </select>
            </div>

            <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end', marginTop: '10px' }}>
              <Button variant="secondary" onClick={() => setEditingUser(null)}>Cancelar</Button>
              <Button variant="primary" onClick={handleSaveEditUser} isLoading={saving}>Guardar Cambios</Button>
            </div>
          </div>
        )}
      </Modal>

      {/* Modal Cambiar Password */}
      <Modal isOpen={Boolean(pwdUser)} onClose={() => setPwdUser(null)} title={`Cambiar Contraseña: ${pwdUser?.nombre}`}>
        {pwdUser && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
            <Input label="Nueva Contraseña" type="password" placeholder="Ingresa la nueva clave..." value={newPasswordVal} onChange={(e) => setNewPasswordVal(e.target.value)} />
            <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end', marginTop: '10px' }}>
              <Button variant="secondary" onClick={() => setPwdUser(null)}>Cancelar</Button>
              <Button variant="primary" onClick={handleSavePassword} isLoading={saving}>Actualizar Contraseña</Button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};
