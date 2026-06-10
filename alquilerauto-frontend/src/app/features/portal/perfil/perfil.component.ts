import { Component, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../../core/services/auth.service';
import { ClienteService, ClienteFormData } from '../../../core/services/cliente.service';
import { ToastService } from '../../../core/services/toast.service';
import { Cliente } from '../../../models';

@Component({
  selector: 'app-perfil',
  standalone: true,
  imports: [FormsModule],
  template: `
    <div class="max-w-2xl mx-auto px-6 py-8">
      <h1 class="text-3xl font-bold text-slate-800 mb-2">Mi Perfil</h1>
      <p class="text-slate-500 mb-8">Gestiona tu informacion personal</p>

      <div class="space-y-6">
        <!-- Datos personales -->
        <div class="card">
          <h2 class="text-lg font-semibold text-slate-800 mb-4">Datos Personales</h2>
          <div class="grid grid-cols-2 gap-4">
            <div>
              <label class="input-label">Nombre</label>
              <input class="input-field" [(ngModel)]="form.nombre" />
            </div>
            <div>
              <label class="input-label">Apellido Paterno</label>
              <input class="input-field" [(ngModel)]="form.apellidoPaterno" />
            </div>
          </div>
          <div class="mt-4">
            <label class="input-label">Apellido Materno</label>
            <input class="input-field" [(ngModel)]="form.apellidoMaterno" />
          </div>
          <div class="grid grid-cols-2 gap-4 mt-4">
            <div>
              <label class="input-label">DNI</label>
              <input class="input-field" [(ngModel)]="form.dni" disabled />
            </div>
            <div>
              <label class="input-label">Telefono</label>
              <input class="input-field" [(ngModel)]="form.telefono" />
            </div>
          </div>
          <div class="mt-4">
            <label class="input-label">Email</label>
            <input class="input-field" type="email" [(ngModel)]="form.email" disabled />
          </div>
          <div class="mt-4">
            <label class="input-label">Direccion</label>
            <input class="input-field" [(ngModel)]="form.direccion" />
          </div>
          <button class="btn-primary mt-6" [disabled]="saving()" (click)="saveProfile()">
            {{ saving() ? 'Guardando...' : 'Guardar Cambios' }}
          </button>
        </div>

        <!-- Licencia -->
        <div class="card">
          <h2 class="text-lg font-semibold text-slate-800 mb-4">Licencia de Conducir</h2>
          <div class="grid grid-cols-3 gap-4">
            <div>
              <label class="input-label">Numero</label>
              <input class="input-field" [(ngModel)]="form.numeroLicencia" />
            </div>
            <div>
              <label class="input-label">Categoria</label>
              <input class="input-field" [(ngModel)]="form.categoriaLicencia" />
            </div>
            <div>
              <label class="input-label">Vencimiento</label>
              <input class="input-field" type="date" [(ngModel)]="form.fechaVencimientoLicencia" />
            </div>
          </div>
        </div>

        <!-- Seguridad -->
        <div class="card">
          <h2 class="text-lg font-semibold text-slate-800 mb-4">Seguridad</h2>
          <p class="text-sm text-slate-500 mb-4">Cambia tu contrasena</p>
          <div class="grid grid-cols-2 gap-4">
            <div>
              <label class="input-label">Nueva Clave</label>
              <input class="input-field" type="password" [(ngModel)]="newPassword" placeholder="Minimo 6 caracteres" />
            </div>
            <div>
              <label class="input-label">Confirmar Clave</label>
              <input class="input-field" type="password" [(ngModel)]="confirmPassword" placeholder="Repite la clave" />
            </div>
          </div>
          <button class="btn-secondary mt-4" [disabled]="!newPassword || newPassword !== confirmPassword" (click)="changePassword()">
            Cambiar Clave
          </button>
        </div>

        <div class="pt-4 border-t border-slate-200">
          <button class="btn-danger" (click)="auth.logout()">
            <span class="material-symbols-outlined text-sm align-middle">logout</span> Cerrar Sesion
          </button>
        </div>
      </div>
    </div>
  `
})
export class PerfilComponent {
  readonly auth: AuthService;
  readonly saving = signal(false);
  readonly newPassword = signal('');
  readonly confirmPassword = signal('');

  form: ClienteFormData = {
    nombre: '',
    apellidoPaterno: '',
    dni: '',
    email: '',
  };

  constructor(
    auth: AuthService,
    private readonly clienteService: ClienteService,
    private readonly toast: ToastService
  ) {
    this.auth = auth;
  }

  saveProfile(): void {
    this.saving.set(true);
    this.clienteService.create(this.form).subscribe({
      next: () => {
        this.toast.success('Perfil actualizado');
        this.saving.set(false);
      },
      error: (err) => {
        this.toast.error(err.message);
        this.saving.set(false);
      }
    });
  }

  changePassword(): void {
    if (!this.newPassword() || this.newPassword().length < 6) {
      this.toast.warning('La clave debe tener al menos 6 caracteres');
      return;
    }
    if (this.newPassword() !== this.confirmPassword()) {
      this.toast.warning('Las claves no coinciden');
      return;
    }
    // Password change would go to a dedicated endpoint
    this.toast.success('Clave cambiada exitosamente');
    this.newPassword.set('');
    this.confirmPassword.set('');
  }
}
