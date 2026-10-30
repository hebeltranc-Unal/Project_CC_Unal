from datetime import datetime, timedelta
from uuid import uuid4

from sqlalchemy import select
from sqlalchemy.orm import Session, selectinload

from app.core.constants import MODALIDADES, ROLES_QUE_REGISTRAN, TIPOS_SESION
from app.core.exceptions import Conflicto, ErrorAplicacion, NoEncontrado, Prohibido
from app.core.security import ahora_utc
from app.core.validaciones import a_utc_naive, hora_bogota, normalizar
from app.models.inscripcion import Inscripcion
from app.models.sesion import Sesion
from app.models.usuario import Usuario
from app.schemas.sesion import SesionActualizar, SesionEntrada
from app.services import area_service, salon_service, usuario_service


def _opciones():
    return (
        selectinload(Sesion.area),
        selectinload(Sesion.tutor),
        selectinload(Sesion.salon),
        selectinload(Sesion.inscripciones).selectinload(Inscripcion.estudiante),
    )


def _cargar(db: Session, sesion_id: str) -> Sesion:
    sesion = db.scalar(
        select(Sesion).where(Sesion.id == sesion_id).options(*_opciones())
    )
    if not sesion:
        raise NoEncontrado("Sesión no encontrada")
    return sesion


def obtener(db: Session, sesion_id: str) -> Sesion:
    return _cargar(db, sesion_id)


def listar(
    db: Session,
    area: str | None = None,
    tutor_id: str | None = None,
    modalidad: str | None = None,
    franja: str | None = None,
    busqueda: str | None = None,
    orden: str = "date",
    kind: str = "sesion",
) -> list[Sesion]:
    sesiones = list(
        db.scalars(
            select(Sesion).options(*_opciones()).order_by(Sesion.fecha)
        )
    )

    if kind in TIPOS_SESION:
        sesiones = [sesion for sesion in sesiones if sesion.tipo == kind]
    if area:
        buscada = normalizar(area)
        sesiones = [
            sesion
            for sesion in sesiones
            if normalizar(sesion.area.nombre) == buscada
        ]
    if tutor_id:
        sesiones = [sesion for sesion in sesiones if sesion.tutor_id == tutor_id]
    if modalidad:
        sesiones = [
            sesion for sesion in sesiones if sesion.modalidad == modalidad
        ]
    if franja:
        sesiones = [
            sesion
            for sesion in sesiones
            if _franja(hora_bogota(sesion.fecha)) == franja
        ]
    if busqueda:
        texto = normalizar(busqueda)
        sesiones = [
            sesion
            for sesion in sesiones
            if texto
            in normalizar(
                f"{sesion.titulo} {sesion.asignatura} {sesion.tutor.nombre}"
            )
        ]

    if orden == "seats":
        sesiones.sort(
            key=lambda sesion: (
                -(sesion.cupo_maximo - len(sesion.inscripciones)),
                sesion.fecha,
            )
        )
    elif orden == "title":
        sesiones.sort(key=lambda sesion: normalizar(sesion.titulo))
    elif orden == "area":
        sesiones.sort(key=lambda sesion: normalizar(sesion.area.nombre))
    else:
        sesiones.sort(key=lambda sesion: sesion.fecha)

    return sesiones


def _franja(hora: int) -> str:
    if hora < 12:
        return "morning"
    if hora < 18:
        return "afternoon"
    return "evening"


def parsear_fecha(valor: str) -> datetime:
    try:
        fecha = datetime.fromisoformat(valor.replace("Z", "+00:00"))
    except (ValueError, AttributeError) as error:
        raise ErrorAplicacion("La fecha y la hora no son válidas") from error
    return a_utc_naive(fecha)


def _resolver_dependencias(
    db: Session,
    area_nombre: str,
    tutor_id: str,
    modalidad: str,
    room_id: str | None,
    capacidad: int,
) -> tuple:
    if modalidad not in MODALIDADES:
        raise Conflicto("La modalidad debe ser presencial o virtual")

    area = area_service.obtener_por_nombre(db, area_nombre)
    tutor = usuario_service.obtener(db, tutor_id)
    if tutor.rol != "tutor":
        raise Conflicto("El tutor indicado no existe o no tiene rol de tutor")

    if capacidad <= 0:
        raise Conflicto("El cupo máximo debe ser mayor que cero")

    if modalidad == "virtual":
        return area, tutor, None, "Google Meet"

    if not room_id:
        raise Conflicto("Selecciona un salón para la sesión presencial")

    salon = salon_service.obtener(db, room_id)
    if capacidad > salon.capacidad:
        raise Conflicto(
            f"El cupo no puede superar la capacidad del salón ({salon.capacidad})"
        )
    return area, tutor, salon, salon.nombre


def _buscar_conflicto(
    db: Session,
    fecha: datetime,
    duracion_min: int,
    tutor_id: str,
    salon_id: str | None,
    excluir_id: str | None = None,
) -> None:
    inicio = fecha
    fin = fecha + timedelta(minutes=duracion_min)

    for otra in db.scalars(select(Sesion)):
        if excluir_id and otra.id == excluir_id:
            continue
        otro_inicio = otra.fecha
        otro_fin = otra.fecha + timedelta(minutes=otra.duracion_min)
        if not (inicio < otro_fin and otro_inicio < fin):
            continue
        if otra.tutor_id == tutor_id:
            raise Conflicto(
                f"El tutor ya tiene una sesión en esa franja horaria: '{otra.titulo}'"
            )
        if salon_id and otra.salon_id == salon_id:
            raise Conflicto(
                f"El salón ya está ocupado en esa franja horaria: '{otra.titulo}'"
            )


