import { useState } from "react";
import { Link, Navigate, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../contextos/AuthContext";

const PANEL_POR_ROL = {
  estudiante: "/mis-reservas",
  tutor: "/tutor",
  coordinador: "/admin",
};

export default function Login() {
  const { usuario, iniciarSesion } = useAuth();
  const navegar = useNavigate();
  const location = useLocation();
  const [correo, setCorreo] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [enviando, setEnviando] = useState(false);

  if (usuario) {
    return <PanelDestino usuario={usuario} />;
  }

  async function enviar(evento) {
    evento.preventDefault();
    setError("");
    setEnviando(true);
    try {
      const datos = await iniciarSesion(correo.trim(), password);
      const destino =
        location.state?.desde || PANEL_POR_ROL[datos.role] || "/";
      navegar(destino, { replace: true });
    } catch (err) {
      setError(err.message || "No se pudo iniciar sesión");
    } finally {
      setEnviando(false);
    }
  }

  return (
    <div className="login-page">
      <div className="login-card">
        <p className="eyebrow">GEA</p>
        <h1 className="page-title">Ingresar</h1>
        <p className="page-lead">
          Usa tu correo institucional y tu contraseña para acceder a tu panel.
        </p>

        <form className="form-stack login-form" onSubmit={enviar}>
          <div className="field">
            <label htmlFor="login-email">Correo institucional</label>
            <input
              id="login-email"
              type="email"
              autoComplete="email"
              placeholder="usuario@unal.edu.co"
              value={correo}
              onChange={(evento) => setCorreo(evento.target.value)}
              required
            />
          </div>

          <div className="field">
            <label htmlFor="login-password">Contraseña</label>
            <input
              id="login-password"
              type="password"
              autoComplete="current-password"
              value={password}
              onChange={(evento) => setPassword(evento.target.value)}
              required
            />
          </div>

          {error && (
            <p className="field-error" role="alert">
              {error}
            </p>
          )}

          <button
            className="btn btn-primary btn-block btn-pill"
            type="submit"
            disabled={enviando}
          >
            {enviando ? "Ingresando…" : "Ingresar"}
          </button>
        </form>

        <p className="login-note">
          ¿No tienes cuenta? <Link to="/">Volver al inicio</Link>
        </p>
      </div>
    </div>
  );
}

function PanelDestino({ usuario }) {
  const destino = PANEL_POR_ROL[usuario.role] || "/";
  return <Navigate to={destino} replace />;
}
