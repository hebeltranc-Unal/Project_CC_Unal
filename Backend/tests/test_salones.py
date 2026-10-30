COORDINADOR = ("coordinador@unal.edu.co", "Coordinador123")
ESTUDIANTE = ("estudiante@unal.edu.co", "Estudiante123")


def test_listar_salones_es_publico(client):
    respuesta = client.get("/api/v1/salones")

    assert respuesta.status_code == 200
    assert len(respuesta.json()) == 5
    assert respuesta.json()[0]["capacity"] > 0


def test_coordinador_crea_edita_y_elimina_salon(client, iniciar_sesion):
    iniciar_sesion(*COORDINADOR)

    creado = client.post(
        "/api/v1/salones",
        json={"name": "Salón de prueba", "capacity": 15},
    )
    assert creado.status_code == 201
    salon_id = creado.json()["id"]

    editado = client.put(
        f"/api/v1/salones/{salon_id}",
        json={"name": "Salón editado", "capacity": 18},
    )
    assert editado.status_code == 200
    assert editado.json()["capacity"] == 18

    eliminado = client.delete(f"/api/v1/salones/{salon_id}")
    assert eliminado.status_code == 200


def test_no_se_repite_el_nombre_del_salon(client, iniciar_sesion):
    iniciar_sesion(*COORDINADOR)

    respuesta = client.post(
        "/api/v1/salones",
        json={"name": "Edificio 404 · Salón 201", "capacity": 20},
    )

    assert respuesta.status_code == 409


def test_no_se_elimina_salon_con_sesiones(client, iniciar_sesion):
    iniciar_sesion(*COORDINADOR)

    respuesta = client.delete("/api/v1/salones/r-404-201")

    assert respuesta.status_code == 409
    assert "sesiones" in respuesta.json()["detail"].lower()


def test_estudiante_no_puede_crear_salon(client, iniciar_sesion):
    iniciar_sesion(*ESTUDIANTE)

    respuesta = client.post(
        "/api/v1/salones",
        json={"name": "Salón no permitido", "capacity": 10},
    )

    assert respuesta.status_code == 403
