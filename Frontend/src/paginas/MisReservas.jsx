import { useEffect, useState } from "react";
import { CalendarCheck } from "lucide-react";
import { Link, useOutletContext } from "react-router-dom";
import TituloSeccion from "../componentes/TituloSeccion";
import { useAuth } from "../contextos/AuthContext";
import { api } from "../servicios/api";
import {
  formatearDia,
  formatearDiaCorto,
  formatearHora,
  formatearMesCorto,
} from "../utilidades/fechas";

function TarjetaReserva({ sesion, programa, alCancelar }) {
  return (
    <article className="reservation-card">
      <div className="reservation-date" aria-hidden="true">
        <span>{formatearDiaCorto(sesion.date)}</span>
        <small>{formatearMesCorto(sesion.date)}</small>
      </div>

      <div className="reservation-body">
        <div className="reservation-head">
          <span className="tag tag-primary">Confirmada</span>
          <span className="reservation-code">{sesion.id}</span>
        </div>

        <h3>{sesion.title}</h3>
        <p className="reservation-meta">
          {sesion.subject} · {sesion.tutorName}
        </p>
        <p className="reservation-meta">
          {formatearDia(sesion.date)} · {formatearHora(sesion.date)} ·{" "}
          {sesion.durationMin} min
        </p>
        <p className="reservation-meta">{sesion.location}</p>
        <p className="reservation-meta">Programa: {programa}</p>
      </div>

      <div className="reservation-actions">
        <Link className="btn btn-outline btn-sm" to={`/sesiones/${sesion.id}`}>
          Ver sesión
        </Link>
        <button className="btn btn-ghost btn-sm" type="button" onClick={alCancelar}>
          Cancelar
        </button>
      </div>
    </article>
  );
}

export default function MisReservas() {
  const { usuario } = useAuth();
  const { mostrarNotificacion } = useOutletContext();
  const [reservas, setReservas] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!usuario) return;
    api
      .get(`/estudiantes/${usuario.id}/inscripciones`)
      .then((datos) => setReservas(datos))
      .catch((err) => setError(err.message))
      .finally(() => setCargando(false));
  }, [usuario]);

  const iniciales = usuario.name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((parte) => parte.charAt(0).toUpperCase())
    .join("");
  const estado = reservas.length === 1 ? "1 activa" : `${reservas.length} activas`;

  async function cancelarReserva(sesionId) {
    try {
      await api.delete(
        `/sesiones/${sesionId}/inscripciones/${usuario.id}`
      );
      setReservas((actuales) =>
        actuales.filter((sesion) => sesion.id !== sesionId)
      );
      mostrarNotificacion("Reserva cancelada");
    } catch (err) {
      mostrarNotificacion("No se pudo cancelar", err.message);
    }
  }

  return (
    <div className="page-soft">
      <div className="container page-pad">
        <p className="eyebrow">Mi cuenta</p>
        <h1 className="page-title">Mis reservas</h1>
        <p className="page-lead">
          Consulta las sesiones a las que te has inscrito y gestiona tus cupos desde un
          solo lugar.
        </p>

        <div className="account-grid">
          <aside className="account-card" aria-label="Perfil del estudiante">
            <div className="tutor-head">
              <div className="tutor-avatar" aria-hidden="true">
                {iniciales || "EG"}
              </div>
              <div>
                <h2>{usuario.name}</h2>
                <p className="tutor-career">{usuario.email}</p>
              </div>
            </div>

            <dl className="account-list">
              <div>
                <dt>Rol</dt>
                <dd>Estudiante</dd>
              </div>
              <div>
                <dt>Programa</dt>
                <dd>{usuario.program || "Programa no registrado"}</dd>
              </div>
              <div>
                <dt>Reservas activas</dt>
                <dd>{reservas.length}</dd>
              </div>
            </dl>

            <Link className="btn btn-primary btn-block" to="/sesiones">
              Explorar sesiones
            </Link>
            <Link className="btn btn-outline btn-block" to="/">
              Volver al inicio
            </Link>
          </aside>

          <section aria-labelledby="reservations-title">
            <TituloSeccion
              enLinea
              etiqueta="Agenda personal"
              titulo="Sesiones reservadas"
              idTitulo="reservations-title"
              accion={<span className="tag tag-primary">{estado}</span>}
            />

            {cargando && <p className="estado-pagina">Cargando reservas…</p>}
            {error && <p className="field-error">{error}</p>}

            {!cargando && !error && (
              <>
                <div className="reservation-list">
                  {reservas.map((sesion) => (
                    <TarjetaReserva
                      key={sesion.id}
                      sesion={sesion}
                      programa={usuario.program || "Programa no registrado"}
                      alCancelar={() => cancelarReserva(sesion.id)}
                    />
                  ))}
                </div>

                {reservas.length === 0 && (
                  <div className="empty-panel">
                    <span className="resource-icon" aria-hidden="true">
                      <CalendarCheck className="icon" />
                    </span>
                    <h3>Aún no tienes reservas</h3>
                    <p>Explora la oferta y reserva una sesión con un par tutor.</p>
                    <Link className="btn btn-primary btn-pill" to="/sesiones">
                      Ver sesiones
                    </Link>
                  </div>
                )}
              </>
            )}

            <p className="admin-note">
              Tus reservas se guardan en la base de datos de GEA.
            </p>
          </section>
        </div>
      </div>
    </div>
  );
}
