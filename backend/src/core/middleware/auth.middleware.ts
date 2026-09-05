import { Request, Response, NextFunction } from 'express';

export interface AuthenticatedRequest extends Request {
  userRole?: string;
  userName?: string;
  userId?: number;
}

export function authMiddleware(req: AuthenticatedRequest, res: Response, next: NextFunction) {
  // Extraer el rol del header x-user-role, Authorization o query (para pruebas flexibles)
  const headerRole = req.headers['x-user-role'] as string;
  const authHeader = req.headers['authorization'] as string;
  const queryRole = req.query.role as string;

  let role = 'OPERADOR';
  let userName = 'Operador General';
  let userId = 1;

  if (headerRole) {
    role = headerRole.toUpperCase();
  } else if (queryRole) {
    role = queryRole.toUpperCase();
  } else if (authHeader && authHeader.includes('Bearer')) {
    // Si viene Bearer token simple
    if (authHeader.includes('admin')) {
      role = 'ADMIN';
    } else if (authHeader.includes('cajero')) {
      role = 'CAJERO';
    }
  }

  if (role === 'ADMIN') {
    userName = 'Administrador Sistema';
    userId = 1;
  } else if (role === 'CAJERO') {
    userName = 'Cajero Turno 1';
    userId = 2;
  } else {
    role = 'OPERADOR';
    userName = 'Operador Entrada/Salida';
    userId = 3;
  }

  req.userRole = role;
  req.userName = userName;
  req.userId = userId;

  next();
}

export function requireRole(...rolesPermitidos: string[]) {
  return (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    const roleActual = req.userRole || 'OPERADOR';
    const rolesUppercase = rolesPermitidos.map((r) => r.toUpperCase());

    if (!rolesUppercase.includes(roleActual)) {
      return res.status(403).json({
        error: `Acceso Denegado. Esta operación requiere el rol: ${rolesPermitidos.join(' o ')}. Tu rol actual es: ${roleActual}.`,
        rolRequerido: rolesPermitidos,
        rolActual: roleActual,
      });
    }

    next();
  };
}