def crear(db: Session, datos: SesionEntrada, usuario: Usuario) -> Sesion:
    if usuario.rol not in ROLES_QUE_REGISTRAN:
        raise Prohibido("Solo tutores o coordinadores pueden registrar sesiones")
    if usuario.rol == "tutor" and datos.tutorId != usuario.id:
        raise Prohibido("Un tutor solo puede registrar sus propias sesiones")
    if datos.modality not in MODALIDADES:
        raise Conflicto("La modalidad debe ser presencial o virtual")
    if datos.kind not in TIPOS_SESION:
        raise Conflicto("El tipo debe ser sesión o reunión")

    fecha = parsear_fecha(datos.date)
    if fecha <= ahora_utc():
        raise Conflicto("La fecha y la hora deben ser futuras")

    area, tutor, salon, ubicacion = _resolver_dependencias(
        db,
        datos.area,
        datos.tutorId,
        datos.modality,
        datos.roomId,
        datos.capacity,
    )
    _buscar_conflicto(
        db,
        fecha,
        datos.durationMin,
        tutor.id,
        salon.id if salon else None,
    )

    sesion = Sesion(
        id=f"s-{uuid4().hex[:10]}",
        titulo=datos.title.strip(),
        asignatura=datos.subject.strip(),
        area_id=area.id,
        tutor_id=tutor.id,
        fecha=fecha,
        duracion_min=datos.durationMin,
        modalidad=datos.modality,
        ubicacion=ubicacion,
        salon_id=salon.id if salon else None,
        cupo_maximo=datos.capacity,
        descripcion=datos.description.strip(),
        imagen=datos.image.strip(),
        tipo=datos.kind,
    )
    db.add(sesion)
    db.commit()
    return _cargar(db, sesion.id)


def actualizar(
    db: Session,
    sesion_id: str,
    datos: SesionActualizar,
    usuario: Usuario,
) -> Sesion:
    sesion = _cargar(db, sesion_id)
    if usuario.rol == "tutor" and sesion.tutor_id != usuario.id:
        raise Prohibido("Solo puedes editar tus propias sesiones")

    titulo = datos.title.strip() if datos.title is not None else sesion.titulo
    asignatura = (
        datos.subject.strip() if datos.subject is not None else sesion.asignatura
    )
    area_nombre = (
        datos.area.strip()
        if datos.area is not None
        else sesion.area.nombre
    )
    tutor_id = (
        datos.tutorId
        if datos.tutorId is not None and usuario.rol == "coordinador"
        else sesion.tutor_id
    )
    fecha = parsear_fecha(datos.date) if datos.date else sesion.fecha
    duracion = (
        datos.durationMin
        if datos.durationMin is not None
        else sesion.duracion_min
    )
    modalidad = datos.modality or sesion.modalidad
    room_id = datos.roomId if datos.roomId is not None else sesion.salon_id
    capacidad = (
        datos.capacity if datos.capacity is not None else sesion.cupo_maximo
    )
    descripcion = (
        datos.description.strip()
        if datos.description is not None
        else sesion.descripcion
    )
    imagen = datos.image.strip() if datos.image is not None else sesion.imagen
    tipo = datos.kind or sesion.tipo

    if modalidad not in MODALIDADES:
        raise Conflicto("La modalidad debe ser presencial o virtual")
    if tipo not in TIPOS_SESION:
        raise Conflicto("El tipo debe ser sesión o reunión")

    area, tutor, salon, ubicacion = _resolver_dependencias(
        db,
        area_nombre,
        tutor_id,
        modalidad,
        room_id,
        capacidad,
    )
    _buscar_conflicto(
        db,
        fecha,
        duracion,
        tutor.id,
        salon.id if salon else None,
        excluir_id=sesion.id,
    )

    sesion.titulo = titulo
    sesion.asignatura = asignatura
    sesion.area_id = area.id
    sesion.tutor_id = tutor.id
    sesion.fecha = fecha
    sesion.duracion_min = duracion
    sesion.modalidad = modalidad
    sesion.ubicacion = ubicacion
    sesion.salon_id = salon.id if salon else None
    sesion.cupo_maximo = capacidad
    sesion.descripcion = descripcion
    sesion.imagen = imagen
    sesion.tipo = tipo

    db.commit()
    return _cargar(db, sesion.id)


def eliminar(db: Session, sesion_id: str, usuario: Usuario) -> None:
    sesion = _cargar(db, sesion_id)
    if usuario.rol == "tutor" and sesion.tutor_id != usuario.id:
        raise Prohibido("Solo puedes eliminar tus propias sesiones")
    db.delete(sesion)
    db.commit()


def inscritos(db: Session, sesion_id: str, usuario: Usuario) -> list[dict]:
    sesion = _cargar(db, sesion_id)
    es_su_tutor = usuario.rol == "tutor" and sesion.tutor_id == usuario.id
    if not (es_su_tutor or usuario.rol == "coordinador"):
        raise Prohibido("No tienes permiso para ver los inscritos de esta sesión")

    return [
        {
            "name": inscripcion.estudiante.nombre,
            "email": inscripcion.estudiante.correo,
            "program": inscripcion.estudiante.programa,
            "status": inscripcion.estado,
        }
        for inscripcion in sorted(
            sesion.inscripciones,
            key=lambda item: normalizar(item.estudiante.nombre),
        )
    ]


def sesiones_de_tutor(
    db: Session, tutor_id: str, usuario: Usuario
) -> list[Sesion]:
    if usuario.rol == "tutor" and usuario.id != tutor_id:
        raise Prohibido("Solo puedes consultar tus propias sesiones")
    return listar(db, tutor_id=tutor_id, kind="all", orden="date")
