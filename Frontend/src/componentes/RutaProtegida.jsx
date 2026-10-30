import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "../contextos/AuthContext";

const PANEL_POR_ROL = {
  estudiante: "/mis-reservas",
  tutor: "/tutor",
  coordinador: "/admin",
};

export default function RutaProtegida({ roles, children }) {
  const { usuario, cargando } = useAuth();
  const location = useLocation();

  if (cargando) {
    return (
      <div className="container page-pad">
        <p className="estado-pagina">Cargando sesión…</p>
      </div>
    );
  }

  if (!usuario) {
    return (
      <Navigate to="/login" replace state={{ desde: location.pathname }} />
    );
  }

  if (roles && !roles.includes(usuario.role)) {
    return <Navigate to={PANEL_POR_ROL[usuario.role] || "/"} replace />;
  }

  return children;
}
