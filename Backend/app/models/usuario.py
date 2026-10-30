from __future__ import annotations

from typing import TYPE_CHECKING

from sqlalchemy import JSON, Boolean, String
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.db.base import Base

if TYPE_CHECKING:
    from app.models.inscripcion import Inscripcion
    from app.models.sesion import Sesion
    from app.models.sesion_auth import SesionAuth


class Usuario(Base):
    __tablename__ = "usuarios"

    id: Mapped[str] = mapped_column(String(50), primary_key=True)
    nombre: Mapped[str] = mapped_column(String(120), index=True)
    correo: Mapped[str] = mapped_column(String(160), unique=True, index=True)
    rol: Mapped[str] = mapped_column(String(20), index=True)
    programa: Mapped[str] = mapped_column(String(120), default="")
    password_hash: Mapped[str] = mapped_column(String(255))
    disponibilidad: Mapped[str] = mapped_column(String(120), default="")
    materias: Mapped[list[str]] = mapped_column(JSON, default=list)
    activo: Mapped[bool] = mapped_column(Boolean, default=True)

    sesiones_como_tutor: Mapped[list["Sesion"]] = relationship(
        back_populates="tutor",
        foreign_keys="Sesion.tutor_id",
    )
    inscripciones: Mapped[list["Inscripcion"]] = relationship(
        back_populates="estudiante",
        cascade="all, delete-orphan",
    )
    sesiones_auth: Mapped[list["SesionAuth"]] = relationship(
        back_populates="usuario",
        cascade="all, delete-orphan",
    )
