from app.core.validaciones import a_iso_z
from app.models.area import Area
from app.models.inscripcion import Inscripcion
from app.models.salon import Salon
from app.models.sesion import Sesion
from app.models.usuario import Usuario


def serializar_area(area: Area) -> dict:
    return {"id": area.id, "name": area.nombre}


def serializar_salon(salon: Salon) -> dict:
    return {"id": salon.id, "name": salon.nombre, "capacity": salon.capacidad}


def serializar_usuario(usuario: Usuario) -> dict:
    return {
        "id": usuario.id,
        "name": usuario.nombre,
        "email": usuario.correo,
        "role": usuario.rol,
        "program": usuario.programa,
    }


def serializar_tutor(usuario: Usuario) -> dict:
    return {
        "id": usuario.id,
        "name": usuario.nombre,
        "email": usuario.correo,
        "career": usuario.programa,
        "subjects": usuario.materias or [],
        "availability": usuario.disponibilidad,
    }


def serializar_sesion(sesion: Sesion) -> dict:
    inscritos = len(sesion.inscripciones)
    return {
        "id": sesion.id,
        "title": sesion.titulo,
        "subject": sesion.asignatura,
        "area": sesion.area.nombre if sesion.area else "",
        "tutorId": sesion.tutor_id,
        "tutorName": sesion.tutor.nombre if sesion.tutor else "",
        "date": a_iso_z(sesion.fecha),
        "durationMin": sesion.duracion_min,
        "modality": sesion.modalidad,
        "location": sesion.ubicacion,
        "roomId": sesion.salon_id,
        "capacity": sesion.cupo_maximo,
        "booked": inscritos,
        "description": sesion.descripcion or "",
        "image": sesion.imagen or "",
        "kind": sesion.tipo,
    }


def serializar_inscripcion(inscripcion: Inscripcion) -> dict:
    return {
        "id": inscripcion.id,
        "name": inscripcion.estudiante.nombre,
        "email": inscripcion.estudiante.correo,
        "program": inscripcion.estudiante.programa,
        "sessionId": inscripcion.sesion_id,
        "sessionTitle": inscripcion.sesion.titulo,
        "area": inscripcion.sesion.area.nombre,
        "date": a_iso_z(inscripcion.fecha),
        "status": inscripcion.estado,
    }
