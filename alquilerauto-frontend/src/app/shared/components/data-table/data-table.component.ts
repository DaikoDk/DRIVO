import { Component, Input, Output, EventEmitter, TemplateRef } from '@angular/core';
import { CommonModule } from '@angular/common';

export interface TableColumn {
  key: string;
  header: string;
  sortable?: boolean;
  width?: string;
}

@Component({
  selector: 'app-data-table',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="overflow-x-auto rounded-xl border border-slate-200">
      <table class="w-full text-sm">
        <thead class="bg-slate-50 border-b border-slate-200">
          <tr>
            @for (col of columns; track col.key) {
              <th class="px-4 py-3 text-left font-medium text-slate-600 whitespace-nowrap" [style.width]="col.width" (click)="col.sortable && onSort(col.key)">
                <span class="inline-flex items-center gap-1" [class.cursor-pointer]="col.sortable" [class.select-none]="col.sortable">
                  {{ col.header }}
                  @if (col.sortable) {
                    <span class="material-symbols-outlined text-sm" style="font-size:16px">
                      {{ sortBy === col.key ? (sortDir === 'asc' ? 'arrow_upward' : 'arrow_downward') : 'unfold_more' }}
                    </span>
                  }
                </span>
              </th>
            }
            @if (actionsTemplate) {
              <th class="px-4 py-3 text-right font-medium text-slate-600" style="width:100px">Acciones</th>
            }
          </tr>
        </thead>
        <tbody class="divide-y divide-slate-100">
          @if (loading) {
            @for (row of [1,2,3,4,5]; track row) {
              <tr>
                @for (col of columns; track col.key) {
                  <td class="px-4 py-3"><div class="skeleton h-4 w-full"></div></td>
                }
                @if (actionsTemplate) {
                  <td class="px-4 py-3"><div class="skeleton h-4 w-16"></div></td>
                }
              </tr>
            }
          } @else if (data.length === 0) {
            <tr>
              <td [attr.colspan]="columns.length + (actionsTemplate ? 1 : 0)" class="px-4 py-16 text-center">
                <div class="flex flex-col items-center justify-center py-8">
                  <span class="material-symbols-outlined text-4xl text-slate-300 mb-2">inbox</span>
                  <p class="text-sm text-slate-500">Sin resultados</p>
                </div>
              </td>
            </tr>
          } @else {
            @for (row of data; track $index) {
              <tr class="hover:bg-slate-50 transition-colors" (click)="rowClick.emit(row)">
                @for (col of columns; track col.key) {
                  <td class="px-4 py-3 whitespace-nowrap text-slate-700">{{ getNestedValue(row, col.key) }}</td>
                }
                @if (actionsTemplate) {
                  <td class="px-4 py-3 text-right">
                    <ng-container *ngTemplateOutlet="actionsTemplate; context: { $implicit: row }"></ng-container>
                  </td>
                }
              </tr>
            }
          }
        </tbody>
      </table>
    </div>
  `
})
export class DataTableComponent {
  @Input() columns: TableColumn[] = [];
  @Input() data: Record<string, unknown>[] = [];
  @Input() loading = false;
  @Input() sortBy = '';
  @Input() sortDir: 'asc' | 'desc' = 'asc';

  @Input() actionsTemplate?: TemplateRef<unknown>;

  @Output() rowClick = new EventEmitter<Record<string, unknown>>();
  @Output() sortChange = new EventEmitter<{ column: string; direction: 'asc' | 'desc' }>();

  onSort(column: string): void {
    this.sortDir = this.sortBy === column && this.sortDir === 'asc' ? 'desc' : 'asc';
    this.sortBy = column;
    this.sortChange.emit({ column: this.sortBy, direction: this.sortDir });
  }

  getNestedValue(obj: Record<string, unknown>, path: string): string {
    return path.split('.').reduce((acc: unknown, part) => {
      if (acc && typeof acc === 'object') {
        return (acc as Record<string, unknown>)[part];
      }
      return undefined;
    }, obj) as string ?? '';
  }
}
