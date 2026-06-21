import { Injectable, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { Observable, tap, throwError, of } from 'rxjs';
import { map, catchError } from 'rxjs/operators';
import { environment } from '../../../environments/environment';

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
  licencia?: {
    numeroLicencia: string;
    categoria: string;
    fechaVencimiento: string;
  };
}

interface ApiResponse<T> {
  success: boolean;
  data: T;
  message: string;
}

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly baseUrl = `${environment.apiUrl}/auth`;
  readonly currentUser = signal<AuthUser | null>(null);

  constructor(private readonly http: HttpClient, private readonly router: Router) {
    const stored = localStorage.getItem('drivo_user');
    if (stored) {
      this.currentUser.set(JSON.parse(stored));
    }
  }

  login(credentials: LoginRequest): Observable<AuthUser> {
    return this.http.post<AuthUser>(`${this.baseUrl}/login`, credentials).pipe(
      tap((user) => this.persistUser(user)),
      catchError((err) => throwError(() => new Error(err.error?.message || 'Credenciales invalidas')))
    );
  }

  register(data: RegisterRequest): Observable<AuthUser> {
    return this.http.post<ApiResponse<AuthUser>>(`${this.baseUrl}/register`, data).pipe(
      map((res) => res.data),
      tap((user) => this.persistUser(user)),
      catchError((err) => throwError(() => new Error(err.error?.message || 'Error en registro')))
    );
  }

  cambiarClave(claveActual: string, claveNueva: string): Observable<void> {
    return this.http.patch<ApiResponse<null>>(`${environment.apiUrl}/usuarios/cambiar-clave`, {
      claveActual,
      claveNueva
    }).pipe(
      map(() => undefined),
      catchError((err) => throwError(() => new Error(err.error?.message || 'Error al cambiar clave')))
    );
  }

  private persistUser(user: AuthUser): void {
    this.currentUser.set(user);
    localStorage.setItem('drivo_user', JSON.stringify(user));
    localStorage.setItem('drivo_token', user.token);
  }

  logoutRemoto(): Observable<void> {
    const token = this.getToken();
    if (!token) return of(undefined);
    return this.http.post<ApiResponse<void>>(`${this.baseUrl}/logout`, {}, {
      headers: { Authorization: 'Bearer ' + token }
    }).pipe(
      map(() => undefined),
      catchError(() => of(undefined))
    );
  }

  logout(): void {
    this.logoutRemoto().subscribe(() => {
      this.currentUser.set(null);
      localStorage.removeItem('drivo_user');
      localStorage.removeItem('drivo_token');
      this.router.navigate(['/login']);
    });
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
