import pytest
from fastapi.testclient import TestClient
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from sqlalchemy.pool import StaticPool

import app.models  # noqa: F401  (registra las tablas)
from app.db.base import Base
from app.db.seed import crear_datos_iniciales
from app.db.session import get_db
from app.main import app


@pytest.fixture()
def fabrica_sesiones():
    """Crea una base SQLite en memoria con los datos de demostración."""
    motor = create_engine(
        "sqlite://",
        connect_args={"check_same_thread": False},
        poolclass=StaticPool,
    )
    Base.metadata.create_all(bind=motor)
    fabrica = sessionmaker(bind=motor, autoflush=False, autocommit=False)

    with fabrica() as db:
        crear_datos_iniciales(db)

    yield fabrica

    Base.metadata.drop_all(bind=motor)
    motor.dispose()


@pytest.fixture()
def client(fabrica_sesiones):
    """Cliente de pruebas con la base en memoria en lugar de gea.db."""

    def obtener_db():
        db = fabrica_sesiones()
        try:
            yield db
        finally:
            db.close()

    app.dependency_overrides[get_db] = obtener_db
    cliente = TestClient(app)
    yield cliente
    cliente.close()
    app.dependency_overrides.clear()


@pytest.fixture()
def iniciar_sesion(client):
    """Inicia sesión y devuelve el usuario. Falla si el login no responde 200."""

    def _iniciar(correo: str, password: str) -> dict:
        respuesta = client.post(
            "/api/v1/auth/login",
            json={"email": correo, "password": password},
        )
        assert respuesta.status_code == 200, respuesta.text
        return respuesta.json()

    return _iniciar
