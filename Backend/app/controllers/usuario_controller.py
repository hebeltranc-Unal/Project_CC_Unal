from sqlalchemy.orm import Session

from app.models.usuario import Usuario
from app.schemas.usuario import UsuarioActualizar, UsuarioEntrada
from app.services import sesion_service, usuario_service
from app.services.serializadores import (
    serializar_sesion,
    serializar_tutor,
    serializar_usuario,
)


def _detalle(usuario: Usuario) -> dict:
    return {
        **serializar_usuario(usuario),
        "subjects": usuario.materias or [],
        "availability": usuario.disponibilidad,
    }


def listar(db: Session, rol: str | None = None) -> list[dict]:
    usuarios = usuario_service.listar(db, rol)
    if rol == "tutor":
        return [serializar_tutor(usuario) for usuario in usuarios]
    return [_detalle(usuario) for usuario in usuarios]


def obtener(db: Session, usuario_id: str) -> dict:
    usuario = usuario_service.obtener(db, usuario_id)
    if usuario.rol == "tutor":
        return serializar_tutor(usuario)
    return _detalle(usuario)


def crear(db: Session, datos: UsuarioEntrada) -> dict:
    usuario = usuario_service.crear(db, datos)
    if usuario.rol == "tutor":
        return serializar_tutor(usuario)
    return _detalle(usuario)


def actualizar(db: Session, usuario_id: str, datos: UsuarioActualizar) -> dict:
    usuario = usuario_service.actualizar(db, usuario_id, datos)
    if usuario.rol == "tutor":
        return serializar_tutor(usuario)
    return _detalle(usuario)


def eliminar(db: Session, usuario_id: str) -> dict:
    usuario_service.eliminar(db, usuario_id)
    return {"ok": True, "mensaje": "Tutor eliminado"}


def sesiones(db: Session, usuario_id: str, usuario: Usuario) -> list[dict]:
    return [
        serializar_sesion(sesion)
        for sesion in sesion_service.sesiones_de_tutor(db, usuario_id, usuario)
    ]
