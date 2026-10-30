from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.api.deps import requiere_rol
from app.controllers import salon_controller
from app.db.session import get_db
from app.models.usuario import Usuario
from app.schemas.comun import MensajeSalida
from app.schemas.salon import SalonEntrada, SalonSalida

router = APIRouter(prefix="/salones", tags=["Salones"])


@router.get("", response_model=list[SalonSalida])
def listar(db: Session = Depends(get_db)):
    return salon_controller.listar(db)


@router.post("", response_model=SalonSalida, status_code=201)
def crear(
    datos: SalonEntrada,
    db: Session = Depends(get_db),
    _: Usuario = Depends(requiere_rol("coordinador")),
):
    return salon_controller.crear(db, datos)


@router.put("/{salon_id}", response_model=SalonSalida)
def actualizar(
    salon_id: str,
    datos: SalonEntrada,
    db: Session = Depends(get_db),
    _: Usuario = Depends(requiere_rol("coordinador")),
):
    return salon_controller.actualizar(db, salon_id, datos)


@router.delete("/{salon_id}", response_model=MensajeSalida)
def eliminar(
    salon_id: str,
    db: Session = Depends(get_db),
    _: Usuario = Depends(requiere_rol("coordinador")),
):
    return salon_controller.eliminar(db, salon_id)
