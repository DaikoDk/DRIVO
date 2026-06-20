import { Injectable, signal } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, tap } from 'rxjs';
import { AuthService } from './auth.service';

export interface ChatMessage {
  texto: string;
  esUsuario: boolean;
  acciones?: string[];
}

export interface WatsonResponse {
  respuesta: string;
  acciones: string[];
  esOffline: boolean;
}

@Injectable({ providedIn: 'root' })
export class WatsonService {
  private readonly baseUrl = 'http://localhost:8080/api/watson';
  readonly mensajes = signal<ChatMessage[]>([]);
  readonly abierto = signal(false);
  readonly cargando = signal(false);

  constructor(private readonly http: HttpClient, private readonly auth: AuthService) {
    this.mensajes.set([{
      texto: '¡Hola! Soy el asistente virtual de DRIVO Rent-a-Car. 🚗\n\nPregúntame sobre autos disponibles, precios o tus reservas.',
      esUsuario: false,
      acciones: ['disponibles', 'precios', 'mis_reservas']
    }]);
  }

  enviar(mensaje: string): Observable<WatsonResponse> {
    this.mensajes.update(m => [...m, { texto: mensaje, esUsuario: true }]);
    this.cargando.set(true);

    const headers = new HttpHeaders({ 'Content-Type': 'application/json' });
    const token = this.auth.getToken();
    if (token) {
      headers.set('Authorization', 'Bearer ' + token);
    }

    return this.http.post<WatsonResponse>(`${this.baseUrl}/message`, { mensaje }, { headers }).pipe(
      tap(res => {
        this.mensajes.update(m => [...m, {
          texto: res.respuesta,
          esUsuario: false,
          acciones: res.acciones
        }]);
        this.cargando.set(false);
      })
    );
  }

  toggle(): void {
    this.abierto.update(a => !a);
  }

  cerrar(): void {
    this.abierto.set(false);
  }
}
