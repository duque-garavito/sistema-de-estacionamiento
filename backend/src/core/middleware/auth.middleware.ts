import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

export interface AuthenticatedRequest extends Request {
  userRole?: string;
  userName?: string;
  userId?: number;
  userEmail?: string;
}

export function getJwtSecret(): string {
  const secret = process.env.JWT_SECRET;
  if (!secret) {
    console.error('💥 [AUTH CRÍTICO] JWT_SECRET no existe en process.env');
    throw new Error('FATAL SECURITY ERROR: JWT_SECRET no está configurada en las variables de entorno (.env)');
  }
  return secret;
}

export function authMiddleware(req: AuthenticatedRequest, res: Response, next: NextFunction) {
  const authHeader = req.headers['authorization'];

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    console.warn(`🔒 [AUTH 401] Petición no autorizada en ${req.method} ${req.originalUrl} (Falta Bearer token)`);
    return res.status(401).json({
      error: 'Acceso no autorizado. Se requiere un token JWT válido (Bearer token).',
    });
  }

  const token = authHeader.split(' ')[1];

  try {
    const secret = getJwtSecret();
    const decoded = jwt.verify(token, secret) as {
      userId: number;
      userName: string;
      userRole: string;
      email?: string;
    };

    req.userId = decoded.userId;
    req.userName = decoded.userName;
    req.userRole = decoded.userRole;
    req.userEmail = decoded.email;

    next();
  } catch (err: any) {
    console.warn(`🔒 [AUTH 401 FALLO JWT] ${req.method} ${req.originalUrl} -> Error: ${err.message}`);
    return res.status(401).json({
      error: err.message.includes('FATAL SECURITY ERROR')
        ? err.message
        : 'Token inválido o expirado. Por favor inicie sesión nuevamente.',
    });
  }
}

export function requireRole(...rolesPermitidos: string[]) {
  return (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    const roleActual = req.userRole;

    if (!roleActual) {
      console.warn(`⛔ [AUTH 401 ROL] Sin autenticar en ${req.method} ${req.originalUrl}`);
      return res.status(401).json({ error: 'Usuario no autenticado.' });
    }

    const rolesUppercase = rolesPermitidos.map((r) => r.toUpperCase());

    if (!rolesUppercase.includes(roleActual.toUpperCase())) {
      console.warn(`⛔ [AUTH 403 ROL INSUFICIENTE] ${req.method} ${req.originalUrl} | Requerido: ${rolesPermitidos.join(' o ')} | Actual: ${roleActual}`);
      return res.status(403).json({
        error: `Acceso Denegado. Esta operación requiere el rol: ${rolesPermitidos.join(' o ')}. Tu rol actual es: ${roleActual}.`,
        rolRequerido: rolesPermitidos,
        rolActual: roleActual,
      });
    }

    next();
  };
}
