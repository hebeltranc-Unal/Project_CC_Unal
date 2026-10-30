from datetime import datetime, timedelta, timezone
import unicodedata

DOMINIO_CORREO = "@unal.edu.co"
# Colombia no aplica horario de verano: UTC-5 todo el año.
ZONA_BOGOTA = timezone(timedelta(hours=-5))


def es_correo_institucional(correo: str) -> bool:
    correo = correo.strip().lower()
    return (
        correo.count("@") == 1
        and correo.endswith(DOMINIO_CORREO)
        and len(correo) > len(DOMINIO_CORREO)
    )


def es_texto_no_vacio(texto: str) -> bool:
    return bool(texto and texto.strip())


def normalizar(texto: str) -> str:
    return (
        unicodedata.normalize("NFD", str(texto or ""))
        .encode("ascii", "ignore")
        .decode("utf-8")
        .lower()
        .strip()
    )


def a_utc_naive(fecha: datetime) -> datetime:
    if fecha.tzinfo is None:
        return fecha
    return fecha.astimezone(timezone.utc).replace(tzinfo=None)


def a_iso_z(fecha: datetime) -> str:
    return a_utc_naive(fecha).replace(tzinfo=timezone.utc).isoformat().replace(
        "+00:00", "Z"
    )


def hora_bogota(fecha: datetime) -> int:
    return a_utc_naive(fecha).replace(tzinfo=timezone.utc).astimezone(
        ZONA_BOGOTA
    ).hour
