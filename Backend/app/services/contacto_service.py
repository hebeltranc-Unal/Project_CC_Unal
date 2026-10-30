from sqlalchemy.orm import Session

from app.models.contacto import MensajeContacto
from app.schemas.contacto import ContactoEntrada


def crear(db: Session, datos: ContactoEntrada) -> MensajeContacto:
    mensaje = MensajeContacto(
        nombre=datos.name.strip(),
        correo=datos.email.strip().lower(),
        mensaje=datos.message.strip(),
    )
    db.add(mensaje)
    db.commit()
    db.refresh(mensaje)
    return mensaje
