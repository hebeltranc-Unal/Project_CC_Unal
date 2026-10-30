import { useState } from "react";
import { areas } from "../datos/datos";
import { fechaParaInput, horaParaInput } from "../utilidades/fechas";
import BotonCerrar from "./BotonCerrar";
import Modal from "./Modal";

export default function ModalEditarSesion({ fila, tutores, alCerrar, alGuardar }) {
  const [datos, setDatos] = useState({
    titulo: fila.title,
    asignatura: fila.subject,
    area: fila.area || "Matemáticas",
    tutorId: fila.tutorId || "",
    modalidad: fila.modality || "presencial",
    ubicacion: fila.location || "",
    fecha: fechaParaInput(fila.date),
    hora: horaParaInput(fila.date),
    duracion: String(fila.durationMin || 90),
    capacidad: String(fila.capacity || 1),
    descripcion: fila.description || "",
  });
  const [error, setError] = useState("");

  const areasDisponibles = [...new Set([...areas, datos.area])];

  function cambiar(evento) {
    const { name, value } = evento.target;
    setDatos({ ...datos, [name]: value });
    setError("");
  }

  function enviar(evento) {
    evento.preventDefault();
    setError("");

    if (
      !datos.titulo.trim() ||
      !datos.asignatura.trim() ||
      !datos.tutorId ||
      !datos.ubicacion.trim() ||
      !datos.fecha ||
      !datos.hora
    ) {
      setError(
        "Completa el tema, la asignatura, el tutor, el espacio, la fecha y la hora."
      );
      return;
    }

    const inicio = new Date(`${datos.fecha}T${datos.hora}:00-05:00`);
    if (isNaN(inicio.getTime())) {
      setError("La fecha y la hora no son válidas.");
      return;
    }

    const capacidad = Number(datos.capacidad);
    if (!capacidad || capacidad < 1 || capacidad > 200) {
      setError("El cupo debe ser un número entero entre 1 y 200.");
      return;
    }

    alGuardar({
      title: datos.titulo.trim(),
      subject: datos.asignatura.trim(),
      area: datos.area,
      tutorId: datos.tutorId,
      modality: datos.modalidad,
      location: datos.ubicacion.trim(),
      date: inicio.toISOString(),
      durationMin: Number(datos.duracion) || 90,
      capacity: capacidad,
      description: datos.descripcion.trim(),
    });
  }

  return (
    <Modal abierto={true} alCerrar={alCerrar} etiqueta="Editar sesión">
      <div className="modal-card modal-wide">
        <BotonCerrar alCerrar={alCerrar} />
        <h2 className="modal-title">Editar sesión</h2>
        <p className="modal-desc">
          Actualiza los datos de la sesión. El cambio se refleja en la tabla del panel como
          demostración.
        </p>

        <div className="modal-body">
          <form className="form-stack admin-session-form" onSubmit={enviar} noValidate>
            <div className="form-grid">
              <div className="field field-wide">
                <label htmlFor="edit-title">Tema de la sesión</label>
                <input
                  id="edit-title"
                  name="titulo"
                  type="text"
                  value={datos.titulo}
                  onChange={cambiar}
                  required
                />
              </div>

              <div className="field">
                <label htmlFor="edit-subject">Asignatura</label>
                <input
                  id="edit-subject"
                  name="asignatura"
                  type="text"
                  value={datos.asignatura}
                  onChange={cambiar}
                  required
                />
              </div>

              <div className="field">
                <label htmlFor="edit-area">Área</label>
                <select id="edit-area" name="area" value={datos.area} onChange={cambiar}>
                  {areasDisponibles.map((area) => (
                    <option value={area} key={area}>
                      {area}
                    </option>
                  ))}
                </select>
              </div>

              <div className="field">
                <label htmlFor="edit-tutor">Tutor</label>
                <select
                  id="edit-tutor"
                  name="tutorId"
                  value={datos.tutorId}
                  onChange={cambiar}
                  required
                >
                  <option value="">Selecciona un tutor</option>
                  {tutores.map((tutor) => (
                    <option value={tutor.id} key={tutor.id}>
                      {tutor.name} · {tutor.career}
                    </option>
                  ))}
                </select>
              </div>

              <div className="field">
                <label htmlFor="edit-modality">Modalidad</label>
                <select
                  id="edit-modality"
                  name="modalidad"
                  value={datos.modalidad}
                  onChange={cambiar}
                >
                  <option value="presencial">Presencial</option>
                  <option value="virtual">Virtual</option>
                </select>
              </div>

              <div className="field field-wide">
                <label htmlFor="edit-location">Salón o enlace</label>
                <input
                  id="edit-location"
                  name="ubicacion"
                  type="text"
                  value={datos.ubicacion}
                  onChange={cambiar}
                  required
                />
              </div>

              <div className="field">
                <label htmlFor="edit-date">Fecha</label>
                <input
                  id="edit-date"
                  name="fecha"
                  type="date"
                  value={datos.fecha}
                  onChange={cambiar}
                  required
                />
              </div>

              <div className="field">
                <label htmlFor="edit-time">Hora de inicio</label>
                <input
                  id="edit-time"
                  name="hora"
                  type="time"
                  value={datos.hora}
                  onChange={cambiar}
                  required
                />
              </div>

              <div className="field">
                <label htmlFor="edit-duration">Duración</label>
                <select
                  id="edit-duration"
                  name="duracion"
                  value={datos.duracion}
                  onChange={cambiar}
                >
                  <option value="60">60 min</option>
                  <option value="90">90 min</option>
                  <option value="120">120 min</option>
                </select>
              </div>

              <div className="field">
                <label htmlFor="edit-capacity">Cupo máximo</label>
                <input
                  id="edit-capacity"
                  name="capacidad"
                  type="number"
                  min="1"
                  max="200"
                  value={datos.capacidad}
                  onChange={cambiar}
                  required
                />
              </div>

              <div className="field field-wide">
                <label htmlFor="edit-description">Descripción</label>
                <textarea
                  id="edit-description"
                  name="descripcion"
                  rows="3"
                  value={datos.descripcion}
                  onChange={cambiar}
                />
              </div>
            </div>

            {error && (
              <p className="field-error" role="alert">
                {error}
              </p>
            )}

            <button className="btn btn-primary btn-block" type="submit">
              Guardar cambios
            </button>
          </form>
        </div>
      </div>
    </Modal>
  );
}
