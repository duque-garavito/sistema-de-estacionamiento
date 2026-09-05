import { useState, useEffect } from 'react';
import { Card } from '@core/design-system/Card';
import { Modal } from '@core/design-system/Modal';
import { Button } from '@core/design-system/Button';
import { ConfirmDialog } from '@core/design-system/ConfirmDialog';
import { ToastNotificationContainer, ToastMessage } from '@core/design-system/ToastNotification';
import { DashboardStats } from '@modules/dashboard/components/DashboardStats';
import { DashboardService } from '@modules/dashboard/services/dashboard.service';
import { DashboardResumen } from '@modules/dashboard/types/dashboard.types';
import { EntradaForm } from '@modules/movimientos/components/EntradaForm';
import { TarifasManager } from '@modules/tarifas/components/TarifasManager';
import { ListaNegraManager } from '@modules/lista-negra/components/ListaNegraManager';
import { CajaManager } from '@modules/caja/components/CajaManager';
import { ReportesManager } from '@modules/reportes/components/ReportesManager';
import { ConfiguracionManager } from '@modules/configuracion/components/ConfiguracionManager';
import { EmisionModal } from '@modules/facturacion/components/EmisionModal';
import { Movimiento, EntradaDTO } from '@modules/movimientos/types/movimiento.types';
import { MovimientosService } from '@modules/movimientos/services/movimientos.service';
import { BoletaPreview } from '@modules/boletas/components/BoletaPreview';
import { EmpresaConfigModal } from '@modules/boletas/components/EmpresaConfigModal';
import { Boleta } from '@modules/boletas/types/boleta.types';
import { UserRoleSelector } from '@modules/auth/components/UserRoleSelector';
import { useAuth, UserRole } from '@modules/auth/context/AuthContext';
import { RoleGuard } from '@modules/auth/components/RoleGuard';
import { LoginPage } from '@modules/auth/components/LoginPage';
import { Routes, Route, Navigate, useLocation, useNavigate } from 'react-router-dom';
import { ROUTES, TAB_TO_ROUTE, ROUTE_TO_TAB, TabType } from './routes/routes';
import {
  Car,
  Clock,
  DollarSign,
  Receipt,
  Settings,
  BarChart3,
  ShieldAlert,
  LayoutDashboard,
  Building2,
  LogIn,
  LogOut,
  Wallet,
  Lock,
  Keyboard,
  Menu,
  X
} from 'lucide-react';

import { TicketPreviewModal } from '@modules/tickets/components/TicketPreviewModal';
import { VehiculosManager } from '@modules/movimientos/components/VehiculosManager';

