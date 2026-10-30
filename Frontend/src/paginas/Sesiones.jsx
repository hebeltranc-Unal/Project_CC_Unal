import { useEffect, useState } from "react";
import { Search } from "lucide-react";
import TarjetaSesion from "../componentes/TarjetaSesion";
import { areas } from "../datos/datos";
import { api } from "../servicios/api";
import { formatearDia, horaBogota } from "../utilidades/fechas";
import { normalizar } from "../utilidades/texto";

function franjaDeSesion(sesion) {
  const hora = horaBogota(sesion.date);
  if (hora < 12) return "morning";
  if (hora < 18) return "afternoon";
  return "evening";
}

export default function Sesiones() {
  const [busqueda, setBusqueda] = useState("");
  const [area, setArea] = useState("");
  const [modalidad, setModalidad] = useState("");
  const [franja, setFranja] = useState("");
  const [tutorId, setTutorId] = useState("");
  const [orden, setOrden] = useState("date");
  const [sesiones, setSesiones] = useState([]);
  const [tutores, setTutores] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    Promise.all([api.get("/sesiones?kind=sesion"), api.get("/usuarios?rol=tutor")])
      .then(([listaSesiones, listaTutores]) => {
        setSesiones(listaSesiones);
        setTutores(listaTutores);
      })
      .catch((err) => setError(err.message))
      .finally(() => setCargando(false));
  }, []);

  const textoBuscado = normalizar(busqueda);

  const sesionesFiltradas = sesiones.filter((sesion) => {
    const texto = normalizar(
      `${sesion.title} ${sesion.subject} ${sesion.tutorName || ""}`
    );

    return (
      (!area || sesion.area === area) &&
      (!modalidad || sesion.modality === modalidad) &&
      (!franja || franjaDeSesion(sesion) === franja) &&
      (!tutorId || sesion.tutorId === tutorId) &&
      (!textoBuscado || texto.includes(textoBuscado))
    );
  });

  const sesionesOrdenadas = [...sesionesFiltradas].sort((a, b) => {
    if (orden === "seats") {
      const disponiblesA = a.capacity - a.booked;
      const disponiblesB = b.capacity - b.booked;
      return disponiblesB - disponiblesA || new Date(a.date) - new Date(b.date);
    }

    return new Date(a.date) - new Date(b.date);
  });

  const grupos = [];
  sesionesOrdenadas.forEach((sesion) => {
    const titulo = formatearDia(sesion.date);
    const ultimoGrupo = grupos[grupos.length - 1];

    if (ultimoGrupo && ultimoGrupo.titulo === titulo) {
      ultimoGrupo.sesiones.push(sesion);
    } else {
      grupos.push({ titulo, sesiones: [sesion] });
    }
  });

  return (
    <div className="page-soft">
      <div className="container page-pad">
        <p className="eyebrow">Agenda</p>
        <h1 className="page-title">Próximas sesiones</h1>

        <div className="filter-bar">
          <label className="search-field">
            <span className="sr-only">Buscar asignatura o tema</span>
            <Search className="icon" aria-hidden="true" />
            <input
              type="search"
              placeholder="Buscar asignatura o tema…"
              value={busqueda}
              onChange={(evento) => setBusqueda(evento.target.value)}
            />
          </label>

          <div className="chips" role="group" aria-label="Área">
            <button
              className="chip"
              type="button"
              aria-pressed={area === ""}
              onClick={() => setArea("")}
            >
              Todas
            </button>
            {areas.map((nombreArea) => (
              <button
                className="chip"
                type="button"
                key={nombreArea}
                aria-pressed={area === nombreArea}
                onClick={() => setArea(nombreArea)}
              >
                {nombreArea}
              </button>
            ))}
          </div>

          <div className="chips" role="group" aria-label="Modalidad">
            <button
              className="chip"
              type="button"
              aria-pressed={modalidad === "presencial"}
              onClick={() =>
                setModalidad(modalidad === "presencial" ? "" : "presencial")
              }
            >
              Presencial
            </button>
            <button
              className="chip"
              type="button"
              aria-pressed={modalidad === "virtual"}
              onClick={() => setModalidad(modalidad === "virtual" ? "" : "virtual")}
            >
              Virtual
            </button>
          </div>

          <div className="chips" role="group" aria-label="Franja horaria">
            <button
              className="chip"
              type="button"
              aria-pressed={franja === ""}
              onClick={() => setFranja("")}
            >
              Cualquier hora
            </button>
            <button
              className="chip"
              type="button"
              aria-pressed={franja === "morning"}
              onClick={() => setFranja("morning")}
            >
              Mañana
            </button>
            <button
              className="chip"
              type="button"
              aria-pressed={franja === "afternoon"}
              onClick={() => setFranja("afternoon")}
            >
              Tarde
            </button>
            <button
              className="chip"
              type="button"
              aria-pressed={franja === "evening"}
              onClick={() => setFranja("evening")}
            >
              Noche
            </button>
          </div>

          <label className="filter-select">
            <span className="sr-only">Filtrar por tutor</span>
            <select value={tutorId} onChange={(evento) => setTutorId(evento.target.value)}>
              <option value="">Todos los tutores</option>
              {tutores.map((tutor) => (
                <option value={tutor.id} key={tutor.id}>
                  {tutor.name}
                </option>
              ))}
            </select>
          </label>

          <label className="filter-select">
            <span className="sr-only">Ordenar la oferta</span>
            <select value={orden} onChange={(evento) => setOrden(evento.target.value)}>
              <option value="date">Ordenar: día y hora</option>
              <option value="seats">Ordenar: cupos disponibles</option>
            </select>
          </label>
        </div>

        {cargando && <p className="estado-pagina">Cargando sesiones…</p>}
        {error && <p className="field-error">{error}</p>}

        {!cargando && !error && sesionesOrdenadas.length === 0 && (
          <p className="empty-state">No hay sesiones con esos filtros.</p>
        )}

        {sesionesOrdenadas.length > 0 && orden === "seats" && (
          <div className="session-groups">
            <section className="session-group">
              <h2 className="session-group-title">Todas las sesiones</h2>
              <div className="session-group-grid">
                {sesionesOrdenadas.map((sesion) => (
                  <TarjetaSesion sesion={sesion} key={sesion.id} />
                ))}
              </div>
            </section>
          </div>
        )}

        {sesionesOrdenadas.length > 0 && orden !== "seats" && (
          <div className="session-groups">
            {grupos.map((grupo) => (
              <section className="session-group" key={grupo.titulo}>
                <h2 className="session-group-title">{grupo.titulo}</h2>
                <div className="session-group-grid">
                  {grupo.sesiones.map((sesion) => (
                    <TarjetaSesion sesion={sesion} key={sesion.id} />
                  ))}
                </div>
              </section>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
