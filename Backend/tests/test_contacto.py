from sqlalchemy import func, select

from app.models.contacto import MensajeContacto


def test_enviar_mensaje_de_contacto(client, fabrica_sesiones):
    respuesta = client.post(
        "/api/v1/contacto",
        json={
            "name": "Laura Estudiante",
            "email": "laura@unal.edu.co",
            "message": "Necesito información sobre las tutorías.",
        },
    )

    assert respuesta.status_code == 201
    assert "mensaje" in respuesta.json()

    with fabrica_sesiones() as db:
        total = db.scalar(select(func.count()).select_from(MensajeContacto))
        assert total == 1


def test_contacto_valida_los_campos(client):
    respuesta = client.post(
        "/api/v1/contacto",
        json={"name": "", "email": "laura@unal.edu.co", "message": ""},
    )

    assert respuesta.status_code == 422
