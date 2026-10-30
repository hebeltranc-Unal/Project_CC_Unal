from datetime import datetime, timedelta, timezone


def fecha_futura(dias: int = 30, hora: int = 15, minuto: int = 0) -> str:
    """Devuelve una fecha ISO en UTC, siempre posterior al momento actual."""
    fecha = datetime.now(timezone.utc) + timedelta(days=dias)
    fecha = fecha.replace(hour=hora, minute=minuto, second=0, microsecond=0)
    return fecha.isoformat().replace("+00:00", "Z")
