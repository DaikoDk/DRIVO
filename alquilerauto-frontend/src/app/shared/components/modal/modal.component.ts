import { Component, Input, Output, EventEmitter, AfterViewChecked, OnChanges, ElementRef } from '@angular/core';

@Component({
  selector: 'app-modal',
  standalone: true,
  host: {
    '(document:keydown.escape)': 'onEsc()'
  },
  template: `
    @if (open) {
      <div class="backdrop flex items-center justify-center p-4" (click)="onBackdropClick($event)">
        <div role="dialog" aria-modal="true" [attr.aria-labelledby]="'modal-title-' + title" class="bg-white rounded-xl shadow-xl w-full max-w-lg max-h-[90vh] overflow-y-auto" [class.slide-in]="sidePanel" (click)="$event.stopPropagation()">
          <div class="flex items-center justify-between p-5 border-b border-slate-200">
            <h2 [id]="'modal-title-' + title" class="text-lg font-semibold text-slate-800">{{ title }}</h2>
            <div class="flex items-center gap-3">
              @if (headerActionLabel && headerActionLabel.length > 0) {
                <button class="text-sm text-red-600 hover:text-red-800 font-medium" (click)="onHeaderAction()">{{ headerActionLabel }}</button>
              }
              <button aria-label="Cerrar" class="text-slate-400 hover:text-slate-600" (click)="close()">
                <span class="material-symbols-outlined">close</span>
              </button>
            </div>
          </div>
          <div class="p-5">
            <ng-content></ng-content>
          </div>
        </div>
      </div>
    }
  `,
  styles: [`
    :host { display: contents; }
    .slide-in {
      animation: slideIn 0.2s ease-out;
    }
    @keyframes slideIn {
      from { transform: translateX(100%); opacity: 0; }
      to { transform: translateX(0); opacity: 1; }
    }
  `]
})
export class ModalComponent implements AfterViewChecked, OnChanges {
  @Input() open = false;
  @Input() title = '';
  @Input() sidePanel = false;
  @Input() headerActionLabel?: string;
  @Output() closed = new EventEmitter<void>();
  @Output() headerAction = new EventEmitter<void>();

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
      const dialog = this.el.nativeElement.querySelector('[role="dialog"]');
      if (dialog) {
        const firstInput = dialog.querySelector('input, select, textarea, button:not([aria-label="Cerrar"])');
        (firstInput as HTMLElement)?.focus();
      }
    }
  }

  onEsc(): void {
    if (this.open) this.close();
  }

  onBackdropClick(event: MouseEvent): void {
    if ((event.target as HTMLElement).classList.contains('backdrop')) {
      this.close();
    }
  }

  close(): void {
    document.body.style.overflow = '';
    this.closed.emit();
  }

  onHeaderAction(): void {
    this.headerAction.emit();
  }
}
