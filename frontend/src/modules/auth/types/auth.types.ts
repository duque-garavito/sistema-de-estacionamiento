export interface Usuario {
  id: number;
  nombre: string;
  email: string;
  rol: 'ADMIN' | 'OPERADOR' | 'CAJERO';
}

export interface AuthResponse {
  usuario: Usuario;
  token: string;
}

export interface LoginDTO {
  email: string;
  password_hash: string;
}
