import React, { createContext, useContext, useState, ReactNode } from 'react';


export type UserRole = 'ADMIN' | 'OPERADOR' | 'CAJERO';

export interface UserProfile {
  id: number;
  nombre: string;
  email: string;
  rol: UserRole;
}

interface AuthContextType {
  user: UserProfile;
  setRole: (role: UserRole) => void;
  hasPermission: (allowedRoles: UserRole[]) => boolean;
  fetchWithAuth: (url: string, options?: RequestInit) => Promise<Response>;
}

const DEFAULT_USER: UserProfile = {
  id: 1,
  nombre: 'Juan Pérez (Admin)',
  email: 'admin@cocheracentral.pe',
  rol: 'ADMIN',
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<UserProfile>(() => {
    const savedRole = localStorage.getItem('app_user_role') as UserRole;
    if (savedRole && ['ADMIN', 'OPERADOR', 'CAJERO'].includes(savedRole)) {
      return {
        id: savedRole === 'ADMIN' ? 1 : (savedRole === 'CAJERO' ? 2 : 3),
        nombre: savedRole === 'ADMIN' ? 'Juan Pérez (Admin)' : (savedRole === 'CAJERO' ? 'Carlos Ruiz (Cajero)' : 'María López (Operador)'),
        email: `${savedRole.toLowerCase()}@cocheracentral.pe`,
        rol: savedRole,
      };
    }
    return DEFAULT_USER;
  });

  const setRole = (newRole: UserRole) => {
    localStorage.setItem('app_user_role', newRole);
    setUser({
      id: newRole === 'ADMIN' ? 1 : (newRole === 'CAJERO' ? 2 : 3),
      nombre: newRole === 'ADMIN' ? 'Juan Pérez (Admin)' : (newRole === 'CAJERO' ? 'Carlos Ruiz (Cajero)' : 'María López (Operador)'),
      email: `${newRole.toLowerCase()}@cocheracentral.pe`,
      rol: newRole,
    });
  };

  const hasPermission = (allowedRoles: UserRole[]): boolean => {
    return allowedRoles.includes(user.rol);
  };

  const fetchWithAuth = async (url: string, options: RequestInit = {}): Promise<Response> => {
    const headers = new Headers(options.headers || {});
    headers.set('x-user-role', user.rol);
    headers.set('Authorization', `Bearer jwt-token-${user.id}`);
    return fetch(url, { ...options, headers });
  };

  return (
    <AuthContext.Provider value={{ user, setRole, hasPermission, fetchWithAuth }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth debe ser usado dentro de un AuthProvider');
  }
  return context;
};
