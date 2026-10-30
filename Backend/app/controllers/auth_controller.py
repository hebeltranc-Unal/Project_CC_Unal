from fastapi import Request
from sqlalchemy.orm import Session

from app.schemas.auth import LoginEntrada
from app.services import auth_service
from app.services.serializadores import serializar_usuario


def login(db: Session, datos: LoginEntrada, request: Request) -> tuple[dict, str]:
    usuario = auth_service.autenticar(db, datos.email, datos.password)
    token = auth_service.crear_sesion(
        db,
        usuario,
        ip=request.client.host if request.client else "",
        user_agent=request.headers.get("user-agent", ""),
    )
    return serializar_usuario(usuario), token


def logout(db: Session, token: str | None) -> dict:
    auth_service.cerrar_sesion(db, token)
    return {"ok": True, "mensaje": "Sesión cerrada"}
