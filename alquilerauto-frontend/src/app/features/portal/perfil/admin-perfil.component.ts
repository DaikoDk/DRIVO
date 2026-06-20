import { Component, OnInit, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../../core/services/auth.service';
import { ApiService } from '../../../core/services/api.service';
import { ToastService } from '../../../core/services/toast.service';
import { ConfirmDialogComponent } from '../../../shared/components/confirm-dialog/confirm-dialog.component';

@Component({
  selector: 'app-admin-perfil',
  standalone: true,
  imports: [FormsModule, ConfirmDialogComponent],
  template: `
    <div class="max-w-2xl mx-auto">
      <h1 class="text-2xl font-bold text-slate-800 mb-6">Mi Perfil</h1>

      <div class="space-y-6">
        <div class="card">
          <h2 class="text-lg font-semibold text-slate-800 mb-4">Información Personal</h2>
          <div class="grid grid-cols-2 gap-4">
            <div>
              <label class="input-label">Nombre</label>
              <input class="input-field" [(ngModel)]="form.nombre" />
            </div>
            <div>
              <label class="input-label">Correo</label>
              <input class="input-field" [(ngModel)]="form.correo" disabled />
            </div>
          </div>
          <div class="mt-4">
            <label class="input-label">Rol</label>
            <input class="input-field" [value]="form.rol" disabled />
          </div>
          <button class="btn-primary mt-6" [disabled]="saving()" (click)="saveProfile()">
            {{ saving() ? 'Guardando...' : 'Guardar Cambios' }}
          </button>
        </div>

        <div class="card">
          <h2 class="text-lg font-semibold text-slate-800 mb-4">Seguridad</h2>
          <p class="text-sm text-slate-500 mb-4">Cambia tu contraseña</p>
          <div class="grid md:grid-cols-3 gap-4">
            <div>
              <label class="input-label">Clave Actual</label>
              <input class="input-field" type="password" [(ngModel)]="claveActual" placeholder="Tu clave actual" />
            </div>
            <div>
              <label class="input-label">Nueva Clave</label>
              <input class="input-field" type="password" [(ngModel)]="newPassword" placeholder="Mínimo 6 caracteres" />
            </div>
            <div>
              <label class="input-label">Confirmar Clave</label>
              <input class="input-field" type="password" [(ngModel)]="confirmPassword" placeholder="Repite la clave" />
            </div>
          </div>
          <button class="btn-secondary mt-4" [disabled]="!claveActual || !newPassword() || !confirmPassword() || newPassword() !== confirmPassword()" (click)="changePassword()">
            Cambiar Clave
          </button>
        </div>

        <div class="pt-4 border-t border-slate-200">
          <button class="btn-danger" (click)="showLogoutConfirm.set(true)">
            <span class="material-symbols-outlined text-sm align-middle">logout</span> Cerrar Sesión
          </button>
        </div>
      </div>
    </div>

    <app-confirm-dialog
      [open]="showLogoutConfirm()"
      title="Cerrar Sesión"
      message="¿Está seguro de cerrar sesión?"
      confirmLabel="Cerrar Sesión"
      [danger]="false"
      (confirmed)="auth.logout()"
      (cancelled)="showLogoutConfirm.set(false)">
    </app-confirm-dialog>
  `
})
export class AdminPerfilComponent implements OnInit {
  readonly auth: AuthService;
  readonly saving = signal(false);
  readonly showLogoutConfirm = signal(false);
  readonly newPassword = signal('');
  readonly confirmPassword = signal('');
  claveActual = '';

  form = { nombre: '', correo: '', rol: '' };

  constructor(
    auth: AuthService,
    private readonly api: ApiService,
    private readonly toast: ToastService
  ) {
    this.auth = auth;
  }

  ngOnInit(): void {
    this.api.get<{ idUsuario: number; nombre: string; correo: string; rol: string }>('/usuarios/me').subscribe({
      next: (u) => {
        this.form.nombre = u.nombre;
        this.form.correo = u.correo;
        this.form.rol = u.rol;
      },
      error: () => this.toast.error('No se pudo cargar el perfil')
    });
  }

  saveProfile(): void {
    this.toast.info('Función no implementada');
  }

  changePassword(): void {
    if (!this.claveActual) {
      this.toast.warning('Ingrese su clave actual');
      return;
    }
    if (!this.newPassword() || this.newPassword().length < 6) {
      this.toast.warning('La clave debe tener al menos 6 caracteres');
      return;
    }
    if (this.newPassword() !== this.confirmPassword()) {
      this.toast.warning('Las claves no coinciden');
      return;
    }
    this.auth.cambiarClave(this.claveActual, this.newPassword()).subscribe({
      next: () => {
        this.toast.success('Clave cambiada exitosamente');
        this.claveActual = '';
        this.newPassword.set('');
        this.confirmPassword.set('');
      },
      error: (err) => this.toast.error(err.message)
    });
  }
}
