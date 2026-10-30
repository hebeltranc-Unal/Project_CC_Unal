from datetime import datetime, timedelta

from app.core.algoritmos import mezclar, ordenar_mezcla, se_cruzan


def test_mezclar_dos_listas_ordenadas():
    resultado = mezclar([1, 3, 5], [2, 4, 6], lambda valor: (valor,))

    assert resultado == [1, 2, 3, 4, 5, 6]


def test_merge_sort_coincide_con_sorted():
    datos = [
        {"nombre": "Carlos", "edad": 30},
        {"nombre": "Ana", "edad": 25},
        {"nombre": "Beatriz", "edad": 30},
        {"nombre": "David", "edad": 20},
    ]

    for clave in (
        lambda item: (item["edad"],),
        lambda item: (item["nombre"],),
        lambda item: (item["edad"], item["nombre"]),
    ):
        assert ordenar_mezcla(datos, clave) == sorted(datos, key=clave)


def test_merge_sort_no_muta_la_lista_original():
    datos = [3, 1, 2]
    copia = datos[:]

    resultado = ordenar_mezcla(datos, lambda valor: (valor,))

    assert datos == copia
    assert resultado == [1, 2, 3]


def test_merge_sort_casos_borde():
    assert ordenar_mezcla([], lambda valor: (valor,)) == []
    assert ordenar_mezcla([1], lambda valor: (valor,)) == [1]
    assert ordenar_mezcla([2, 1, 2, 1], lambda valor: (valor,)) == [1, 1, 2, 2]


def test_intervalos_se_cruzan():
    base = datetime(2026, 1, 1, 8, 0)

    assert se_cruzan(
        base,
        base + timedelta(hours=2),
        base + timedelta(hours=1),
        base + timedelta(hours=3),
    )
    assert se_cruzan(
        base,
        base + timedelta(hours=4),
        base + timedelta(hours=1),
        base + timedelta(hours=2),
    )
    assert not se_cruzan(
        base,
        base + timedelta(hours=2),
        base + timedelta(hours=2),
        base + timedelta(hours=4),
    )
    assert not se_cruzan(
        base,
        base + timedelta(hours=1),
        base + timedelta(hours=2),
        base + timedelta(hours=3),
    )
