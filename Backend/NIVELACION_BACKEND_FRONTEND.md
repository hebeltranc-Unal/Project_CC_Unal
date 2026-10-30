# Nivelación backend ↔ frontend

> Estado: **implementada y probada**. El frontend consume la API real y ya no usa
> `localStorage` para reservas, tutores, reuniones ni sesiones.
>
> Estructura de la API: [`ESTRUCTURA_API_REST.md`](ESTRUCTURA_API_REST.md)

## 1. Estado actual

### Backend

- API REST con **FastAPI**, **SQLAlchemy 2**, **Pydantic v2** y **SQLite**.
- Capas separadas: `models`, `schemas`, `services`, `controllers` y `api/v1/routes`.
- Autenticación por **sesión en servidor** con cookie `HttpOnly`.
- Contraseñas con **Argon2id** y tokens de sesión guardados hasheados.
- CRUD de sesiones, tutores, salones y áreas.
- Inscripciones con control de cupos, duplicados y cruces de horario.
- Reportes de resumen, ocupación y áreas.
- Contacto persistido en base de datos.
- **45 pruebas automatizadas** con `pytest` y `TestClient`.

### Frontend

- React + Vite conectado a `http://localhost:8000/api/v1`.
- Cliente HTTP en `src/servicios/api.js` con `credentials: "include"`.
- Sesión real mediante `AuthContext` y rutas protegidas por rol.
- Sin contraseña fija, sin enlaces de demostración y sin `localStorage`.
- Estados de carga y error en las páginas que consumen datos.
- `src/datos/datos.js` solo conserva catálogos estáticos: áreas y portadas.

## 2. Modelo de datos implementado

| Tabla | Campos principales | Uso en el frontend |
|---|---|---|
| `areas` | `id`, `nombre` | Filtros y etiquetas |
| `usuarios` | `id`, `nombre`, `correo`, `rol`, `programa`, `password_hash`, `disponibilidad`, `materias`, `activo` | Tutores, estudiantes y coordinador |
| `salones` | `id`, `nombre`, `capacidad` | Formularios y panel administrativo |
| `sesiones` | `id`, `titulo`, `asignatura`, `area_id`, `tutor_id`, `fecha`, `duracion_min`, `modalidad`, `ubicacion`, `salon_id`, `cupo_maximo`, `descripcion`, `imagen`, `tipo`, `creada_en` | Sesiones y reuniones |
| `inscripciones` | `id`, `estudiante_id`, `sesion_id`, `fecha`, `estado` | Reservas y reportes |
| `sesiones_auth` | `id`, `usuario_id`, `token_hash`, `creada_en`, `expira_en`, `ultimo_uso`, `revocada_en`, `ip`, `user_agent` | Login con cookie |
| `mensajes_contacto` | `id`, `nombre`, `correo`, `mensaje`, `creado_en` | Formulario de contacto |

Restricciones importantes:

- `usuarios.correo` es único.
- La pareja `(estudiante_id, sesion_id)` es única: no hay reservas duplicadas.
- `sesiones_auth.token_hash` es único.
- Un salón o un tutor no pueden tener dos sesiones que se crucen en el tiempo.

## 3. Mapeo de campos frontend ↔ backend

| Frontend | Backend | Nota |
|---|---|---|
| `tutor.id` | `usuarios.id` | El backend usa IDs de texto: `t1`, `c1`, `e1` |
| `tutor.name` | `usuarios.nombre` | — |
| `tutor.career` | `usuarios.programa` | — |
| `tutor.subjects` | `usuarios.materias` | Lista JSON de materias |
| `tutor.availability` | `usuarios.disponibilidad` | Texto libre |
| `sesion.title` | `sesiones.titulo` | — |
| `sesion.subject` | `sesiones.asignatura` | — |
| `sesion.area` | `areas.nombre` | Se envía por nombre en la API |
| `sesion.tutorId` | `sesiones.tutor_id` | — |
| `sesion.date` | `sesiones.fecha` | Fecha y hora exactas en UTC, ISO 8601 |
| `sesion.durationMin` | `sesiones.duracion_min` | Minutos |
| `sesion.modality` | `sesiones.modalidad` | `presencial` o `virtual` |
| `sesion.location` | `sesiones.ubicacion` | Nombre del salón o “Google Meet” |
| `sesion.roomId` | `sesiones.salon_id` | Nulo en sesiones virtuales |
| `sesion.capacity` | `sesiones.cupo_maximo` | — |
| `sesion.booked` | Calculado | Número de inscripciones |
| `sesion.description` | `sesiones.descripcion` | — |
| `sesion.image` | `sesiones.imagen` | URL de la portada |
| `sesion.kind` | `sesiones.tipo` | `sesion` o `reunion` |
| `reserva.status` | `inscripciones.estado` | “Confirmada” |
| `reserva.createdAt` | `inscripciones.fecha` | — |
| `room.id`, `room.name`, `room.capacity` | `salones.id`, `salones.nombre`, `salones.capacidad` | — |

