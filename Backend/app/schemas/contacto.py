from pydantic import BaseModel, Field


class ContactoEntrada(BaseModel):
    name: str = Field(min_length=1, max_length=120)
    email: str
    message: str = Field(min_length=1, max_length=4000)
