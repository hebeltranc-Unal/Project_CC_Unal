from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.api.deps import requiere_rol
from app.controllers import reporte_controller
from app.db.session import get_db
from app.models.usuario import Usuario
from app.schemas.reporte import AreaReporteSalida, OcupacionSalida, ResumenSalida

router = APIRouter(prefix="/reportes", tags=["Reportes"])


@router.get("/resumen", response_model=ResumenSalida)
def resumen(
    db: Session = Depends(get_db),
    _: Usuario = Depends(requiere_rol("coordinador")),
):
    return reporte_controller.resumen(db)


@router.get("/areas", response_model=list[AreaReporteSalida])
def areas(
    db: Session = Depends(get_db),
    _: Usuario = Depends(requiere_rol("coordinador")),
):
    return reporte_controller.areas(db)


@router.get("/ocupacion", response_model=list[OcupacionSalida])
def ocupacion(
    db: Session = Depends(get_db),
    _: Usuario = Depends(requiere_rol("coordinador")),
):
    return reporte_controller.ocupacion(db)
