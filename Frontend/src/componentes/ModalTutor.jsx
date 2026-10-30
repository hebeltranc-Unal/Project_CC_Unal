import { useEffect, useState } from "react";
import BotonCerrar from "./BotonCerrar";
import Modal from "./Modal";

const ESTADO_INICIAL = {
  nombre: "",
  email: "",
  password: "",
  carrera: "",
  asignaturas: "",
  disponibilidad: "",
};

export default function ModalTutor({ abierto, tutor, alCerrar, alGuardar }) {
  const [datos, setDatos] = useState(ESTADO_INICIAL);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!abierto) return;

    setDatos({
      nombre: tutor ? tutor.name : "",
      email: tutor ? tutor.email : "",
      password: "",
      carrera: tutor ? tutor.career : "",
      asignaturas: tutor ? (tutor.subjects || []).join(", ") : "",
      disponibilidad: tutor ? tutor.availability : "",
    });
    setError("");
  }, [abierto, tutor]);

  function cambiar(evento) {
    const { name, value } = evento.target;
    setDatos({ ...datos, [name]: value });
    setError("");
  }

  function enviar(evento) {
    evento.preventDefault();
    setError("");

    if (
      !datos.nombre.trim() ||
      !datos.email.trim() ||
      !datos.carrera.trim() ||
      !datos.asignaturas.trim() ||
      !datos.disponibilidad.trim()
    ) {
      setError(
        "Completa el nombre, el correo, la carrera, las asignaturas y la disponibilidad."
      );
      return;
    }

    alGuardar(tutor, {
      nombre: datos.nombre.trim(),
      email: datos.email.trim(),
      password: datos.password,
      carrera: datos.carrera.trim(),
      asignaturas: datos.asignaturas
        .split(",")
        .map((item) => item.trim())
        .filter(Boolean),
      disponibilidad: datos.disponibilidad.trim(),
    });
  }

  return (
    <Modal abierto={abierto} alCerrar={alCerrar} etiqueta="Formulario de tutor">
      <div className="modal-card">
        <BotonCerrar alCerrar={alCerrar} />
        <h2 className="modal-title">{tutor ? "Editar tutor" : "Nuevo tutor"}</h2>
        <p className="modal-desc">Registra los datos del par tutor y sus asignaturas.</p>

        <div className="modal-body">
          <form className="form-stack admin-session-form" onSubmit={enviar} noValidate>
            <div className="field">
              <label htmlFor="tutor-name">Nombre completo</label>
              <input
                id="tutor-name"
                name="nombre"
                type="text"
                value={datos.nombre}
                onChange={cambiar}
                required
              />
            </div>

            <div className="field">
              <label htmlFor="tutor-email">Correo institucional</label>
              <input
                id="tutor-email"
                name="email"
                type="email"
                placeholder="tutor@unal.edu.co"
                value={datos.email}
                onChange={cambiar}
                required
              />
            </div>

            <div className="field">
              <label htmlFor="tutor-password">Contraseña</label>
              <input
                id="tutor-password"
                name="password"
                type="password"
                autoComplete="new-password"
                placeholder={
                  tutor
                    ? "Dejar vacío para conservar la actual"
                    : "Si se deja vacío: Tutor123"
                }
                value={datos.password}
                onChange={cambiar}
              />
            </div>

            <div className="field">
              <label htmlFor="tutor-career">Carrera</label>
              <input
                id="tutor-career"
                name="carrera"
                type="text"
                value={datos.carrera}
                onChange={cambiar}
                required
              />
            </div>

            <div className="field">
              <label htmlFor="tutor-subjects">Asignaturas</label>
              <input
                id="tutor-subjects"
                name="asignaturas"
                type="text"
                placeholder="Ej. Cálculo diferencial, Álgebra lineal"
                value={datos.asignaturas}
                onChange={cambiar}
                required
              />
            </div>

            <div className="field">
              <label htmlFor="tutor-availability">Disponibilidad</label>
              <input
                id="tutor-availability"
                name="disponibilidad"
                type="text"
                placeholder="Ej. Lun · Mié · Vie"
                value={datos.disponibilidad}
                onChange={cambiar}
                required
              />
            </div>

            {error && (
              <p className="field-error" role="alert">
                {error}
              </p>
            )}

            <button className="btn btn-primary btn-block" type="submit">
              Guardar tutor
            </button>
          </form>
        </div>
      </div>
    </Modal>
  );
}
