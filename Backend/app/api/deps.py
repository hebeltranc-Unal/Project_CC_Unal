from fastapi import Depends, Request
from sqlalchemy.orm import Session

from app.core.config import settings
from app.core.exceptions import NoAutorizado, Prohibido
from app.db.session import get_db
from app.models.usuario import Usuario
from app.services import auth_service


def token_actual(request: Request) -> str | None:
    return request.cookies.get(settings.session_cookie)


def usuario_actual(
    request: Request, db: Session = Depends(get_db)
) -> Usuario:
    usuario = auth_service.obtener_usuario_por_token(
        db, token_actual(request)
    )
    if not usuario:
        raise NoAutorizado()
    return usuario


def usuario_actual_opcional(
    request: Request, db: Session = Depends(get_db)
) -> Usuario | None:
    return auth_service.obtener_usuario_por_token(
        db, token_actual(request)
    )


def requiere_rol(*roles: str):
    def dependencia(usuario: Usuario = Depends(usuario_actual)) -> Usuario:
        if usuario.rol not in roles:
            raise Prohibido()
        return usuario

    return dependencia
