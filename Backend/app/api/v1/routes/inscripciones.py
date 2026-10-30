from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session

from app.api.deps import requiere_rol
from app.controllers import inscripcion_controller
from app.db.session import get_db
from app.models.usuario import Usuario
from app.schemas.comun import MensajeSalida
from app.schemas.inscripcion import InscripcionSalida
from app.schemas.sesion import SesionSalida

router = APIRouter(tags=["Inscripciones"])


@router.post(
    "/sesiones/{sesion_id}/inscripciones",
    response_model=SesionSalida,
    status_code=201,
)
def crear(
    sesion_id: str,
    db: Session = Depends(get_db),
    usuario: Usuario = Depends(requiere_rol("estudiante")),
):
    return inscripcion_controller.crear(db, sesion_id, usuario)


@router.delete(
    "/sesiones/{sesion_id}/inscripciones/{estudiante_id}",
    response_model=MensajeSalida,
)
def cancelar(
    sesion_id: str,
    estudiante_id: str,
    db: Session = Depends(get_db),
    usuario: Usuario = Depends(requiere_rol("estudiante", "coordinador")),
):
    return inscripcion_controller.cancelar(
        db, sesion_id, estudiante_id, usuario
    )


@router.get(
    "/estudiantes/{estudiante_id}/inscripciones",
    response_model=list[SesionSalida],
)
def por_estudiante(
    estudiante_id: str,
    db: Session = Depends(get_db),
    usuario: Usuario = Depends(requiere_rol("estudiante", "coordinador")),
):
    return inscripcion_controller.por_estudiante(db, estudiante_id, usuario)


@router.get("/inscripciones", response_model=list[InscripcionSalida])
def listar(
    busqueda: str | None = Query(default=None),
    area: str | None = Query(default=None),
    sesion_id: str | None = Query(default=None),
    db: Session = Depends(get_db),
    usuario: Usuario = Depends(requiere_rol("coordinador")),
):
    return inscripcion_controller.listar(
        db,
        usuario,
        busqueda=busqueda,
        area=area,
        sesion_id=sesion_id,
    )
