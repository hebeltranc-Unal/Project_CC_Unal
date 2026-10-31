# GEA · Grupos de Estudio Autónomo

Sistema de tutorías entre pares para la Universidad Nacional de Colombia, sede
Bogotá. GEA permite consultar sesiones y tutores, reservar cupos, administrar la
oferta académica y revisar reportes de ocupación.

El proyecto está compuesto por dos aplicaciones independientes que trabajan
juntas:

- **Backend:** API REST en FastAPI con base de datos SQLite.
- **Frontend:** aplicación React + Vite que consume la API real.

> **Estado:** implementado y probado. El frontend ya no usa `localStorage` para
> reservas, tutores, reuniones ni sesiones. La autenticación se hace con una
> cookie `HttpOnly` emitida por el backend.

---

## 1. Generalidades

### ¿Qué permite hacer?

- Consultar el catálogo público de sesiones, tutores, áreas y salones.
- Filtrar sesiones por área, modalidad, franja horaria, tutor, texto libre y tipo.
- Reservar y cancelar cupos con el correo institucional.
- Evitar reservas duplicadas, sesiones llenas, cruces de horario y sesiones pasadas.
- Gestionar sesiones y reuniones desde el panel del tutor.
- Administrar tutores, salones, sesiones, inscripciones y reportes desde el panel
  del coordinador.
- Enviar mensajes desde el formulario de contacto.
- Mantener una sesión segura por rol sin guardar tokens en el navegador.

### Roles del sistema

| Rol | Alcance |
|---|---|
| Público | Ver sesiones, tutores, áreas y salones; enviar contacto |
| Estudiante | Reservar, cancelar sus reservas y consultar su agenda |
| Tutor | Ver y administrar sus propias sesiones e inscritos |
| Coordinador | Administrar todo el sistema y consultar reportes |

La autorización se valida **siempre en el backend**. El frontend solo muestra u
oculta opciones según el rol.

### Tipos de registro

- **Sesión:** tutoría entre pares con cupo, fecha, modalidad y salón o enlace.
- **Reunión:** registro interno del panel administrativo, almacenado en la misma
  tabla de sesiones mediante el campo `tipo`.

---

## 2. Tecnologías

| Capa | Tecnologías |
|---|---|
| Frontend | React 19, Vite 8, React Router 7, `lucide-react`, CSS separado |
| Backend | Python 3.11+, FastAPI, SQLAlchemy 2, Pydantic v2, Uvicorn |
| Base de datos | SQLite (`gea.db`) |
| Seguridad | Argon2id, cookie `HttpOnly`, tokens de sesión hasheados con SHA-256 |
| Pruebas | `pytest`, `TestClient`, SQLite en memoria |

Las versiones exactas del backend están fijadas en
[`Backend/requirements.txt`](Backend/requirements.txt) y las del frontend en
[`Frontend/package.json`](Frontend/package.json).

---

## 3. Estructura del repositorio

```text
Gea/
├── Backend/
│   ├── app/
│   │   ├── main.py            # FastAPI, CORS, errores y lifespan
│   │   ├── core/              # configuración, seguridad, validaciones y algoritmos
│   │   ├── db/                # conexión, tablas y datos iniciales
│   │   ├── models/            # tablas SQLAlchemy
│   │   ├── schemas/           # contratos Pydantic
│   │   ├── services/          # reglas de negocio
│   │   ├── controllers/       # coordinación entre rutas y servicios
│   │   └── api/               # dependencias y rutas /api/v1
│   ├── tests/                 # 51 pruebas automatizadas
│   ├── pytest.ini
│   ├── requirements.txt
│   ├── ESTRUCTURA_API_REST.md
│   └── README.md
├── Frontend/
│   ├── src/
│   │   ├── componentes/       # componentes reutilizables y de layout
│   │   ├── contextos/         # AuthContext
│   │   ├── datos/             # catálogos estáticos
│   │   ├── estilos/           # CSS base, componentes y páginas
│   │   ├── paginas/           # vistas de la aplicación
│   │   ├── servicios/         # cliente HTTP de la API
│   │   └── utilidades/        # fechas, texto y etiquetas
│   ├── public/                # imágenes y favicon
│   ├── package.json
│   └── README.md
└── README.md                  # este documento
```

---

## 4. Requisitos

- **Python 3.11 o superior.**
- **Node.js 20 o superior.**
- Windows, Linux o macOS.

---

## 5. Puesta en marcha

El backend debe iniciarse primero. La base de datos se crea y se siembra
automáticamente la primera vez.

### 5.1 Backend

```bash
cd Gea/Backend
python -m venv .venv
```

En Windows:

```powershell
.venv\Scripts\activate
pip install -r requirements.txt
uvicorn app.main:app --reload --port 8000
```

En Linux/macOS:

