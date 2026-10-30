from datetime import datetime, time, timedelta

from sqlalchemy import select
from sqlalchemy.orm import Session

from app.core.security import ahora_utc, hashear_password
from app.models.area import Area
from app.models.inscripcion import Inscripcion
from app.models.salon import Salon
from app.models.sesion import Sesion
from app.models.usuario import Usuario

AREAS = ["Matemáticas", "Ciencias", "Ingeniería", "Humanidades"]

SALONES = [
    ("r-404-201", "Edificio 404 · Salón 201", 24),
    ("r-404-105", "Edificio 404 · Salón 105", 20),
    ("r-453-computo3", "Edificio 453 · Sala de cómputo 3", 25),
    ("r-biblioteca-gea", "Biblioteca Central · Sala GEA", 18),
    ("r-auditorio-b", "Auditorio León de Greiff · Sala B", 30),
]

TUTORES = [
    (
        "t1",
        "Valentina Rojas",
        "tutor@unal.edu.co",
        "Matemáticas",
        ["Cálculo diferencial", "Álgebra lineal"],
        "Lun · Mié · Vie",
    ),
    (
        "t2",
        "Santiago Pérez",
        "santiago.perez@unal.edu.co",
        "Ingeniería Química",
        ["Química general", "Termodinámica"],
        "Mar · Jue",
    ),
    (
        "t3",
        "Laura Gómez",
        "laura.gomez@unal.edu.co",
        "Física",
        ["Física mecánica", "Cálculo integral"],
        "Lun · Jue",
    ),
    (
        "t4",
        "Andrés Martínez",
        "andres.martinez@unal.edu.co",
        "Ingeniería de Sistemas",
        ["Programación", "Estructuras de datos"],
        "Mié · Vie",
    ),
    (
        "t5",
        "Camila Herrera",
        "camila.herrera@unal.edu.co",
        "Lingüística",
        ["Lectura y escritura", "Comunicación oral"],
        "Mar · Mié",
    ),
    (
        "t6",
        "Julián Castro",
        "julian.castro@unal.edu.co",
        "Estadística",
        ["Probabilidad", "Estadística"],
        "Lun · Vie",
    ),
]

SESIONES = [
    {
        "id": "calculo-limites",
        "titulo": "Límites y continuidad sin miedo",
        "asignatura": "Cálculo diferencial",
        "area": "Matemáticas",
        "tutor": "t1",
        "dias": 1, "hora": "15:00",
        "duracion": 90,
        "modalidad": "presencial",
        "ubicacion": "Edificio 404 · Salón 201",
        "salon": "r-404-201",
        "cupo": 20,
        "booked": 14,
        "descripcion": (
            "Repasamos la intuición detrás de los límites, resolvemos "
            "ejercicios típicos de parcial y aclaramos dudas sobre continuidad."
        ),
    },
    {
        "id": "quimica-estequiometria",
        "titulo": "Estequiometría paso a paso",
        "asignatura": "Química general",
        "area": "Ciencias",
        "tutor": "t2",
        "dias": 1, "hora": "19:00",
        "duracion": 60,
        "modalidad": "virtual",
        "ubicacion": "Google Meet",
        "salon": None,
        "cupo": 30,
        "booked": 9,
        "descripcion": (
            "Balanceo de ecuaciones, reactivo límite y rendimiento con "
            "problemas guiados."
        ),
    },
    {
        "id": "python-intro",
        "titulo": "Primeros pasos con Python",
        "asignatura": "Programación",
        "area": "Ingeniería",
        "tutor": "t4",
        "dias": 2, "hora": "21:00",
        "duracion": 120,
        "modalidad": "presencial",
        "ubicacion": "Edificio 453 · Sala de cómputo 3",
        "salon": "r-453-computo3",
        "cupo": 25,
        "booked": 25,
        "descripcion": (
            "Variables, condicionales y ciclos con ejercicios prácticos. "
            "Trae tu portátil si puedes."
        ),
    },
    {
        "id": "fisica-dinamica",
        "titulo": "Dinámica: fuerzas y diagramas",
        "asignatura": "Física mecánica",
        "area": "Ciencias",
        "tutor": "t3",
        "dias": 3, "hora": "14:00",
        "duracion": 90,
        "modalidad": "presencial",
        "ubicacion": "Biblioteca Central · Sala GEA",
        "salon": "r-biblioteca-gea",
        "cupo": 18,
        "booked": 6,
        "descripcion": (
            "Cómo plantear diagramas de cuerpo libre y aplicar las leyes "
            "de Newton en problemas reales."
        ),
    },
    {
        "id": "escritura-academica",
        "titulo": "Escribir un ensayo académico",
        "asignatura": "Lectura y escritura",
        "area": "Humanidades",
        "tutor": "t5",
        "dias": 4, "hora": "16:00",
        "duracion": 60,
        "modalidad": "virtual",
        "ubicacion": "Google Meet",
        "salon": None,
        "cupo": 40,
        "booked": 22,
        "descripcion": (
            "Estructura, argumentación y citación para tus primeros "
            "ensayos universitarios."
        ),
    },
    {
        "id": "algebra-matrices",
        "titulo": "Matrices y sistemas lineales",
        "asignatura": "Álgebra lineal",
        "area": "Matemáticas",
        "tutor": "t1",
        "dias": 5, "hora": "20:00",
        "duracion": 90,
        "modalidad": "presencial",
        "ubicacion": "Edificio 404 · Salón 105",
        "salon": "r-404-105",
        "cupo": 20,
        "booked": 11,
        "descripcion": "Eliminación gaussiana, determinantes e inversas con ejemplos claros.",
    },
    {
        "id": "probabilidad-basica",
        "titulo": "Probabilidad para no estadísticos",
        "asignatura": "Probabilidad",
        "area": "Matemáticas",
        "tutor": "t6",
        "dias": 6, "hora": "15:00",
        "duracion": 60,
        "modalidad": "virtual",
        "ubicacion": "Google Meet",
        "salon": None,
        "cupo": 35,
        "booked": 12,
        "descripcion": (
            "Espacios muestrales, probabilidad condicional y teorema de "
            "Bayes con casos cotidianos."
        ),
    },
    {
        "id": "oratoria",
        "titulo": "Hablar en público con confianza",
        "asignatura": "Comunicación oral",
        "area": "Humanidades",
        "tutor": "t5",
        "dias": 8, "hora": "19:00",
        "duracion": 90,
        "modalidad": "presencial",
        "ubicacion": "Auditorio León de Greiff · Sala B",
        "salon": "r-auditorio-b",
        "cupo": 30,
        "booked": 8,
        "descripcion": (
            "Técnicas para preparar exposiciones y manejar los nervios. "
            "Ideal para participantes de Exprésa3."
        ),
    },
]

