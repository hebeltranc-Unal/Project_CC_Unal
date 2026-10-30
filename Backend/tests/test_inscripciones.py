from datetime import timedelta

from app.core.security import ahora_utc
from app.models.sesion import Sesion
from tests.fechas import fecha_futura

ESTUDIANTE = ("estudiante@unal.edu.co", "Estudiante123")
COORDINADOR = ("coordinador@unal.edu.co", "Coordinador123")


def datos_sesion(titulo, tutor, salon, fecha):
    return {
        "title": titulo,
        "subject": "Cálculo diferencial",
        "area": "Matemáticas",
        "tutorId": tutor,
        "date": fecha,
        "durationMin": 90,
        "modality": "presencial",
        "roomId": salon,
        "capacity": 20,
        "description": "Sesión de prueba",
        "image": "",
        "kind": "sesion",
    }


def test_estudiante_reserva_y_cancela(client, iniciar_sesion):
    iniciar_sesion(*ESTUDIANTE)

    reserva = client.post("/api/v1/sesiones/calculo-limites/inscripciones")
    assert reserva.status_code == 201
    assert reserva.json()["booked"] == 15

    mios = client.get("/api/v1/estudiantes/e1/inscripciones")
    assert mios.status_code == 200
    assert [sesion["id"] for sesion in mios.json()] == ["calculo-limites"]

    cancelada = client.delete(
        "/api/v1/sesiones/calculo-limites/inscripciones/e1"
    )
    assert cancelada.status_code == 200
    assert client.get("/api/v1/estudiantes/e1/inscripciones").json() == []


def test_no_se_puede_reservar_dos_veces(client, iniciar_sesion):
    iniciar_sesion(*ESTUDIANTE)
    client.post("/api/v1/sesiones/calculo-limites/inscripciones")

    repetida = client.post("/api/v1/sesiones/calculo-limites/inscripciones")

    assert repetida.status_code == 409
    assert "inscrito" in repetida.json()["detail"].lower()


def test_no_se_puede_reservar_sesion_llena(client, iniciar_sesion):
    iniciar_sesion(*ESTUDIANTE)

    respuesta = client.post("/api/v1/sesiones/python-intro/inscripciones")

    assert respuesta.status_code == 409
    assert "cupo" in respuesta.json()["detail"].lower()


def test_no_se_puede_reservar_dos_sesiones_a_la_misma_hora(
    client, iniciar_sesion
):
    iniciar_sesion(*COORDINADOR)
    primera = client.post(
        "/api/v1/sesiones",
        json=datos_sesion(
            "Sesión simultánea A",
            "t1",
            "r-404-201",
            fecha_futura(40),
        ),
    )
    segunda = client.post(
        "/api/v1/sesiones",
        json=datos_sesion(
            "Sesión simultánea B",
            "t2",
            "r-404-105",
            fecha_futura(40),
        ),
    )
    assert primera.status_code == 201
    assert segunda.status_code == 201

    client.post("/api/v1/auth/logout")
    iniciar_sesion(*ESTUDIANTE)

    assert (
        client.post(
            f"/api/v1/sesiones/{primera.json()['id']}/inscripciones"
        ).status_code
        == 201
    )
    cruce = client.post(
        f"/api/v1/sesiones/{segunda.json()['id']}/inscripciones"
    )

    assert cruce.status_code == 409
    assert "cruce" in cruce.json()["detail"].lower()


def test_estudiante_no_cancela_inscripcion_ajena(client, iniciar_sesion):
    iniciar_sesion(*ESTUDIANTE)

    respuesta = client.delete(
        "/api/v1/sesiones/calculo-limites/inscripciones/e2"
    )

    assert respuesta.status_code == 403


def test_coordinador_cancela_cualquier_inscripcion(client, iniciar_sesion):
    iniciar_sesion(*COORDINADOR)

    respuesta = client.delete(
        "/api/v1/sesiones/calculo-limites/inscripciones/e2"
    )

    assert respuesta.status_code == 200
    inscritos = client.get("/api/v1/sesiones/calculo-limites/inscritos")
    assert len(inscritos.json()) == 13


def test_inscripciones_del_admin_incluyen_datos_del_estudiante(
    client, iniciar_sesion
):
    iniciar_sesion(*COORDINADOR)

    respuesta = client.get("/api/v1/inscripciones")

    assert respuesta.status_code == 200
    assert len(respuesta.json()) == 107
    primera = respuesta.json()[0]
    assert {"name", "email", "program", "sessionTitle", "area", "date"} <= set(
        primera
    )


def test_no_se_reserva_una_sesion_pasada(
    client, iniciar_sesion, fabrica_sesiones
):
    with fabrica_sesiones() as db:
        sesion = db.get(Sesion, "calculo-limites")
        sesion.fecha = ahora_utc() - timedelta(days=1)
        db.commit()

    iniciar_sesion(*ESTUDIANTE)

    respuesta = client.post(
        "/api/v1/sesiones/calculo-limites/inscripciones"
    )

    assert respuesta.status_code == 409
    assert "pasó" in respuesta.json()["detail"]
