from pydantic import BaseModel


class LoginEntrada(BaseModel):
    email: str
    password: str


class UsuarioSalida(BaseModel):
    id: str
    name: str
    email: str
    role: str
    program: str = ""