```bash
source .venv/bin/activate
pip install -r requirements.txt
uvicorn app.main:app --reload --port 8000
```

Servicios disponibles:

- API: `http://localhost:8000/api/v1`
- Documentación interactiva: `http://localhost:8000/docs`
- Salud: `http://localhost:8000/health`

### 5.2 Frontend

En otra terminal:

```bash
cd Gea/Frontend
npm install
npm run dev
```

La aplicación estará en `http://localhost:5173`.

### 5.3 Variables de entorno

El backend lee un archivo `.env` opcional. Se puede copiar
`Backend/.env.example` y ajustar:

```text
GEA_DATABASE_URL=sqlite:///./gea.db
GEA_CORS_ORIGINS=http://localhost:5173,http://127.0.0.1:5173,http://localhost:4173
GEA_SECURE_COOKIES=false
GEA_SESSION_HOURS=8
GEA_SESSION_IDLE_MINUTES=120
GEA_SEED_DEMO=true
```

El frontend usa `Frontend/.env` si se necesita cambiar la URL de la API:

```text
VITE_API_URL=http://localhost:8000/api/v1
```

Si no se define, se usa esa misma URL por defecto.

---

## 6. Usuarios de prueba

Todos los correos deben pertenecer al dominio `@unal.edu.co`. Estas cuentas son
solo para demostración y las contraseñas no deben usarse en producción.

| Rol | Correo | Contraseña | Panel |
|---|---|---|---|
| Estudiante | `estudiante@unal.edu.co` | `Estudiante123` | `/mis-reservas` |
| Tutor | `tutor@unal.edu.co` | `Tutor123` | `/tutor` |
| Coordinador | `coordinador@unal.edu.co` | `Coordinador123` | `/admin` |

Cuentas adicionales del `seed`:

- Los demás tutores usan la contraseña `Tutor123`. Por ejemplo:
  `santiago.perez@unal.edu.co`.
- Los estudiantes de demostración usan `Estudiante123`. Por ejemplo:
  `demo001@unal.edu.co`.

La base de datos también incluye áreas, salones, 8 sesiones y más de 100
inscripciones de ejemplo.

---

## 7. Datos de demostración

- El `seed` se ejecuta al arrancar si la base está vacía y `GEA_SEED_DEMO=true`.
- Las fechas de las sesiones son **futuras y relativas al día de arranque**, para
  que la demo siempre tenga sesiones próximas.
- Para reiniciar los datos: detener el backend, borrar `Backend/gea.db` y volver a
  iniciarlo.
- Las pruebas usan una base SQLite en memoria y **no modifican** `gea.db`.

---

## 8. Páginas del frontend

| Ruta | Descripción | Acceso |
|---|---|---|
| `/` | Inicio | Público |
| `/sesiones` | Listado y filtros de sesiones | Público |
| `/sesiones/:id` | Detalle de una sesión | Público |
| `/tutores` | Directorio de pares tutores | Público |
| `/recursos` | Recursos de estudio | Público |
| `/contacto` | Formulario de contacto | Público |
| `/login` | Inicio de sesión | Público |
| `/mis-reservas` | Agenda y reservas del estudiante | Estudiante |
| `/tutor` | Panel del tutor | Tutor |
| `/admin` | Panel administrativo | Coordinador |

---

## 9. API REST

Todos los endpoints de negocio cuelgan de `/api/v1`; `GET /health` está en la
raíz del servidor. El catálogo completo, con permisos, filtros y mapeo de campos,
se resume en la tabla siguiente.

| Recurso | Rutas principales |
|---|---|
| Autenticación | `POST /auth/login`, `GET /auth/me`, `POST /auth/logout` |
| Áreas | `GET /areas`, `POST /areas` |
| Usuarios y tutores | `GET /usuarios?rol=tutor`, `GET /usuarios/{id}`, `POST/PUT/DELETE /usuarios` |
| Sesiones | `GET /sesiones`, `GET /sesiones/{id}`, `POST/PUT/DELETE /sesiones` |
| Inscripciones | `POST /sesiones/{id}/inscripciones`, `DELETE /sesiones/{id}/inscripciones/{estudiante_id}`, `GET /estudiantes/{id}/inscripciones` |
| Salones | `GET /salones`, `POST/PUT/DELETE /salones` |
| Reportes | `GET /reportes/resumen`, `GET /reportes/areas`, `GET /reportes/ocupacion` |
| Contacto | `POST /contacto` |
| Sistema | `GET /health` |

### Filtros de sesiones

`GET /sesiones` acepta:

| Parámetro | Valores | Efecto |
|---|---|---|
| `area` | Nombre del área | Filtra por área, sin distinguir tildes ni mayúsculas |
| `tutor_id` | `t1`, `t2`, … | Filtra por tutor |
| `modalidad` | `presencial`, `virtual` | Filtra por modalidad |
| `franja` | `morning`, `afternoon`, `evening` | Hora de Bogotá (UTC−5) |
| `busqueda` | Texto libre | Busca en título, asignatura y tutor |
| `orden` | `date`, `seats`, `title`, `area` | Ordena el resultado |
| `kind` | `sesion`, `reunion`, `all` | Tipo de registro |

