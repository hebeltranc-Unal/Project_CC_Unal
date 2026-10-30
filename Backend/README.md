# GEA Backend

API REST del sistema GEA construida con FastAPI, SQLAlchemy y SQLite.

## Requisitos

- Python 3.11 o superior.

## Instalación

```bash
cd Gea/Backend
python -m venv .venv
.venv\Scripts\activate
pip install -r requirements.txt
```

En Linux/macOS:

```bash
source .venv/bin/activate
```

## Ejecución

```bash
uvicorn app.main:app --reload --port 8000
```

- API: `http://localhost:8000/api/v1`
- Documentación: `http://localhost:8000/docs`
- Salud: `http://localhost:8000/health`

## Usuarios de demostración

| Rol | Correo | Contraseña |
|---|---|---|
| Estudiante | `estudiante@unal.edu.co` | `Estudiante123` |
| Tutor | `tutor@unal.edu.co` | `Tutor123` |
| Coordinador | `coordinador@unal.edu.co` | `Coordinador123` |

La base de datos se crea y se siembra automáticamente la primera vez.

## Configuración

Copiar `.env.example` a `.env` y ajustar si es necesario:

```text
GEA_DATABASE_URL=sqlite:///./gea.db
GEA_CORS_ORIGINS=http://localhost:5173,http://127.0.0.1:5173,http://localhost:4173
GEA_SECURE_COOKIES=false
GEA_SESSION_HOURS=8
GEA_SESSION_IDLE_MINUTES=120
GEA_SEED_DEMO=true
```

## Autenticación

La API usa sesiones del lado del servidor con cookie `HttpOnly`.

- `POST /api/v1/auth/login`
- `GET /api/v1/auth/me`
- `POST /api/v1/auth/logout`

El frontend debe enviar las peticiones con `credentials: "include"`.

## Endpoints principales

| Recurso | Rutas |
|---|---|
| Autenticación | `POST /auth/login`, `GET /auth/me`, `POST /auth/logout` |
| Áreas | `GET /areas`, `POST /areas` |
| Tutores y usuarios | `GET /usuarios?rol=tutor`, `GET /usuarios/{id}`, `POST/PUT/DELETE /usuarios` |
| Sesiones | `GET /sesiones`, `GET /sesiones/{id}`, `POST/PUT/DELETE /sesiones` |
| Inscripciones | `POST /sesiones/{id}/inscripciones`, `DELETE /sesiones/{id}/inscripciones/{estudiante_id}`, `GET /estudiantes/{id}/inscripciones` |
| Salones | `GET /salones`, `POST/PUT/DELETE /salones` |
| Reportes | `GET /reportes/resumen`, `GET /reportes/areas`, `GET /reportes/ocupacion` |
| Contacto | `POST /contacto` |

El catálogo completo, con permisos y filtros, está en
`Api JUANCA/NIVELACION_BACKEND_FRONTEND.md`.
La equivalencia con el núcleo anterior está en
`Api JUANCA/MIGRACION_LOGICA_ANTERIOR.md`.

## Pruebas

```bash
.venv\Scripts\python.exe -m pytest
```

Las pruebas usan una base SQLite en memoria y no modifican `gea.db`.
Actualmente son **51 pruebas**. Incluyen `tests/test_algoritmos.py`, que cubre
el merge sort y el cruce de intervalos.

## Algoritmos implementados a mano

`app/core/algoritmos.py` conserva:

- `mezclar` y `ordenar_mezcla`: merge sort recursivo, sin `sorted` ni
  `list.sort`, que devuelve una lista nueva.
- `se_cruzan`: cruce de intervalos con desigualdad estricta.

`sesion_service.listar` usa `ordenar_mezcla` para los órdenes `date`, `seats`,
`title` y `area`; `sesion_service._buscar_conflicto` e
`inscripcion_service.crear` usan `se_cruzan`. Los filtros y la búsqueda siguen
siendo recorridos lineales escritos a mano.

## Estructura

```text
app/
├── main.py
├── core/          configuración, constantes, errores, seguridad, validaciones y algoritmos
├── db/            conexión, creación de tablas y datos iniciales
├── models/        tablas SQLAlchemy
├── schemas/       contratos Pydantic
├── services/      reglas de negocio
├── controllers/   coordinación entre rutas y servicios
└── api/
    ├── deps.py
    └── v1/
        ├── router.py
        └── routes/

tests/             pruebas de API con pytest
pytest.ini
```

Para reiniciar los datos de demostración, detener el servidor, borrar `gea.db` y
volver a iniciarlo. El `seed` genera fechas futuras relativas al día de arranque,
así que la demo siempre tiene sesiones próximas.
