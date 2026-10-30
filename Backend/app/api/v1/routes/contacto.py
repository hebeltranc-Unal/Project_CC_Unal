from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.controllers import contacto_controller
from app.db.session import get_db
from app.schemas.comun import MensajeSalida
from app.schemas.contacto import ContactoEntrada

router = APIRouter(prefix="/contacto", tags=["Contacto"])


@router.post("", response_model=MensajeSalida, status_code=201)
def crear(datos: ContactoEntrada, db: Session = Depends(get_db)):
    return contacto_controller.crear(db, datos)
