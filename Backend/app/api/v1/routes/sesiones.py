from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session

from app.api.deps import requiere_rol
from app.controllers import sesion_controller
from app.db.session import get_db
from app.models.usuario import Usuario
from app.schemas.comun import MensajeSalida
from app.schemas.inscripcion import InscritoSalida
from app.schemas.sesion import SesionActualizar, SesionEntrada, SesionSalida

router = APIRouter(prefix="/sesiones", tags=["Sesiones"])


@router.get("", response_model=list[SesionSalida])
def listar(
    area: str | None = Query(default=None),
    tutor_id: str | None = Query(default=None),
    modalidad: str | None = Query(default=None),
    franja: str | None = Query(default=None),
    busqueda: str | None = Query(default=None),
    orden: str = Query(default="date"),
    kind: str = Query(default="sesion"),
    db: Session = Depends(get_db),
):
    return sesion_controller.listar(
        db,
        area=area,
        tutor_id=tutor_id,
        modalidad=modalidad,
        franja=franja,
        busqueda=busqueda,
        orden=orden,
        kind=kind,
    )


@router.get("/{sesion_id}", response_model=SesionSalida)
def obtener(sesion_id: str, db: Session = Depends(get_db)):
    return sesion_controller.obtener(db, sesion_id)


@router.post("", response_model=SesionSalida, status_code=201)
def crear(
    datos: SesionEntrada,
    db: Session = Depends(get_db),
    usuario: Usuario = Depends(requiere_rol("tutor", "coordinador")),
):
    return sesion_controller.crear(db, datos, usuario)


@router.put("/{sesion_id}", response_model=SesionSalida)
def actualizar(
    sesion_id: str,
    datos: SesionActualizar,
    db: Session = Depends(get_db),
    usuario: Usuario = Depends(requiere_rol("tutor", "coordinador")),
):
    return sesion_controller.actualizar(db, sesion_id, datos, usuario)


@router.delete("/{sesion_id}", response_model=MensajeSalida)
def eliminar(
    sesion_id: str,
    db: Session = Depends(get_db),
    usuario: Usuario = Depends(requiere_rol("tutor", "coordinador")),
):
    return sesion_controller.eliminar(db, sesion_id, usuario)


@router.get("/{sesion_id}/inscritos", response_model=list[InscritoSalida])
def inscritos(
    sesion_id: str,
    db: Session = Depends(get_db),
    usuario: Usuario = Depends(requiere_rol("tutor", "coordinador")),
):
    return sesion_controller.inscritos(db, sesion_id, usuario)
