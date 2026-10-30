from pydantic import BaseModel


class InscripcionSalida(BaseModel):
    id: int
    name: str
    email: str
    program: str
    sessionId: str
    sessionTitle: str
    area: str
    date: str
    status: str


class InscritoSalida(BaseModel):
    name: str
    email: str
    program: str
    status: str
