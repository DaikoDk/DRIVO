const fs = require('fs');
const path = require('path');

let cells = [];
let id = 100;
function nextId() { return 'n' + (id++); }

function tableCell(id, x, y, w, h, title, rows, fillColor, fontColor) {
  const tableRows = rows.map(r => {
    const pk = r.includes('*');
    const fk = r.includes('(FK)');
    const comp = r.includes('(comp)');
    let display = r.replace('*','').replace('(FK)','').replace('(comp)','').trim();
    let suffix = '';
    if (pk) suffix = ' &#x1F511;';
    if (fk) suffix = ' &#x1F517;';
    if (comp) suffix = ' &#x1F9EE;';
    return '<tr><td style="font-size:11px;padding:2px 8px;border-bottom:1px solid #ddd;">' + display + suffix + '</td></tr>';
  }).join('');

  const html = '<table border="0" cellspacing="0" cellpadding="0" style="width:100%;height:100%;">' +
    '<tr><td style="background-color:' + fillColor + ';color:' + fontColor + ';font-weight:bold;font-size:12px;padding:6px 8px;text-align:center;border-bottom:2px solid #666;">' + title + '</td></tr>' +
    '<tr><td style="background-color:#ffffff;color:#333;padding:0;">' +
    '<table border="0" cellspacing="0" cellpadding="0" style="width:100%;">' + tableRows + '</table>' +
    '</td></tr></table>';

  const escapedHtml = html.replace(/"/g, '&quot;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

  return '<mxCell id="' + id + '" value="' + escapedHtml + '" style="rounded=1;whiteSpace=wrap;html=1;fillColor=' + fillColor + ';strokeColor=' + fillColor.replace('fc','aa') + ';fontColor=' + fontColor + ';arcSize=6;verticalAlign=top;overflow=hidden;" vertex="1" parent="1">' +
    '<mxGeometry x="' + x + '" y="' + y + '" width="' + w + '" height="' + h + '" as="geometry"/>' +
    '</mxCell>';
}

// Tables definitions: [title, x, y, w, h, columns, fillColor, fontColor]
const tables = [
  ['tb_marca', 20, 20, 210, 170, [
    'idMarca*', 'nombre', 'paisOrigen', 'activo', 'fechaRegistro'
  ], '#dae8fc', '#000000'],

  ['tb_modelo', 260, 20, 210, 200, [
    'idModelo*', 'idMarca (FK)', 'nombre', 'categoria', 'numeroPasajeros', 'activo', 'fechaRegistro'
  ], '#dae8fc', '#000000'],

  ['tb_auto', 500, 20, 240, 450, [
    'idAuto*', 'placa', 'idMarca (FK)', 'idModelo (FK)', 'anio', 'color',
    'numeroMotor', 'numeroChasis', 'kilometrajeActual', 'ultimaRevisionKm',
    'proximaRevisionKm', 'precioPorDia', 'precioPorHora', 'moraPorDia',
    'estado', 'activo', 'fechaRegistro', 'fechaUltimaActualizacion'
  ], '#dae8fc', '#000000'],

  ['tb_licencia', 20, 260, 210, 150, [
    'idLicencia*', 'numeroLicencia', 'categoria', 'fechaVencimiento'
  ], '#e1d5e7', '#000000'],

  ['tb_cliente', 260, 260, 240, 400, [
    'idCliente*', 'nombre', 'apellidoPaterno', 'apellidoMaterno', 'dni',
    'telefono', 'email', 'direccion', 'idLicencia (FK)', 'numeroReservas',
    'numeroIncidentes', 'bloqueado', 'estado', 'activo', 'fechaRegistro'
  ], '#e1d5e7', '#000000'],

  ['tb_reserva', 530, 260, 240, 560, [
    'idReserva*', 'idCliente (FK)', 'idAuto (FK)', 'fechaInicio', 'horaInicio',
    'fechaFin', 'horaFin', 'kilometrajeInicio', 'kilometrajeFin', 'subtotal',
    'mora', 'costoReparaciones', 'total', 'estado', 'estadoEntrega',
    'observacionesEntrega', 'fechaHoraInicioReal', 'fechaHoraFinReal',
    'fechaCreacion', 'usuarioCreacion', 'fechaFinalizacion', 'usuarioFinalizacion'
  ], '#d5e8d4', '#000000'],

  ['tb_pago', 800, 260, 210, 220, [
    'idPago*', 'idReserva (FK)', 'montoBase', 'montoMora', 'montoDanos',
    'montoTotalPagado', 'fechaPago', 'metodoPago'
  ], '#d5e8d4', '#000000'],

  ['tb_catalogo_reparacion', 20, 700, 210, 180, [
    'idCatalogoReparacion*', 'descripcion', 'costoEstimado',
    'tiempoEstimadoHoras', 'activo', 'fechaRegistro'
  ], '#fff2cc', '#000000'],

  ['tb_reparacion', 260, 700, 240, 310, [
    'idReparacion*', 'idReserva (FK)', 'idAuto (FK)', 'idCatalogoReparacion (FK)',
    'descripcion', 'costo', 'estado', 'responsable', 'fechaReporte',
    'fechaInicio', 'fechaFin', 'usuarioReporte'
  ], '#fff2cc', '#000000'],

  ['tb_mantenimiento', 530, 700, 210, 200, [
    'idMantenimiento*', 'idAuto (FK)', 'fechaIngreso', 'fechaSalida',
    'tipo', 'costo', 'detalle'
  ], '#f8cecc', '#000000'],

  ['tb_historial_kilometraje', 770, 700, 230, 260, [
    'idHistorial*', 'idAuto (FK)', 'idReserva (FK)', 'kilometrajeAnterior',
    'kilometrajeNuevo', 'diferencia (comp)', 'tipoRegistro', 'observaciones',
    'fechaRegistro', 'usuarioRegistro'
  ], '#f8cecc', '#000000'],

  ['tb_configuracion', 20, 1020, 210, 180, [
    'idConfiguracion*', 'clave', 'valor', 'descripcion', 'tipo', 'fechaActualizacion'
  ], '#cccccc', '#000000'],

  ['tb_usuario', 260, 1020, 210, 200, [
    'IdUsuario*', 'Nombre', 'Correo', 'Clave', 'Rol', 'Activo', 'FechaRegistro'
  ], '#cccccc', '#000000'],
];

tables.forEach(t => {
  cells.push(tableCell(nextId(), t[1], t[2], t[3], t[4], t[0], t[5], t[6], t[7]));
});

// Views section
const viewsY = 1300;
cells.push('<mxCell id="' + nextId() + '" value="Vistas&amp;nbsp;&amp;nbsp;&amp;nbsp;&amp;nbsp;&amp;nbsp;&amp;nbsp;&amp;nbsp;&amp;nbsp;&amp;nbsp;&amp;nbsp;&amp;nbsp;&amp;nbsp;&amp;nbsp;&amp;nbsp;&amp;nbsp;&amp;nbsp;&amp;nbsp;&amp;nbsp;&amp;nbsp;&amp;nbsp;&amp;nbsp;&amp;nbsp;&amp;nbsp;&amp;nbsp;&amp;nbsp;&amp;nbsp;&amp;nbsp;&amp;nbsp;&amp;nbsp;&amp;nbsp;&amp;nbsp;&amp;nbsp;&amp;nbsp;&amp;nbsp;&amp;nbsp;&amp;nbsp;&amp;nbsp;&amp;nbsp;&amp;nbsp;&amp;nbsp;&amp;nbsp;&amp;nbsp;&amp;nbsp;&amp;nbsp;&lt;br&gt;&lt;br&gt;&amp;nbsp;&amp;#x1F441; vw_Auto_Completo&lt;br&gt;&amp;nbsp;&amp;#x1F441; vw_Reserva_Detalle&lt;br&gt;&amp;nbsp;&amp;#x1F441; vw_Ingresos_Periodo" style="rounded=1;whiteSpace=wrap;html=1;fillColor=#9673a6;strokeColor=#9673a6;fontColor=#ffffff;arcSize=6;verticalAlign=top;fontSize=12;" vertex="1" parent="1">' +
  '<mxGeometry x="20" y="' + viewsY + '" width="210" height="120" as="geometry"/>' +
  '</mxCell>');

// SPs section
cells.push('<mxCell id="' + nextId() + '" value="Stored Procedures&amp;nbsp;&amp;nbsp;&amp;nbsp;&amp;nbsp;&amp;nbsp;&amp;nbsp;&amp;nbsp;&amp;nbsp;&amp;nbsp;&amp;nbsp;&amp;nbsp;&amp;nbsp;&amp;nbsp;&amp;nbsp;&amp;nbsp;&amp;nbsp;&amp;nbsp;&amp;nbsp;&amp;nbsp;&amp;nbsp;&amp;nbsp;&amp;nbsp;&amp;nbsp;&amp;nbsp;&amp;nbsp;&amp;nbsp;&amp;nbsp;&amp;nbsp;&amp;nbsp;&amp;nbsp;&amp;nbsp;&amp;nbsp;&amp;nbsp;&amp;nbsp;&amp;nbsp;&amp;nbsp;&amp;nbsp;&amp;nbsp;&amp;nbsp;&amp;nbsp;&amp;nbsp;&amp;nbsp;&amp;nbsp;&amp;nbsp;&lt;br&gt;&lt;br&gt;&amp;nbsp;&amp;#x2699; sp_Auto_ListarDisponibles&lt;br&gt;&amp;nbsp;&amp;#x2699; sp_Auto_VerificarDisponibilidad&lt;br&gt;&amp;nbsp;&amp;#x2699; sp_Reserva_Crear&lt;br&gt;&amp;nbsp;&amp;#x2699; sp_Reserva_Finalizar&lt;br&gt;&amp;nbsp;&amp;#x2699; sp_Dashboard_Resumen&lt;br&gt;&amp;nbsp;&amp;#x2699; sp_Reporte_Financiero&lt;br&gt;&amp;nbsp;&amp;#x2699; sp_Reporte_Operativo&lt;br&gt;&amp;nbsp;&amp;#x2699; sp_Reporte_Operativo_Completo&lt;br&gt;&amp;nbsp;&amp;#x2699; sp_Reporte_Clientes" style="rounded=1;whiteSpace=wrap;html=1;fillColor=#d80073;strokeColor=#d80073;fontColor=#ffffff;arcSize=6;verticalAlign=top;fontSize=12;" vertex="1" parent="1">' +
  '<mxGeometry x="260" y="' + viewsY + '" width="280" height="260" as="geometry"/>' +
  '</mxCell>');

// Legend
cells.push('<mxCell id="' + nextId() + '" value="Leyenda&amp;nbsp;&amp;nbsp;&amp;nbsp;&amp;nbsp;&amp;nbsp;&amp;nbsp;&amp;nbsp;&amp;nbsp;&amp;nbsp;&amp;nbsp;&amp;nbsp;&amp;nbsp;&amp;nbsp;&amp;nbsp;&amp;nbsp;&amp;nbsp;&amp;nbsp;&amp;nbsp;&amp;nbsp;&amp;nbsp;&amp;nbsp;&amp;nbsp;&amp;nbsp;&amp;nbsp;&amp;nbsp;&amp;nbsp;&amp;nbsp;&amp;nbsp;&amp;nbsp;&amp;nbsp;&amp;nbsp;&amp;nbsp;&amp;nbsp;&amp;nbsp;&amp;nbsp;&amp;nbsp;&amp;nbsp;&amp;nbsp;&amp;nbsp;&amp;nbsp;&amp;nbsp;&amp;nbsp;&amp;nbsp;&amp;nbsp;&lt;br&gt;&lt;br&gt;&amp;nbsp;&amp;#x1F511; Primary Key&lt;br&gt;&amp;nbsp;&amp;#x1F517; Foreign Key&lt;br&gt;&amp;nbsp;&amp;#x1F9EE; Computed Column" style="rounded=1;whiteSpace=wrap;html=1;fillColor=#f5f5f5;strokeColor=#cccccc;arcSize=6;verticalAlign=top;fontSize=12;" vertex="1" parent="1">' +
  '<mxGeometry x="580" y="' + viewsY + '" width="200" height="120" as="geometry"/>' +
  '</mxCell>');

// Build full XML
const xml = '<?xml version="1.0" encoding="UTF-8"?>\n' +
  '<mxfile host="app.diagrams.net" modified="2026-06-20T05:00:00.000Z" agent="Mozilla/5.0 (Windows NT 10.0; Win64; x64)" version="21.6.5" type="device">\n' +
  '<diagram name="DER - BD_RentCar" id="page-der">\n' +
  '<mxGraphModel dx="968" dy="618" grid="1" gridSize="10" guides="1" tooltips="1" connect="0" arrows="1" fold="1" page="1" pageScale="1" pageWidth="1169" pageHeight="1654" math="0" shadow="0">\n' +
  '<root>\n' +
  '<mxCell id="0"/>\n' +
  '<mxCell id="1" parent="0"/>\n' +
  cells.join('\n') + '\n' +
  '</root>\n' +
  '</mxGraphModel>\n' +
  '</diagram>\n' +
  '</mxfile>';

fs.writeFileSync(path.join('docs/diagrams/der.drawio'), xml);
console.log('DER diagram created: ' + xml.length + ' bytes');
