export interface Reparacion {
  idReparacion: number;
  idReserva: number;
  idAuto: number;
  placa: string;
  idCatalogoReparacion?: number;
  descripcionCatalogo?: string;
  descripcion: string;
  costo: number;
  estado: string;
  responsable?: string;
  fechaReporte: string;
  fechaInicio?: string;
  fechaFin?: string;
  usuarioReporte?: string;
}
