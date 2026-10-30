class ErrorAplicacion(Exception):
    def __init__(self, mensaje: str, estado: int = 400):
        self.mensaje = mensaje
        self.estado = estado
        super().__init__(mensaje)


class NoEncontrado(ErrorAplicacion):
    def __init__(self, mensaje: str = "Recurso no encontrado"):
        super().__init__(mensaje, 404)


class Conflicto(ErrorAplicacion):
    def __init__(self, mensaje: str):
        super().__init__(mensaje, 409)


class NoAutorizado(ErrorAplicacion):
    def __init__(self, mensaje: str = "Debes iniciar sesión"):
        super().__init__(mensaje, 401)


class Prohibido(ErrorAplicacion):
    def __init__(self, mensaje: str = "No tienes permisos para esta acción"):
        super().__init__(mensaje, 403)
