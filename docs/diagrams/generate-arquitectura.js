const fs = require('fs');
const path = require('path');

let cells = [];
let edges = [];
let id = 100;
let eid = 1000;
function nid() { return 'n' + (id++); }
function eid2() { return 'e' + (eid++); }

function box(id, x, y, w, h, label, style) {
  const s = style || 'rounded=1;whiteSpace=wrap;html=1;fillColor=#dae8fc;strokeColor=#6c8ebf;fontSize=11;';
  cells.push('<mxCell id="' + id + '" value="' + label + '" style="' + s + '" vertex="1" parent="1">' +
    '<mxGeometry x="' + x + '" y="' + y + '" width="' + w + '" height="' + h + '" as="geometry"/>' +
    '</mxCell>');
}

function headerBox(id, x, y, w, h, label, color) {
  box(id, x, y, w, h, label, 'rounded=1;whiteSpace=wrap;html=1;fillColor='+color+';strokeColor='+color+';fontSize=14;fontColor=#ffffff;fontStyle=1;');
}

function edge(from, to, label, style) {
  const s = style || 'edgeStyle=orthogonalEdgeStyle;rounded=0;orthogonalLoop=1;jettySize=auto;html=1;fontSize=10;';
  edges.push('<mxCell id="' + eid2() + '" value="' + label + '" style="' + s + '" edge="1" parent="1" source="' + from + '" target="' + to + '">' +
    '<mxGeometry relative="1" as="geometry"/>' +
    '</mxCell>');
}

// ========== LAYER 1: Client ==========
const layerY1 = 10;
const l1w = 1060, l1h = 35;
const h1 = nid();
headerBox(h1, 20, layerY1, l1w, l1h, 'CLIENTE (Navegador Web)', '#4a86e8');

// Browser
const browser = nid();
box(browser, 40, 60, 180, 50, 'Navegador Web\nChrome / Edge / Firefox', 'rounded=1;whiteSpace=wrap;html=1;fillColor=#ffffff;strokeColor=#4a86e8;fontSize=11;dashed=1;');

// ========== LAYER 2: Frontend Angular ==========
const layerY2 = 130;
const h2 = nid();
headerBox(h2, 20, layerY2, l1w, l1h, 'FRONTEND (Angular 19 - Standalone - Tailwind CSS)', '#6aa84f');

// App Components
const app = nid();
box(app, 40, 180, 180, 40, 'app.ts / app.config.ts\nRouting + Guards', 'rounded=1;whiteSpace=wrap;html=1;fillColor=#ffffff;strokeColor=#6aa84f;fontSize=10;');

// Layout components
const layout = nid();
box(layout, 240, 180, 180, 40, 'Layouts\nadmin-layout / portal-layout\nsidebar / topbar', 'rounded=1;whiteSpace=wrap;html=1;fillColor=#ffffff;strokeColor=#6aa84f;fontSize=10;');

// Feature components
const features = nid();
box(features, 440, 180, 200, 100,
  'Features (páginas)\n\u2022 Login / Register\n\u2022 Dashboard\n\u2022 Vehicles / Clients\n\u2022 Reservations / Payments\n\u2022 Repairs / Maintenance\n\u2022 Settings / Perfil Admin\n\u2022 Portal Home / Cat\u00e1logo\n\u2022 Auto Detail / Mis Reservas',
  'rounded=1;whiteSpace=wrap;html=1;fillColor=#ffffff;strokeColor=#6aa84f;fontSize=10;verticalAlign=top;');

// Shared components
const shared = nid();
box(shared, 660, 180, 160, 80,
  'Shared Components\n\u2022 Modal / Toast\n\u2022 Confirm Dialog\n\u2022 Status Badge\n\u2022 Pagination\n\u2022 Stat Card / Skeleton',
  'rounded=1;whiteSpace=wrap;html=1;fillColor=#ffffff;strokeColor=#6aa84f;fontSize=10;verticalAlign=top;');

// Core services
const core = nid();
box(core, 840, 180, 220, 100,
  'Core Services &amp; Guards\n\u2022 Auth Service (JWT)\n\u2022 API Service\n\u2022 Auto / Cliente / Reserva / Pago\n\u2022 Dashboard / Configuraci\u00f3n\n\u2022 Auth Interceptor\n\u2022 Role Guard',
  'rounded=1;whiteSpace=wrap;html=1;fillColor=#ffffff;strokeColor=#6aa84f;fontSize=10;verticalAlign=top;');

// ========== LAYER 3: HTTP / API ==========
const layerY3 = 310;
const http = nid();
box(http, 40, layerY3, l1w, 40, 'HTTP (REST API) - JSON - JWT Bearer Token - CORS localhost:4200', 'rounded=1;whiteSpace=wrap;html=1;fillColor=#f4f4f4;strokeColor=#999;fontSize=11;fontColor=#666;');

// ========== LAYER 4: Backend Spring Boot ==========
const layerY4 = 370;
const h4 = nid();
headerBox(h4, 20, layerY4, l1w, l1h, 'BACKEND (Spring Boot 3.5.14 - Java 17 - Maven)', '#e06666');

