import { Injectable } from '@angular/core';
import { HttpClient, HttpParams, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { Router } from '@angular/router';

export interface ApiResponse<T> {
  data: T;
  message?: string;
  timestamp?: string;
}

@Injectable({ providedIn: 'root' })
export class ApiService {
  private readonly baseUrl = 'http://localhost:8080/api';

  constructor(private readonly http: HttpClient, private readonly router: Router) {}

  get<T>(path: string, params?: Record<string, string | number | boolean>): Observable<T> {
    let httpParams = new HttpParams();
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== '') {
          httpParams = httpParams.set(key, String(value));
        }
      });
    }
    return this.http.get<T>(`${this.baseUrl}${path}`, { params: httpParams }).pipe(
      map((res: any) => (res && res.data !== undefined ? res.data : res) as T),
      catchError((error) => this.handleError(error))
    );
  }

  getById<T>(path: string, id: number): Observable<T> {
    return this.http.get<T>(`${this.baseUrl}${path}/${id}`).pipe(
      map((res: any) => (res && res.data !== undefined ? res.data : res) as T),
      catchError((error) => this.handleError(error))
    );
  }

  post<T>(path: string, body: unknown): Observable<T> {
    return this.http.post<T>(`${this.baseUrl}${path}`, body).pipe(
      map((res: any) => (res && res.data !== undefined ? res.data : res) as T),
      catchError((error) => this.handleError(error))
    );
  }

  put<T>(path: string, id: number, body: unknown): Observable<T> {
    return this.http.put<T>(`${this.baseUrl}${path}/${id}`, body).pipe(
      map((res: any) => (res && res.data !== undefined ? res.data : res) as T),
      catchError((error) => this.handleError(error))
    );
  }

  putCustom<T>(path: string, body: unknown): Observable<T> {
    return this.http.put<T>(`${this.baseUrl}${path}`, body).pipe(
      map((res: any) => (res && res.data !== undefined ? res.data : res) as T),
      catchError((error) => this.handleError(error))
    );
  }

  delete<T>(path: string, id: number): Observable<T> {
    return this.http.delete<T>(`${this.baseUrl}${path}/${id}`).pipe(
      map((res: any) => (res && res.data !== undefined ? res.data : res) as T),
      catchError((error) => this.handleError(error))
    );
  }

  patch<T>(path: string, id: number, body: unknown): Observable<T> {
    return this.http.patch<T>(`${this.baseUrl}${path}/${id}`, body).pipe(
      map((res: any) => (res && res.data !== undefined ? res.data : res) as T),
      catchError((error) => this.handleError(error))
    );
  }

  patchCustom<T>(path: string, body: unknown = {}): Observable<T> {
    return this.http.patch<T>(`${this.baseUrl}${path}`, body).pipe(
      map((res: any) => (res && res.data !== undefined ? res.data : res) as T),
      catchError((error) => this.handleError(error))
    );
  }

  paginate<T>(path: string, page: number, size: number, params?: Record<string, string | number | boolean>): Observable<{ content: T[]; totalElements: number; totalPages: number }> {
    let httpParams = new HttpParams().set('page', page).set('size', size);
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== '') {
          httpParams = httpParams.set(key, String(value));
        }
      });
    }
    return this.http.get<{ content: T[]; totalElements: number; totalPages: number }>(`${this.baseUrl}${path}`, { params: httpParams }).pipe(
      map((res: any) => (res && res.data !== undefined ? res.data : res)),
      catchError((error) => this.handleError(error))
    );
  }

  private handleError(error: HttpErrorResponse): Observable<never> {
    let message = 'Error interno del servidor';

    if (error.status === 401) {
      message = 'Credenciales invalidas. Inicie sesion nuevamente.';
      this.router.navigate(['/login']);
    } else if (error.status === 403) {
      message = 'Acceso denegado. No tiene permisos para esta accion.';
    } else if (error.status === 404) {
      message = error.error?.message || 'Recurso no encontrado';
    } else if (error.status === 400) {
      message = error.error?.message || 'Datos invalidos';
    } else if (error.status === 0) {
      message = 'No se pudo conectar con el servidor';
    } else if (error.error?.message) {
      message = error.error.message;
    }

    return throwError(() => new Error(message));
  }
}
