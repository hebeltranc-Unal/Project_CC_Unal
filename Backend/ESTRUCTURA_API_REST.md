# Estructura de la API REST con FastAPI

> Documento de estructura de la implementación actual.

La API está construida con **FastAPI**, usando **Uvicorn**, **SQLAlchemy 2**, **Pydantic v2** y **SQLite**.

## Directorio

```text
backend/
│
├── app/
│   ├── __init__.py
│   ├── main.py                     # FastAPI(), CORS, lifespan e include_router
│   │
│   ├── core/
│   │   ├── __init__.py
│   │   ├── config.py               # BaseSettings: nombre, URL de SQLite, CORS
│   │   ├── constants.py            # roles, modalidades y tipos
│   │   ├── exceptions.py           # errores de negocio convertidos a HTTP
│   │   ├── security.py             # Argon2id, tokens y hash de sesión
│   │   ├── algoritmos.py           # merge sort y cruce de intervalos
│   │   └── validaciones.py         # correo, fechas, horas y normalización
│   │
│   ├── db/
│   │   ├── __init__.py
│   │   ├── base.py                 # DeclarativeBase de SQLAlchemy
│   │   ├── session.py              # create_engine, sessionmaker y get_db
│   │   ├── init_db.py              # Base.metadata.create_all
│   │   └── seed.py                 # datos iniciales y usuarios demo
│   │
│   ├── models/
│   │   ├── __init__.py
│   │   ├── area.py                 # tabla areas
│   │   ├── usuario.py              # tabla usuarios
│   │   ├── salon.py                # tabla salones
│   │   ├── sesion.py               # tabla sesiones
│   │   ├── inscripcion.py          # tabla inscripciones
│   │   ├── sesion_auth.py          # sesiones de autenticación
│   │   └── contacto.py             # mensajes de contacto
│   │
│   ├── schemas/
│   │   ├── __init__.py
│   │   ├── auth.py                 # login y usuario de sesión
│   │   ├── area.py
│   │   ├── usuario.py
│   │   ├── salon.py
│   │   ├── sesion.py
│   │   ├── inscripcion.py
│   │   ├── reporte.py
│   │   ├── contacto.py
│   │   └── comun.py
│   │
│   ├── services/
│   │   ├── __init__.py
│   │   ├── auth_service.py         # login, logout y validación de sesión
│   │   ├── area_service.py
│   │   ├── usuario_service.py
│   │   ├── salon_service.py
│   │   ├── sesion_service.py
│   │   ├── inscripcion_service.py
│   │   ├── reporte_service.py
│   │   ├── contacto_service.py
│   │   └── serializadores.py
│   │
│   ├── controllers/
│   │   ├── __init__.py
│   │   ├── auth_controller.py
│   │   ├── area_controller.py
│   │   ├── usuario_controller.py
│   │   ├── salon_controller.py
│   │   ├── sesion_controller.py
│   │   ├── inscripcion_controller.py
│   │   ├── reporte_controller.py
│   │   └── contacto_controller.py
│   │
│   └── api/
│       ├── __init__.py
│       ├── deps.py                 # get_db, usuario_actual y requiere_rol
│       └── v1/
│           ├── __init__.py
│           ├── router.py           # APIRouter que agrupa los routers
│           └── routes/
│               ├── __init__.py
│               ├── auth.py         # login, me y logout
│               ├── areas.py
│               ├── usuarios.py
│               ├── salones.py
│               ├── sesiones.py
│               ├── inscripciones.py
│               ├── reportes.py
│               └── contacto.py
│
├── tests/                          # pruebas de API con pytest
│   ├── __init__.py
│   ├── conftest.py                 # base SQLite en memoria y cliente de pruebas
│   ├── fechas.py                   # helper de fechas futuras para las pruebas
│   ├── test_algoritmos.py          # merge sort e intervalos
│   ├── test_auth.py
│   ├── test_sesiones.py
│   ├── test_inscripciones.py
│   ├── test_usuarios.py
│   ├── test_salones.py
│   ├── test_reportes.py
│   └── test_contacto.py
├── pytest.ini
├── requirements.txt
├── .env.example
└── README.md
```

## Explicación de cada parte

### `app/main.py`

Es el punto de entrada de FastAPI. Aquí se crea la aplicación:

- `FastAPI(title=..., lifespan=...)`.
- `CORSMiddleware` para permitir el frontend React.
- `include_router(router, prefix="/api/v1")`.
- Inicialización de la base de datos al arrancar.

### `app/core/`

Contiene la configuración y utilidades transversales:

- `config.py`: usa `BaseSettings` de `pydantic-settings` para leer variables de entorno.
- `constants.py`: roles, modalidades y tipos de registro.
- `exceptions.py`: errores de negocio (`404`, `409`, `401`, `403`) que `main.py` convierte en respuestas JSON.
- `security.py`: Argon2id, generación de tokens y hash SHA-256 de la sesión.
- `algoritmos.py`: merge sort (`mezclar`, `ordenar_mezcla`) y cruce de intervalos (`se_cruzan`), implementados a mano.
- `validaciones.py`: correo institucional, fechas, hora de Bogotá y normalización de texto.

### `app/db/`

Maneja la conexión con SQLite mediante SQLAlchemy:

