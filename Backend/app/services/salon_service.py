from uuid import uuid4

from sqlalchemy import select
from sqlalchemy.orm import Session

from app.core.exceptions import Conflicto, NoEncontrado
from app.models.salon import Salon
from app.schemas.salon import SalonEntrada


def listar(db: Session) -> list[Salon]:
    return list(db.scalars(select(Salon).order_by(Salon.nombre)))


def obtener(db: Session, salon_id: str) -> Salon:
    salon = db.get(Salon, salon_id)
    if not salon:
        raise NoEncontrado("Salón no encontrado")
    return salon


def crear(db: Session, datos: SalonEntrada) -> Salon:
    existente = db.scalar(
        select(Salon).where(Salon.nombre == datos.name.strip())
    )
    if existente:
        raise Conflicto("Ya existe un salón con ese nombre")
    salon = Salon(
        id=f"r-{uuid4().hex[:8]}",
        nombre=datos.name.strip(),
        capacidad=datos.capacity,
    )
    db.add(salon)
    db.commit()
    db.refresh(salon)
    return salon


def actualizar(db: Session, salon_id: str, datos: SalonEntrada) -> Salon:
    salon = obtener(db, salon_id)
    salon.nombre = datos.name.strip()
    salon.capacidad = datos.capacity
    db.commit()
    db.refresh(salon)
    return salon


def eliminar(db: Session, salon_id: str) -> None:
    salon = obtener(db, salon_id)
    if salon.sesiones:
        raise Conflicto("No se puede eliminar un salón con sesiones asignadas")
    db.delete(salon)
    db.commit()