## 4. Endpoints implementados

Todos cuelgan de `/api/v1`. La documentación interactiva está en `/docs`.

### Autenticación

| Método | Ruta | Acceso |
|---|---|---|
| `POST` | `/auth/login` | Público |
| `GET` | `/auth/me` | Sesión activa (devuelve `null` si no hay sesión) |
| `POST` | `/auth/logout` | Sesión activa |

### Áreas, tutores y salones

| Método | Ruta | Acceso |
|---|---|---|
| `GET` | `/areas` | Público |
| `POST` | `/areas` | Coordinador |
| `GET` | `/usuarios?rol=tutor` | Público |
| `GET` | `/usuarios/{id}` | Público si es tutor |
| `POST` | `/usuarios` | Coordinador |
| `PUT` | `/usuarios/{id}` | Coordinador |
| `DELETE` | `/usuarios/{id}` | Coordinador |
| `GET` | `/usuarios/{id}/sesiones` | Tutor dueño o coordinador |
| `GET` | `/salones` | Público |
| `POST` | `/salones` | Coordinador |
| `PUT` | `/salones/{id}` | Coordinador |
| `DELETE` | `/salones/{id}` | Coordinador |

### Sesiones e inscripciones

| Método | Ruta | Acceso |
|---|---|---|
| `GET` | `/sesiones` | Público |
| `GET` | `/sesiones/{id}` | Público |
| `POST` | `/sesiones` | Tutor o coordinador |
| `PUT` | `/sesiones/{id}` | Tutor dueño o coordinador |
| `DELETE` | `/sesiones/{id}` | Tutor dueño o coordinador |
| `GET` | `/sesiones/{id}/inscritos` | Tutor dueño o coordinador |
| `POST` | `/sesiones/{id}/inscripciones` | Estudiante |
| `DELETE` | `/sesiones/{id}/inscripciones/{estudiante_id}` | Estudiante dueño o coordinador |
| `GET` | `/estudiantes/{id}/inscripciones` | Estudiante dueño o coordinador |
| `GET` | `/inscripciones` | Coordinador |

### Reportes, contacto y sistema

| Método | Ruta | Acceso |
|---|---|---|
| `GET` | `/reportes/resumen` | Coordinador |
| `GET` | `/reportes/areas` | Coordinador |
| `GET` | `/reportes/ocupacion` | Coordinador |
| `POST` | `/contacto` | Público |
| `GET` | `/health` | Público |

## 5. Filtros y orden de sesiones

`GET /sesiones` acepta:

| Parámetro | Valores | Efecto |
|---|---|---|
| `area` | Nombre del área | Filtra por área, sin distinguir tildes ni mayúsculas |
| `tutor_id` | `t1`, `t2`, … | Filtra por tutor |
| `modalidad` | `presencial`, `virtual` | Filtra por modalidad |
| `franja` | `morning`, `afternoon`, `evening` | Hora de Bogotá (UTC−5) |
| `busqueda` | Texto libre | Busca en título, asignatura y nombre del tutor |
| `orden` | `date`, `seats`, `title`, `area` | Fecha, cupos disponibles, título o área |
| `kind` | `sesion`, `reunion`, `all` | Tipo de registro |

La búsqueda y el orden usan normalización de tildes y mayúsculas.

## 6. Autenticación y roles

### Flujo

```text
POST /auth/login
      → validar correo y contraseña con Argon2id
      → crear fila en sesiones_auth con token hasheado
      → Set-Cookie: gea_sesion=<token>; HttpOnly; SameSite=Lax
Cada petición
      → leer cookie → validar expiración e inactividad → cargar usuario
POST /auth/logout
      → marcar la sesión como revocada y borrar la cookie
```

### Configuración

- Cookie `gea_sesion`, `HttpOnly`, `SameSite=Lax`, `Path=/`.
- `Secure` se activa con `GEA_SECURE_COOKIES=true` en producción.
- Expiración absoluta: `GEA_SESSION_HOURS` (8 por defecto).
- Expiración por inactividad: `GEA_SESSION_IDLE_MINUTES` (120 por defecto).
- Token aleatorio de 48 bytes; en la base solo se guarda su hash SHA-256.
- Peticiones de escritura con `Origin` no permitido responden `403`.
- CORS con `allow_credentials=True` y orígenes explícitos.

