from datetime import timedelta

from sqlalchemy import select
from sqlalchemy.orm import Session, joinedload

from app.core.algoritmos import se_cruzan
from app.core.exceptions import Conflicto, NoEncontrado, Prohibido
from app.core.security import ahora_utc
from app.core.validaciones import normalizar
from app.models.inscripcion import Inscripcion
from app.models.sesion import Sesion
from app.models.usuario import Usuario
from app.services.serializadores import serializar_inscripcion
from app.services.sesion_service import _cargar, _opciones


def crear(db: Session, sesion_id: str, usuario: Usuario) -> Sesion:
    if usuario.rol != "estudiante":
        raise Prohibido("Solo los estudiantes pueden inscribirse")

    sesion = _cargar(db, sesion_id)

    if sesion.fecha <= ahora_utc():
        raise Conflicto("La sesión ya pasó y no admite nuevas inscripciones")

    if len(sesion.inscripciones) >= sesion.cupo_maximo:
        raise Conflicto("No hay cupo disponible en esta sesión")

    existente = db.scalar(
        select(Inscripcion).where(
            Inscripcion.estudiante_id == usuario.id,
            Inscripcion.sesion_id == sesion_id,
        )
    )
    if existente:
        raise Conflicto("El estudiante ya está inscrito en esta sesión")

    otras_sesiones = list(
        db.scalars(
            select(Sesion)
            .join(Inscripcion, Inscripcion.sesion_id == Sesion.id)
            .where(Inscripcion.estudiante_id == usuario.id)
            .options(*_opciones())
        )
    )
    inicio = sesion.fecha
    fin = inicio + timedelta(minutes=sesion.duracion_min)
    for otra in otras_sesiones:
        otro_inicio = otra.fecha
        otro_fin = otro_inicio + timedelta(minutes=otra.duracion_min)
        if se_cruzan(inicio, fin, otro_inicio, otro_fin):
            raise Conflicto(
                f"Cruce de horario con '{otra.titulo}' "
                f"({otra.fecha.strftime('%H:%M')}-{otro_fin.strftime('%H:%M')})"
            )

    inscripcion = Inscripcion(
        estudiante_id=usuario.id,
        sesion_id=sesion_id,
        fecha=ahora_utc(),
        estado="Confirmada",
    )
    db.add(inscripcion)
    db.commit()
    return _cargar(db, sesion_id)


def cancelar(
    db: Session,
    sesion_id: str,
    estudiante_id: str,
    usuario: Usuario,
) -> None:
    if usuario.rol == "estudiante" and usuario.id != estudiante_id:
        raise Prohibido("Solo puedes cancelar tus propias inscripciones")
    if usuario.rol not in ("estudiante", "coordinador"):
        raise Prohibido("No tienes permiso para cancelar esta inscripción")

    inscripcion = db.scalar(
        select(Inscripcion).where(
            Inscripcion.estudiante_id == estudiante_id,
            Inscripcion.sesion_id == sesion_id,
        )
    )
    if not inscripcion:
        raise NoEncontrado("El estudiante no está inscrito en esa sesión")

    db.delete(inscripcion)
    db.commit()


def listar_por_estudiante(
    db: Session, estudiante_id: str, usuario: Usuario
) -> list[Sesion]:
    if usuario.rol == "estudiante" and usuario.id != estudiante_id:
        raise Prohibido("Solo puedes consultar tus propias inscripciones")
    if usuario.rol not in ("estudiante", "coordinador"):
        raise Prohibido("No tienes permiso para consultar estas inscripciones")

    return list(
        db.scalars(
            select(Sesion)
            .join(Inscripcion, Inscripcion.sesion_id == Sesion.id)
            .where(Inscripcion.estudiante_id == estudiante_id)
            .options(*_opciones())
            .order_by(Sesion.fecha)
        )
    )


def listar_todas(
    db: Session,
    usuario: Usuario,
    busqueda: str | None = None,
    area: str | None = None,
    sesion_id: str | None = None,
) -> list[dict]:
    if usuario.rol != "coordinador":
        raise Prohibido("Solo el coordinador puede ver todas las inscripciones")

    inscripciones = list(
        db.scalars(
            select(Inscripcion)
            .options(
                joinedload(Inscripcion.estudiante),
                joinedload(Inscripcion.sesion).joinedload(Sesion.area),
            )
            .order_by(Inscripcion.fecha.desc())
        )
    )

    if busqueda:
        texto = normalizar(busqueda)
        inscripciones = [
            inscripcion
            for inscripcion in inscripciones
            if texto
            in normalizar(
                f"{inscripcion.estudiante.nombre} "
                f"{inscripcion.estudiante.correo} "
                f"{inscripcion.estudiante.programa}"
            )
        ]
    if area:
        area_normalizada = normalizar(area)
        inscripciones = [
            inscripcion
            for inscripcion in inscripciones
            if normalizar(inscripcion.sesion.area.nombre) == area_normalizada
        ]
    if sesion_id:
        inscripciones = [
            inscripcion
            for inscripcion in inscripciones
            if inscripcion.sesion_id == sesion_id
        ]

    return [serializar_inscripcion(inscripcion) for inscripcion in inscripciones]
