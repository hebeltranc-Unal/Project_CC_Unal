from __future__ import annotations

from datetime import datetime
from typing import TYPE_CHECKING

from sqlalchemy import DateTime, ForeignKey, String, UniqueConstraint
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.core.security import ahora_utc
from app.db.base import Base

if TYPE_CHECKING:
    from app.models.sesion import Sesion
    from app.models.usuario import Usuario


class Inscripcion(Base):
    __tablename__ = "inscripciones"
    __table_args__ = (
        UniqueConstraint(
            "estudiante_id",
            "sesion_id",
            name="uq_inscripcion_estudiante_sesion",
        ),
    )

    id: Mapped[int] = mapped_column(primary_key=True, autoincrement=True)
    estudiante_id: Mapped[str] = mapped_column(
        ForeignKey("usuarios.id"), index=True
    )
    sesion_id: Mapped[str] = mapped_column(ForeignKey("sesiones.id"), index=True)
    fecha: Mapped[datetime] = mapped_column(DateTime, default=ahora_utc)
    estado: Mapped[str] = mapped_column(String(20), default="Confirmada")

    estudiante: Mapped["Usuario"] = relationship(back_populates="inscripciones")
    sesion: Mapped["Sesion"] = relationship(back_populates="inscripciones")