- `base.py`: define `Base` con `DeclarativeBase`.
- `session.py`: crea el `engine`, `SessionLocal` y la dependencia `get_db`.
- `init_db.py`: crea las tablas con `Base.metadata.create_all`.
- `seed.py`: carga los datos de prueba iniciales.

### `app/models/`

Define las tablas con SQLAlchemy 2:

- `area.py`: áreas de conocimiento.
- `usuario.py`: estudiantes, tutores y coordinadores.
- `salon.py`: salones con capacidad.
- `sesion.py`: sesiones y reuniones.
- `inscripcion.py`: inscripciones de estudiantes.
- `sesion_auth.py`: sesiones de autenticación con cookie.
- `contacto.py`: mensajes del formulario de contacto.

### `app/schemas/`

Define los contratos de entrada y salida con Pydantic v2:

- `BaseModel` para cada request y response.
- `Field` para restricciones de longitud y rangos.
- Schemas específicos para login, usuarios, salones, sesiones, inscripciones,
  reportes y contacto.

FastAPI usa estos schemas automáticamente para validar y documentar la API en `/docs`.

### `app/services/`

Contiene las reglas de negocio, sin depender de FastAPI:

- Autenticar usuarios, crear y revocar sesiones.
- Registrar áreas, tutores y salones.
- Registrar sesiones y reuniones.
- Evitar cruces de horario entre tutor y salón.
- Controlar cupos.
- Evitar inscripciones duplicadas y cruces en la agenda del estudiante.
- Calcular reportes.
- Guardar mensajes de contacto.
- Serializar modelos a los nombres que espera el frontend.

Reciben una sesión de SQLAlchemy y devuelven datos o lanzan errores de negocio.

### Algoritmos implementados a mano

`app/core/algoritmos.py` concentra los algoritmos que no deben depender de
funciones de ordenamiento de la biblioteca:

- `mezclar` y `ordenar_mezcla`: merge sort recursivo, sin `sorted` ni
  `list.sort`, que devuelve una lista nueva.
- `se_cruzan`: comparación de intervalos con desigualdad estricta, para que dos
  sesiones consecutivas no se consideren cruzadas.

`sesion_service.listar` usa `ordenar_mezcla` con `_clave_orden` para los
criterios `date`, `seats`, `title` y `area`. Los filtros y la búsqueda son
recorridos lineales en el mismo service; `area_service.obtener_por_nombre`
también recorre las áreas linealmente.

### `app/controllers/`

Recibe los datos validados por los schemas, llama al service y transforma el
resultado en un diccionario listo para el `response_model`. Los errores de negocio
se lanzan como excepciones propias y un manejador global en `main.py` los convierte
en respuestas HTTP con el código correspondiente.

### `app/api/`

Es la capa HTTP de FastAPI:

- `deps.py`: dependencias reutilizables con `Depends`: `get_db`, `usuario_actual`,
  `usuario_actual_opcional` y `requiere_rol`.
- `v1/router.py`: un `APIRouter` que agrupa todos los routers.
- `v1/routes/`: un `APIRouter` por recurso, con sus métodos `GET`, `POST`, `PUT` y `DELETE`.

Ejemplo conceptual de una ruta:

```python
router = APIRouter(prefix="/sesiones", tags=["Sesiones"])

@router.get("", response_model=list[SesionSalida])
def listar_sesiones(db: Session = Depends(get_db)):
    return sesion_controller.listar(db)
```

### `tests/`

Pruebas de la API usando `TestClient` de FastAPI y `pytest`. La base de pruebas es
SQLite en memoria, así que no modifican `gea.db`.

```bash
.venv\Scripts\python.exe -m pytest
```

El catálogo completo de endpoints está en [`README.md`](README.md) y en la
documentación interactiva `/docs`.

## Flujo de una petición

```text
@router.get / @router.post
        ↓
controller
        ↓
service
        ↓
models + sesión SQLAlchemy
        ↓
response_model de Pydantic
```

1. FastAPI valida la entrada con el schema.
2. La ruta llama al controller.
3. El controller llama al service.
4. El service aplica las reglas y usa los models.
5. FastAPI serializa la respuesta con el `response_model`.

## Equivalencia con el núcleo anterior `gea/`

| Archivo anterior | Nuevo lugar |
|---|---|
| `gea/modelo.py` | `app/models/` y `app/db/base.py` |
| `gea/negocio.py` | `app/services/` |
| `gea/consultas.py` | `app/core/algoritmos.py` y `app/services/sesion_service.py` |
| `gea/reportes.py` | `app/services/reporte_service.py` |
| `gea/persistencia.py` | `app/db/session.py` |
| `gea/validaciones.py` | `app/core/validaciones.py` y `app/core/algoritmos.py` |
| `gea/constantes.py` | `app/core/constants.py` |
| `gea/datos_prueba.py` | `app/db/seed.py` |

## Dependencias

```text
fastapi==0.162.0
uvicorn[standard]==0.54.0
sqlalchemy==2.1.6
pydantic==2.14.2
pydantic-settings==2.16.2
argon2-cffi==25.1.0
httpx==0.28.1
pytest==9.2.0
```

Están fijadas en `requirements.txt`.
