from sqlalchemy import select
from sqlalchemy.orm import Session

from app.core.exceptions import Conflicto, NoEncontrado
from app.core.validaciones import normalizar
from app.models.area import Area


def listar(db: Session) -> list[Area]:
    return list(db.scalars(select(Area).order_by(Area.nombre)))


def obtener_por_nombre(db: Session, nombre: str) -> Area:
    buscada = normalizar(nombre)
    for area in db.scalars(select(Area)):
        if normalizar(area.nombre) == buscada:
            return area
    raise NoEncontrado(f"El área '{nombre}' no existe")


def crear(db: Session, nombre: str) -> Area:
    nombre = nombre.strip()
    existente = db.scalar(select(Area).where(Area.nombre == nombre))
    if existente:
        raise Conflicto("Ya existe un área con ese nombre")
    area = Area(nombre=nombre)
    db.add(area)
    db.commit()
    db.refresh(area)
    return area
