from __future__ import annotations

from datetime import datetime
from typing import TYPE_CHECKING
from uuid import uuid4

from sqlalchemy import DateTime, ForeignKey, String
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.core.security import ahora_utc
from app.db.base import Base

if TYPE_CHECKING:
    from app.models.usuario import Usuario


class SesionAuth(Base):
    __tablename__ = "sesiones_auth"

    id: Mapped[str] = mapped_column(
        String(36), primary_key=True, default=lambda: str(uuid4())
    )
    usuario_id: Mapped[str] = mapped_column(
        ForeignKey("usuarios.id"), index=True
    )
    token_hash: Mapped[str] = mapped_column(String(64), unique=True, index=True)
    creada_en: Mapped[datetime] = mapped_column(DateTime, default=ahora_utc)
    expira_en: Mapped[datetime] = mapped_column(DateTime)
    ultimo_uso: Mapped[datetime] = mapped_column(DateTime, default=ahora_utc)
    revocada_en: Mapped[datetime | None] = mapped_column(DateTime, nullable=True)
    ip: Mapped[str] = mapped_column(String(64), default="")
    user_agent: Mapped[str] = mapped_column(String(255), default="")

    usuario: Mapped["Usuario"] = relationship(back_populates="sesiones_auth")
