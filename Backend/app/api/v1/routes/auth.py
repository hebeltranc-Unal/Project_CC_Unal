from fastapi import APIRouter, Depends, Request, Response
from sqlalchemy.orm import Session

from app.api.deps import token_actual, usuario_actual_opcional
from app.controllers import auth_controller
from app.core.config import settings
from app.db.session import get_db
from app.models.usuario import Usuario
from app.schemas.auth import LoginEntrada, UsuarioSalida
from app.schemas.comun import MensajeSalida
from app.services.serializadores import serializar_usuario

router = APIRouter(prefix="/auth", tags=["Autenticación"])


@router.post("/login", response_model=UsuarioSalida)
def login(
    datos: LoginEntrada,
    request: Request,
    response: Response,
    db: Session = Depends(get_db),
):
    usuario, token = auth_controller.login(db, datos, request)
    response.set_cookie(
        key=settings.session_cookie,
        value=token,
        httponly=True,
        secure=settings.secure_cookies,
        samesite="lax",
        max_age=settings.session_hours * 3600,
        path="/",
    )
    return usuario


@router.get("/me", response_model=UsuarioSalida | None)
def me(usuario: Usuario | None = Depends(usuario_actual_opcional)):
    if not usuario:
        return None
    return serializar_usuario(usuario)


@router.post("/logout", response_model=MensajeSalida)
def logout(
    response: Response,
    token: str | None = Depends(token_actual),
    db: Session = Depends(get_db),
):
    resultado = auth_controller.logout(db, token)
    response.delete_cookie(
        key=settings.session_cookie,
        path="/",
        httponly=True,
        secure=settings.secure_cookies,
        samesite="lax",
    )
    return resultado
