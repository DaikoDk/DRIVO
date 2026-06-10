import { Component, Input, Output, EventEmitter } from '@angular/core';

@Component({
  selector: 'app-pagination',
  standalone: true,
  template: `
    @if (totalPages > 1) {
      <div class="flex items-center justify-between pt-4">
        <p class="text-sm text-slate-500">
          Mostrando {{ (currentPage - 1) * pageSize + 1 }}-{{ Math.min(currentPage * pageSize, totalItems) }} de {{ totalItems }}
        </p>
        <div class="flex items-center gap-1">
          <button class="btn-sm btn-secondary" [disabled]="currentPage <= 1" (click)="goTo(currentPage - 1)">
            <span class="material-symbols-outlined text-sm">chevron_left</span>
          </button>
          @for (page of visiblePages; track page) {
            <button class="btn-sm" [class.btn-primary]="page === currentPage" [class.btn-secondary]="page !== currentPage" (click)="goTo(page)">
              {{ page }}
            </button>
          }
          <button class="btn-sm btn-secondary" [disabled]="currentPage >= totalPages" (click)="goTo(currentPage + 1)">
            <span class="material-symbols-outlined text-sm">chevron_right</span>
          </button>
        </div>
      </div>
    }
  `
})
export class PaginationComponent {
  @Input() currentPage = 1;
  @Input() totalPages = 0;
  @Input() totalItems = 0;
  @Input() pageSize = 10;
  @Output() pageChange = new EventEmitter<number>();

  Math = Math;

  get visiblePages(): number[] {
    const pages: number[] = [];
    const start = Math.max(1, this.currentPage - 2);
    const end = Math.min(this.totalPages, this.currentPage + 2);
    for (let i = start; i <= end; i++) {
      pages.push(i);
    }
    return pages;
  }

  goTo(page: number): void {
    if (page >= 1 && page <= this.totalPages && page !== this.currentPage) {
      this.pageChange.emit(page);
    }
  }
}
