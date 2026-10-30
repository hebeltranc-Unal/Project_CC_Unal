COORDINADOR = ("coordinador@unal.edu.co", "Coordinador123")
TUTOR = ("tutor@unal.edu.co", "Tutor123")
ESTUDIANTE = ("estudiante@unal.edu.co", "Estudiante123")


def datos_tutor(**cambios):
    datos = {
        "name": "Tutor de Prueba",
        "email": "tutor.prueba@unal.edu.co",
        "password": "Tutor123",
        "role": "tutor",
        "program": "Física",
        "subjects": ["Física mecánica"],
        "availability": "Lun · Vie",
    }
    datos.update(cambios)
    return datos


def test_listar_tutores_es_publico(client):
    respuesta = client.get("/api/v1/usuarios", params={"rol": "tutor"})

    assert respuesta.status_code == 200
    assert len(respuesta.json()) == 6
    assert respuesta.json()[0]["email"].endswith("@unal.edu.co")


def test_ver_un_tutor_es_publico(client):
    respuesta = client.get("/api/v1/usuarios/t1")

    assert respuesta.status_code == 200
    assert respuesta.json()["name"] == "Valentina Rojas"
    assert "Cálculo diferencial" in respuesta.json()["subjects"]


def test_listar_estudiantes_requiere_coordinador(client, iniciar_sesion):
    iniciar_sesion(*ESTUDIANTE)

    respuesta = client.get("/api/v1/usuarios", params={"rol": "estudiante"})

    assert respuesta.status_code == 403


def test_coordinador_crea_edita_y_elimina_tutor(client, iniciar_sesion):
    iniciar_sesion(*COORDINADOR)

    creado = client.post("/api/v1/usuarios", json=datos_tutor())
    assert creado.status_code == 201
    tutor_id = creado.json()["id"]

    editado = client.put(
        f"/api/v1/usuarios/{tutor_id}",
        json={"name": "Tutor Editado"},
    )
    assert editado.status_code == 200
    assert editado.json()["name"] == "Tutor Editado"

    eliminado = client.delete(f"/api/v1/usuarios/{tutor_id}")
    assert eliminado.status_code == 200


def test_no_se_crea_tutor_con_correo_externo(client, iniciar_sesion):
    iniciar_sesion(*COORDINADOR)

    respuesta = client.post(
        "/api/v1/usuarios",
        json=datos_tutor(email="tutor@gmail.com"),
    )

    assert respuesta.status_code == 409
    assert "institucional" in respuesta.json()["detail"].lower()


def test_no_se_elimina_tutor_con_sesiones(client, iniciar_sesion):
    iniciar_sesion(*COORDINADOR)

    respuesta = client.delete("/api/v1/usuarios/t1")

    assert respuesta.status_code == 409
    assert "sesiones" in respuesta.json()["detail"].lower()


def test_tutor_consulta_solo_sus_sesiones(client, iniciar_sesion):
    iniciar_sesion(*TUTOR)

    propias = client.get("/api/v1/usuarios/t1/sesiones")
    ajenas = client.get("/api/v1/usuarios/t2/sesiones")

    assert propias.status_code == 200
    assert [sesion["id"] for sesion in propias.json()] == [
        "calculo-limites",
        "algebra-matrices",
    ]
    assert ajenas.status_code == 403


def test_coordinador_consulta_sesiones_de_cualquier_tutor(
    client, iniciar_sesion
):
    iniciar_sesion(*COORDINADOR)

    respuesta = client.get("/api/v1/usuarios/t1/sesiones")

    assert respuesta.status_code == 200
    assert len(respuesta.json()) == 2
