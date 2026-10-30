import { Clock, MapPin, Monitor, Users } from "lucide-react";
import { Link } from "react-router-dom";
import { tagDeArea } from "../utilidades/estilos";
import { formatearDia, formatearHora } from "../utilidades/fechas";

export default function TarjetaSesion({ sesion }) {
  const disponibles = sesion.capacity - sesion.booked;

  return (
    <Link className="session-card card-lift" to={`/sesiones/${sesion.id}`}>
      <div className="session-top">
        <span className={`tag ${tagDeArea(sesion.area)}`}>{sesion.subject}</span>
        <span className="session-seats">
          {disponibles > 0 ? `${disponibles} cupos` : "Completa"}
        </span>
      </div>
      <p className="session-day">{formatearDia(sesion.date)}</p>
      <h3 className="session-title">{sesion.title}</h3>
      <div className="session-meta">
        <p>
          <Clock className="icon" aria-hidden="true" />
          <span>
            {formatearHora(sesion.date)} · {sesion.durationMin} min
          </span>
        </p>
        <p>
          {sesion.modality === "virtual" ? (
            <Monitor className="icon" aria-hidden="true" />
          ) : (
            <MapPin className="icon" aria-hidden="true" />
          )}
          <span>{sesion.location}</span>
        </p>
        <p>
          <Users className="icon" aria-hidden="true" />
          <span>{sesion.tutorName || "Tutor GEA"}</span>
        </p>
      </div>
    </Link>
  );
}
