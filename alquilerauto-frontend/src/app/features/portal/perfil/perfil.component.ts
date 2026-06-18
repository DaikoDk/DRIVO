import { Component, OnInit, signal } from '@angular/core';
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

      @if (loading()) {
        <div class="flex items-center justify-center py-16">
          <p class="text-slate-400">Cargando perfil...</p>
        </div>
      } @else {
      <div class="space-y-6">
        <!-- Datos personales -->
        <div class="card">
          <h2 class="text-lg font-semibold text-slate-800 mb-4">Datos Personales</h2>
          <div class="grid grid-cols-2 gap-4">
            <div>
              <label class="input-label" for="perf-nombre">Nombre</label>
              <input class="input-field" id="perf-nombre" [(ngModel)]="form.nombre" />
            </div>
            <div>
              <label class="input-label" for="perf-apellido-paterno">Apellido Paterno</label>
              <input class="input-field" id="perf-apellido-paterno" [(ngModel)]="form.apellidoPaterno" />
            </div>
          </div>
          <div class="mt-4">
            <label class="input-label" for="perf-apellido-materno">Apellido Materno</label>
            <input class="input-field" id="perf-apellido-materno" [(ngModel)]="form.apellidoMaterno" />
          </div>
          <div class="grid grid-cols-2 gap-4 mt-4">
            <div>
              <label class="input-label" for="perf-dni">DNI</label>
              <input class="input-field" id="perf-dni" [(ngModel)]="form.dni" disabled />
            </div>
            <div>
              <label class="input-label" for="perf-telefono">Telefono</label>
              <input class="input-field" id="perf-telefono" [(ngModel)]="form.telefono" />
            </div>
          </div>
          <div class="mt-4">
            <label class="input-label" for="perf-email">Email</label>
            <input class="input-field" id="perf-email" type="email" [(ngModel)]="form.email" disabled />
          </div>
          <div class="mt-4">
            <label class="input-label" for="perf-direccion">Direccion</label>
            <input class="input-field" id="perf-direccion" [(ngModel)]="form.direccion" />
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
              <label class="input-label" for="perf-licencia-numero">Numero</label>
              <input class="input-field" id="perf-licencia-numero" [(ngModel)]="form.numeroLicencia" />
            </div>
            <div>
              <label class="input-label" for="perf-licencia-categoria">Categoria</label>
              <input class="input-field" id="perf-licencia-categoria" [(ngModel)]="form.categoriaLicencia" />
            </div>
            <div>
              <label class="input-label" for="perf-licencia-vencimiento">Vencimiento</label>
              <input class="input-field" id="perf-licencia-vencimiento" type="date" [(ngModel)]="form.fechaVencimientoLicencia" />
            </div>
          </div>
        </div>

        <!-- Seguridad -->
          <div class="card">
            <h2 class="text-lg font-semibold text-slate-800 mb-4">Seguridad</h2>
            <p class="text-sm text-slate-500 mb-4">Cambia tu contrasena</p>
            <div class="grid md:grid-cols-3 gap-4">
              <div>
                <label class="input-label" for="perf-clave-actual">Clave Actual</label>
                <input class="input-field" id="perf-clave-actual" type="password" [(ngModel)]="claveActual" placeholder="Tu clave actual" />
              </div>
              <div>
                <label class="input-label" for="perf-nueva-clave">Nueva Clave</label>
                <input class="input-field" id="perf-nueva-clave" type="password" [(ngModel)]="newPassword" placeholder="Minimo 6 caracteres" />
              </div>
              <div>
                <label class="input-label" for="perf-confirmar-clave">Confirmar Clave</label>
                <input class="input-field" id="perf-confirmar-clave" type="password" [(ngModel)]="confirmPassword" placeholder="Repite la clave" />
              </div>
            </div>
            <button class="btn-secondary mt-4" [disabled]="!claveActual || !newPassword() || !confirmPassword() || newPassword() !== confirmPassword()" (click)="changePassword()">
              Cambiar Clave
            </button>
          </div>

        <div class="pt-4 border-t border-slate-200">
          <button class="btn-danger" (click)="auth.logout()">
            <span class="material-symbols-outlined text-sm align-middle">logout</span> Cerrar Sesion
          </button>
        </div>
      </div>
      }
    </div>
  `
})
export class PerfilComponent implements OnInit {
  readonly auth: AuthService;
  readonly saving = signal(false);
  readonly loading = signal(true);
  readonly newPassword = signal('');
  readonly confirmPassword = signal('');
  claveActual = '';

  form: ClienteFormData = {
    nombre: '',
    apellidoPaterno: '',
    dni: '',
    email: '',
  };

  private clienteId: number | null = null;

  constructor(
    auth: AuthService,
    private readonly clienteService: ClienteService,
    private readonly toast: ToastService
  ) {
    this.auth = auth;
  }

  ngOnInit(): void {
    this.clienteService.getMe().subscribe({
      next: (c) => {
        console.log('Perfil cargado:', JSON.stringify(c));
        this.clienteId = c.idCliente;
        this.form = {
          nombre: c.nombre || '',
          apellidoPaterno: c.apellidoPaterno || '',
          apellidoMaterno: c.apellidoMaterno || '',
          dni: c.dni || '',
          telefono: c.telefono || '',
          email: c.email || '',
          direccion: c.direccion || '',
          numeroLicencia: c.numeroLicencia || '',
          categoriaLicencia: c.categoriaLicencia || '',
          fechaVencimientoLicencia: c.fechaVencimientoLicencia || '',
        };
        this.loading.set(false);
      },
      error: (err) => {
        console.error('Error cargando perfil:', err);
        this.toast.error('No se pudo cargar el perfil');
        this.loading.set(false);
      }
    });
  }

  saveProfile(): void {
    this.saving.set(true);
    this.clienteService.updateMe({
      nombre: this.form.nombre,
      apellidoPaterno: this.form.apellidoPaterno,
      apellidoMaterno: this.form.apellidoMaterno,
      telefono: this.form.telefono,
      direccion: this.form.direccion,
      numeroLicencia: this.form.numeroLicencia,
      categoriaLicencia: this.form.categoriaLicencia,
      fechaVencimientoLicencia: this.form.fechaVencimientoLicencia,
    }).subscribe({
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
