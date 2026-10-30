from sqlalchemy.orm import Session

from app.schemas.area import AreaEntrada
from app.services import area_service
from app.services.serializadores import serializar_area


def listar(db: Session) -> list[dict]:
    return [serializar_area(area) for area in area_service.listar(db)]


def crear(db: Session, datos: AreaEntrada) -> dict:
    return serializar_area(area_service.crear(db, datos.name))
