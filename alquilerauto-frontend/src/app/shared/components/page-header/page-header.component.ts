import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-page-header',
  standalone: true,
  template: `
    <div class="flex items-center justify-between mb-6">
      <div>
        <h1 class="text-2xl font-bold text-slate-800">{{ title }}</h1>
        @if (subtitle) {
          <p class="text-sm text-slate-500 mt-1">{{ subtitle }}</p>
        }
      </div>
      <div class="flex items-center gap-3">
        <ng-content></ng-content>
      </div>
    </div>
  `
})
export class PageHeaderComponent {
  @Input() title = '';
  @Input() subtitle = '';
}