NOMBRES = [
    "Laura",
    "Santiago",
    "Valentina",
    "Andrés",
    "Camila",
    "Julián",
    "Mariana",
    "Felipe",
    "Daniela",
    "Sebastián",
    "Natalia",
    "Diego",
]

APELLIDOS = [
    "Gómez",
    "Pérez",
    "Rojas",
    "Martínez",
    "Herrera",
    "Castro",
    "Rodríguez",
    "Moreno",
    "Ramírez",
    "Torres",
]

PROGRAMAS = [
    "Ingeniería de Sistemas",
    "Matemáticas",
    "Física",
    "Química",
    "Estadística",
    "Ingeniería Química",
]


def _fecha(dias: int, hora: str) -> datetime:
    """Devuelve una fecha futura (UTC) relativa al día actual."""
    horas, minutos = (int(parte) for parte in hora.split(":"))
    base = ahora_utc().date() + timedelta(days=dias)
    return datetime.combine(base, time(hour=horas, minute=minutos))


def crear_datos_iniciales(db: Session) -> None:
    if db.scalar(select(Usuario).limit(1)):
        return

    password_tutor = hashear_password("Tutor123")
    password_admin = hashear_password("Coordinador123")
    password_estudiante = hashear_password("Estudiante123")

    areas: dict[str, Area] = {}
    for nombre in AREAS:
        area = Area(nombre=nombre)
        db.add(area)
        areas[nombre] = area

    salones: dict[str, Salon] = {}
    for salon_id, nombre, capacidad in SALONES:
        salon = Salon(id=salon_id, nombre=nombre, capacidad=capacidad)
        db.add(salon)
        salones[salon_id] = salon

    for tutor_id, nombre, correo, carrera, materias, disponibilidad in TUTORES:
        db.add(
            Usuario(
                id=tutor_id,
                nombre=nombre,
                correo=correo,
                rol="tutor",
                programa=carrera,
                password_hash=password_tutor,
                disponibilidad=disponibilidad,
                materias=materias,
            )
        )

    db.add(
        Usuario(
            id="c1",
            nombre="Ana Gómez",
            correo="coordinador@unal.edu.co",
            rol="coordinador",
            programa="Dirección Académica",
            password_hash=password_admin,
        )
    )
    db.add(
        Usuario(
            id="e1",
            nombre="Sofía Mora",
            correo="estudiante@unal.edu.co",
            rol="estudiante",
            programa="Matemáticas",
            password_hash=password_estudiante,
        )
    )

    estudiantes_demo: list[Usuario] = []
    for indice in range(120):
        nombre = f"{NOMBRES[indice % len(NOMBRES)]} {APELLIDOS[indice // len(NOMBRES)]}"
        estudiante = Usuario(
            id=f"e{indice + 2}",
            nombre=nombre,
            correo=f"demo{indice + 1:03d}@unal.edu.co",
            rol="estudiante",
            programa=PROGRAMAS[indice % len(PROGRAMAS)],
            password_hash=password_estudiante,
        )
        db.add(estudiante)
        estudiantes_demo.append(estudiante)

    db.flush()

    indice_estudiante = 0
    ahora = ahora_utc()
    for datos in SESIONES:
        sesion = Sesion(
            id=datos["id"],
            titulo=datos["titulo"],
            asignatura=datos["asignatura"],
            area_id=areas[datos["area"]].id,
            tutor_id=datos["tutor"],
            fecha=_fecha(datos["dias"], datos["hora"]),
            duracion_min=datos["duracion"],
            modalidad=datos["modalidad"],
            ubicacion=datos["ubicacion"],
            salon_id=datos["salon"],
            cupo_maximo=datos["cupo"],
            descripcion=datos["descripcion"],
            imagen="",
            tipo="sesion",
            creada_en=ahora,
        )
        db.add(sesion)
        db.flush()

        for _ in range(datos["booked"]):
            estudiante = estudiantes_demo[indice_estudiante]
            indice_estudiante += 1
            db.add(
                Inscripcion(
                    estudiante_id=estudiante.id,
                    sesion_id=sesion.id,
                    fecha=ahora,
                    estado="Confirmada",
                )
            )

    db.commit()
