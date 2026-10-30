const API_URL = import.meta.env.VITE_API_URL || "http://localhost:8000/api/v1";

export class ErrorApi extends Error {
  constructor(mensaje, estado) {
    super(mensaje);
    this.name = "ErrorApi";
    this.estado = estado;
  }
}

async function peticion(ruta, opciones = {}) {
  const respuesta = await fetch(`${API_URL}${ruta}`, {
    credentials: "include",
    headers: {
      "Content-Type": "application/json",
      ...(opciones.headers || {}),
    },
    ...opciones,
  });

  const texto = await respuesta.text();
  let datos = null;
  if (texto) {
    try {
      datos = JSON.parse(texto);
    } catch {
      datos = texto;
    }
  }

  if (!respuesta.ok) {
    const detalle = datos?.detail || datos?.mensaje || "Error en la solicitud";
    const mensaje =
      typeof detalle === "string"
        ? detalle
        : "No se pudo completar la solicitud";
    throw new ErrorApi(mensaje, respuesta.status);
  }

  return datos;
}

export const api = {
  get: (ruta) => peticion(ruta),
  post: (ruta, cuerpo) =>
    peticion(ruta, { method: "POST", body: JSON.stringify(cuerpo) }),
  put: (ruta, cuerpo) =>
    peticion(ruta, { method: "PUT", body: JSON.stringify(cuerpo) }),
  delete: (ruta) => peticion(ruta, { method: "DELETE" }),
};
