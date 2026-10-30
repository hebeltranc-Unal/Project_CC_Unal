from datetime import datetime, timezone
from hashlib import sha256
import secrets

from argon2 import PasswordHasher
from argon2.exceptions import VerifyMismatchError

_hasher = PasswordHasher()


def hashear_password(password: str) -> str:
    return _hasher.hash(password)


def verificar_password(password: str, password_hash: str) -> bool:
    try:
        return _hasher.verify(password_hash, password)
    except (VerifyMismatchError, ValueError):
        return False


def crear_token_sesion() -> str:
    return secrets.token_urlsafe(48)


def hashear_token(token: str) -> str:
    return sha256(token.encode("utf-8")).hexdigest()


def ahora_utc() -> datetime:
    return datetime.now(timezone.utc).replace(tzinfo=None)
