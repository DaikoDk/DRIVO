import { Component, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService, RegisterRequest } from '../../core/services/auth.service';
import { ToastService } from '../../core/services/toast.service';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [FormsModule, RouterLink],
  template: `
    <div class="min-h-screen flex items-center justify-center bg-slate-50 p-4 py-8">
      <div class="w-full max-w-lg">
        <div class="text-center mb-6">
          <div class="w-14 h-14 rounded-xl bg-primary flex items-center justify-center mx-auto mb-3">
            <span class="material-symbols-outlined text-white text-3xl">directions_car</span>
          </div>
          <h1 class="text-2xl font-bold text-slate-800">DRIVO</h1>
          <p class="text-sm text-slate-500 mt-1">Crear Cuenta</p>
        </div>

        <div class="card">
          <h2 class="text-lg font-semibold text-slate-800 mb-6">Datos Personales</h2>

          <div class="space-y-4">
            <div class="grid grid-cols-2 gap-4">
              <div>
                <label class="input-label">Nombre *</label>
                <input class="input-field" [(ngModel)]="form.nombre" placeholder="Nombres" />
              </div>
              <div>
                <label class="input-label">Apellido Paterno *</label>
                <input class="input-field" [(ngModel)]="form.apellidoPaterno" placeholder="Apellido" />
              </div>
            </div>
            <div>
              <label class="input-label">Apellido Materno</label>
              <input class="input-field" [(ngModel)]="form.apellidoMaterno" placeholder="Apellido materno" />
            </div>
            <div class="grid grid-cols-2 gap-4">
              <div>
                <label class="input-label">DNI *</label>
                <input class="input-field" [(ngModel)]="form.dni" placeholder="12345678" />
              </div>
              <div>
                <label class="input-label">Telefono</label>
                <input class="input-field" [(ngModel)]="form.telefono" placeholder="999888777" />
              </div>
            </div>
            <div>
              <label class="input-label">Email *</label>
              <input class="input-field" type="email" [(ngModel)]="form.email" placeholder="correo@ejemplo.com" />
            </div>
            <div>
              <label class="input-label">Direccion</label>
              <input class="input-field" [(ngModel)]="form.direccion" placeholder="Av. Principal 123" />
            </div>
            <div>
              <label class="input-label">Clave *</label>
              <input class="input-field" type="password" [(ngModel)]="form.clave" placeholder="Minimo 6 caracteres" />
            </div>

            <div class="border-t border-slate-100 pt-4">
              <p class="text-sm font-semibold text-slate-700 mb-3">Licencia de Conducir</p>
              <div class="grid grid-cols-3 gap-4">
                <div>
                  <label class="input-label">Numero</label>
                  <input class="input-field" [(ngModel)]="form.numeroLicencia" placeholder="Q12345678" />
                </div>
                <div>
                  <label class="input-label">Categoria</label>
                  <select class="input-field" [(ngModel)]="form.categoriaLicencia">
                    <option value="">Seleccionar</option>
                    <option value="A1">A1</option>
                    <option value="A2">A2</option>
                    <option value="A3">A3</option>
                    <option value="B">B</option>
                    <option value="C">C</option>
                  </select>
                </div>
                <div>
                  <label class="input-label">Vencimiento</label>
                  <input class="input-field" type="date" [(ngModel)]="form.fechaVencimientoLicencia" />
                </div>
              </div>
            </div>

            <button class="btn-primary w-full" [disabled]="loading()" (click)="doRegister()">
              {{ loading() ? 'Creando cuenta...' : 'Crear Cuenta' }}
            </button>
            @if (msg()) {
              <p class="text-sm text-center" [class.text-error]="isError()" [class.text-success]="!isError()">{{ msg() }}</p>
            }
          </div>

          <div class="mt-6 pt-4 border-t border-slate-200 text-center">
            <p class="text-sm text-slate-500">
              ¿Ya tienes cuenta?
              <a routerLink="/login" class="text-primary font-medium hover:underline">Inicia sesion</a>
            </p>
          </div>
        </div>
      </div>
    </div>
  `
})
export class RegisterComponent {
  form: RegisterRequest = {
    nombre: '',
    apellidoPaterno: '',
    dni: '',
    email: '',
    clave: '',
  };

  readonly loading = signal(false);
  readonly msg = signal('');
  readonly isError = signal(false);

  constructor(
    private readonly auth: AuthService,
    private readonly router: Router,
    private readonly toast: ToastService
  ) {}

  doRegister(): void {
    if (!this.form.nombre || !this.form.apellidoPaterno || !this.form.dni || !this.form.email || !this.form.clave) {
      this.msg.set('Complete todos los campos obligatorios');
      this.isError.set(true);
      return;
    }
    if (this.form.clave.length < 6) {
      this.msg.set('La clave debe tener al menos 6 caracteres');
      this.isError.set(true);
      return;
    }
    this.loading.set(true);
    this.msg.set('');

    this.auth.register(this.form).subscribe({
      next: (user) => {
        this.toast.success(`Bienvenido, ${user.nombre}`);
        this.router.navigate(['/portal/home']);
      },
      error: (err) => {
        this.msg.set(err.message || 'Error al registrarse');
        this.isError.set(true);
        this.loading.set(false);
      }
    });
  }
}
