from uuid import uuid4

from sqlalchemy import select
from sqlalchemy.orm import Session

from app.core.constants import ROLES_VALIDOS
from app.core.exceptions import Conflicto, NoEncontrado
from app.core.security import hashear_password
from app.core.validaciones import es_correo_institucional
from app.models.usuario import Usuario
from app.schemas.usuario import UsuarioActualizar, UsuarioEntrada


def listar(db: Session, rol: str | None = None) -> list[Usuario]:
    consulta = select(Usuario).where(Usuario.activo.is_(True)).order_by(Usuario.nombre)
    if rol:
        consulta = consulta.where(Usuario.rol == rol)
    return list(db.scalars(consulta))


def obtener(db: Session, usuario_id: str) -> Usuario:
    usuario = db.get(Usuario, usuario_id)
    if not usuario or not usuario.activo:
        raise NoEncontrado("Usuario no encontrado")
    return usuario


def crear(db: Session, datos: UsuarioEntrada) -> Usuario:
    if datos.role not in ROLES_VALIDOS:
        raise Conflicto("Rol inválido")

    correo = datos.email.strip().lower()
    if not es_correo_institucional(correo):
        raise Conflicto("El correo debe ser institucional (@unal.edu.co)")

    if db.scalar(select(Usuario).where(Usuario.correo == correo)):
        raise Conflicto("Ya existe un usuario con ese correo")

    password = datos.password or "Tutor123"
    prefijo = "t" if datos.role == "tutor" else "u"
    usuario = Usuario(
        id=f"{prefijo}-{uuid4().hex[:10]}",
        nombre=datos.name.strip(),
        correo=correo,
        rol=datos.role,
        programa=datos.program.strip(),
        password_hash=hashear_password(password),
        disponibilidad=datos.availability.strip(),
        materias=datos.subjects or [],
    )
    db.add(usuario)
    db.commit()
    db.refresh(usuario)
    return usuario


def actualizar(db: Session, usuario_id: str, datos: UsuarioActualizar) -> Usuario:
    usuario = obtener(db, usuario_id)

    if datos.email is not None:
        correo = datos.email.strip().lower()
        if not es_correo_institucional(correo):
            raise Conflicto("El correo debe ser institucional (@unal.edu.co)")
        repetido = db.scalar(
            select(Usuario).where(Usuario.correo == correo, Usuario.id != usuario.id)
        )
        if repetido:
            raise Conflicto("Ya existe un usuario con ese correo")
        usuario.correo = correo

    if datos.name is not None:
        usuario.nombre = datos.name.strip()
    if datos.program is not None:
        usuario.programa = datos.program.strip()
    if datos.subjects is not None:
        usuario.materias = datos.subjects
    if datos.availability is not None:
        usuario.disponibilidad = datos.availability.strip()
    if datos.password:
        usuario.password_hash = hashear_password(datos.password)

    db.commit()
    db.refresh(usuario)
    return usuario


def eliminar(db: Session, usuario_id: str) -> None:
    usuario = obtener(db, usuario_id)
    if usuario.sesiones_como_tutor:
        raise Conflicto("No se puede eliminar un tutor que tiene sesiones asignadas")
    db.delete(usuario)
    db.commit()
