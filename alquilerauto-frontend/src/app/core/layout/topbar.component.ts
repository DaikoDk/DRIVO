import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-topbar',
  standalone: true,
  template: `
    <header class="h-16 sticky top-0 z-30 flex items-center justify-between px-6 border-b bg-surface-container border-slate-200">
      <div class="flex items-center gap-4">
        <h2 class="text-lg font-semibold text-slate-800">{{ pageTitle }}</h2>
      </div>

      <div class="flex items-center gap-4">
        <div class="relative">
          <button type="button" aria-label="Notificaciones" class="material-symbols-outlined cursor-pointer text-slate-500 bg-transparent border-0">notifications</button>
          <span class="absolute -top-1 -right-1 w-2 h-2 rounded-full bg-error"></span>
        </div>
        <button type="button" aria-label="Menú de usuario" class="flex items-center gap-2 cursor-pointer bg-transparent border-0">
          <div class="w-8 h-8 rounded-full flex items-center justify-center text-white text-sm font-medium bg-primary">
            A
          </div>
          <span class="text-sm font-medium text-slate-700">Admin</span>
        </button>
      </div>
    </header>
  `
})
export class TopbarComponent {
  @Input() pageTitle = '';
}
