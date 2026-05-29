import { Component, Input, Output, EventEmitter } from '@angular/core';

@Component({
  selector: 'app-modal',
  standalone: true,
  host: {
    '(document:keydown.escape)': 'onEsc()'
  },
  template: `
    @if (open) {
      <div class="backdrop flex items-center justify-center p-4" (click)="onBackdropClick($event)">
        <div class="bg-white rounded-xl shadow-xl w-full max-w-lg max-h-[90vh] overflow-y-auto" [class.slide-in]="sidePanel" (click)="$event.stopPropagation()">
          <div class="flex items-center justify-between p-5 border-b border-slate-200">
            <h2 class="text-lg font-semibold text-slate-800">{{ title }}</h2>
            <button class="text-slate-400 hover:text-slate-600" (click)="close()">
              <span class="material-symbols-outlined">close</span>
            </button>
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
export class ModalComponent {
  @Input() open = false;
  @Input() title = '';
  @Input() sidePanel = false;
  @Output() closed = new EventEmitter<void>();

  onEsc(): void {
    if (this.open) this.close();
  }

  onBackdropClick(event: MouseEvent): void {
    if ((event.target as HTMLElement).classList.contains('backdrop')) {
      this.close();
    }
  }

  close(): void {
    this.closed.emit();
  }
}
