export interface Pago {
  idPago: number;
  idReserva: number;
  nombreCliente: string;
  montoBase: number;
  montoMora: number;
  montoDanos: number;
  montoTotalPagado: number;
  fechaPago: string;
  metodoPago: string;
}
