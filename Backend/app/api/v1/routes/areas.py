from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.api.deps import requiere_rol
from app.controllers import area_controller
from app.db.session import get_db
from app.models.usuario import Usuario
from app.schemas.area import AreaEntrada, AreaSalida

router = APIRouter(prefix="/areas", tags=["Áreas"])


@router.get("", response_model=list[AreaSalida])
def listar(db: Session = Depends(get_db)):
    return area_controller.listar(db)


@router.post("", response_model=AreaSalida, status_code=201)
def crear(
    datos: AreaEntrada,
    db: Session = Depends(get_db),
    _: Usuario = Depends(requiere_rol("coordinador")),
):
    return area_controller.crear(db, datos)
