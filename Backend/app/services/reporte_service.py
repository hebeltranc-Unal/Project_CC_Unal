from sqlalchemy import select
from sqlalchemy.orm import Session, selectinload

from app.core.validaciones import a_iso_z
from app.models.area import Area
from app.models.inscripcion import Inscripcion
from app.models.sesion import Sesion
from app.schemas.reporte import AreaReporteSalida, OcupacionSalida, ResumenSalida


def _sesiones(db: Session) -> list[Sesion]:
    return list(
        db.scalars(
            select(Sesion)
            .options(
                selectinload(Sesion.area),
                selectinload(Sesion.inscripciones).selectinload(Inscripcion.estudiante),
            )
            .order_by(Sesion.fecha)
        )
    )


def resumen(db: Session) -> ResumenSalida:
    sesiones = _sesiones(db)
    total_inscritos = sum(len(sesion.inscripciones) for sesion in sesiones)
    total_capacidad = sum(sesion.cupo_maximo for sesion in sesiones)
    promedio = (
        round(total_inscritos / total_capacidad * 100) if total_capacidad else 0
    )
    completas = sum(
        1
        for sesion in sesiones
        if sesion.cupo_maximo > 0
        and len(sesion.inscripciones) >= sesion.cupo_maximo
    )
    return ResumenSalida(
        totalInscripciones=total_inscritos,
        sesionesActivas=len(sesiones),
        ocupacionPromedio=promedio,
        sesionesCompletas=completas,
    )


def areas(db: Session) -> list[AreaReporteSalida]:
    sesiones = _sesiones(db)
    resultado: list[AreaReporteSalida] = []
    for area in db.scalars(select(Area).order_by(Area.nombre)):
        sesiones_area = [sesion for sesion in sesiones if sesion.area_id == area.id]
        inscritos = sum(len(sesion.inscripciones) for sesion in sesiones_area)
        capacidad = sum(sesion.cupo_maximo for sesion in sesiones_area)
        porcentaje = round(inscritos / capacidad * 100) if capacidad else 0
        resultado.append(
            AreaReporteSalida(
                name=area.nombre,
                enrolled=inscritos,
                capacity=capacidad,
                percentage=porcentaje,
            )
        )
    return resultado


def ocupacion(db: Session) -> list[OcupacionSalida]:
    resultado: list[OcupacionSalida] = []
    for sesion in _sesiones(db):
        inscritos = len(sesion.inscripciones)
        porcentaje = (
            round(inscritos / sesion.cupo_maximo * 100)
            if sesion.cupo_maximo
            else 0
        )
        resultado.append(
            OcupacionSalida(
                id=sesion.id,
                title=sesion.titulo,
                subject=sesion.asignatura,
                area=sesion.area.nombre,
                date=a_iso_z(sesion.fecha),
                enrolled=inscritos,
                capacity=sesion.cupo_maximo,
                percentage=porcentaje,
                full=sesion.cupo_maximo > 0 and inscritos >= sesion.cupo_maximo,
            )
        )
    return resultado
