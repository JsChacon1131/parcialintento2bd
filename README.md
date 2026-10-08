# Cultural Space Booking

Proyecto de Bases de Datos Multimedia desarrollado a partir de la estructura Express/rutas/controladores de `Clase-APIJS` y la estructura MySQL/DAO/interfaz de `Node_MySQL_Example-master`.

## Instalación

1. Instalar Node.js y MySQL 8.0+.
2. Ejecutar los archivos `sql/01_heritage_db.sql` y `sql/02_booking_db.sql` en MySQL Workbench o la consola de MySQL (cada script crea su base de datos).
3. Copiar `.env.example` a `.env` y configurar las credenciales de MySQL. No subir `.env` a GitHub.
4. Ejecutar `npm install` y `npm start` en la raíz del proyecto.
5. Abrir `http://localhost:5000`.

La base `heritage_db` mantiene dependencias y espacios. La base `booking_db` mantiene organizaciones, reservas y ocupaciones. La referencia `reservations.space_id` se verifica contra `heritage_db` mediante el servicio de aplicación, sin clave foránea entre bases independientes.

## API REST

| Método | Ruta | Descripción |
| --- | --- | --- |
| GET | `/api/spaces` | Lista espacios |
| GET | `/api/spaces/:id` | Consulta espacio |
| POST | `/api/spaces` | Crea espacio |
| GET | `/api/administrative-units` | Lista dependencias |
| GET | `/api/organizations` | Lista organizaciones |
| GET | `/api/reservations` | Lista reservas |
| GET | `/api/reservations/:id` | Consulta estado y detalle |
| POST | `/api/reservations` | Solicitud pendiente |
| PATCH | `/api/reservations/:id` | Aprueba, rechaza o cancela |

### Ejemplo de espacio

```json
{"name":"Teatro Central","address":"Calle 10 # 20-30","maximumCapacity":150,"conservationStatus":"operational","administrativeUnitId":1}
```

### Ejemplo de solicitud

```json
{"spaceId":1,"organizationId":1,"attendees":100,"startAt":"2026-11-15T14:00","endAt":"2026-11-15T16:00"}
```

### Ejemplo de cambio de estado

```json
{"status":"approved"}
```

El servidor valida la existencia, operatividad, aforo y ausencia de solapamiento con reservas aprobadas antes de crear la solicitud. Una solicitud nueva siempre queda `pending`. Al aprobar, comprueba nuevamente estas reglas y registra ocupación. Para evitar aprobaciones simultáneas incompatibles, usa `GET_LOCK` por espacio en MySQL. Los intervalos son semiabiertos: terminar exactamente cuando inicia otra reserva está permitido. Se consideran fechas locales de la ciudad, sin desplazamiento horario.

## Diagramas ER

Los archivos `academico.png` y `repositorio.png` conservan **los nombres exactos pedidos en la guía** aunque los dominios son patrimonio y reservas, respectivamente.

## Control de entrega

Subir la carpeta comprimida junto al archivo con el vínculo real del repositorio público en `enlace_repositorio.txt`. No se puede construir una URL de repositorio hasta conocer el nombre real del usuario y publicarlo.
