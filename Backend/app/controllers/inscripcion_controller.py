from sqlalchemy.orm import Session

from app.models.usuario import Usuario
from app.services import inscripcion_service
from app.services.serializadores import serializar_sesion


def crear(db: Session, sesion_id: str, usuario: Usuario) -> dict:
    return serializar_sesion(inscripcion_service.crear(db, sesion_id, usuario))


def cancelar(
    db: Session, sesion_id: str, estudiante_id: str, usuario: Usuario
) -> dict:
    inscripcion_service.cancelar(db, sesion_id, estudiante_id, usuario)
    return {"ok": True, "mensaje": "Reserva cancelada"}


def por_estudiante(
    db: Session, estudiante_id: str, usuario: Usuario
) -> list[dict]:
    return [
        serializar_sesion(sesion)
        for sesion in inscripcion_service.listar_por_estudiante(
            db, estudiante_id, usuario
        )
    ]


def listar(
    db: Session,
    usuario: Usuario,
    busqueda: str | None = None,
    area: str | None = None,
    sesion_id: str | None = None,
) -> list[dict]:
    return inscripcion_service.listar_todas(
        db,
        usuario,
        busqueda=busqueda,
        area=area,
        sesion_id=sesion_id,
    )
