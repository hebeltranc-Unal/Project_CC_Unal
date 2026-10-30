from sqlalchemy.orm import Session

from app.models.usuario import Usuario
from app.schemas.sesion import SesionActualizar, SesionEntrada
from app.services import sesion_service
from app.services.serializadores import serializar_sesion


def listar(
    db: Session,
    area: str | None = None,
    tutor_id: str | None = None,
    modalidad: str | None = None,
    franja: str | None = None,
    busqueda: str | None = None,
    orden: str = "date",
    kind: str = "sesion",
) -> list[dict]:
    sesiones = sesion_service.listar(
        db,
        area=area,
        tutor_id=tutor_id,
        modalidad=modalidad,
        franja=franja,
        busqueda=busqueda,
        orden=orden,
        kind=kind,
    )
    return [serializar_sesion(sesion) for sesion in sesiones]


def obtener(db: Session, sesion_id: str) -> dict:
    return serializar_sesion(sesion_service.obtener(db, sesion_id))


def crear(db: Session, datos: SesionEntrada, usuario: Usuario) -> dict:
    return serializar_sesion(sesion_service.crear(db, datos, usuario))


def actualizar(
    db: Session, sesion_id: str, datos: SesionActualizar, usuario: Usuario
) -> dict:
    return serializar_sesion(
        sesion_service.actualizar(db, sesion_id, datos, usuario)
    )


def eliminar(db: Session, sesion_id: str, usuario: Usuario) -> dict:
    sesion_service.eliminar(db, sesion_id, usuario)
    return {"ok": True, "mensaje": "Sesión eliminada"}


def inscritos(db: Session, sesion_id: str, usuario: Usuario) -> list[dict]:
    return sesion_service.inscritos(db, sesion_id, usuario)