export function App() {
  const { isAuthenticated, logout, hasPermission } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  // Redireccionar al Login si la ruta es /login o no está autenticado
  if (location.pathname === ROUTES.LOGIN) {
    return <LoginPage />;
  }

  if (!isAuthenticated) {
    return <Navigate to={ROUTES.LOGIN} replace />;
  }

  const activeTab: TabType = ROUTE_TO_TAB[location.pathname] || 'dashboard';

  const navigateToTab = (tab: TabType) => {
    const route = TAB_TO_ROUTE[tab] || ROUTES.DASHBOARD;
    navigate(route);
  };

  const [movimientos, setMovimientos] = useState<Movimiento[]>([]);
  const [selectedMovimiento, setSelectedMovimiento] = useState<Movimiento | null>(null);
  const [activeBoleta, setActiveBoleta] = useState<Boleta | null>(null);
  const [metodoPago, setMetodoPago] = useState<'Efectivo' | 'Yape' | 'Plin' | 'Tarjeta'>('Efectivo');
  const [isEmpresaModalOpen, setIsEmpresaModalOpen] = useState(false);
  const [activeTicketMovimientoId, setActiveTicketMovimientoId] = useState<string | null>(null);
  const [activeTicketTipo, setActiveTicketTipo] = useState<'entrada' | 'salida'>('entrada');
  const [isConfirmCobroOpen, setIsConfirmCobroOpen] = useState(false);
  const [procesandoCobro, setProcesandoCobro] = useState(false);
  const [isEmisionFiscalOpen, setIsEmisionFiscalOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // Toasts
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  const addToast = (type: 'success' | 'error' | 'info', title: string, message?: string) => {
    const id = String(Date.now());
    setToasts((prev) => [...prev, { id, type, title, message }]);
  };

  const removeToast = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  // Stats en tiempo real
  const [dashStats, setDashStats] = useState<DashboardResumen>({
    vehiculosParqueados: 0,
    capacidadTotal: 50,
    ingresosHoy: 0,
    gastosHoy: 0,
    balanceHoy: 0,
    totalMovimientosHoy: 0,
    cajaAbierta: true,
    metodosPago: { efectivo: 0, yape: 0, plin: 0, tarjeta: 0 }
  });

  const cargarDatosGlobales = async () => {
    const [activosData, statsData] = await Promise.all([
      MovimientosService.obtenerActivos(),
      DashboardService.obtenerStats()
    ]);
    setMovimientos(activosData);
    setDashStats(statsData);
  };

  useEffect(() => {
    cargarDatosGlobales();
  }, [location.pathname]);

  // Manejo de Atajos de Teclado Globales (Hotkeys)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'F1') {
        e.preventDefault();
        navigateToTab('movimientos');
        addToast('info', 'Atajo F1', 'Navegado a Ingreso de Vehículos');
      } else if (e.key === 'F2') {
        e.preventDefault();
        navigateToTab('movimientos');
        addToast('info', 'Atajo F2', 'Navegado a Salida / Cobranza');
      } else if (e.key === 'F3') {
        e.preventDefault();
        navigateToTab('movimientos');
        addToast('info', 'Atajo F3', 'Buscador de Placa');
      } else if (e.key === 'Escape') {
        setSelectedMovimiento(null);
        setActiveBoleta(null);
        setIsEmpresaModalOpen(false);
        setActiveTicketMovimientoId(null);
        setIsConfirmCobroOpen(false);
        setIsMobileMenuOpen(false);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const handleEntradaSubmit = async (dto: EntradaDTO) => {
    const nuevoMovimiento = await MovimientosService.registrarEntrada(dto);
    await cargarDatosGlobales();

    addToast('success', 'Ingreso Registrado', `Vehículo ${dto.placa} ingresó a parqueo`);

    if (nuevoMovimiento && nuevoMovimiento.id) {
      setActiveTicketMovimientoId(nuevoMovimiento.id);
      setActiveTicketTipo('entrada');
    }
  };

  const handleCobrarSalida = async () => {
    if (!selectedMovimiento) return;
    setProcesandoCobro(true);
    try {
      const movimientoActualizado = await MovimientosService.registrarSalida({
        movimientoId: selectedMovimiento.id,
        metodoPago,
      });

      addToast('success', 'Salida Procesada', `Cobro de placa ${selectedMovimiento.placa} registrado (${metodoPago})`);
      setSelectedMovimiento(null);
      setIsConfirmCobroOpen(false);
      setActiveTicketMovimientoId(movimientoActualizado.id);
      setActiveTicketTipo('salida');
      await cargarDatosGlobales();
    } catch (err: any) {
      addToast('error', 'Error al procesar salida', err.message || 'No se pudo completar el cobro');
    } finally {
      setProcesandoCobro(false);
    }
  };

  const menuItems: { id: TabType; label: string; icon: any; roles: UserRole[] }[] = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard, roles: ['ADMIN', 'OPERADOR', 'CAJERO'] },
    { id: 'movimientos', label: 'Movimientos', icon: Clock, roles: ['ADMIN', 'OPERADOR', 'CAJERO'] },
    { id: 'caja', label: 'Caja & Arqueo', icon: DollarSign, roles: ['ADMIN', 'CAJERO'] },
    { id: 'tarifas', label: 'Tarifario', icon: Settings, roles: ['ADMIN'] },
    { id: 'lista-negra', label: 'Lista Negra', icon: ShieldAlert, roles: ['ADMIN'] },
    { id: 'reportes', label: 'Reportes', icon: BarChart3, roles: ['ADMIN', 'CAJERO'] },
    { id: 'configuracion', label: 'Configuración', icon: Building2, roles: ['ADMIN'] },
  ];

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      {/* Backdrop for Mobile Sidebar Drawer */}
      <div
        className={`mobile-sidebar-backdrop ${isMobileMenuOpen ? 'active' : ''}`}
        onClick={() => setIsMobileMenuOpen(false)}
      />

      {/* Top Navigation Header */}
      <header style={{
        background: 'var(--bg-secondary)',
        borderBottom: '1px solid var(--border-subtle)',
        padding: '12px 20px',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        position: 'sticky',
        top: 0,
        zIndex: 10,
        flexWrap: 'wrap',
        gap: '12px'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          {/* Mobile Hamburger Toggle Button */}
          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            style={{
              background: 'var(--bg-card)',
              border: '1px solid var(--border-subtle)',
              color: 'var(--text-primary)',
              borderRadius: 'var(--radius-md)',
              padding: '8px',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}
            aria-label="Abrir Menú"
          >
            {isMobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
          </button>

          <div style={{
            background: 'linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%)',
            padding: '8px 10px',
            borderRadius: 'var(--radius-md)',
            display: 'flex',
            alignItems: 'center',
            color: '#fff'
          }}>
            <Car size={22} />
          </div>
          <div>
            <h1 style={{ fontSize: '1.1rem', fontWeight: 800, color: 'var(--text-primary)', letterSpacing: '-0.5px', margin: 0 }}>
              COCHERA CENTRAL
            </h1>
            <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)', fontWeight: 600, display: 'block' }}>
              Gestión Operativa v1.0
            </span>
          </div>
        </div>

        {/* Global Quick Stats & Config & Role Selector & Logout */}
        <div style={{ display: 'flex', gap: '10px', alignItems: 'center', flexWrap: 'wrap' }}>
          <div className="header-stats-container" style={{ display: 'flex', alignItems: 'center', gap: '8px', background: 'var(--bg-primary)', padding: '6px 12px', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-subtle)' }}>
            <Car size={16} color="var(--accent-primary)" />
            <div>
              <span style={{ fontSize: '0.65rem', color: 'var(--text-muted)', display: 'block', textTransform: 'uppercase' }}>Ocupados</span>
              <strong style={{ fontSize: '0.9rem', color: 'var(--text-primary)' }}>{dashStats.vehiculosParqueados} / {dashStats.capacidadTotal || 50}</strong>
            </div>
          </div>

          <div className="header-stats-container" style={{ display: 'flex', alignItems: 'center', gap: '8px', background: 'var(--bg-primary)', padding: '6px 12px', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-subtle)' }}>
            <DollarSign size={16} color="var(--accent-success)" />
            <div>
              <span style={{ fontSize: '0.65rem', color: 'var(--text-muted)', display: 'block', textTransform: 'uppercase' }}>Ingresos Día</span>
              <strong style={{ fontSize: '0.9rem', color: 'var(--accent-success)' }}>S/ {dashStats.ingresosHoy.toFixed(2)}</strong>
            </div>
          </div>

          <Button
            variant="secondary"
            onClick={() => setIsEmisionFiscalOpen(true)}
            icon={<Receipt size={16} color="var(--accent-warning)" />}
            style={{ fontSize: '0.82rem' }}
          >
            Emisión Fiscal
          </Button>

          <Button
            variant="secondary"
            onClick={() => setIsEmpresaModalOpen(true)}
            icon={<Building2 size={16} color="var(--accent-primary)" />}
            style={{ fontSize: '0.82rem' }}
          >
            Datos Empresa
          </Button>

          <UserRoleSelector />

          <Button
            variant="danger"
            onClick={() => {
              logout();
              navigate(ROUTES.LOGIN);
            }}
            icon={<LogOut size={16} />}
            style={{ fontSize: '0.82rem', padding: '6px 12px' }}
          >
            Salir
          </Button>
        </div>
      </header>

      {/* Main Content Body */}
      <div style={{ display: 'flex', flex: 1 }}>
        {/* Responsive Sidebar Nav */}
        <aside
          className={`responsive-sidebar ${isMobileMenuOpen ? 'open' : ''}`}
          style={{
            width: '240px',
            background: 'var(--bg-secondary)',
            borderRight: '1px solid var(--border-subtle)',
            padding: '20px 12px',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
            gap: '12px'
          }}
        >
          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
            {menuItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              const allowed = hasPermission(item.roles);

              return (
                <button
                  key={item.id}
                  onClick={() => {
                    if (allowed) {
                      navigateToTab(item.id);
                      setIsMobileMenuOpen(false);
                    }
                  }}
                  disabled={!allowed}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '12px 16px',
                    borderRadius: 'var(--radius-md)',
                    border: 'none',
                    background: isActive ? 'var(--accent-primary)' : 'transparent',
                    color: isActive ? '#ffffff' : (allowed ? 'var(--text-secondary)' : 'var(--text-muted)'),
                    fontWeight: isActive ? 700 : 500,
                    cursor: allowed ? 'pointer' : 'not-allowed',
                    textAlign: 'left',
                    fontSize: '0.9rem',
                    opacity: allowed ? 1 : 0.45,
                    transition: 'all 0.15s ease'
                  }}
                  title={allowed ? item.label : `Requiere rol ${item.roles.join(' o ')}`}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <Icon size={18} />
                    <span>{item.label}</span>
                  </div>
                  {!allowed && <Lock size={14} color="var(--text-muted)" />}
                </button>
              );
            })}
          </div>

          {/* Atajos Rápidos Leyenda */}
          <div style={{
            background: 'var(--bg-primary)',
            padding: '12px',
            borderRadius: 'var(--radius-md)',
            border: '1px solid var(--border-subtle)',
            fontSize: '0.75rem',
            display: 'flex',
            flexDirection: 'column',
            gap: '6px'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: 'var(--accent-primary)', fontWeight: 700 }}>
              <Keyboard size={14} /> Atajos de Teclado
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--text-secondary)' }}>
              <span>Registrar Entrada:</span> <strong>F1</strong>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--text-secondary)' }}>
              <span>Cobrar Salida:</span> <strong>F2</strong>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--text-secondary)' }}>
              <span>Buscar Placa:</span> <strong>F3</strong>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--text-secondary)' }}>
              <span>Cerrar Modal:</span> <strong>ESC</strong>
            </div>
          </div>
        </aside>

        {/* Dashboard Dynamic Area */}
        <main style={{ flex: 1, padding: '24px', background: 'var(--bg-primary)', display: 'flex', flexDirection: 'column', gap: '20px', overflowX: 'hidden' }}>
          <Routes>
            <Route path="/" element={<Navigate to={ROUTES.DASHBOARD} replace />} />

            <Route path={ROUTES.DASHBOARD} element={
              <RoleGuard allowedRoles={['ADMIN', 'OPERADOR', 'CAJERO']}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                  {/* Stats KPIs */}
                  <DashboardStats stats={dashStats} />

                  {/* Botones de Acciones Rápidas del Operador */}
                  <Card title="Acciones Rápidas Operativas (Atajos: F1, F2, F3)" subtitle="Operaciones frecuentes del día a día">
                    <div className="responsive-grid-3" style={{ marginTop: '12px' }}>
                      <Button
                        variant="primary"
                        onClick={() => navigateToTab('movimientos')}
                        icon={<LogIn size={20} />}
                        style={{ padding: '16px', fontSize: '1rem' }}
                      >
                        Registrar Entrada (F1)
                      </Button>
                      <Button
                        variant="secondary"
                        onClick={() => navigateToTab('movimientos')}
                        icon={<LogOut size={20} />}
                        style={{ padding: '16px', fontSize: '1rem' }}
                      >
                        Cobrar / Registrar Salida (F2)
                      </Button>
                      <Button
                        variant="secondary"
                        onClick={() => navigateToTab('caja')}
                        icon={<Wallet size={20} />}
                        style={{ padding: '16px', fontSize: '1rem' }}
                      >
                        Ver Arqueo de Caja & Gastos
                      </Button>
                    </div>
                  </Card>
                </div>
              </RoleGuard>
            } />

            <Route path={ROUTES.MOVIMIENTOS} element={
              <RoleGuard allowedRoles={['ADMIN', 'OPERADOR', 'CAJERO']}>
                <div className="responsive-movimientos-grid">
                  {/* Form Entry Panel */}
                  <Card title="Ingreso de Vehículo" subtitle="Registro de parqueo en tiempo real">
                    <EntradaForm onSubmit={handleEntradaSubmit} />
                  </Card>

                  {/* Table Vehicles Active & Manager Panel */}
                  <VehiculosManager
                    movimientosActivos={movimientos}
                    onSalidaSelect={(mov) => setSelectedMovimiento(mov)}
                    onVerTicket={(mov) => {
                      setActiveTicketMovimientoId(mov.id);
                      setActiveTicketTipo(mov.estado === 'Completado' ? 'salida' : 'entrada');
                    }}
                    onDataChanged={cargarDatosGlobales}
                  />
                </div>
              </RoleGuard>
            } />

            <Route path={ROUTES.TARIFAS} element={
              <RoleGuard allowedRoles={['ADMIN']}>
                <TarifasManager />
              </RoleGuard>
            } />

            <Route path={ROUTES.LISTA_NEGRA} element={
              <RoleGuard allowedRoles={['ADMIN']}>
                <ListaNegraManager />
              </RoleGuard>
            } />

            <Route path={ROUTES.CAJA} element={
              <RoleGuard allowedRoles={['ADMIN', 'CAJERO']}>
                <CajaManager />
              </RoleGuard>
            } />

            <Route path={ROUTES.REPORTES} element={
              <RoleGuard allowedRoles={['ADMIN', 'CAJERO']}>
                <ReportesManager />
              </RoleGuard>
            } />

            <Route path={ROUTES.CONFIGURACION} element={
              <RoleGuard allowedRoles={['ADMIN']}>
                <ConfiguracionManager onConfigChanged={cargarDatosGlobales} />
              </RoleGuard>
            } />

            <Route path="*" element={<Navigate to={ROUTES.DASHBOARD} replace />} />
          </Routes>
        </main>
      </div>

      {/* Salida Modal */}
      <Modal
        isOpen={Boolean(selectedMovimiento)}
        onClose={() => setSelectedMovimiento(null)}
        title={`Registrar Salida / Placa: ${selectedMovimiento?.placa || ''}`}
      >
        {selectedMovimiento && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div style={{ background: 'var(--bg-primary)', padding: '16px', borderRadius: 'var(--radius-md)', display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span>Hora Ingreso:</span>
                <strong>{new Date(selectedMovimiento.fechaEntrada).toLocaleTimeString()}</strong>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span>Tipo:</span>
                <strong>{selectedMovimiento.tipoVehiculo}</strong>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span>Tarifa por día (Aplicada):</span>
                <strong>S/ {selectedMovimiento.tarifaDiaAplicada.toFixed(2)} / día</strong>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span>Momento de Pago:</span>
                <strong style={{ color: selectedMovimiento.momentoPago === 'ENTRADA' ? 'var(--accent-success)' : 'var(--text-primary)' }}>
                  {selectedMovimiento.momentoPago === 'ENTRADA' ? '✅ Ya pagado al Ingresar' : 'Pendiente al Salir'}
                </strong>
              </div>
            </div>

            <div className="input-group">
              <label className="input-label">Método de Pago</label>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '8px' }}>
                {(['Efectivo', 'Yape', 'Plin', 'Tarjeta'] as const).map((m) => (
                  <button
                    key={m}
                    type="button"
                    onClick={() => setMetodoPago(m)}
                    style={{
                      padding: '10px 4px',
                      borderRadius: 'var(--radius-sm)',
                      border: metodoPago === m ? '2px solid var(--accent-primary)' : '1px solid var(--border-subtle)',
                      background: metodoPago === m ? 'var(--accent-glow)' : 'var(--bg-primary)',
                      color: metodoPago === m ? '#fff' : 'var(--text-secondary)',
                      fontSize: '0.85rem',
                      fontWeight: 600,
                      cursor: 'pointer'
                    }}
                  >
                    {m}
                  </button>
                ))}
              </div>
            </div>

            <div style={{ display: 'flex', gap: '8px', flexDirection: 'column' }}>
              <Button
                variant="primary"
                onClick={() => setIsConfirmCobroOpen(true)}
                icon={<Receipt size={18} />}
              >
                Procesar Cobro e Imprimir Ticket Garita
              </Button>
              <Button
                variant="secondary"
                onClick={() => setIsEmisionFiscalOpen(true)}
                icon={<Receipt size={18} />}
              >
                📄 Emitir Comprobante Fiscal (SUNAT / Boleta / Factura)
              </Button>
            </div>
          </div>
        )}
      </Modal>

      {/* Confirmation Dialog para Cobro de Salida */}
      <ConfirmDialog
        isOpen={isConfirmCobroOpen}
        title={`¿Confirmar Salida de Placa ${selectedMovimiento?.placa || ''}?`}
        message={`Se registrará el cobro mediante ${metodoPago} y se liberará el espacio en parqueo. ¿Deseas continuar?`}
        confirmText="Sí, Cobrar e Imprimir"
        cancelText="Volver"
        variant="primary"
        isLoading={procesandoCobro}
        onConfirm={handleCobrarSalida}
        onCancel={() => setIsConfirmCobroOpen(false)}
      />

      {/* Emisión Fiscal SUNAT Modal */}
      <EmisionModal
        isOpen={isEmisionFiscalOpen}
        onClose={() => setIsEmisionFiscalOpen(false)}
        movimientoId={selectedMovimiento ? Number(selectedMovimiento.id) : undefined}
        totalMonto={selectedMovimiento ? (selectedMovimiento.totalPagar ?? selectedMovimiento.tarifaDiaAplicada) : 10.0}
        metodoPago={metodoPago}
      />

      {/* Ticket Preview Modal */}
      <Modal
        isOpen={Boolean(activeBoleta)}
        onClose={() => setActiveBoleta(null)}
        title="Comprobante Emitido"
      >
        {activeBoleta && (
          <BoletaPreview
            boleta={activeBoleta}
            onDone={() => setActiveBoleta(null)}
          />
        )}
      </Modal>

      {/* Empresa Config Modal */}
      <EmpresaConfigModal
        isOpen={isEmpresaModalOpen}
        onClose={() => setIsEmpresaModalOpen(false)}
      />

      {/* Ticket Entrada / Salida Modal */}
      <TicketPreviewModal
        isOpen={Boolean(activeTicketMovimientoId)}
        onClose={() => setActiveTicketMovimientoId(null)}
        movimientoId={activeTicketMovimientoId || undefined}
        tipoTicket={activeTicketTipo}
      />

      {/* Toast Notifications Container */}
      <ToastNotificationContainer toasts={toasts} onClose={removeToast} />
    </div>
  );
}
