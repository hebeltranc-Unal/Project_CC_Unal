import { useEffect, useState } from "react";
import { CalendarDays } from "lucide-react";
import { Link, useOutletContext } from "react-router-dom";
import BotonCerrar from "../componentes/BotonCerrar";
import FormularioSesion from "../componentes/FormularioSesion";
import Modal from "../componentes/Modal";
import ModalInscritos from "../componentes/ModalInscritos";
import TituloSeccion from "../componentes/TituloSeccion";
import { useAuth } from "../contextos/AuthContext";
import { api } from "../servicios/api";
import {
  formatearDia,
  formatearDiaCorto,
  formatearHora,
  formatearMesCorto,
} from "../utilidades/fechas";

export default function PanelTutor() {
  const { usuario } = useAuth();
  const { mostrarNotificacion } = useOutletContext();

  const [tutor, setTutor] = useState(null);
  const [sesiones, setSesiones] = useState([]);
  const [salones, setSalones] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState("");
  const [modalCrear, setModalCrear] = useState(false);
  const [sesionInscritos, setSesionInscritos] = useState(null);
  const [estudiantes, setEstudiantes] = useState([]);

  useEffect(() => {
    if (!usuario) return;

    Promise.all([
      api.get(`/usuarios/${usuario.id}`),
      api.get(`/usuarios/${usuario.id}/sesiones`),
      api.get("/salones"),
    ])
      .then(([detalle, listaSesiones, listaSalones]) => {
        setTutor(detalle);
        setSesiones(listaSesiones);
        setSalones(listaSalones);
      })
      .catch((err) => setError(err.message))
      .finally(() => setCargando(false));
  }, [usuario]);

  const totalInscritos = sesiones.reduce(
    (suma, sesion) => suma + sesion.booked,
    0
  );
  const totalCapacidad = sesiones.reduce(
    (suma, sesion) => suma + sesion.capacity,
    0
  );
  const ocupacionPromedio = totalCapacidad
    ? Math.round((totalInscritos / totalCapacidad) * 100)
    : 0;

  async function crearSesion(datos) {
    await api.post("/sesiones", datos);
    const actualizadas = await api.get(`/usuarios/${usuario.id}/sesiones`);
    setSesiones(actualizadas);
    setModalCrear(false);
    mostrarNotificacion(
      "Sesión publicada",
      `${datos.title} · ${formatearDia(datos.date)}`
    );
  }

  async function abrirInscritos(sesion) {
    try {
      const lista = await api.get(`/sesiones/${sesion.id}/inscritos`);
      setSesionInscritos(sesion);
      setEstudiantes(lista);
    } catch (err) {
      mostrarNotificacion("No se pudo cargar la lista", err.message);
    }
  }

  if (cargando) {
    return (
      <div className="container page-pad">
        <p className="estado-pagina">Cargando panel del tutor…</p>
      </div>
    );
  }

  return (
    <div className="page-soft">
      <div className="container page-pad">
        <div className="tutor-page-head">
          <div>
            <p className="eyebrow">Panel del tutor</p>
            <h1 className="page-title">Hola, {usuario.name.split(" ")[0]}</h1>
            <p className="page-lead">
              Gestiona tus sesiones, revisa la ocupación y consulta quiénes se han
              inscrito.
            </p>
          </div>
          <button
            className="btn btn-primary btn-pill"
            type="button"
            onClick={() => setModalCrear(true)}
          >
            Registrar nueva sesión
          </button>
        </div>

        <div className="tutor-dashboard-grid">
          <aside className="account-card tutor-profile-card" aria-label="Perfil del tutor">
            <div className="tutor-head">
              <div className="tutor-avatar" aria-hidden="true">
                {usuario.name
                  .split(" ")
                  .filter(Boolean)
                  .slice(0, 2)
                  .map((parte) => parte.charAt(0).toUpperCase())
                  .join("")}
              </div>
              <div>
                <h2>{usuario.name}</h2>
                <p className="tutor-career">{tutor?.career || usuario.program}</p>
              </div>
            </div>

            {tutor && (
              <>
                <div className="tutor-subjects">
                  {tutor.subjects.map((materia) => (
                    <span key={materia}>{materia}</span>
                  ))}
                </div>
                <p className="tutor-availability">
                  <CalendarDays className="icon" aria-hidden="true" />
                  {tutor.availability}
                </p>
              </>
            )}

            <dl className="account-list">
              <div>
                <dt>Rol</dt>
                <dd>Tutor</dd>
              </div>
              <div>
                <dt>Sesiones asignadas</dt>
                <dd>{sesiones.length}</dd>
              </div>
              <div>
                <dt>Inscritos totales</dt>
                <dd>{totalInscritos}</dd>
              </div>
              <div>
                <dt>Ocupación promedio</dt>
                <dd>{ocupacionPromedio} %</dd>
              </div>
            </dl>

            <Link className="btn btn-outline btn-block" to="/sesiones">
              Ver oferta pública
            </Link>
          </aside>

          <section aria-labelledby="tutor-sessions-title">
            <TituloSeccion
              enLinea
              etiqueta="Agenda del tutor"
              titulo="Mis sesiones"
              idTitulo="tutor-sessions-title"
              accion={
                <span className="tag tag-primary">
                  {sesiones.length === 1
                    ? "1 sesión"
                    : `${sesiones.length} sesiones`}
                </span>
              }
            />

            {error && <p className="field-error">{error}</p>}

            <div className="tutor-session-list">
              {!error && sesiones.length === 0 && (
                <div className="empty-panel">
                  <h3>No tienes sesiones asignadas</h3>
                  <p>Registra una nueva sesión para comenzar.</p>
                </div>
              )}

              {sesiones.map((sesion) => {
                const porcentaje = sesion.capacity
                  ? Math.round((sesion.booked / sesion.capacity) * 100)
                  : 0;

                return (
                  <article className="tutor-session-card" key={sesion.id}>
                    <div className="tutor-session-date" aria-hidden="true">
                      <strong>{formatearDiaCorto(sesion.date)}</strong>
                      <span>{formatearMesCorto(sesion.date)}</span>
                    </div>

                    <div className="tutor-session-body">
                      <div className="tutor-session-head">
                        <div>
                          <span className="tag tag-primary">{sesion.subject}</span>
                          <h3>{sesion.title}</h3>
                        </div>
                        <span className="tag tag-secondary">
                          {sesion.modality === "virtual" ? "Virtual" : "Presencial"}
                        </span>
                      </div>

                      <p className="reservation-meta">
                        {formatearDia(sesion.date)} · {formatearHora(sesion.date)} ·{" "}
                        {sesion.durationMin} min · {sesion.location}
                      </p>

                      <div className="tutor-session-progress">
                        <div className="progress" aria-hidden="true">
                          <span style={{ width: `${porcentaje}%` }}></span>
                        </div>
                        <span>
                          {sesion.booked}/{sesion.capacity} inscritos · {porcentaje}%
                        </span>
                      </div>
                    </div>

                    <div className="tutor-session-actions">
                      <button
                        className="btn btn-outline btn-sm"
                        type="button"
                        onClick={() => abrirInscritos(sesion)}
                      >
                        Ver inscritos
                      </button>
                    </div>
                  </article>
                );
              })}
            </div>

            <p className="admin-note">
              Los inscritos se consultan en la base de datos de GEA.
            </p>
          </section>
        </div>
      </div>

      {modalCrear && (
        <Modal
          abierto={true}
          alCerrar={() => setModalCrear(false)}
          clase="modal tutor-create-modal"
          etiqueta="Registrar nueva sesión"
        >
          <div className="tutor-create-card">
            <div className="tutor-create-head">
              <div>
                <p className="admin-kicker">Panel del tutor · Registrar sesión</p>
                <h2 className="modal-title">Registrar nueva sesión</h2>
                <p className="modal-desc">Misma vista de creación que usa el coordinador.</p>
              </div>
              <BotonCerrar alCerrar={() => setModalCrear(false)} />
            </div>

            <FormularioSesion
              tutores={tutor ? [tutor] : []}
              salones={salones}
              tutorInicial={usuario.id}
              tipo="sesión"
              textoBoton="Publicar sesión"
              alCrear={crearSesion}
            />
          </div>
        </Modal>
      )}

      {sesionInscritos && (
        <ModalInscritos
          abierto={true}
          alCerrar={() => setSesionInscritos(null)}
          titulo="Inscritos"
          subtitulo={`${sesionInscritos.title} · ${formatearDia(
            sesionInscritos.date
          )} · ${formatearHora(sesionInscritos.date)}`}
          estudiantes={estudiantes}
          mensajeVacio="Aún no hay estudiantes inscritos."
        />
      )}
    </div>
  );
}
