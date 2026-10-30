from app.db.base import Base
from app.db.session import engine
import app.models  # noqa: F401  (registra las tablas en Base.metadata)


def crear_tablas() -> None:
    Base.metadata.create_all(bind=engine)
