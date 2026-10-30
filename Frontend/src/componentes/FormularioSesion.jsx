import { useEffect, useState } from "react";
import {
  BookOpen,
  CalendarDays,
  Clock,
  Image as ImageIcon,
  MapPin,
  Users,
  X,
} from "lucide-react";
import { areas, portadas } from "../datos/datos";
import { fechaHoyBogota, formatearHora } from "../utilidades/fechas";

const ESTADO_INICIAL = {
  titulo: "",
  asignatura: "",
  area: "Matemáticas",
  tutorId: "",
  modalidad: "presencial",
  salonId: "",
  fecha: "",
  hora: "",
  duracion: "90",
  capacidad: "20",
  descripcion: "",
  imagen: "",
};

function imagenSegura(valor) {
  const src = String(valor ?? "").trim();
  if (!src || /^(javascript|vbscript):/i.test(src)) return "";
  return src;
}

export default function FormularioSesion({
  tutores = [],
  salones = [],
  tutorInicial = "",
  alCrear,
  textoBoton = "Publicar sesión",
  tipo = "sesión",
}) {
  const [formulario, setFormulario] = useState({
    ...ESTADO_INICIAL,
    tutorId: tutorInicial,
  });
  const [error, setError] = useState("");
  const [enviando, setEnviando] = useState(false);
  const [imagenValida, setImagenValida] = useState(false);
  const [horaFin, setHoraFin] = useState("—");

  const hoy = fechaHoyBogota();
  const imagen = imagenSegura(formulario.imagen);
  const salonSeleccionado = salones.find((salon) => salon.id === formulario.salonId);
  const capacidadMaxima =
    formulario.modalidad === "presencial" && salonSeleccionado
      ? salonSeleccionado.capacity
      : 200;

  useEffect(() => {
    setImagenValida(false);
  }, [imagen]);

  useEffect(() => {
    if (!formulario.fecha || !formulario.hora) {
      setHoraFin("—");
      return;
    }

    const inicio = new Date(`${formulario.fecha}T${formulario.hora}:00-05:00`);
    if (isNaN(inicio.getTime())) {
      setHoraFin("—");
      return;
    }

    const fin = new Date(inicio.getTime() + Number(formulario.duracion) * 60000);
    setHoraFin(formatearHora(fin));
  }, [formulario.fecha, formulario.hora, formulario.duracion]);

  function cambiar(evento) {
    const { name, value } = evento.target;
    setFormulario({ ...formulario, [name]: value });
    setError("");
  }

  function cambiarModalidad(evento) {
    const modalidad = evento.target.value;
    setFormulario({
      ...formulario,
      modalidad,
      salonId: modalidad === "virtual" ? "" : formulario.salonId,
    });
    setError("");
  }

  function cambiarSalon(evento) {
    const salonId = evento.target.value;
    const salon = salones.find((item) => item.id === salonId);
    let capacidad = formulario.capacidad;

    if (salon && Number(capacidad) > salon.capacity) {
      capacidad = String(salon.capacity);
    }

    setFormulario({ ...formulario, salonId, capacidad });
    setError("");
  }

  function quitarImagen() {
    setFormulario({ ...formulario, imagen: "" });
    setError("");
  }

  async function enviar(evento) {
    evento.preventDefault();
    setError("");

    const titulo = formulario.titulo.trim();
    const asignatura = formulario.asignatura.trim();
    const tutorId = formulario.tutorId;
    const modalidad = formulario.modalidad;
    const salonId = formulario.salonId;
    const fecha = formulario.fecha;
    const hora = formulario.hora;
    const duracion = Number(formulario.duracion) || 90;
    const capacidad = Number(formulario.capacidad);
    const descripcion = formulario.descripcion.trim();
    const imagenLimpia = imagenSegura(formulario.imagen);

    if (!titulo || !asignatura || !tutorId || !fecha || !hora) {
      setError("Completa el tema, la asignatura, el tutor, la fecha y la hora.");
      return;
    }

    if (!capacidad || !Number.isInteger(capacidad) || capacidad < 1) {
      setError("El cupo debe ser un número entero mayor que cero.");
      return;
    }

    if (modalidad === "presencial" && !salonId) {
      setError(`Selecciona un salón para la ${tipo} presencial.`);
      return;
    }

    const inicio = new Date(`${fecha}T${hora}:00-05:00`);
    if (isNaN(inicio.getTime())) {
      setError("La fecha y la hora no son válidas.");
      return;
    }

    if (inicio.getTime() <= Date.now()) {
      setError("La fecha y la hora deben ser futuras.");
      return;
    }

    const salon = modalidad === "presencial" ? salonSeleccionado : null;

    if (salon && capacidad > salon.capacity) {
      setError(
        `El cupo no puede superar la capacidad del salón (${salon.capacity}).`
      );
      return;
    }

    const datos = {
      title: titulo,
      subject: asignatura,
      area: formulario.area,
      tutorId,
      modality: modalidad,
      roomId: modalidad === "virtual" ? null : salonId,
      location:
        modalidad === "virtual" ? "Google Meet" : salon ? salon.name : "",
      date: inicio.toISOString(),
      durationMin: duracion,
      capacity: capacidad,
      description: descripcion,
      image: imagenLimpia,
      kind: tipo === "reunión" ? "reunion" : "sesion",
    };

    setEnviando(true);
    try {
      await alCrear(datos);
      setFormulario({ ...ESTADO_INICIAL, tutorId: tutorInicial });
      setError("");
      setImagenValida(false);
    } catch (err) {
      setError(err.message || "No se pudo guardar la sesión");
    } finally {
      setEnviando(false);
    }
  }

  return (
    <form className="admin-composer" onSubmit={enviar} noValidate>
      <aside className="admin-cover-panel" aria-label={`Portada de la ${tipo}`}>
        <div className="admin-cover-preview">
          {imagen && (
            <img
              src={imagen}
              alt="Portada seleccionada"
              hidden={!imagenValida}
              onLoad={() => setImagenValida(true)}
              onError={() => setImagenValida(false)}
            />
          )}
          <div className="admin-cover-placeholder" hidden={imagenValida}>
            <ImageIcon className="icon" aria-hidden="true" />
            <span>Portada de la {tipo}</span>
            <small>Elige una imagen o pega una URL</small>
          </div>
        </div>

        <div className="admin-cover-controls">
          <label className="admin-cover-label" htmlFor="meeting-image">
            URL de la imagen
          </label>
          <div className="admin-cover-url">
            <input
              id="meeting-image"
              name="imagen"
              type="text"
              inputMode="url"
              placeholder="https://... o una imagen prediseñada"
              autoComplete="off"
              value={formulario.imagen}
              onChange={cambiar}
            />
            <button
              className="admin-icon-btn"
              type="button"
              aria-label="Quitar imagen"
              onClick={quitarImagen}
            >
              <X className="icon" aria-hidden="true" />
            </button>
          </div>

          <p className="admin-cover-label">Imágenes prediseñadas</p>
          <div className="admin-cover-presets">
            {portadas.map((portada) => (
              <button
                className="admin-cover-preset"
                type="button"
                key={portada.id}
                aria-pressed={imagen === portada.src}
                onClick={() => {
                  setFormulario({ ...formulario, imagen: portada.src });
                  setError("");
                }}
              >
                <img src={portada.src} alt="" loading="lazy" />
                <span>{portada.label}</span>
              </button>
            ))}
          </div>
        </div>
      </aside>

      <div className="admin-composer-fields">
        <div className="admin-composer-top">
          <span className="admin-pill">
            <CalendarDays className="icon" aria-hidden="true" /> Calendario GEA
          </span>
          <span className="admin-pill">
            <Users className="icon" aria-hidden="true" /> Público
          </span>
        </div>

        <div className="admin-title-field">
          <label className="sr-only" htmlFor="meeting-title">
            Nombre de la {tipo}
          </label>
          <input
            id="meeting-title"
            name="titulo"
            className="admin-event-title"
            type="text"
            placeholder={`Nombre de la ${tipo}`}
            required
            value={formulario.titulo}
            onChange={cambiar}
          />
        </div>

        <div className="admin-datetime">
          <div className="admin-datetime-main">
            <div className="admin-datetime-row">
              <span className="admin-datetime-label">
                <CalendarDays className="icon" aria-hidden="true" /> Inicio
              </span>
              <input
                id="meeting-date"
                name="fecha"
                type="date"
                aria-label="Fecha de inicio"
                min={hoy}
                required
                value={formulario.fecha}
                onChange={cambiar}
              />
              <input
                id="meeting-time"
                name="hora"
                type="time"
                aria-label="Hora de inicio"
                required
                value={formulario.hora}
                onChange={cambiar}
              />
            </div>

            <div className="admin-datetime-row">
              <span className="admin-datetime-label">
                <Clock className="icon" aria-hidden="true" /> Fin
              </span>
              <span className="admin-end-time">{horaFin}</span>
              <label className="sr-only" htmlFor="meeting-duration">
                Duración
              </label>
              <select
                id="meeting-duration"
                name="duracion"
                aria-label="Duración"
                value={formulario.duracion}
                onChange={cambiar}
              >
                <option value="60">60 min</option>
                <option value="90">90 min</option>
                <option value="120">120 min</option>
              </select>
            </div>
          </div>

          <div className="admin-timezone">
            <Clock className="icon" aria-hidden="true" />
            <span>
              <strong>GMT-05:00</strong>
              <small>Bogotá</small>
            </span>
          </div>
        </div>

        <div className="admin-row">
          <span className="admin-row-icon">
            <MapPin className="icon" aria-hidden="true" />
          </span>
          <div className="admin-row-body">
            <div className="admin-row-head">
              <span>Ubicación</span>
              <label className="sr-only" htmlFor="meeting-modality">
                Modalidad
              </label>
              <select
                id="meeting-modality"
                name="modalidad"
                value={formulario.modalidad}
                onChange={cambiarModalidad}
              >
                <option value="presencial">Presencial</option>
                <option value="virtual">Virtual</option>
              </select>
            </div>

            {formulario.modalidad === "presencial" && (
              <div className="admin-row-sub">
                <label className="sr-only" htmlFor="meeting-room">
                  Salón
                </label>
                <select
                  id="meeting-room"
                  name="salonId"
                  required
                  value={formulario.salonId}
                  onChange={cambiarSalon}
                >
                  <option value="">Selecciona un salón</option>
                  {salones.map((salon) => (
                    <option value={salon.id} key={salon.id}>
                      {salon.name} · {salon.capacity} cupos
                    </option>
                  ))}
                </select>
              </div>
            )}
          </div>
        </div>

        <div className="admin-row admin-row-textarea">
          <span className="admin-row-icon">
            <BookOpen className="icon" aria-hidden="true" />
          </span>
          <div className="admin-row-body">
            <label className="admin-row-label" htmlFor="meeting-description">
              Descripción
            </label>
            <textarea
              id="meeting-description"
              name="descripcion"
              rows="3"
              placeholder="Agregar descripción"
              value={formulario.descripcion}
              onChange={cambiar}
            />
          </div>
        </div>

        <div className="admin-options">
          <p className="admin-options-title">Opciones de la {tipo}</p>

          <div className="admin-option-row">
            <span>
              <Users className="icon" aria-hidden="true" /> Tutor
            </span>
            <label className="sr-only" htmlFor="meeting-tutor">
              Tutor
            </label>
            <select
              id="meeting-tutor"
              name="tutorId"
              required
              value={formulario.tutorId}
              onChange={cambiar}
            >
              <option value="">Selecciona un tutor</option>
              {tutores.map((tutor) => (
                <option value={tutor.id} key={tutor.id}>
                  {tutor.name} · {tutor.career}
                </option>
              ))}
            </select>
          </div>

          <div className="admin-option-row">
            <span>
              <BookOpen className="icon" aria-hidden="true" /> Área
            </span>
            <label className="sr-only" htmlFor="meeting-area">
              Área
            </label>
            <select id="meeting-area" name="area" value={formulario.area} onChange={cambiar}>
              {areas.map((area) => (
                <option value={area} key={area}>
                  {area}
                </option>
              ))}
            </select>
          </div>

          <div className="admin-option-row">
            <span>
              <BookOpen className="icon" aria-hidden="true" /> Asignatura
            </span>
            <label className="sr-only" htmlFor="meeting-subject">
              Asignatura
            </label>
            <input
              id="meeting-subject"
              name="asignatura"
              type="text"
              placeholder="Ej. Cálculo diferencial"
              required
              value={formulario.asignatura}
              onChange={cambiar}
            />
          </div>

          <div className="admin-option-row">
            <span>
              <Users className="icon" aria-hidden="true" /> Cupo
            </span>
            <label className="sr-only" htmlFor="meeting-capacity">
              Capacidad
            </label>
            <input
              id="meeting-capacity"
              name="capacidad"
              type="number"
              min="1"
              max={capacidadMaxima}
              required
              value={formulario.capacidad}
              onChange={cambiar}
            />
          </div>
        </div>

        {error && (
          <p className="field-error" role="alert">
            {error}
          </p>
        )}

        <button className="admin-create-btn" type="submit" disabled={enviando}>
          {enviando ? "Guardando…" : textoBoton}
        </button>
      </div>
    </form>
  );
}
