import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-stat-card',
  standalone: true,
  template: `
    <div class="card flex items-start gap-4">
      @if (icon) {
        <div class="flex items-center justify-center w-10 h-10 rounded-lg shrink-0" [style.background-color]="iconBg">
          <span class="material-symbols-outlined" [style.color]="iconColor">{{ icon }}</span>
        </div>
      }
      <div class="flex-1 min-w-0">
        <p class="text-sm font-medium text-slate-500 truncate">{{ label }}</p>
        <p class="text-2xl font-bold text-slate-800 mt-1">{{ value }}</p>
        @if (change !== undefined) {
          <p class="text-xs mt-1" [class.text-success]="change >= 0" [class.text-error]="change < 0">
            <span class="material-symbols-outlined text-sm align-bottom" style="font-size:14px">{{ change >= 0 ? 'trending_up' : 'trending_down' }}</span>
            {{ change >= 0 ? '+' : '' }}{{ change }}%
          </p>
        }
      </div>
    </div>
  `
})
export class StatCardComponent {
  @Input() label = '';
  @Input() value: string | number = '';
  @Input() icon = '';
  @Input() iconBg = '#e0e7ff';
  @Input() iconColor = '#4f46e5';
  @Input() change?: number;
}
