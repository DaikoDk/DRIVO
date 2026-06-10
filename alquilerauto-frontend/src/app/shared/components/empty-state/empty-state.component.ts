import { Component, Input, Output, EventEmitter } from '@angular/core';

@Component({
  selector: 'app-empty-state',
  standalone: true,
  template: `
    <div class="flex flex-col items-center justify-center py-16 text-center">
      <span class="material-symbols-outlined text-5xl text-slate-300 mb-4">{{ icon }}</span>
      <h3 class="text-lg font-medium text-slate-600 mb-1">{{ title }}</h3>
      <p class="text-sm text-slate-400 max-w-sm">{{ description }}</p>
      @if (actionLabel) {
        <button class="btn-primary mt-4" (click)="actionClick.emit()">{{ actionLabel }}</button>
      }
    </div>
  `
})
export class EmptyStateComponent {
  @Input() icon = 'inbox';
  @Input() title = 'No hay datos';
  @Input() description = 'No se encontraron resultados para mostrar.';
  @Input() actionLabel = '';
  @Output() actionClick = new EventEmitter<void>();
}
