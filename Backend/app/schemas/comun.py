from pydantic import BaseModel


class MensajeSalida(BaseModel):
    ok: bool = True
    mensaje: str
