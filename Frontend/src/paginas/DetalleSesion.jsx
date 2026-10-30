import { useEffect, useState } from "react";
import { ArrowLeft, CalendarDays, CircleCheck, Clock, MapPin, Users } from "lucide-react";
import { Link, useOutletContext, useParams } from "react-router-dom";
import BotonCerrar from "../componentes/BotonCerrar";
import Modal from "../componentes/Modal";
import TarjetaTutor from "../componentes/TarjetaTutor";
import { useAuth } from "../contextos/AuthContext";
import { api } from "../servicios/api";
import { tagDeArea } from "../utilidades/estilos";
import { formatearDia, formatearHora } from "../utilidades/fechas";

export default function DetalleSesion() {
  const { id } = useParams();
  const { usuario } = useAuth();
  const { mostrarNotificacion } = useOutletContext();

  const [sesion, setSesion] = useState(null);
  const [tutor, setTutor] = useState(null);
  const [misSesiones, setMisSesiones] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState("");
  const [reservaAbierta, setReservaAbierta] = useState(false);
  const [guardando, setGuardando] = useState(false);
  const [errorReserva, setErrorReserva] = useState("");

  useEffect(() => {
    setCargando(true);
    setError("");
    api
      .get(`/sesiones/${id}`)
      .then((datos) => {
        setSesion(datos);
        return api.get(`/usuarios/${datos.tutorId}`);
      })
      .then((datosTutor) => setTutor(datosTutor))
      .catch((err) => setError(err.message))
      .finally(() => setCargando(false));
  }, [id]);

  useEffect(() => {
    if (!usuario || usuario.role !== "estudiante") {
      setMisSesiones([]);
      return;
    }
    api
      .get(`/estudiantes/${usuario.id}/inscripciones`)
      .then((datos) => setMisSesiones(datos))
      .catch(() => setMisSesiones([]));
  }, [usuario, id]);

  if (cargando) {
    return (
      <div className="container page-pad">
        <p className="estado-pagina">Cargando sesión…</p>
      </div>
    );
  }

  if (error || !sesion) {
    return (
      <div className="container page-pad">
        <h1 className="page-title">Sesión no encontrada</h1>
        <p className="page-lead">{error || "La sesión no está disponible."}</p>
        <Link className="btn btn-primary btn-pill" to="/sesiones">
          Ver sesiones
        </Link>
      </div>
    );
  }

  const reservada = misSesiones.some((item) => item.id === sesion.id);
  const disponibles = Math.max(0, sesion.capacity - sesion.booked);
  const porcentaje = Math.min(
    100,
    (sesion.booked / Math.max(1, sesion.capacity)) * 100
  );
  const esEstudiante = usuario?.role === "estudiante";

  async function confirmarReserva() {
    setGuardando(true);
    setErrorReserva("");
    try {
      const actualizada = await api.post(
        `/sesiones/${sesion.id}/inscripciones`
      );
      setSesion(actualizada);
      setMisSesiones((actuales) => [...actuales, actualizada]);
      setReservaAbierta(false);
      mostrarNotificacion(
        "¡Reserva confirmada!",
        `Te enviaremos los detalles a ${usuario.email}`
      );
    } catch (err) {
      setErrorReserva(err.message);
    } finally {
      setGuardando(false);
    }
  }

  async function cancelarReserva() {
    try {
      await api.delete(
        `/sesiones/${sesion.id}/inscripciones/${usuario.id}`
      );
      const actualizada = await api.get(`/sesiones/${sesion.id}`);
      setSesion(actualizada);
      setMisSesiones((actuales) =>
        actuales.filter((item) => item.id !== sesion.id)
      );
      mostrarNotificacion("Reserva cancelada");
    } catch (err) {
      mostrarNotificacion("No se pudo cancelar", err.message);
    }
  }

  return (
    <div className="page-soft">
      <div className="container detail-wrap">
        <Link className="back-link" to="/sesiones">
          <ArrowLeft className="icon" aria-hidden="true" /> Sesiones
        </Link>

        <div className="detail-grid">
          <div className="detail-main">
            <span className={`tag ${tagDeArea(sesion.area)}`}>
              {sesion.subject}
            </span>
            <h1 className="detail-title">{sesion.title}</h1>
            <p className="detail-desc">{sesion.description}</p>

            <h2 className="detail-subtitle">Par tutor</h2>
            {tutor && (
              <div className="detail-tutor">
                <TarjetaTutor tutor={tutor} />
              </div>
            )}
          </div>

          <aside className="detail-aside">
            <ul className="detail-list">
              <li>
                <CalendarDays className="icon" aria-hidden="true" />
                <span className="capitalize">{formatearDia(sesion.date)}</span>
              </li>
              <li>
                <Clock className="icon" aria-hidden="true" />
                <span>
                  {formatearHora(sesion.date)} · {sesion.durationMin} min
                </span>
              </li>
              <li>
                <MapPin className="icon" aria-hidden="true" />
                <span>{sesion.location}</span>
              </li>
              <li>
                <Users className="icon" aria-hidden="true" />
                <span>
                  {sesion.booked}/{sesion.capacity} ·{" "}
                  {disponibles > 0 ? `${disponibles} cupos` : "Completa"}
                </span>
              </li>
            </ul>

            <div className="progress" aria-hidden="true">
              <span style={{ width: `${porcentaje}%` }}></span>
            </div>

            {!usuario && (
              <Link
                className="btn btn-primary btn-lg btn-pill btn-block detail-book"
                to="/login"
                state={{ desde: `/sesiones/${sesion.id}` }}
              >
                Iniciar sesión para reservar
              </Link>
            )}

            {usuario && !esEstudiante && (
              <p className="admin-note">
                Solo las cuentas de estudiante pueden reservar cupos.
              </p>
            )}

            {esEstudiante && !reservada && (
              <button
                className="btn btn-primary btn-lg btn-pill btn-block detail-book"
                type="button"
                disabled={disponibles <= 0}
                onClick={() => {
                  setErrorReserva("");
                  setReservaAbierta(true);
                }}
              >
                {disponibles > 0 ? "Agendar sesión" : "Completa"}
              </button>
            )}

            {esEstudiante && reservada && (
              <div className="booked-panel">
                <p className="booked-note">
                  <CircleCheck className="icon" aria-hidden="true" />
                  <span>Ya estás inscrito en esta sesión</span>
                </p>
                <p className="booked-hint">
                  No se permiten inscripciones duplicadas en la misma sesión.
                </p>
                <button
                  className="btn btn-outline btn-block"
                  type="button"
                  onClick={cancelarReserva}
                >
                  Cancelar reserva
                </button>
              </div>
            )}
          </aside>
        </div>
      </div>

      {reservaAbierta && (
        <Modal
          abierto={true}
          alCerrar={() => setReservaAbierta(false)}
          etiqueta="Reservar cupo"
        >
          <div className="modal-card">
            <BotonCerrar alCerrar={() => setReservaAbierta(false)} />
            <h2 className="modal-title">Reservar cupo</h2>
            <p className="modal-desc">
              {sesion.title} ·{" "}
              <span className="capitalize">{formatearDia(sesion.date)}</span>,{" "}
              {formatearHora(sesion.date)}
            </p>

            <div className="modal-body">
              <div className="form-stack">
                <div className="field">
                  <label htmlFor="booking-name">Nombre completo</label>
                  <input id="booking-name" value={usuario.name} readOnly />
                </div>
                <div className="field">
                  <label htmlFor="booking-email">Correo institucional</label>
                  <input id="booking-email" value={usuario.email} readOnly />
                </div>
                <div className="field">
                  <label htmlFor="booking-program">Programa académico</label>
                  <input id="booking-program" value={usuario.program} readOnly />
                </div>

                {errorReserva && (
                  <p className="field-error booking-alert" role="alert">
                    {errorReserva}
                  </p>
                )}

                <button
                  className="btn btn-primary btn-block"
                  type="button"
                  disabled={guardando}
                  onClick={confirmarReserva}
                >
                  {guardando ? "Confirmando…" : "Confirmar reserva"}
                </button>
              </div>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}
