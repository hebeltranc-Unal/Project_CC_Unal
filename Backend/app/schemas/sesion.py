from pydantic import BaseModel, Field


class SesionSalida(BaseModel):
    id: str
    title: str
    subject: str
    area: str
    tutorId: str
    tutorName: str
    date: str
    durationMin: int
    modality: str
    location: str
    roomId: str | None = None
    capacity: int
    booked: int
    description: str = ""
    image: str = ""
    kind: str = "sesion"


class SesionEntrada(BaseModel):
    title: str = Field(min_length=1, max_length=180)
    subject: str = Field(min_length=1, max_length=120)
    area: str = Field(min_length=1, max_length=80)
    tutorId: str
    date: str
    durationMin: int = Field(default=90, gt=0, le=600)
    modality: str = "presencial"
    location: str = ""
    roomId: str | None = None
    capacity: int = Field(default=20, gt=0, le=500)
    description: str = ""
    image: str = ""
    kind: str = "sesion"


class SesionActualizar(BaseModel):
    title: str | None = Field(default=None, min_length=1, max_length=180)
    subject: str | None = Field(default=None, min_length=1, max_length=120)
    area: str | None = None
    tutorId: str | None = None
    date: str | None = None
    durationMin: int | None = Field(default=None, gt=0, le=600)
    modality: str | None = None
    location: str | None = None
    roomId: str | None = None
    capacity: int | None = Field(default=None, gt=0, le=500)
    description: str | None = None
    image: str | None = None
    kind: str | None = None
