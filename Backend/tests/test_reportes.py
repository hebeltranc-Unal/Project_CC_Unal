COORDINADOR = ("coordinador@unal.edu.co", "Coordinador123")
ESTUDIANTE = ("estudiante@unal.edu.co", "Estudiante123")


def test_resumen_del_panel(client, iniciar_sesion):
    iniciar_sesion(*COORDINADOR)

    respuesta = client.get("/api/v1/reportes/resumen")

    assert respuesta.status_code == 200
    assert respuesta.json() == {
        "totalInscripciones": 107,
        "sesionesActivas": 8,
        "ocupacionPromedio": 49,
        "sesionesCompletas": 1,
    }


def test_reporte_por_area(client, iniciar_sesion):
    iniciar_sesion(*COORDINADOR)

    respuesta = client.get("/api/v1/reportes/areas")

    assert respuesta.status_code == 200
    assert len(respuesta.json()) == 4
    ingenieria = next(
        area for area in respuesta.json() if area["name"] == "Ingeniería"
    )
    assert ingenieria == {
        "name": "Ingeniería",
        "enrolled": 25,
        "capacity": 25,
        "percentage": 100,
    }


def test_reporte_de_ocupacion(client, iniciar_sesion):
    iniciar_sesion(*COORDINADOR)

    respuesta = client.get("/api/v1/reportes/ocupacion")

    assert respuesta.status_code == 200
    assert len(respuesta.json()) == 8
    python = next(
        fila for fila in respuesta.json() if fila["id"] == "python-intro"
    )
    assert python["percentage"] == 100
    assert python["full"] is True


def test_reportes_requieren_coordinador(client, iniciar_sesion):
    iniciar_sesion(*ESTUDIANTE)

    assert client.get("/api/v1/reportes/resumen").status_code == 403
    assert client.get("/api/v1/reportes/areas").status_code == 403
    assert client.get("/api/v1/reportes/ocupacion").status_code == 403
