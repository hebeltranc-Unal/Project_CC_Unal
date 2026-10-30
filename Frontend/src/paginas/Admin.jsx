import { useEffect, useState } from "react";
import {
  ArrowUpRight,
  CalendarCheck,
  CalendarDays,
  ChartColumn,
  ClipboardList,
  Image as ImageIcon,
  MapPin,
  Users,
} from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import Escudo from "../componentes/Escudo";
import FormularioSesion from "../componentes/FormularioSesion";
import ModalEditarSesion from "../componentes/ModalEditarSesion";
import ModalInscritos from "../componentes/ModalInscritos";
import ModalTutor from "../componentes/ModalTutor";
import { Notificaciones, useNotificaciones } from "../componentes/Notificaciones";
import { useAuth } from "../contextos/AuthContext";
import { api } from "../servicios/api";
import { formatearFechaHora } from "../utilidades/fechas";
import { normalizar } from "../utilidades/texto";

const TABS = [
  {
    id: "meetings",
    texto: "Reuniones",
    icono: <CalendarDays className="icon" aria-hidden="true" />,
  },
  {
    id: "sessions",
    texto: "Sesiones",
    icono: <CalendarCheck className="icon" aria-hidden="true" />,
  },
  {
    id: "enrollments",
    texto: "Inscripciones",
    icono: <ClipboardList className="icon" aria-hidden="true" />,
  },
  {
    id: "tutors",
    texto: "Tutores",
    icono: <Users className="icon" aria-hidden="true" />,
  },
  {
    id: "rooms",
    texto: "Salones",
    icono: <MapPin className="icon" aria-hidden="true" />,
  },
  {
    id: "reports",
    texto: "Reportes",
    icono: <ChartColumn className="icon" aria-hidden="true" />,
  },
];

const RESUMEN_INICIAL = {
  totalInscripciones: 0,
  sesionesActivas: 0,
  ocupacionPromedio: 0,
  sesionesCompletas: 0,
};