### Matriz de permisos

| Rol | Puede |
|---|---|
| Público | Ver sesiones, tutores, áreas y salones; enviar contacto |
| Estudiante | Reservar, cancelar sus reservas y ver su agenda |
| Tutor | Ver y administrar sus sesiones y sus inscritos |
| Coordinador | Todo: sesiones, tutores, salones, inscripciones y reportes |

La autorización se valida siempre en el backend con `requiere_rol`. React solo
oculta o muestra botones; no es la barrera de seguridad.

## 7. Páginas conectadas

| Ruta | Endpoints que usa | Estado |
|---|---|---|
| `/` | `GET /sesiones`, `GET /usuarios?rol=tutor` | Conectada |
| `/sesiones` | `GET /sesiones`, `GET /usuarios?rol=tutor` | Conectada |
| `/sesiones/:id` | `GET /sesiones/{id}`, `GET /usuarios/{id}`, inscripciones | Conectada |
| `/tutores` | `GET /usuarios?rol=tutor` | Conectada |
| `/recursos` | Ninguno | Contenido estático |
| `/contacto` | `POST /contacto` | Conectada |
| `/login` | `POST /auth/login`, `GET /auth/me` | Conectada |
| `/mis-reservas` | `GET /estudiantes/{id}/inscripciones`, `DELETE` de reserva | Conectada |
| `/tutor` | Sesiones del tutor, salones, crear sesión, inscritos | Conectada |
| `/admin` | CRUD, inscripciones y reportes | Conectada |

## 8. Decisiones tomadas

1. **IDs:** texto (`t1`, `calculo-limites`) para conservar los enlaces del prototipo.
2. **Fechas:** fecha y hora exactas en UTC; el frontend las muestra en hora de Bogotá.
3. **Reuniones:** se unificaron con sesiones mediante el campo `tipo`.
4. **Materias del tutor:** lista JSON de texto libre, no una tabla aparte.
5. **Disponibilidad:** texto libre (`Lun · Mié · Vie`).
6. **Salones:** tabla propia con capacidad y CRUD de backend.
7. **Imágenes:** URL almacenada en `sesiones.imagen`; no hay subida de archivos.
8. **Contacto:** se guarda en `mensajes_contacto`.
9. **Login:** sesión de servidor con cookie `HttpOnly`; se descartó JWT en `localStorage`.
10. **Datos iniciales:** se migraron los datos del prototipo a `app/db/seed.py`, con
    fechas futuras relativas al día de arranque.

## 9. Pruebas

```bash
cd Gea/Backend
.venv\Scripts\python.exe -m pytest
```

Resultado actual: **45 pruebas aprobadas**.

| Archivo | Qué cubre |
|---|---|
| `tests/test_auth.py` | Login, cookie, logout, roles y origen |
| `tests/test_sesiones.py` | Listados, filtros, detalle, CRUD y conflictos |
| `tests/test_inscripciones.py` | Reservas, duplicados, cupos, cruces y cancelación |
| `tests/test_usuarios.py` | Tutores, permisos, CRUD y sesiones propias |
| `tests/test_salones.py` | Listado, CRUD y restricciones |
| `tests/test_reportes.py` | Resumen, áreas y ocupación |
| `tests/test_contacto.py` | Persistencia y validación del formulario |

Las pruebas usan una base SQLite en memoria y datos de demostración; no tocan
`gea.db`.

## 10. Pendientes opcionales

El backend ya cumple la nivelación. Estas mejoras quedan para una siguiente fase:

- Limitar intentos de login y agregar bloqueo temporal.
- Token CSRF explícito además de la validación de `Origin`.
- Migraciones con Alembic en lugar de `create_all`.
- Paginación en listados grandes.
- Subida de imágenes en lugar de URLs.
- Usar los filtros de la API desde el frontend en lugar de filtrar en el navegador.
- Integración continua para ejecutar `pytest` y `npm run build`.

## 11. Criterio de nivelación

- [x] El frontend no usa `datos.js` para información dinámica.
- [x] Las reservas se guardan en la base de datos, no en `localStorage`.
- [x] El panel del tutor muestra sus sesiones reales.
- [x] El panel administrativo crea, edita y elimina datos persistentes.
- [x] Los filtros y el orden de sesiones existen en la API.
- [x] Los roles se validan en el backend.
- [x] Las respuestas incluyen los campos que el frontend muestra.
- [x] El frontend maneja carga, errores y sesión autenticada.
- [x] Hay pruebas automatizadas de los flujos principales.