// Security
const security = nid();
box(security, 40, 420, 200, 90,
  'Security Layer\n\u2022 JwtTokenProvider\n\u2022 JwtAuthenticationFilter\n\u2022 UserDetailsServiceImpl\n\u2022 SecurityConfig\n\u2022 TokenBlacklistService',
  'rounded=1;whiteSpace=wrap;html=1;fillColor=#ffffff;strokeColor=#e06666;fontSize=10;verticalAlign=top;');

// Controllers
const controllers = nid();
box(controllers, 260, 420, 200, 90,
  'Controllers (REST)\n\u2022 AuthController\n\u2022 AutoController\n\u2022 ClienteController\n\u2022 ReservaController\n\u2022 PagoController\n\u2022 Dashboard / Reporte / Usuario\n\u2022 Marca / Modelo / Reparacion\n\u2022 Mantenimiento / Config / Foto',
  'rounded=1;whiteSpace=wrap;html=1;fillColor=#ffffff;strokeColor=#e06666;fontSize=10;verticalAlign=top;');

// Services
const services = nid();
box(services, 480, 420, 200, 90,
  'Services (Business Logic)\n\u2022 AutoService / ClienteService\n\u2022 ReservaService / PagoService\n\u2022 DashboardService / ReporteService\n\u2022 FotoService / MarcaService\n\u2022 ModeloService / ReparacionService\n\u2022 Mantenimiento / Config / Usuario',
  'rounded=1;whiteSpace=wrap;html=1;fillColor=#ffffff;strokeColor=#e06666;fontSize=10;verticalAlign=top;');

// Repositories + Entities
const repos = nid();
box(repos, 700, 420, 200, 90,
  'Persistence Layer\n\u2022 JPA Repositories (12)\n\u2022 Entities (13)\n\u2022 DTOs (Request/Response)\n\u2022 ApiResponse &lt;T&gt;\n\u2022 GlobalExceptionHandler',
  'rounded=1;whiteSpace=wrap;html=1;fillColor=#ffffff;strokeColor=#e06666;fontSize=10;verticalAlign=top;');

// Uploads static files
const uploads = nid();
box(uploads, 920, 420, 140, 50,
  'Static Files\nuploads/fotos/\n(WebP images)',
  'rounded=1;whiteSpace=wrap;html=1;fillColor=#fff2cc;strokeColor=#d6b656;fontSize=10;');

// ========== LAYER 5: Database ==========
const layerY5 = 540;
const h5 = nid();
headerBox(h5, 20, layerY5, l1w, l1h, 'BASE DE DATOS (SQL Server - BD_RentCar)', '#741b47');

// Tables groups
const tablesGroup = nid();
box(tablesGroup, 40, 590, 280, 130,
  'Tablas (13)\n\u2022 tb_marca / tb_modelo / tb_auto\n\u2022 tb_cliente / tb_licencia\n\u2022 tb_reserva / tb_pago\n\u2022 tb_reparacion / tb_catalogo_reparacion\n\u2022 tb_mantenimiento\n\u2022 tb_historial_kilometraje\n\u2022 tb_configuracion / tb_usuario',
  'rounded=1;whiteSpace=wrap;html=1;fillColor=#ffffff;strokeColor=#741b47;fontSize=10;verticalAlign=top;');

const viewsSql = nid();
box(viewsSql, 340, 590, 190, 130,
  'Vistas (3)\n\u2022 vw_Auto_Completo\n\u2022 vw_Reserva_Detalle\n\u2022 vw_Ingresos_Periodo',
  'rounded=1;whiteSpace=wrap;html=1;fillColor=#ffffff;strokeColor=#741b47;fontSize=10;verticalAlign=top;');

const spGroup = nid();
box(spGroup, 550, 590, 230, 130,
  'Stored Procedures (9)\n\u2022 sp_Auto_ListarDisponibles\n\u2022 sp_Auto_VerificarDisponibilidad\n\u2022 sp_Reserva_Crear / Finalizar\n\u2022 sp_Dashboard_Resumen\n\u2022 sp_Reporte_Financiero\n\u2022 sp_Reporte_Operativo\n\u2022 sp_Reporte_Operativo_Completo\n\u2022 sp_Reporte_Clientes',
  'rounded=1;whiteSpace=wrap;html=1;fillColor=#ffffff;strokeColor=#741b47;fontSize=10;verticalAlign=top;');

const triggers = nid();
box(triggers, 800, 590, 200, 130,
  'Triggers &amp; Constraints\n\u2022 Trg: Auto_Actualizacion\n\u2022 Trg: Reserva_Finalizar\n\u2022 30+ CHECK constraints\n\u2022 15+ FK relationships\n\u2022 15+ Indexes',
  'rounded=1;whiteSpace=wrap;html=1;fillColor=#ffffff;strokeColor=#741b47;fontSize=10;verticalAlign=top;');

// ========== Edges / Flows ==========

// Browser -> App
edge(browser, app, 'ng serve\nlocalhost:4200', '');

// App -> Layout
edge(app, layout, 'Routing', '');

