import { Component, inject, signal, ViewChild, ElementRef, AfterViewChecked } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { WatsonService, ChatMessage } from '../../../core/services/watson.service';

@Component({
  selector: 'app-chat-widget',
  standalone: true,
  imports: [FormsModule],
  template: `
    <!-- Botón flotante -->
    @if (!watson.abierto()) {
      <button (click)="watson.toggle()"
        class="fixed bottom-6 right-6 z-50 w-14 h-14 rounded-full shadow-lg flex items-center justify-center transition-transform hover:scale-110 active:scale-95"
        style="background-color: #10b981; color: white;"
        aria-label="Abrir chat asistente">
        <span class="material-symbols-outlined text-2xl">chat</span>
      </button>
    }

    <!-- Panel del chat -->
    @if (watson.abierto()) {
      <div class="fixed bottom-6 right-6 z-50 w-96 max-w-[calc(100vw-2rem)] shadow-2xl rounded-2xl overflow-hidden flex flex-col"
        style="max-height: 32rem; background-color: #ffffff;"
        role="dialog" aria-label="Asistente virtual DRIVO">

        <!-- Header -->
        <div class="flex items-center justify-between px-4 py-3 text-white" style="background-color: #059669;">
          <div class="flex items-center gap-2.5">
            <div class="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center">
              <span class="material-symbols-outlined text-lg">smart_toy</span>
            </div>
            <div>
              <p class="text-sm font-semibold">Asistente DRIVO</p>
              <p class="text-2xs text-white/70">Online</p>
            </div>
          </div>
          <button (click)="watson.cerrar()" class="text-white/70 hover:text-white transition-colors" aria-label="Cerrar chat">
            <span class="material-symbols-outlined">close</span>
          </button>
        </div>

        <!-- Mensajes -->
        <div class="flex-1 overflow-y-auto p-4 space-y-3" style="background-color: #f8fafc;" #scrollContainer>
          @for (msg of watson.mensajes(); track $index) {
            @if (msg.esUsuario) {
              <div class="flex justify-end">
                <div class="max-w-[80%] px-3.5 py-2.5 rounded-2xl text-sm text-white" style="background-color: #4f46e5; border-bottom-right-radius: 4px;">
                  {{ msg.texto }}
                </div>
              </div>
            } @else {
              <div class="flex justify-start">
                <div class="max-w-[85%] px-3.5 py-2.5 rounded-2xl text-sm" style="background-color: #ffffff; color: #1e293b; border: 1px solid #e2e8f0; border-bottom-left-radius: 4px;">
                  <div class="whitespace-pre-line">{{ msg.texto }}</div>
                  @if (msg.acciones && msg.acciones.length > 0) {
                    <div class="flex flex-wrap gap-1.5 mt-2.5">
                      @for (accion of msg.acciones; track accion) {
                        <button (click)="ejecutarAccion(accion)"
                          class="accion-btn px-2.5 py-1 text-xs font-medium rounded-full transition-colors"
                          style="background-color: #e0e7ff; color: #3730a3;">
                          {{ etiquetaAccion(accion) }}
                        </button>
                      }
                    </div>
                  }
                </div>
              </div>
            }
          }

          @if (watson.cargando()) {
            <div class="flex justify-start">
              <div class="px-3.5 py-2.5 rounded-2xl" style="background-color: #ffffff; border: 1px solid #e2e8f0; border-bottom-left-radius: 4px;">
                <div class="flex gap-1">
                  <span class="w-2 h-2 rounded-full animate-bounce" style="background-color: #10b981; animation-delay: 0ms;"></span>
                  <span class="w-2 h-2 rounded-full animate-bounce" style="background-color: #10b981; animation-delay: 150ms;"></span>
                  <span class="w-2 h-2 rounded-full animate-bounce" style="background-color: #10b981; animation-delay: 300ms;"></span>
                </div>
              </div>
            </div>
          }
        </div>

        <!-- Input -->
        <div class="border-t px-4 py-3 flex items-center gap-2" style="border-color: #e2e8f0; background-color: #ffffff;">
          <input
            #inputField
            [(ngModel)]="mensajeInput"
            (keydown.enter)="enviar()"
            placeholder="Escribe tu mensaje..."
            class="flex-1 px-3 py-2 text-sm rounded-lg border outline-none transition-colors"
            style="border-color: #cbd5e1; background-color: #f8fafc; color: #1e293b;"
            (focus)="onFocus($event)"
            (blur)="onBlur($event)"
            [disabled]="watson.cargando()"
            aria-label="Mensaje para el asistente">
          <button (click)="enviar()" [disabled]="!mensajeInput.trim() || watson.cargando()"
            class="w-9 h-9 rounded-lg flex items-center justify-center transition-opacity disabled:opacity-40"
            style="background-color: #10b981; color: white;"
            aria-label="Enviar mensaje">
            <span class="material-symbols-outlined text-lg">send</span>
          </button>
        </div>
      </div>
    }
  `,
  styles: [`
    :host { display: contents; }
    ::-webkit-scrollbar { width: 4px; }
    ::-webkit-scrollbar-track { background: transparent; }
    ::-webkit-scrollbar-thumb { background: #cbd5e1; border-radius: 2px; }
    @keyframes bounce { 0%,100% { transform: translateY(0); } 50% { transform: translateY(-4px); } }
    .animate-bounce { animation: bounce 0.6s infinite; }
  `]
})
export class ChatWidgetComponent implements AfterViewChecked {
  readonly watson = inject(WatsonService);
  mensajeInput = '';

  @ViewChild('scrollContainer') private scrollContainer?: ElementRef;

  private accionLabels: Record<string, string> = {
    'disponibles': 'Ver autos disponibles',
    'precios': 'Mostrar precios',
    'mis_reservas': 'Mis reservas',
    'categoria_suv': 'Autos SUV',
    'categoria_sedan': 'Autos Sedán',
    'categoria_hatchback': 'Autos Hatchback',
    'categoria_pickup': 'Autos Pickup',
    'reservar': 'Como reservar',
    'pagar': 'Informacion de pagos',
    'ayuda': 'Ayuda',
  };

  ngAfterViewChecked() {
    this.scrollToBottom();
  }

  private scrollToBottom(): void {
    try {
      const el = this.scrollContainer?.nativeElement;
      if (el) el.scrollTop = el.scrollHeight;
    } catch {}
  }

  enviar(): void {
    const msg = this.mensajeInput.trim();
    if (!msg || this.watson.cargando()) return;
    this.mensajeInput = '';
    this.watson.enviar(msg).subscribe({ error: () => {} });
  }

  ejecutarAccion(accion: string): void {
    this.mensajeInput = this.accionLabels[accion] || accion;
    this.enviar();
  }

  etiquetaAccion(accion: string): string {
    return this.accionLabels[accion] || accion;
  }

  onFocus(e: FocusEvent): void {
    (e.target as HTMLElement).style.borderColor = '#4f46e5';
  }

  onBlur(e: FocusEvent): void {
    (e.target as HTMLElement).style.borderColor = '#cbd5e1';
  }
}
