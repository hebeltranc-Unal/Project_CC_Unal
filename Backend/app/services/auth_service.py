from datetime import timedelta

from sqlalchemy import select
from sqlalchemy.orm import Session

from app.core.config import settings
from app.core.exceptions import NoAutorizado
from app.core.security import (
    ahora_utc,
    crear_token_sesion,
    hashear_token,
    verificar_password,
)
from app.models.sesion_auth import SesionAuth
from app.models.usuario import Usuario


def autenticar(db: Session, email: str, password: str) -> Usuario:
    usuario = db.scalar(
        select(Usuario).where(Usuario.correo == email.strip().lower())
    )
    if not usuario or not usuario.activo:
        raise NoAutorizado("Correo o contraseña incorrectos")
    if not verificar_password(password, usuario.password_hash):
        raise NoAutorizado("Correo o contraseña incorrectos")
    return usuario


def crear_sesion(
    db: Session,
    usuario: Usuario,
    ip: str = "",
    user_agent: str = "",
) -> str:
    token = crear_token_sesion()
    ahora = ahora_utc()
    sesion = SesionAuth(
        usuario_id=usuario.id,
        token_hash=hashear_token(token),
        creada_en=ahora,
        expira_en=ahora + timedelta(hours=settings.session_hours),
        ultimo_uso=ahora,
        ip=ip or "",
        user_agent=(user_agent or "")[:255],
    )
    db.add(sesion)
    db.commit()
    return token


def obtener_usuario_por_token(db: Session, token: str | None) -> Usuario | None:
    if not token:
        return None

    sesion = db.scalar(
        select(SesionAuth).where(SesionAuth.token_hash == hashear_token(token))
    )
    if not sesion or sesion.revocada_en is not None:
        return None

    ahora = ahora_utc()
    if sesion.expira_en <= ahora:
        sesion.revocada_en = ahora
        db.commit()
        return None

    inactividad = timedelta(minutes=settings.session_idle_minutes)
    if sesion.ultimo_uso + inactividad <= ahora:
        sesion.revocada_en = ahora
        db.commit()
        return None

    sesion.ultimo_uso = ahora
    db.commit()
    return sesion.usuario


def cerrar_sesion(db: Session, token: str | None) -> None:
    if not token:
        return
    sesion = db.scalar(
        select(SesionAuth).where(SesionAuth.token_hash == hashear_token(token))
    )
    if sesion and sesion.revocada_en is None:
        sesion.revocada_en = ahora_utc()
        db.commit()
