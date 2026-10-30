from pydantic import BaseModel, Field


class SalonSalida(BaseModel):
    id: str
    name: str
    capacity: int


class SalonEntrada(BaseModel):
    name: str = Field(min_length=1, max_length=120)
    capacity: int = Field(gt=0, le=500)
