const formatoDia = new Intl.DateTimeFormat("es-CO", {
  weekday: "long",
  day: "numeric",
  month: "long",
  timeZone: "America/Bogota",
});

const formatoHora = new Intl.DateTimeFormat("es-CO", {
  hour: "numeric",
  minute: "2-digit",
  timeZone: "America/Bogota",
});

const formatoFechaHoraDia = new Intl.DateTimeFormat("es-CO", {
  weekday: "short",
  day: "numeric",
  month: "short",
  timeZone: "America/Bogota",
});

const formatoDiaCorto = new Intl.DateTimeFormat("es-CO", {
  day: "2-digit",
  timeZone: "America/Bogota",
});

const formatoMesCorto = new Intl.DateTimeFormat("es-CO", {
  month: "short",
  timeZone: "America/Bogota",
});

const formatoFechaInput = new Intl.DateTimeFormat("en-CA", {
  timeZone: "America/Bogota",
  year: "numeric",
  month: "2-digit",
  day: "2-digit",
});

const formatoHoraInput = new Intl.DateTimeFormat("en-GB", {
  timeZone: "America/Bogota",
  hour: "2-digit",
  minute: "2-digit",
  hour12: false,
});

const formatoHora24 = new Intl.DateTimeFormat("en-US", {
  hour: "numeric",
  hour12: false,
  timeZone: "America/Bogota",
});

function capitalizar(texto) {
  return texto.charAt(0).toUpperCase() + texto.slice(1);
}

export function formatearDia(fecha) {
  return capitalizar(formatoDia.format(new Date(fecha)));
}

export function formatearHora(fecha) {
  return formatoHora.format(new Date(fecha));
}

export function formatearFechaHora(fecha) {
  const fechaSinPuntos = formatoFechaHoraDia.format(new Date(fecha)).replace(/\./g, "");
  return capitalizar(fechaSinPuntos) + " · " + formatearHora(fecha);
}

export function formatearDiaCorto(fecha) {
  return formatoDiaCorto.format(new Date(fecha));
}

export function formatearMesCorto(fecha) {
  return formatoMesCorto.format(new Date(fecha)).replace(".", "").toUpperCase();
}

export function fechaParaInput(fecha) {
  const valor = new Date(fecha);
  if (isNaN(valor.getTime())) return "";
  return formatoFechaInput.format(valor);
}

export function horaParaInput(fecha) {
  const valor = new Date(fecha);
  if (isNaN(valor.getTime())) return "";
  return formatoHoraInput.format(valor);
}

export function fechaHoyBogota() {
  return formatoFechaInput.format(new Date());
}

export function horaBogota(fecha) {
  const hora = Number(formatoHora24.format(new Date(fecha)));
  return hora === 24 ? 0 : hora;
}
