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
    throw new Error('FATAL SECURITY ERROR: JWT_SECRET no está configurada en las variables de entorno (.env)');
  }
  return secret;
}

export function authMiddleware(req: AuthenticatedRequest, res: Response, next: NextFunction) {
  const authHeader = req.headers['authorization'];

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
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
      return res.status(401).json({ error: 'Usuario no autenticado.' });
    }

    const rolesUppercase = rolesPermitidos.map((r) => r.toUpperCase());

    if (!rolesUppercase.includes(roleActual.toUpperCase())) {
      return res.status(403).json({
        error: `Acceso Denegado. Esta operación requiere el rol: ${rolesPermitidos.join(' o ')}. Tu rol actual es: ${roleActual}.`,
        rolRequerido: rolesPermitidos,
        rolActual: roleActual,
      });
    }

    next();
  };
}
