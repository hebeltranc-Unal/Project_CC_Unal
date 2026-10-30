import { useEffect, useState } from "react";
import TarjetaTutor from "../componentes/TarjetaTutor";
import { api } from "../servicios/api";

export default function Tutores() {
  const [tutores, setTutores] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    api
      .get("/usuarios?rol=tutor")
      .then((datos) => setTutores(datos))
      .catch((err) => setError(err.message))
      .finally(() => setCargando(false));
  }, []);

  return (
    <div className="container page-pad">
      <p className="eyebrow">Nuestro equipo</p>
      <h1 className="page-title">Pares tutores</h1>
      <p className="page-lead">
        Estudiantes formados en la Escuela de Pares Tutores, listos para acompañarte.
      </p>

      {cargando && <p className="estado-pagina">Cargando tutores…</p>}
      {error && <p className="field-error">{error}</p>}

      <div className="grid-3" style={{ marginTop: "3rem" }}>
        {tutores.map((tutor) => (
          <TarjetaTutor tutor={tutor} key={tutor.id} />
        ))}
      </div>
    </div>
  );
}
