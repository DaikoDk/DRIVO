import { Component, Input, Output, EventEmitter, OnChanges, AfterViewChecked, ElementRef } from '@angular/core';

@Component({
  selector: 'app-confirm-dialog',
  standalone: true,
  host: {
    '(document:keydown.escape)': 'onEsc()'
  },
  template: `
    @if (open) {
      <div class="backdrop flex items-center justify-center p-4" (click)="onCancel()">
        <div role="alertdialog" aria-modal="true" aria-labelledby="confirm-title" aria-describedby="confirm-message" class="bg-white rounded-xl shadow-xl w-full max-w-sm p-6" (click)="$event.stopPropagation()">
          <h3 id="confirm-title" class="text-lg font-semibold text-slate-800 mb-2">{{ title }}</h3>
          <p id="confirm-message" class="text-sm text-slate-500 mb-6">{{ message }}</p>
          <div class="flex justify-end gap-3">
            <button class="btn-secondary" (click)="onCancel()">{{ cancelLabel }}</button>
            <button [class.btn-danger]="danger" [class.btn-primary]="!danger" (click)="onConfirm()">{{ confirmLabel }}</button>
          </div>
        </div>
      </div>
    }
  `
})
export class ConfirmDialogComponent implements OnChanges, AfterViewChecked {
  @Input() open = false;
  @Input() title = 'Confirmar';
  @Input() message = '¿Está seguro?';
  @Input() confirmLabel = 'Aceptar';
  @Input() cancelLabel = 'Cancelar';
  @Input() danger = false;
  @Output() confirmed = new EventEmitter<void>();
  @Output() cancelled = new EventEmitter<void>();

  private needsFocus = false;

  constructor(private readonly el: ElementRef) {}

  ngOnChanges(): void {
    if (this.open) {
      this.needsFocus = true;
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
  }

  ngAfterViewChecked(): void {
    if (this.needsFocus && this.open) {
      this.needsFocus = false;
      const dialog = this.el.nativeElement.querySelector('[role="alertdialog"]');
      if (dialog) {
        const cancelBtn = dialog.querySelector('.btn-secondary');
        (cancelBtn as HTMLElement)?.focus();
      }
    }
  }

  onEsc(): void {
    if (this.open) this.onCancel();
  }

  onConfirm(): void {
    document.body.style.overflow = '';
    this.confirmed.emit();
  }

  onCancel(): void {
    document.body.style.overflow = '';
    this.cancelled.emit();
  }
}
