import { Component, Input, Output, EventEmitter } from '@angular/core';

@Component({
  selector: 'app-confirm-dialog',
  standalone: true,
  template: `
    @if (open) {
      <div class="backdrop flex items-center justify-center p-4" (click)="onCancel()">
        <div class="bg-white rounded-xl shadow-xl w-full max-w-sm p-6" (click)="$event.stopPropagation()">
          <h3 class="text-lg font-semibold text-slate-800 mb-2">{{ title }}</h3>
          <p class="text-sm text-slate-500 mb-6">{{ message }}</p>
          <div class="flex justify-end gap-3">
            <button class="btn-secondary" (click)="onCancel()">{{ cancelLabel }}</button>
            <button [class.btn-danger]="danger" [class.btn-primary]="!danger" (click)="onConfirm()">{{ confirmLabel }}</button>
          </div>
        </div>
      </div>
    }
  `
})
export class ConfirmDialogComponent {
  @Input() open = false;
  @Input() title = 'Confirmar';
  @Input() message = '¿Esta seguro?';
  @Input() confirmLabel = 'Aceptar';
  @Input() cancelLabel = 'Cancelar';
  @Input() danger = false;
  @Output() confirmed = new EventEmitter<void>();
  @Output() cancelled = new EventEmitter<void>();

  onConfirm(): void {
    this.confirmed.emit();
  }

  onCancel(): void {
    this.cancelled.emit();
  }
}
