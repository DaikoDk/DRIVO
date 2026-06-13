import { Injectable, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { Observable, tap, of, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';

export interface AuthUser {
  token: string;
  nombre: string;
  rol: string;
}

export interface LoginRequest {
  correo: string;
  clave: string;
}

export interface RegisterRequest {
  nombre: string;
  apellidoPaterno: string;
  apellidoMaterno?: string;
  dni: string;
  telefono?: string;
  email: string;
  direccion?: string;
  clave: string;
  numeroLicencia?: string;
  categoriaLicencia?: string;
  fechaVencimientoLicencia?: string;
}

interface MockUser extends AuthUser {
  clave: string;
  correo: string;
}

const MOCK_USERS: MockUser[] = [
  {
    token: 'mock-jwt-admin-token',
    nombre: 'Admin DRIVO',
    rol: 'ADMIN',
    clave: 'admin123',
    correo: 'admin@drivo.com',
  },
  {
    token: 'mock-jwt-cliente-token',
    nombre: 'Carlos Lopez',
    rol: 'CLIENTE',
    clave: 'cliente123',
    correo: 'carlos@email.com',
  },
];

/**
 * HABILITAR CUANDO EL BACKEND YA TENGA JWT IMPLEMENTADO.
 * Cambiar USE_MOCK a false para usar endpoints reales.
 */
const USE_MOCK = false;

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly baseUrl = 'http://localhost:8080/api/auth';
  readonly currentUser = signal<AuthUser | null>(null);

  constructor(private readonly http: HttpClient, private readonly router: Router) {
    const stored = localStorage.getItem('drivo_user');
    if (stored) {
      this.currentUser.set(JSON.parse(stored));
    }
  }

  login(credentials: LoginRequest): Observable<AuthUser> {
    if (USE_MOCK) {
      return this.mockLogin(credentials);
    }
    return this.http.post<AuthUser>(`${this.baseUrl}/login`, credentials).pipe(
      tap((user) => this.persistUser(user))
    );
  }

  register(data: RegisterRequest): Observable<AuthUser> {
    if (USE_MOCK) {
      return this.mockRegister(data);
    }
    return this.http.post<AuthUser>(`${this.baseUrl}/register`, data).pipe(
      tap((user) => this.persistUser(user))
    );
  }

  private mockLogin(credentials: LoginRequest): Observable<AuthUser> {
    const found = MOCK_USERS.find(
      (u) => u.correo === credentials.correo && u.clave === credentials.clave
    );
    if (!found) {
      return throwError(() => new Error('Credenciales invalidas. Use admin@drivo.com / admin123 o carlos@email.com / cliente123'));
    }
    const { clave: _, ...user } = found;
    this.persistUser(user);
    return of(user);
  }

  private mockRegister(data: RegisterRequest): Observable<AuthUser> {
    const newUser: AuthUser = {
      token: 'mock-jwt-register-token',
      nombre: data.nombre,
      rol: 'CLIENTE',
    };
    this.persistUser(newUser);
    // Agregar a la lista mock para que pueda loguearse despues
    MOCK_USERS.push({ ...newUser, clave: data.clave, correo: data.email });
    return of(newUser);
  }

  private persistUser(user: AuthUser): void {
    this.currentUser.set(user);
    localStorage.setItem('drivo_user', JSON.stringify(user));
    localStorage.setItem('drivo_token', user.token);
  }

  logout(): void {
    this.currentUser.set(null);
    localStorage.removeItem('drivo_user');
    localStorage.removeItem('drivo_token');
    this.router.navigate(['/login']);
  }

  getToken(): string | null {
    return localStorage.getItem('drivo_token');
  }

  isLoggedIn(): boolean {
    return !!this.currentUser();
  }

  isAdmin(): boolean {
    return this.currentUser()?.rol === 'ADMIN';
  }

  isClient(): boolean {
    return this.currentUser()?.rol === 'CLIENTE';
  }
}
