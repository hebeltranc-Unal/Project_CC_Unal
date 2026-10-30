from __future__ import annotations

from datetime import datetime
from typing import TYPE_CHECKING

from sqlalchemy import DateTime, ForeignKey, Integer, String, Text
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.core.security import ahora_utc
from app.db.base import Base

if TYPE_CHECKING:
    from app.models.area import Area
    from app.models.inscripcion import Inscripcion
    from app.models.salon import Salon
    from app.models.usuario import Usuario


class Sesion(Base):
    __tablename__ = "sesiones"

    id: Mapped[str] = mapped_column(String(60), primary_key=True)
    titulo: Mapped[str] = mapped_column(String(180))
    asignatura: Mapped[str] = mapped_column(String(120), index=True)
    area_id: Mapped[int] = mapped_column(ForeignKey("areas.id"), index=True)
    tutor_id: Mapped[str] = mapped_column(ForeignKey("usuarios.id"), index=True)
    fecha: Mapped[datetime] = mapped_column(DateTime, index=True)
    duracion_min: Mapped[int] = mapped_column(Integer, default=90)
    modalidad: Mapped[str] = mapped_column(String(20), default="presencial")
    ubicacion: Mapped[str] = mapped_column(String(180), default="")
    salon_id: Mapped[str | None] = mapped_column(
        ForeignKey("salones.id"), nullable=True
    )
    cupo_maximo: Mapped[int] = mapped_column(Integer, default=20)
    descripcion: Mapped[str] = mapped_column(Text, default="")
    imagen: Mapped[str] = mapped_column(String(500), default="")
    tipo: Mapped[str] = mapped_column(String(20), default="sesion", index=True)
    creada_en: Mapped[datetime] = mapped_column(DateTime, default=ahora_utc)

    area: Mapped["Area"] = relationship(back_populates="sesiones")
    tutor: Mapped["Usuario"] = relationship(
        back_populates="sesiones_como_tutor",
        foreign_keys=[tutor_id],
    )
    salon: Mapped["Salon | None"] = relationship(back_populates="sesiones")
    inscripciones: Mapped[list["Inscripcion"]] = relationship(
        back_populates="sesion",
        cascade="all, delete-orphan",
    )
