from sqlalchemy.orm import Session

from app.schemas.contacto import ContactoEntrada
from app.services import contacto_service


def crear(db: Session, datos: ContactoEntrada) -> dict:
    contacto_service.crear(db, datos)
    return {"ok": True, "mensaje": "Mensaje enviado. Te responderemos pronto."}
