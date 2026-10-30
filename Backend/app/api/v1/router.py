from fastapi import APIRouter

from app.api.v1.routes import (
    areas,
    auth,
    contacto,
    inscripciones,
    reportes,
    salones,
    sesiones,
    usuarios,
)

router = APIRouter()
router.include_router(auth.router)
router.include_router(areas.router)
router.include_router(usuarios.router)
router.include_router(sesiones.router)
router.include_router(inscripciones.router)
router.include_router(salones.router)
router.include_router(reportes.router)
router.include_router(contacto.router)
