export interface Cliente {
  idCliente: number;
  nombre: string;
  apellidoPaterno: string;
  apellidoMaterno?: string;
  dni: string;
  telefono?: string;
  email: string;
  direccion?: string;
  idLicencia?: number;
  numeroLicencia?: string;
  categoriaLicencia?: string;
  fechaVencimientoLicencia?: string;
  numeroReservas: number;
  numeroIncidentes: number;
  bloqueado: boolean;
  estado: string;
  activo: boolean;
  fechaRegistro: string;
}
