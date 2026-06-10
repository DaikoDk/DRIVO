import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-skeleton-loader',
  standalone: true,
  template: `
    <div class="space-y-4">
      @for (i of rowArray; track i) {
        <div class="flex gap-4">
          @for (c of colArray; track c) {
            <div class="skeleton h-4 flex-1"></div>
          }
        </div>
      }
    </div>
  `
})
export class SkeletonLoaderComponent {
  @Input() rows = 5;
  @Input() cols = 4;

  get rowArray(): number[] {
    return Array.from({ length: this.rows }, (_, i) => i);
  }

  get colArray(): number[] {
    return Array.from({ length: this.cols }, (_, i) => i);
  }
}
