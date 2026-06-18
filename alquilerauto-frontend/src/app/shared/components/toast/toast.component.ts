import { Component, inject } from '@angular/core';
import { ToastService } from '../../../core/services/toast.service';

@Component({
  selector: 'app-toast',
  standalone: true,
  template: `
    <div role="status" aria-live="polite" class="fixed top-4 right-4 z-[100] flex flex-col gap-2 pointer-events-none">
      @for (toast of toastService.toasts(); track toast.id) {
        <div class="pointer-events-auto flex items-center gap-3 px-4 py-3 rounded-lg shadow-lg text-sm font-medium animate-slide-in min-w-[300px] max-w-sm"
             [class.bg-success]="toast.type === 'success'"
             [class.bg-error]="toast.type === 'error'"
             [class.bg-warning]="toast.type === 'warning'"
             [class.bg-info]="toast.type === 'info'"
             [class.text-white]="true">
          <span class="material-symbols-outlined text-lg">
            {{ toast.type === 'success' ? 'check_circle' : toast.type === 'error' ? 'cancel' : toast.type === 'warning' ? 'warning' : 'info' }}
          </span>
          <span class="flex-1">{{ toast.message }}</span>
          <button aria-label="Cerrar notificación" class="opacity-70 hover:opacity-100" (click)="toastService.remove(toast.id)">
            <span class="material-symbols-outlined text-base">close</span>
          </button>
        </div>
      }
    </div>
  `,
  styles: [`
    :host { display: contents; }
    @keyframes slideInRight {
      from { transform: translateX(100%); opacity: 0; }
      to { transform: translateX(0); opacity: 1; }
    }
    .animate-slide-in {
      animation: slideInRight 0.2s ease-out;
    }
  `]
})
export class ToastComponent {
  readonly toastService = inject(ToastService);
}