// Layout -> Features
edge(layout, features, 'Router\nOutlet', '');

// Features -> Core
edge(features, core, 'Services\nInjection', '');

// Core -> HTTP
edge(core, http, 'HTTP\nRequests', '');

// HTTP -> Security
edge(http, security, 'JWT Bearer\nToken', 'edgeStyle=orthogonalEdgeStyle;rounded=0;orthogonalLoop=1;jettySize=auto;html=1;fontSize=10;entryX=0.5;entryY=0;');

// Security -> Controllers
edge(security, controllers, 'Authenticated\nRequest', '');

// Controllers -> Services
edge(controllers, services, 'Business\nLogic', '');

// Services -> Repos
edge(services, repos, 'JPA / DTOs', '');

// Repos -> Tables
edge(repos, tablesGroup, 'JDBC\nSQL Queries', '');

// Tables -> Views
edge(tablesGroup, viewsSql, 'Reads', '');

// Tables -> SPs
edge(tablesGroup, spGroup, 'Executes', '');

// Tables -> Triggers
edge(tablesGroup, triggers, 'DDL', '');

// Services -> Uploads
edge(services, uploads, 'Write WebP\nfiles', 'edgeStyle=orthogonalEdgeStyle;rounded=0;orthogonalLoop=1;jettySize=auto;html=1;fontSize=10;');

// Uploads -> Browser
edge(uploads, browser, 'GET /uploads/fotos/*\n(Static Resource\nHandler)', 'edgeStyle=orthogonalEdgeStyle;rounded=0;orthogonalLoop=1;jettySize=auto;html=1;fontSize=10;');

// ========== Flows annotations ==========

// JWT Flow box
const jwtFlow = nid();
box(jwtFlow, 40, 750, 330, 100,
  'FLUJO JWT (Login - Logout)\n\u2192 POST /api/auth/login \u2192 JwtTokenProvider genera token\n\u2192 Frontend guarda en localStorage\n\u2192 AuthInterceptor agrega Bearer token a cada request\n\u2192 JwtAuthenticationFilter valida en cada request\n\u2192 POST /api/auth/logout \u2192 TokenBlacklistService invalida\n\u2192 Cleanup autom\u00e1tico cada 1 hora',
  'rounded=1;whiteSpace=wrap;html=1;fillColor=#e1d5e7;strokeColor=#9673a6;fontSize=10;verticalAlign=top;');

// Photo flow box
const photoFlow = nid();
box(photoFlow, 400, 750, 330, 100,
  'FLUJO DE FOTOS (WebP)\n\u2192 POST /api/autos/{id}/foto (multipart)\n   o PUT /api/autos/{id}/foto-url (JSON url)\n\u2192 FotoService convierte a WebP\n   (JPG/PNG \u2192 re-encode, WebP \u2192 directo)\n\u2192 Guarda en uploads/fotos/{id}.webp\n\u2192 Sirve est\u00e1tico via ResourceHandler\n\u2192 Frontend: http://localhost:8080/uploads/fotos/{id}.webp',
  'rounded=1;whiteSpace=wrap;html=1;fillColor=#d5e8d4;strokeColor=#82b366;fontSize=10;verticalAlign=top;');

// Reservation flow box
const resFlow = nid();
box(resFlow, 760, 750, 300, 100,
  'FLUJO DE RESERVAS\n\u2192 Cliente crea reserva en portal\n\u2192 Auto cambia a "Reservado"\n\u2192 Admin confirma \u2192 "Confirmada"\n\u2192 Check-in \u2192 "En proceso" (km inicio)\n\u2192 Check-out \u2192 "Finalizada"\n   \u2192 Auto vuelve a "Disponible"\n   \u2192 Se registra historial km\n   \u2192 Se genera pago',
  'rounded=1;whiteSpace=wrap;html=1;fillColor=#fff2cc;strokeColor=#d6b656;fontSize=10;verticalAlign=top;');

// Build full XML
const allCells = cells.concat(edges);
const xml = '<?xml version="1.0" encoding="UTF-8"?>\n' +
  '<mxfile host="app.diagrams.net" modified="2026-06-20T05:00:00.000Z" agent="Mozilla/5.0 (Windows NT 10.0; Win64; x64)" version="21.6.5" type="device">\n' +
  '<diagram name="Arquitectura" id="page-arch">\n' +
  '<mxGraphModel dx="968" dy="618" grid="1" gridSize="10" guides="1" tooltips="1" connect="0" arrows="1" fold="1" page="1" pageScale="1" pageWidth="1169" pageHeight="1654" math="0" shadow="0">\n' +
  '<root>\n' +
  '<mxCell id="0"/>\n' +
  '<mxCell id="1" parent="0"/>\n' +
  allCells.join('\n') + '\n' +
  '</root>\n' +
  '</mxGraphModel>\n' +
  '</diagram>\n' +
  '</mxfile>';

fs.writeFileSync(path.join('docs/diagrams/arquitectura.drawio'), xml);
console.log('Architecture diagram created: ' + xml.length + ' bytes');
