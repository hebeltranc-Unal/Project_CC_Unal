from contextlib import asynccontextmanager

from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse

from app.api.v1.router import router
from app.core.config import settings
from app.core.exceptions import ErrorAplicacion
from app.db.init_db import crear_tablas
from app.db.seed import crear_datos_iniciales
from app.db.session import SessionLocal


@asynccontextmanager
async def lifespan(_: FastAPI):
    crear_tablas()
    if settings.seed_demo:
        with SessionLocal() as db:
            crear_datos_iniciales(db)
    yield


app = FastAPI(
    title=settings.app_name,
    description="API REST del sistema de gestión GEA",
    version="1.0.0",
    lifespan=lifespan,
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.middleware("http")
async def validar_origen(request: Request, call_next):
    if request.method in {"POST", "PUT", "PATCH", "DELETE"}:
        origen = request.headers.get("origin")
        if origen and origen not in settings.origins:
            return JSONResponse(
                status_code=403,
                content={"detail": "Origen no permitido"},
            )
    return await call_next(request)


@app.exception_handler(ErrorAplicacion)
async def manejar_error_aplicacion(_: Request, error: ErrorAplicacion):
    return JSONResponse(
        status_code=error.estado,
        content={"detail": error.mensaje},
    )


app.include_router(router, prefix=settings.api_prefix)


@app.get("/health", tags=["Sistema"])
def health():
    return {"ok": True, "app": settings.app_name}


@app.get("/", tags=["Sistema"])
def root():
    return {
        "app": settings.app_name,
        "docs": "/docs",
        "api": settings.api_prefix,
    }
