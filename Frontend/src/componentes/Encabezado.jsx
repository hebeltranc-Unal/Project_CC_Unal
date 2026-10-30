import { useState } from "react";
import { Hand, Menu } from "lucide-react";
import { Link, NavLink, useNavigate } from "react-router-dom";
import { useAuth } from "../contextos/AuthContext";
import Escudo from "./Escudo";
import Modal from "./Modal";
import BotonCerrar from "./BotonCerrar";

const enlaces = [
  { texto: "Inicio", ruta: "/", exacto: true },
  { texto: "Sesiones", ruta: "/sesiones" },
  { texto: "Recursos", ruta: "/recursos" },
  { texto: "Tutores", ruta: "/tutores" },
  { texto: "Contacto", ruta: "/contacto" },
];

export default function Encabezado() {
  const [menuAbierto, setMenuAbierto] = useState(false);
  const { usuario, cargando, cerrarSesion } = useAuth();
  const navegar = useNavigate();

  async function salir() {
    await cerrarSesion();
    setMenuAbierto(false);
    navegar("/", { replace: true });
  }

  return (
    <>
      <a className="skip-link" href="#main">
        Saltar al contenido
      </a>

      <div className="topbar">
        <div className="container topbar-inner">
          <a
            className="unal-brand"
            href="https://unal.edu.co"
            target="_blank"
            rel="noreferrer"
          >
            <Escudo />
            <span className="hide-sm">Universidad Nacional de Colombia</span>
            <span className="show-sm">UNAL</span>
          </a>
          <div className="topbar-right">
            <a
              className="lsc"
              href="https://unal.edu.co/accesibilidad"
              target="_blank"
              rel="noreferrer"
              aria-label="Accesibilidad en Lengua de Señas Colombiana"
            >
              <Hand className="icon" aria-hidden="true" /> LSC
            </a>
          </div>
        </div>
      </div>

      <header className="site-header">
        <div className="container header-inner">
          <Link className="logo" to="/" aria-label="GEA inicio">
            <span>GEA</span>
            <small>Grupos de Estudio Autónomo</small>
          </Link>

          <nav className="main-nav" aria-label="Principal">
            {enlaces.map((enlace) => (
              <NavLink
                key={enlace.ruta}
                to={enlace.ruta}
                end={enlace.exacto}
                className="nav-link"
              >
                {enlace.texto}
              </NavLink>
            ))}
          </nav>

          <div className="header-actions">
            {!cargando &&
              (usuario ? (
                <>
                  <span className="header-user">
                    Hola, <strong>{usuario.name.split(" ")[0]}</strong>
                  </span>
                  <button
                    className="btn btn-ghost btn-sm"
                    type="button"
                    onClick={salir}
                  >
                    Salir
                  </button>
                </>
              ) : (
                <Link className="btn btn-ghost btn-sm" to="/login">
                  Ingresar
                </Link>
              ))}
            <Link className="btn btn-primary btn-sm btn-pill" to="/sesiones">
              Agendar sesión
            </Link>
          </div>

          <button
            className="menu-toggle"
            type="button"
            aria-label="Abrir menú"
            onClick={() => setMenuAbierto(true)}
          >
            <Menu className="icon" aria-hidden="true" />
          </button>
        </div>
      </header>

      <Modal
        abierto={menuAbierto}
        alCerrar={() => setMenuAbierto(false)}
        clase="drawer"
        etiqueta="Menú"
      >
        <div className="drawer-panel">
          <BotonCerrar
            alCerrar={() => setMenuAbierto(false)}
            clase="drawer-close"
            etiqueta="Cerrar menú"
          />

          <nav className="drawer-nav" aria-label="Menú principal">
            {enlaces.map((enlace) => (
              <NavLink
                key={enlace.ruta}
                to={enlace.ruta}
                end={enlace.exacto}
                onClick={() => setMenuAbierto(false)}
              >
                {enlace.texto}
              </NavLink>
            ))}
          </nav>

          <div className="drawer-actions">
            {usuario ? (
              <>
                <p className="header-user">Sesión: {usuario.name}</p>
                <button
                  className="btn btn-outline btn-block"
                  type="button"
                  onClick={salir}
                >
                  Cerrar sesión
                </button>
              </>
            ) : (
              <Link
                className="btn btn-outline btn-block"
                to="/login"
                onClick={() => setMenuAbierto(false)}
              >
                Ingresar
              </Link>
            )}
            <Link
              className="btn btn-primary btn-block"
              to="/sesiones"
              onClick={() => setMenuAbierto(false)}
            >
              Agendar sesión
            </Link>
          </div>
        </div>
      </Modal>
    </>
  );
}
