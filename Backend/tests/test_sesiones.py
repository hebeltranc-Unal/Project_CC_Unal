from app.core.validaciones import normalizar
from tests.fechas import fecha_futura

COORDINADOR = ("coordinador@unal.edu.co", "Coordinador123")
TUTOR = ("tutor@unal.edu.co", "Tutor123")


def datos_sesion(**cambios):
    datos = {
        "title": "Sesión de prueba",
        "subject": "Cálculo diferencial",
        "area": "Matemáticas",
        "tutorId": "t1",
        "date": fecha_futura(),
        "durationMin": 90,
        "modality": "presencial",
        "roomId": "r-404-201",
        "capacity": 20,
        "description": "Sesión creada por las pruebas",
        "image": "",
        "kind": "sesion",
    }
    datos.update(cambios)
    return datos


def test_listar_sesiones_publicas(client):
    respuesta = client.get("/api/v1/sesiones")

    assert respuesta.status_code == 200
    assert len(respuesta.json()) == 8
    assert respuesta.json()[0]["booked"] >= 0


def test_filtrar_por_area_modalidad_y_busqueda(client):
    por_area = client.get("/api/v1/sesiones", params={"area": "Matemáticas"})
    virtuales = client.get("/api/v1/sesiones", params={"modalidad": "virtual"})
    busqueda = client.get("/api/v1/sesiones", params={"busqueda": "python"})

    assert len(por_area.json()) == 3
    assert len(virtuales.json()) == 3
    assert len(busqueda.json()) == 1
    assert busqueda.json()[0]["id"] == "python-intro"


def test_filtrar_por_franja_y_ordenar_por_titulo(client):
    manana = client.get("/api/v1/sesiones", params={"franja": "morning"})
    noche = client.get("/api/v1/sesiones", params={"franja": "evening"})
    por_titulo = client.get("/api/v1/sesiones", params={"orden": "title"})

    assert len(manana.json()) == 4
    assert noche.json() == []
    assert por_titulo.json()[0]["id"] == "fisica-dinamica"


def test_ordenar_por_fecha_cupos_y_area(client):
    por_fecha = client.get("/api/v1/sesiones").json()
    fechas = [sesion["date"] for sesion in por_fecha]
    assert fechas == sorted(fechas)

    por_cupos = client.get(
        "/api/v1/sesiones", params={"orden": "seats"}
    ).json()
    disponibles = [
        sesion["capacity"] - sesion["booked"] for sesion in por_cupos
    ]
    assert disponibles == sorted(disponibles, reverse=True)

    por_area = client.get(
        "/api/v1/sesiones", params={"orden": "area"}
    ).json()
    areas = [normalizar(sesion["area"]) for sesion in por_area]
    assert areas == sorted(areas)


def test_detalle_de_sesion(client):
    respuesta = client.get("/api/v1/sesiones/calculo-limites")

    assert respuesta.status_code == 200
    assert respuesta.json()["booked"] == 14
    assert respuesta.json()["capacity"] == 20
    assert respuesta.json()["tutorName"] == "Valentina Rojas"


def test_sesion_inexistente(client):
    respuesta = client.get("/api/v1/sesiones/no-existe")

    assert respuesta.status_code == 404


def test_coordinador_crea_edita_y_elimina_sesion(client, iniciar_sesion):
    iniciar_sesion(*COORDINADOR)

    creada = client.post("/api/v1/sesiones", json=datos_sesion())
    assert creada.status_code == 201
    sesion_id = creada.json()["id"]

    editada = client.put(
        f"/api/v1/sesiones/{sesion_id}",
        json={"title": "Sesión editada"},
    )
    assert editada.status_code == 200
    assert editada.json()["title"] == "Sesión editada"

    eliminada = client.delete(f"/api/v1/sesiones/{sesion_id}")
    assert eliminada.status_code == 200
    assert client.get(f"/api/v1/sesiones/{sesion_id}").status_code == 404


def test_no_se_puede_repetir_tutor_en_la_misma_franja(client, iniciar_sesion):
    iniciar_sesion(*COORDINADOR)
    client.post("/api/v1/sesiones", json=datos_sesion())

    repetida = client.post(
        "/api/v1/sesiones",
        json=datos_sesion(roomId="r-404-105"),
    )

    assert repetida.status_code == 409
    assert "tutor" in repetida.json()["detail"].lower()


def test_no_se_puede_repetir_salon_en_la_misma_franja(client, iniciar_sesion):
    iniciar_sesion(*COORDINADOR)
    client.post("/api/v1/sesiones", json=datos_sesion())

    repetida = client.post(
        "/api/v1/sesiones",
        json=datos_sesion(tutorId="t2"),
    )

    assert repetida.status_code == 409
    assert "salón" in repetida.json()["detail"].lower()


def test_tutor_crea_sus_sesiones_pero_no_las_de_otro(client, iniciar_sesion):
    iniciar_sesion(*TUTOR)

    propia = client.post(
        "/api/v1/sesiones",
        json=datos_sesion(date=fecha_futura(31)),
    )
    ajena = client.post(
        "/api/v1/sesiones",
        json=datos_sesion(
            tutorId="t2",
            date=fecha_futura(32),
            roomId="r-404-105",
        ),
    )

    assert propia.status_code == 201
    assert ajena.status_code == 403


def test_tutor_ve_inscritos_de_su_sesion(client, iniciar_sesion):
    iniciar_sesion(*TUTOR)

    respuesta = client.get("/api/v1/sesiones/calculo-limites/inscritos")

    assert respuesta.status_code == 200
    assert len(respuesta.json()) == 14
    assert respuesta.json()[0]["email"].endswith("@unal.edu.co")


def test_tutor_no_ve_inscritos_de_otra_sesion(client, iniciar_sesion):
    iniciar_sesion("santiago.perez@unal.edu.co", "Tutor123")

    respuesta = client.get("/api/v1/sesiones/calculo-limites/inscritos")

    assert respuesta.status_code == 403