export default function Admin() {
  const { usuario, cerrarSesion } = useAuth();
  const navegar = useNavigate();
  const { notificaciones, mostrarNotificacion } = useNotificaciones();

  const [tabActiva, setTabActiva] = useState("meetings");
  const [areas, setAreas] = useState([]);
  const [tutores, setTutores] = useState([]);
  const [salones, setSalones] = useState([]);
  const [sesiones, setSesiones] = useState([]);
  const [inscripciones, setInscripciones] = useState([]);
  const [resumen, setResumen] = useState(RESUMEN_INICIAL);
  const [reporteAreas, setReporteAreas] = useState([]);
  const [reporteOcupacion, setReporteOcupacion] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState("");
  const [filtrosInscripciones, setFiltrosInscripciones] = useState({
    busqueda: "",
    area: "",
    sesionId: "",
  });
  const [filaEdicion, setFilaEdicion] = useState(null);
  const [formularioTutor, setFormularioTutor] = useState({
    abierto: false,
    tutor: null,
  });
  const [filaInscritos, setFilaInscritos] = useState(null);
  const [estudiantesInscritos, setEstudiantesInscritos] = useState([]);

  useEffect(() => {
    document.body.classList.add("admin-page");
    return () => document.body.classList.remove("admin-page");
  }, []);

  useEffect(() => {
    cargarTodo();
  }, []);

  async function cargarTodo() {
    setCargando(true);
    setError("");
    try {
      const [
        listaAreas,
        listaTutores,
        listaSalones,
        listaSesiones,
        listaInscripciones,
        datosResumen,
        datosAreas,
        datosOcupacion,
      ] = await Promise.all([
        api.get("/areas"),
        api.get("/usuarios?rol=tutor"),
        api.get("/salones"),
        api.get("/sesiones?kind=all"),
        api.get("/inscripciones"),
        api.get("/reportes/resumen"),
        api.get("/reportes/areas"),
        api.get("/reportes/ocupacion"),
      ]);

      setAreas(listaAreas);
      setTutores(listaTutores);
      setSalones(listaSalones);
      setSesiones(listaSesiones);
      setInscripciones(listaInscripciones);
      setResumen(datosResumen);
      setReporteAreas(datosAreas);
      setReporteOcupacion(datosOcupacion);
    } catch (err) {
      setError(err.message);
    } finally {
      setCargando(false);
    }
  }

  const reuniones = sesiones
    .filter((sesion) => sesion.kind === "reunion")
    .sort((a, b) => new Date(a.date) - new Date(b.date));

  const textoInscripciones = normalizar(filtrosInscripciones.busqueda);
  const inscripcionesFiltradas = inscripciones.filter((fila) => {
    const texto = normalizar(`${fila.name} ${fila.email} ${fila.program}`);
    return (
      (!textoInscripciones || texto.includes(textoInscripciones)) &&
      (!filtrosInscripciones.area || fila.area === filtrosInscripciones.area) &&
      (!filtrosInscripciones.sesionId ||
        fila.sessionId === filtrosInscripciones.sesionId)
    );
  });

  async function salir() {
    await cerrarSesion();
    navegar("/", { replace: true });
  }

  function alPresionarTecla(evento, indice) {
    if (evento.key !== "ArrowRight" && evento.key !== "ArrowLeft") return;
    evento.preventDefault();
    const siguiente =
      TABS[
        (indice + (evento.key === "ArrowRight" ? 1 : TABS.length - 1)) %
          TABS.length
      ];
    setTabActiva(siguiente.id);
    document.getElementById(`tab-${siguiente.id}`)?.focus();
  }

  async function crearReunion(datos) {
    await api.post("/sesiones", { ...datos, kind: "reunion" });
    await cargarTodo();
    mostrarNotificacion(
      "Reunión creada",
      `${datos.title} · ${formatearFechaHora(datos.date)}`
    );
  }

  async function eliminarSesion(fila) {
    if (!window.confirm("¿Eliminar esta sesión del panel?")) return;
    try {
      await api.delete(`/sesiones/${fila.id}`);
      await cargarTodo();
      mostrarNotificacion("Sesión eliminada");
    } catch (err) {
      mostrarNotificacion("No se pudo eliminar", err.message);
    }
  }

  async function guardarEdicion(fila, campos) {
    try {
      await api.put(`/sesiones/${fila.id}`, campos);
      setFilaEdicion(null);
      await cargarTodo();
      mostrarNotificacion("Sesión actualizada", campos.title);
    } catch (err) {
      mostrarNotificacion("No se pudo actualizar", err.message);
    }
  }

  async function guardarTutor(tutorOriginal, datos) {
    const cuerpo = {
      name: datos.nombre,
      email: datos.email,
      password: datos.password || undefined,
      role: "tutor",
      program: datos.carrera,
      subjects: datos.asignaturas,
      availability: datos.disponibilidad,
    };

    try {
      if (tutorOriginal) {
        await api.put(`/usuarios/${tutorOriginal.id}`, cuerpo);
        mostrarNotificacion("Tutor actualizado", datos.nombre);
      } else {
        await api.post("/usuarios", cuerpo);
        mostrarNotificacion("Tutor creado", datos.nombre);
      }
      setFormularioTutor({ abierto: false, tutor: null });
      await cargarTodo();
    } catch (err) {
      mostrarNotificacion("No se pudo guardar el tutor", err.message);
    }
  }

  async function eliminarTutor(id) {
    if (!window.confirm("¿Eliminar este tutor?")) return;
    try {
      await api.delete(`/usuarios/${id}`);
      await cargarTodo();
      mostrarNotificacion("Tutor eliminado");
    } catch (err) {
      mostrarNotificacion("No se pudo eliminar", err.message);
    }
  }

  async function abrirInscritos(fila) {
    try {
      const lista = await api.get(`/sesiones/${fila.id}/inscritos`);
      setEstudiantesInscritos(lista);
      setFilaInscritos(fila);
    } catch (err) {
      mostrarNotificacion("No se pudo cargar la lista", err.message);
    }
  }

  return (
    <>
      <a className="skip-link" href="#admin-main">
        Saltar al contenido
      </a>

      <div className="admin-app">
        <header className="admin-topbar">
          <div className="admin-topbar-inner">
            <Link className="admin-brand" to="/" aria-label="GEA, volver al sitio">
              <Escudo />
              <span className="admin-brand-text">
                <strong>GEA</strong>
                <small>Administración</small>
              </span>
            </Link>

            <nav className="admin-nav" role="tablist" aria-label="Secciones del panel">
              {TABS.map((tab, indice) => (
                <button
                  className="admin-nav-item"
                  type="button"
                  role="tab"
                  id={`tab-${tab.id}`}
                  aria-controls={`panel-${tab.id}`}
                  aria-selected={tabActiva === tab.id}
                  key={tab.id}
                  onClick={() => setTabActiva(tab.id)}
                  onKeyDown={(evento) => alPresionarTecla(evento, indice)}
                >
                  {tab.icono} {tab.texto}
                </button>
              ))}
            </nav>

            <div className="admin-topbar-actions">
              <span className="admin-site-link">{usuario?.name}</span>
              <Link className="admin-site-link" to="/">
                Ver sitio <ArrowUpRight className="icon" aria-hidden="true" />
              </Link>
              <button className="admin-logout-btn" type="button" onClick={salir}>
                Cerrar sesión
              </button>
            </div>
          </div>
        </header>

        <main className="admin-main" id="admin-main">
          <div className="admin-dashboard">
            <div className="admin-dashboard-head">
              <h1 className="admin-kicker">Panel administrativo</h1>
              <div className="admin-summary" role="group" aria-label="Resumen">
                <div className="admin-summary-item">
                  <strong>{reuniones.length}</strong>
                  <span>Reuniones</span>
                </div>
                <div className="admin-summary-item">
                  <strong>{sesiones.length}</strong>
                  <span>Sesiones</span>
                </div>
                <div className="admin-summary-item">
                  <strong>{tutores.length}</strong>
                  <span>Tutores</span>
                </div>
                <div className="admin-summary-item">
                  <strong>{salones.length}</strong>
                  <span>Salones</span>
                </div>
                <div className="admin-summary-item">
                  <strong>{inscripciones.length}</strong>
                  <span>Inscripciones</span>
                </div>
              </div>
            </div>

            {cargando && <p className="admin-empty">Cargando panel…</p>}
            {error && <p className="field-error">{error}</p>}

            {!cargando && !error && (
              <>
                <section
                  id="panel-meetings"
                  role="tabpanel"
                  aria-labelledby="tab-meetings"
                  hidden={tabActiva !== "meetings"}
                >
                  <FormularioSesion
                    tutores={tutores}
                    salones={salones}
                    tipo="reunión"
                    textoBoton="Crear reunión"
                    alCrear={crearReunion}
                  />

                  <div className="admin-created">
                    <div className="admin-created-head">
                      <h2>Reuniones creadas</h2>
                      <span>
                        {reuniones.length === 1
                          ? "1 reunión"
                          : `${reuniones.length} reuniones`}
                      </span>
                    </div>

                    <div className="admin-list" aria-live="polite">
                      {reuniones.length === 0 && (
                        <p className="admin-empty">Aún no has creado reuniones.</p>
                      )}

                      {reuniones.map((reunion) => (
                        <article className="admin-meeting" key={reunion.id}>
                          {reunion.image ? (
                            <img
                              className="admin-meeting-thumb"
                              src={reunion.image}
                              alt=""
                              loading="lazy"
                            />
                          ) : (
                            <div
                              className="admin-meeting-thumb-empty"
                              aria-hidden="true"
                            >
                              <ImageIcon className="icon" />
                            </div>
                          )}

                          <div className="admin-meeting-body">
                            <div className="admin-meeting-head">
                              <div>
                                <h3 className="admin-meeting-title">
                                  {reunion.title}
                                </h3>
                                <p className="admin-meeting-meta">
                                  {formatearFechaHora(reunion.date)} ·{" "}
                                  {reunion.durationMin} min
                                </p>
                              </div>
                              <span className="tag tag-primary">
                                {reunion.area || "General"}
                              </span>
                            </div>

                            <p className="admin-meeting-meta">
                              {reunion.tutorName} ·{" "}
                              {reunion.modality === "virtual"
                                ? "Virtual"
                                : "Presencial"}{" "}
                              · {reunion.location} · {reunion.capacity} cupos
                            </p>

                            {reunion.description && (
                              <p className="admin-meeting-desc">
                                {reunion.description}
                              </p>
                            )}

                            <div className="admin-meeting-actions">
                              <button
                                className="admin-delete"
                                type="button"
                                onClick={() => eliminarSesion(reunion)}
                              >
                                Eliminar
                              </button>
                            </div>
                          </div>
                        </article>
                      ))}
                    </div>

                    <p className="admin-note">
                      Las reuniones se guardan en la base de datos de GEA.
                    </p>
                  </div>
                </section>

                <section
                  id="panel-sessions"
                  role="tabpanel"
                  aria-labelledby="tab-sessions"
                  hidden={tabActiva !== "sessions"}
                >
                  <div className="admin-table-card">
                    <div className="admin-panel-head">
                      <div>
                        <h2>Sesiones y reuniones</h2>
                        <p className="table-hint">
                          Desliza horizontalmente para ver todas las columnas.
                        </p>
                      </div>
                    </div>

                    <div
                      className="table-wrap"
                      tabIndex="0"
                      role="region"
                      aria-label="Sesiones y reuniones"
                    >
                      <table className="data-table">
                        <thead>
                          <tr>
                            <th>Sesión</th>
                            <th>Fecha y hora</th>
                            <th>Tutor</th>
                            <th>Modalidad</th>
                            <th>Espacio</th>
                            <th>Cupos</th>
                            <th>Acciones</th>
                          </tr>
                        </thead>
                        <tbody>
                          {sesiones.length === 0 && (
                            <tr>
                              <td colSpan="7" className="table-empty">
                                Sin sesiones registradas.
                              </td>
                            </tr>
                          )}

                          {sesiones.map((fila) => {
                            const completa =
                              fila.capacity > 0 && fila.booked >= fila.capacity;

                            return (
                              <tr key={fila.id}>
                                <td>
                                  <span className="cell-title">{fila.title}</span>
                                  {fila.kind === "reunion" && (
                                    <span className="table-tag">Reunión</span>
                                  )}
                                  <span className="cell-sub">{fila.subject}</span>
                                </td>
                                <td>{formatearFechaHora(fila.date)}</td>
                                <td>{fila.tutorName}</td>
                                <td>
                                  {fila.modality === "virtual"
                                    ? "Virtual"
                                    : "Presencial"}
                                </td>
                                <td>{fila.location}</td>
                                <td>
                                  {fila.booked}/{fila.capacity}
                                  {completa && (
                                    <span className="table-note"> · Completa</span>
                                  )}
                                </td>
                                <td>
                                  <div className="admin-actions">
                                    <button
                                      className="admin-action"
                                      type="button"
                                      onClick={() => abrirInscritos(fila)}
                                    >
                                      Inscritos
                                    </button>
                                    <button
                                      className="admin-action"
                                      type="button"
                                      onClick={() => setFilaEdicion(fila)}
                                    >
                                      Editar
                                    </button>
                                    <button
                                      className="admin-action admin-action-danger"
                                      type="button"
                                      onClick={() => eliminarSesion(fila)}
                                    >
                                      Eliminar
                                    </button>
                                  </div>
                                </td>
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </section>

                <section
                  id="panel-enrollments"
                  role="tabpanel"
                  aria-labelledby="tab-enrollments"
                  hidden={tabActiva !== "enrollments"}
                >
                  <div className="admin-table-card">
                    <div className="admin-panel-head">
                      <div>
                        <h2>Inscripciones</h2>
                        <p className="table-hint">
                          Listado de estudiantes inscritos en las sesiones.
                        </p>
                      </div>

                      <div className="admin-filters">
                        <label className="admin-filter">
                          <span className="sr-only">Buscar inscripción</span>
                          <input
                            type="search"
                            placeholder="Buscar estudiante o correo"
                            value={filtrosInscripciones.busqueda}
                            onChange={(evento) =>
                              setFiltrosInscripciones({
                                ...filtrosInscripciones,
                                busqueda: evento.target.value,
                              })
                            }
                          />
                        </label>

                        <label className="admin-filter">
                          <span className="sr-only">Filtrar por área</span>
                          <select
                            value={filtrosInscripciones.area}
                            onChange={(evento) =>
                              setFiltrosInscripciones({
                                ...filtrosInscripciones,
                                area: evento.target.value,
                              })
                            }
                          >
                            <option value="">Todas las áreas</option>
                            {areas.map((area) => (
                              <option value={area.name} key={area.id}>
                                {area.name}
                              </option>
                            ))}
                          </select>
                        </label>

                        <label className="admin-filter">
                          <span className="sr-only">Filtrar por sesión</span>
                          <select
                            value={filtrosInscripciones.sesionId}
                            onChange={(evento) =>
                              setFiltrosInscripciones({
                                ...filtrosInscripciones,
                                sesionId: evento.target.value,
                              })
                            }
                          >
                            <option value="">Todas las sesiones</option>
                            {sesiones.map((fila) => (
                              <option value={fila.id} key={fila.id}>
                                {fila.title} · {formatearFechaHora(fila.date)}
                              </option>
                            ))}
                          </select>
                        </label>
                      </div>
                    </div>

                    <div
                      className="table-wrap"
                      tabIndex="0"
                      role="region"
                      aria-label="Inscripciones"
                    >
                      <table className="data-table">
                        <thead>
                          <tr>
                            <th>Estudiante</th>
                            <th>Correo</th>
                            <th>Programa</th>
                            <th>Sesión</th>
                            <th>Área</th>
                            <th>Fecha de inscripción</th>
                            <th>Estado</th>
                          </tr>
                        </thead>
                        <tbody>
                          {inscripcionesFiltradas.length === 0 && (
                            <tr>
                              <td colSpan="7" className="table-empty">
                                No hay inscripciones con esos filtros.
                              </td>
                            </tr>
                          )}

                          {inscripcionesFiltradas.map((fila) => (
                            <tr key={fila.id}>
                              <td>
                                <span className="cell-title">{fila.name}</span>
                              </td>
                              <td>{fila.email}</td>
                              <td>{fila.program}</td>
                              <td>{fila.sessionTitle}</td>
                              <td>
                                <span className="tag tag-primary">{fila.area}</span>
                              </td>
                              <td>{formatearFechaHora(fila.date)}</td>
                              <td>
                                <span className="tag tag-primary">
                                  {fila.status}
                                </span>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>

                    <p className="admin-enrolled-note">
                      {inscripcionesFiltradas.length === 1
                        ? "1 inscripción"
                        : `${inscripcionesFiltradas.length} inscripciones`}
                    </p>
                  </div>
                </section>

                <section
                  id="panel-tutors"
                  role="tabpanel"
                  aria-labelledby="tab-tutors"
                  hidden={tabActiva !== "tutors"}
                >
                  <div className="admin-table-card">
                    <div className="admin-panel-head">
                      <div>
                        <h2>Pares tutores</h2>
                        <p className="table-hint">
                          Desliza horizontalmente para ver todas las columnas.
                        </p>
                      </div>
                      <button
                        className="admin-create-btn admin-create-btn-sm"
                        type="button"
                        onClick={() =>
                          setFormularioTutor({ abierto: true, tutor: null })
                        }
                      >
                        Nuevo tutor
                      </button>
                    </div>

                    <div
                      className="table-wrap"
                      tabIndex="0"
                      role="region"
                      aria-label="Pares tutores"
                    >
                      <table className="data-table">
                        <thead>
                          <tr>
                            <th>Tutor</th>
                            <th>Carrera</th>
                            <th>Asignaturas</th>
                            <th>Disponibilidad</th>
                            <th>Acciones</th>
                          </tr>
                        </thead>
                        <tbody>
                          {tutores.length === 0 && (
                            <tr>
                              <td colSpan="5" className="table-empty">
                                Sin tutores registrados.
                              </td>
                            </tr>
                          )}

                          {tutores.map((tutor) => (
                            <tr key={tutor.id}>
                              <td>
                                <span className="cell-title">{tutor.name}</span>
                              </td>
                              <td>{tutor.career}</td>
                              <td>{(tutor.subjects || []).join(", ")}</td>
                              <td>{tutor.availability}</td>
                              <td>
                                <div className="admin-actions">
                                  <button
                                    className="admin-action"
                                    type="button"
                                    onClick={() =>
                                      setFormularioTutor({
                                        abierto: true,
                                        tutor,
                                      })
                                    }
                                  >
                                    Editar
                                  </button>
                                  <button
                                    className="admin-action admin-action-danger"
                                    type="button"
                                    onClick={() => eliminarTutor(tutor.id)}
                                  >
                                    Eliminar
                                  </button>
                                </div>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </section>

                <section
                  id="panel-rooms"
                  role="tabpanel"
                  aria-labelledby="tab-rooms"
                  hidden={tabActiva !== "rooms"}
                >
                  <div className="admin-table-card">
                    <h2>Salones</h2>
                    <p className="table-hint">
                      Desliza horizontalmente para ver todas las columnas.
                    </p>

                    <div
                      className="table-wrap"
                      tabIndex="0"
                      role="region"
                      aria-label="Salones"
                    >
                      <table className="data-table">
                        <thead>
                          <tr>
                            <th>Salón</th>
                            <th>Capacidad</th>
                            <th>Sesiones programadas</th>
                          </tr>
                        </thead>
                        <tbody>
                          {salones.length === 0 && (
                            <tr>
                              <td colSpan="3" className="table-empty">
                                Sin salones registrados.
                              </td>
                            </tr>
                          )}

                          {salones.map((salon) => {
                            const programadas = sesiones.filter(
                              (fila) =>
                                fila.modality === "presencial" &&
                                fila.location === salon.name
                            ).length;

                            return (
                              <tr key={salon.id}>
                                <td>
                                  <span className="cell-title">{salon.name}</span>
                                </td>
                                <td>{salon.capacity}</td>
                                <td>{programadas}</td>
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>
                    </div>

                    <p className="admin-note">
                      Los encuentros virtuales se realizan por Google Meet.
                    </p>
                  </div>
                </section>

                <section
                  id="panel-reports"
                  role="tabpanel"
                  aria-labelledby="tab-reports"
                  hidden={tabActiva !== "reports"}
                >
                  <div className="admin-report-grid">
                    <article className="admin-report-card">
                      <span className="admin-report-label">Total inscripciones</span>
                      <strong className="admin-report-value">
                        {resumen.totalInscripciones}
                      </strong>
                      <span className="admin-report-sub">En todas las sesiones</span>
                    </article>
                    <article className="admin-report-card">
                      <span className="admin-report-label">Sesiones activas</span>
                      <strong className="admin-report-value">
                        {resumen.sesionesActivas}
                      </strong>
                      <span className="admin-report-sub">
                        Entre sesiones y reuniones
                      </span>
                    </article>
                    <article className="admin-report-card">
                      <span className="admin-report-label">Ocupación promedio</span>
                      <strong className="admin-report-value">
                        {resumen.ocupacionPromedio} %
                      </strong>
                      <span className="admin-report-sub">
                        Sobre la capacidad total
                      </span>
                    </article>
                    <article className="admin-report-card">
                      <span className="admin-report-label">Sesiones completas</span>
                      <strong className="admin-report-value">
                        {resumen.sesionesCompletas}
                      </strong>
                      <span className="admin-report-sub">Sin cupos disponibles</span>
                    </article>
                  </div>

                  <div className="admin-report-stack">
                    <div className="admin-table-card">
                      <h2>Inscritos por área</h2>
                      <div className="admin-area-bars">
                        {reporteAreas.length === 0 && (
                          <p className="admin-empty">Sin datos para reportar.</p>
                        )}

                        {reporteAreas.map((area) => (
                          <div className="admin-area-row" key={area.name}>
                            <span>{area.name}</span>
                            <div className="admin-area-track">
                              <span
                                className="admin-area-fill"
                                style={{ width: `${area.percentage}%` }}
                              ></span>
                            </div>
                            <span className="admin-area-value">
                              {area.enrolled}/{area.capacity} · {area.percentage}%
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div className="admin-table-card">
                      <h2>Ocupación por sesión</h2>
                      <div
                        className="table-wrap"
                        tabIndex="0"
                        role="region"
                        aria-label="Ocupación por sesión"
                      >
                        <table className="data-table">
                          <thead>
                            <tr>
                              <th>Sesión</th>
                              <th>Área</th>
                              <th>Fecha</th>
                              <th>Inscritos</th>
                              <th>Ocupación</th>
                              <th>Estado</th>
                            </tr>
                          </thead>
                          <tbody>
                            {reporteOcupacion.length === 0 && (
                              <tr>
                                <td colSpan="6" className="table-empty">
                                  Sin sesiones registradas.
                                </td>
                              </tr>
                            )}

                            {reporteOcupacion.map((fila) => (
                              <tr key={fila.id}>
                                <td>
                                  <span className="cell-title">{fila.title}</span>
                                  <span className="cell-sub">{fila.subject}</span>
                                </td>
                                <td>{fila.area}</td>
                                <td>{formatearFechaHora(fila.date)}</td>
                                <td>
                                  {fila.enrolled}/{fila.capacity}
                                </td>
                                <td>
                                  <div className="admin-area-track">
                                    <span
                                      className="admin-area-fill"
                                      style={{ width: `${fila.percentage}%` }}
                                    ></span>
                                  </div>
                                  <span className="table-note">
                                    {fila.percentage}%
                                  </span>
                                </td>
                                <td>
                                  {fila.full ? (
                                    <span className="tag tag-muted">Completa</span>
                                  ) : (
                                    <span className="tag tag-primary">
                                      Disponible
                                    </span>
                                  )}
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  </div>
                </section>
              </>
            )}
          </div>
        </main>
      </div>

      {filaEdicion && (
        <ModalEditarSesion
          fila={filaEdicion}
          tutores={tutores}
          alCerrar={() => setFilaEdicion(null)}
          alGuardar={(campos) => guardarEdicion(filaEdicion, campos)}
        />
      )}

      <ModalTutor
        abierto={formularioTutor.abierto}
        tutor={formularioTutor.tutor}
        alCerrar={() => setFormularioTutor({ abierto: false, tutor: null })}
        alGuardar={guardarTutor}
      />

      {filaInscritos && (
        <ModalInscritos
          abierto={true}
          alCerrar={() => {
            setFilaInscritos(null);
            setEstudiantesInscritos([]);
          }}
          titulo="Inscritos en la sesión"
          subtitulo={`${filaInscritos.title} · ${formatearFechaHora(
            filaInscritos.date
          )} · ${filaInscritos.booked}/${filaInscritos.capacity} inscritos`}
          estudiantes={estudiantesInscritos}
          mensajeVacio="Esta sesión aún no tiene inscritos."
          claseMensajeVacio="admin-empty"
        />
      )}

      <Notificaciones notificaciones={notificaciones} />
    </>
  );
}
