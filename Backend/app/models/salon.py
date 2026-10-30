from __future__ import annotations

from typing import TYPE_CHECKING

from sqlalchemy import String
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.db.base import Base

if TYPE_CHECKING:
    from app.models.sesion import Sesion


class Salon(Base):
    __tablename__ = "salones"

    id: Mapped[str] = mapped_column(String(50), primary_key=True)
    nombre: Mapped[str] = mapped_column(String(120), unique=True)
    capacidad: Mapped[int] = mapped_column(default=0)

    sesiones: Mapped[list["Sesion"]] = relationship(back_populates="salon")
