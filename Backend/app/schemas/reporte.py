from pydantic import BaseModel


class ResumenSalida(BaseModel):
    totalInscripciones: int
    sesionesActivas: int
    ocupacionPromedio: int
    sesionesCompletas: int


class AreaReporteSalida(BaseModel):
    name: str
    enrolled: int
    capacity: int
    percentage: int


class OcupacionSalida(BaseModel):
    id: str
    title: str
    subject: str
    area: str
    date: str
    enrolled: int
    capacity: int
    percentage: int
    full: bool
