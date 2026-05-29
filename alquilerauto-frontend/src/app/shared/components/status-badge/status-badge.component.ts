import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-status-badge',
  standalone: true,
  template: `<span [class]="badgeClass">{{ label }}</span>`,
  styles: [`
    :host { display: inline-flex; }
  `]
})
export class StatusBadgeComponent {
  @Input() status = '';
  @Input() label = '';

  private readonly statusMap: Record<string, string> = {
    'Disponible': 'badge-success',
    'activo': 'badge-success',
    'Confirmada': 'badge-success',
    'Completada': 'badge-success',
    'Finalizada': 'badge-neutral',
    'Pendiente': 'badge-warning',
    'Sin entregar': 'badge-warning',
    'En proceso': 'badge-info',
    'En curso': 'badge-info',
    'Cancelada': 'badge-error',
    'bloqueado': 'badge-error',
    'En reparacion': 'badge-warning',
    'Mantenimiento': 'badge-info',
  };

  get badgeClass(): string {
    const cls = this.statusMap[this.status] || 'badge-neutral';
    return `badge ${cls}`;
  }
}
