from pydantic import BaseModel, Field


class TutorSalida(BaseModel):
    id: str
    name: str
    email: str = ""
    career: str
    subjects: list[str]
    availability: str


class UsuarioDetalleSalida(BaseModel):
    id: str
    name: str
    email: str
    role: str
    program: str = ""
    subjects: list[str] = []
    availability: str = ""


class UsuarioEntrada(BaseModel):
    name: str = Field(min_length=1, max_length=120)
    email: str
    password: str | None = None
    role: str = "tutor"
    program: str = ""
    subjects: list[str] = Field(default_factory=list)
    availability: str = ""


class UsuarioActualizar(BaseModel):
    name: str | None = Field(default=None, min_length=1, max_length=120)
    email: str | None = None
    password: str | None = None
    program: str | None = None
    subjects: list[str] | None = None
    availability: str | None = None
