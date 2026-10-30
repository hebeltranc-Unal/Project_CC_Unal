from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session

from app.api.deps import requiere_rol, usuario_actual, usuario_actual_opcional
from app.controllers import usuario_controller
from app.db.session import get_db
from app.models.usuario import Usuario
from app.schemas.comun import MensajeSalida
from app.schemas.sesion import SesionSalida
from app.schemas.usuario import (
    TutorSalida,
    UsuarioActualizar,
    UsuarioDetalleSalida,
    UsuarioEntrada,
)

router = APIRouter(prefix="/usuarios", tags=["Usuarios y tutores"])


@router.get("", response_model=list[TutorSalida | UsuarioDetalleSalida])
def listar(
    rol: str | None = Query(default="tutor"),
    db: Session = Depends(get_db),
    usuario: Usuario | None = Depends(usuario_actual_opcional),
):
    if rol != "tutor":
        if not usuario or usuario.rol != "coordinador":
            from app.core.exceptions import Prohibido

            raise Prohibido("Solo el coordinador puede listar todos los usuarios")
    return usuario_controller.listar(db, rol)


@router.get("/{usuario_id}", response_model=TutorSalida | UsuarioDetalleSalida)
def obtener(
    usuario_id: str,
    db: Session = Depends(get_db),
    usuario: Usuario | None = Depends(usuario_actual_opcional),
):
    detalle = usuario_controller.obtener(db, usuario_id)
    if detalle.get("role") in (None, "tutor"):
        return detalle
    if not usuario or usuario.rol != "coordinador":
        from app.core.exceptions import Prohibido

        raise Prohibido("No tienes permiso para ver este usuario")
    return detalle


@router.post("", response_model=TutorSalida | UsuarioDetalleSalida, status_code=201)
def crear(
    datos: UsuarioEntrada,
    db: Session = Depends(get_db),
    _: Usuario = Depends(requiere_rol("coordinador")),
):
    return usuario_controller.crear(db, datos)


@router.put("/{usuario_id}", response_model=TutorSalida | UsuarioDetalleSalida)
def actualizar(
    usuario_id: str,
    datos: UsuarioActualizar,
    db: Session = Depends(get_db),
    _: Usuario = Depends(requiere_rol("coordinador")),
):
    return usuario_controller.actualizar(db, usuario_id, datos)


@router.delete("/{usuario_id}", response_model=MensajeSalida)
def eliminar(
    usuario_id: str,
    db: Session = Depends(get_db),
    _: Usuario = Depends(requiere_rol("coordinador")),
):
    return usuario_controller.eliminar(db, usuario_id)


@router.get("/{usuario_id}/sesiones", response_model=list[SesionSalida])
def sesiones(
    usuario_id: str,
    db: Session = Depends(get_db),
    usuario: Usuario = Depends(requiere_rol("tutor", "coordinador")),
):
    return usuario_controller.sesiones(db, usuario_id, usuario)
