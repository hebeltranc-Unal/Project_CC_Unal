# GEA Frontend

Aplicación React + Vite conectada a la API REST de GEA.

## Requisitos

- Node.js 20 o superior.
- El backend de `Gea/Backend` ejecutándose en `http://localhost:8000`.

## Cómo ejecutar

En una terminal, desde `Gea/Backend`:

```bash
.venv\Scripts\activate
uvicorn app.main:app --reload --port 8000
```

En otra terminal, desde `Gea/Frontend`:

```bash
npm install
npm run dev
```

La aplicación estará en `http://localhost:5173`.

## Variables de entorno

Copiar `.env.example` a `.env` si se necesita cambiar la URL de la API:

```text
VITE_API_URL=http://localhost:8000/api/v1
```

Si no se define, se usa esa misma URL por defecto.

## Usuarios de demostración

| Rol | Correo | Contraseña | Panel |
|---|---|---|---|
| Estudiante | `estudiante@unal.edu.co` | `Estudiante123` | `/mis-reservas` |
| Tutor | `tutor@unal.edu.co` | `Tutor123` | `/tutor` |
| Coordinador | `coordinador@unal.edu.co` | `Coordinador123` | `/admin` |

La sesión se guarda en una cookie `HttpOnly`. El frontend no guarda tokens en `localStorage`.

## Páginas

- `/` Inicio
- `/sesiones` Listado y filtros de sesiones
- `/sesiones/:id` Detalle de una sesión
- `/tutores` Directorio de pares tutores
- `/recursos` Recursos de estudio
- `/contacto` Contacto
- `/login` Inicio de sesión
- `/mis-reservas` Vista del estudiante, protegida
- `/tutor` Panel del tutor, protegido
- `/admin` Panel administrativo, protegido para coordinadores

## Estructura

```text
src/
├── componentes/       componentes reutilizables y de layout
├── contextos/         AuthContext para la sesión
├── datos/             catálogos estáticos (áreas y portadas)
├── estilos/
│   ├── base.css
│   ├── componentes/
│   └── paginas/
├── paginas/           vistas de la aplicación
├── servicios/         cliente HTTP de la API
└── utilidades/        fechas, texto y etiquetas
```

## Verificación

```bash
npm run build
npm run preview
```
