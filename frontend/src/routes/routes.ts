export const ROUTES = {
  HOME: '/',
  DASHBOARD: '/dashboard',
  MOVIMIENTOS: '/movimientos',
  CAJA: '/caja',
  TARIFAS: '/tarifas',
  LISTA_NEGRA: '/lista-negra',
  REPORTES: '/reportes',
  CONFIGURACION: '/configuracion',
} as const;

export type TabType = 'dashboard' | 'movimientos' | 'caja' | 'tarifas' | 'lista-negra' | 'reportes' | 'configuracion';

export const TAB_TO_ROUTE: Record<TabType, string> = {
  dashboard: ROUTES.DASHBOARD,
  movimientos: ROUTES.MOVIMIENTOS,
  caja: ROUTES.CAJA,
  tarifas: ROUTES.TARIFAS,
  'lista-negra': ROUTES.LISTA_NEGRA,
  reportes: ROUTES.REPORTES,
  configuracion: ROUTES.CONFIGURACION,
};

export const ROUTE_TO_TAB: Record<string, TabType> = {
  [ROUTES.HOME]: 'dashboard',
  [ROUTES.DASHBOARD]: 'dashboard',
  [ROUTES.MOVIMIENTOS]: 'movimientos',
  [ROUTES.CAJA]: 'caja',
  [ROUTES.TARIFAS]: 'tarifas',
  [ROUTES.LISTA_NEGRA]: 'lista-negra',
  [ROUTES.REPORTES]: 'reportes',
  [ROUTES.CONFIGURACION]: 'configuracion',
};

