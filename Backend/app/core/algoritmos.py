"""Algoritmos implementados a mano, sin usar ``sorted`` ni ``list.sort``.

Se conservan aquí las ideas del núcleo anterior: comparar intervalos y ordenar
por mezcla (merge sort). Los services los usan para mantener la lógica de
ordenamiento y de cruces en código Python puro.
"""

from collections.abc import Callable
from datetime import datetime
from typing import TypeVar

T = TypeVar("T")
Clave = Callable[[T], tuple]


def se_cruzan(
    inicio1: datetime,
    fin1: datetime,
    inicio2: datetime,
    fin2: datetime,
) -> bool:
    """Dos intervalos se cruzan si ``inicio1 < fin2`` y ``inicio2 < fin1``.

    La desigualdad es estricta: dos sesiones consecutivas (8-10 y 10-12) no se
    cruzan.
    """
    return inicio1 < fin2 and inicio2 < fin1


def mezclar(izquierda: list[T], derecha: list[T], clave: Clave) -> list[T]:
    """Mezcla dos listas ya ordenadas según ``clave``."""
    resultado: list[T] = []
    i = 0
    j = 0

    while i < len(izquierda) and j < len(derecha):
        if clave(izquierda[i]) <= clave(derecha[j]):
            resultado.append(izquierda[i])
            i += 1
        else:
            resultado.append(derecha[j])
            j += 1

    resultado.extend(izquierda[i:])
    resultado.extend(derecha[j:])
    return resultado


def ordenar_mezcla(lista: list[T], clave: Clave) -> list[T]:
    """Devuelve una lista nueva ordenada con merge sort.

    No modifica la lista original. La comparación se hace con ``clave``, que
    debe devolver una tupla cuyos elementos sean comparables.
    """
    if len(lista) <= 1:
        return list(lista)

    mitad = len(lista) // 2
    izquierda = ordenar_mezcla(lista[:mitad], clave)
    derecha = ordenar_mezcla(lista[mitad:], clave)
    return mezclar(izquierda, derecha, clave)
