from sqlalchemy.orm import Session

from app.services import reporte_service


def resumen(db: Session):
    return reporte_service.resumen(db)


def areas(db: Session):
    return reporte_service.areas(db)


def ocupacion(db: Session):
    return reporte_service.ocupacion(db)
