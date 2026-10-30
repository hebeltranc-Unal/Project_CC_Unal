ESTUDIANTE = ("estudiante@unal.edu.co", "Estudiante123")
TUTOR = ("tutor@unal.edu.co", "Tutor123")
COORDINADOR = ("coordinador@unal.edu.co", "Coordinador123")


def test_login_crea_cookie_http_only(client):
    respuesta = client.post(
        "/api/v1/auth/login",
        json={"email": ESTUDIANTE[0], "password": ESTUDIANTE[1]},
    )

    assert respuesta.status_code == 200
    assert respuesta.json()["role"] == "estudiante"
    assert "httponly" in respuesta.headers["set-cookie"].lower()
    assert client.cookies.get("gea_sesion")


def test_me_devuelve_el_usuario_de_la_sesion(client, iniciar_sesion):
    iniciar_sesion(*ESTUDIANTE)

    respuesta = client.get("/api/v1/auth/me")

    assert respuesta.status_code == 200
    assert respuesta.json()["email"] == ESTUDIANTE[0]
    assert respuesta.json()["name"] == "Sofía Mora"


def test_login_con_password_incorrecta(client):
    respuesta = client.post(
        "/api/v1/auth/login",
        json={"email": ESTUDIANTE[0], "password": "incorrecta"},
    )

    assert respuesta.status_code == 401
    assert "incorrectos" in respuesta.json()["detail"]


def test_logout_revoca_la_sesion(client, iniciar_sesion):
    iniciar_sesion(*ESTUDIANTE)

    respuesta = client.post("/api/v1/auth/logout")
    assert respuesta.status_code == 200

    me = client.get("/api/v1/auth/me")
    assert me.status_code == 200
    assert me.json() is None


def test_estudiante_no_puede_crear_sesiones(client, iniciar_sesion):
    iniciar_sesion(*ESTUDIANTE)

    respuesta = client.post("/api/v1/sesiones", json={})

    assert respuesta.status_code == 403


def test_tutor_no_puede_ver_todas_las_inscripciones(client, iniciar_sesion):
    iniciar_sesion(*TUTOR)

    respuesta = client.get("/api/v1/inscripciones")

    assert respuesta.status_code == 403


def test_origen_no_permitido_en_peticiones_de_escritura(client):
    respuesta = client.post(
        "/api/v1/contacto",
        json={
            "name": "Prueba",
            "email": "prueba@unal.edu.co",
            "message": "Hola",
        },
        headers={"origin": "http://sitio-malicioso.com"},
    )

    assert respuesta.status_code == 403
