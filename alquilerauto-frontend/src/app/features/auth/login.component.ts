import { Component, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';
import { ToastService } from '../../core/services/toast.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [FormsModule, RouterLink],
  template: `
    <div class="min-h-screen flex items-center justify-center bg-slate-50 p-4">
      <div class="w-full max-w-md">
        <div class="text-center mb-8">
          <div class="w-14 h-14 rounded-xl bg-primary flex items-center justify-center mx-auto mb-4">
            <span class="material-symbols-outlined text-white text-3xl">directions_car</span>
          </div>
          <h1 class="text-2xl font-bold text-slate-800">DRIVO</h1>
          <p class="text-sm text-slate-500 mt-1">Rent-a-Car</p>
        </div>

        <div class="card">
          <h2 class="text-lg font-semibold text-slate-800 mb-6 text-center">Iniciar Sesion</h2>

          <div class="space-y-4">
            <div>
              <label class="input-label">Correo</label>
              <input class="input-field" type="email" [(ngModel)]="correo" placeholder="correo@ejemplo.com" />
            </div>
            <div>
              <label class="input-label">Clave</label>
              <input class="input-field" type="password" [(ngModel)]="clave" placeholder="••••••••" (keyup.enter)="doLogin()" />
            </div>
            <button class="btn-primary w-full" [disabled]="loading()" (click)="doLogin()">
              {{ loading() ? 'Ingresando...' : 'Ingresar' }}
            </button>
            @if (error()) {
              <p class="text-sm text-red-600 text-center">{{ error() }}</p>
            }
          </div>

            <div class="mt-6 pt-4 border-t border-slate-200 text-center">
            <p class="text-sm text-slate-500">
              ¿No tienes cuenta?
              <a routerLink="/register" class="text-primary font-medium hover:underline">Registrate</a>
            </p>
          </div>

          <div class="mt-4 p-3 rounded-lg bg-slate-50 border border-slate-200">
            <p class="text-xs font-medium text-slate-600 mb-2">Usuarios de prueba:</p>
            <div class="grid grid-cols-2 gap-2 text-xs text-slate-500">
              <div>
                <p class="font-medium text-slate-700">Admin</p>
                <p>admin&#64;drivo.com</p>
                <p>admin123</p>
              </div>
              <div>
                <p class="font-medium text-slate-700">Cliente</p>
                <p>carlos&#64;email.com</p>
                <p>cliente123</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  `
})
export class LoginComponent {
  correo = '';
  clave = '';
  readonly loading = signal(false);
  readonly error = signal('');

  constructor(
    private readonly auth: AuthService,
    private readonly router: Router,
    private readonly toast: ToastService
  ) {}

  doLogin(): void {
    if (!this.correo || !this.clave) {
      this.error.set('Complete todos los campos');
      return;
    }
    this.loading.set(true);
    this.error.set('');

    this.auth.login({ correo: this.correo, clave: this.clave }).subscribe({
      next: (user) => {
        this.toast.success(`Bienvenido, ${user.nombre}`);
        if (user.rol === 'ADMIN') {
          this.router.navigate(['/admin/dashboard']);
        } else {
          this.router.navigate(['/portal/home']);
        }
      },
      error: (err) => {
        this.error.set(err.message || 'Credenciales invalidas');
        this.loading.set(false);
      }
    });
  }
}