### Algoritmos implementados a mano

El backend conserva en `Backend/app/core/algoritmos.py` los algoritmos que el
curso exige implementar sin funciones de ordenamiento de la biblioteca:

- `mezclar` y `ordenar_mezcla`: merge sort recursivo; no usan `sorted` ni
  `list.sort` y no modifican la lista original.
- `se_cruzan`: comparación de intervalos con desigualdad estricta, para que dos
  sesiones consecutivas no se consideren cruzadas.

`sesion_service.listar` usa `ordenar_mezcla` con los criterios `date`, `seats`,
`title` y `area`. Los filtros y la búsqueda siguen siendo recorridos lineales
hechos a mano en `sesion_service.listar`; `area_service.obtener_por_nombre`
también recorre las áreas linealmente.

---

## 10. Autenticación y seguridad

- La autenticación usa **sesión de servidor** con cookie `HttpOnly`, no JWT en
  `localStorage`.
- Las contraseñas se almacenan con **Argon2id**.
- El token de sesión es aleatorio y en la base solo se guarda su hash SHA-256.
- La cookie es `SameSite=Lax`, `Path=/` y `Secure` se activa con
  `GEA_SECURE_COOKIES=true` en producción.
- La sesión expira por tiempo absoluto (`GEA_SESSION_HOURS`) y por inactividad
  (`GEA_SESSION_IDLE_MINUTES`).
- Las peticiones de escritura con un `Origin` no permitido responden `403`.
- CORS usa orígenes explícitos y `allow_credentials=True`.
- `GET /auth/me` devuelve `200` con `null` cuando no hay sesión, para que el
  frontend pueda arrancar sin errores `401`.

---

## 11. Pruebas y verificación

### Backend

```bash
cd Gea/Backend
.venv\Scripts\python.exe -m pytest
```

En Linux/macOS:

```bash
.venv/bin/python -m pytest
```

Resultado actual: **51 pruebas aprobadas**.

| Archivo | Qué cubre |
|---|---|
| `tests/test_algoritmos.py` | Merge sort, intervalos y casos borde |
| `tests/test_auth.py` | Login, cookie, logout, roles y origen |
| `tests/test_sesiones.py` | Listados, filtros, detalle, CRUD y conflictos |
| `tests/test_inscripciones.py` | Reservas, duplicados, cupos, cruces, sesiones pasadas y cancelación |
| `tests/test_usuarios.py` | Tutores, permisos, CRUD y sesiones propias |
| `tests/test_salones.py` | Listado, CRUD y restricciones |
| `tests/test_reportes.py` | Resumen, áreas y ocupación |
| `tests/test_contacto.py` | Persistencia y validación del formulario |

### Frontend

```bash
cd Gea/Frontend
npm run build
npm run preview
```

`npm run build` compila la aplicación para producción en `Frontend/dist`.

---

## 12. Documentación adicional

- [`Backend/README.md`](Backend/README.md): instalación y ejecución del backend.
- [`Backend/ESTRUCTURA_API_REST.md`](Backend/ESTRUCTURA_API_REST.md): capas,
  archivos y responsabilidades.
- [`Frontend/README.md`](Frontend/README.md): páginas y estructura del frontend.

---

## 13. Decisiones de diseño

1. **IDs de texto** (`t1`, `calculo-limites`) para conservar los enlaces del
   prototipo.
2. **Fechas en UTC**; el frontend las muestra en hora de Bogotá (UTC−5).
3. **Reuniones unificadas** con sesiones mediante el campo `tipo`.
4. **Materias del tutor** como lista JSON de texto libre.
5. **Disponibilidad** como texto libre (`Lun · Mié · Vie`).
6. **Salones** en tabla propia con capacidad y CRUD.
7. **Imágenes** como URL almacenada; no hay subida de archivos.
8. **Contacto** persistido en la tabla `mensajes_contacto`.
9. **Login** con sesión de servidor y cookie `HttpOnly`; se descartó JWT en
   `localStorage`.
10. **Datos iniciales** con fechas futuras relativas al día de arranque.

---

## 14. Pendientes opcionales

El sistema cumple el alcance actual. Para una siguiente fase:

- Limitar intentos de login y agregar bloqueo temporal.
- Agregar un token CSRF explícito además de la validación de `Origin`.
- Usar migraciones con Alembic en lugar de `create_all`.
- Paginar listados grandes.
- Permitir subida de imágenes en lugar de URLs.
- Usar los filtros de la API directamente desde el frontend.
- Configurar integración continua para ejecutar `pytest` y `npm run build`.
