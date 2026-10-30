from sqlalchemy.orm import Session

from app.schemas.salon import SalonEntrada
from app.services import salon_service
from app.services.serializadores import serializar_salon


def listar(db: Session) -> list[dict]:
    return [serializar_salon(salon) for salon in salon_service.listar(db)]


def crear(db: Session, datos: SalonEntrada) -> dict:
    return serializar_salon(salon_service.crear(db, datos))


def actualizar(db: Session, salon_id: str, datos: SalonEntrada) -> dict:
    return serializar_salon(salon_service.actualizar(db, salon_id, datos))


def eliminar(db: Session, salon_id: str) -> dict:
    salon_service.eliminar(db, salon_id)
    return {"ok": True, "mensaje": "Salón eliminado"}
