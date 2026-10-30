import { Link } from "react-router-dom";
import Escudo from "./Escudo";

export default function PieDePagina() {
  return (
    <footer className="site-footer">
      <div className="container footer-grid">
        <div className="footer-brand">
          <div className="footer-brand-head">
            <Escudo />
            <div>
              <p>GEA</p>
              <p>Dirección Académica · Sede Bogotá</p>
            </div>
          </div>
          <p className="footer-address">
            Carrera 45 # 26-85, Edificio Uriel Gutiérrez. Bogotá D.C., Colombia. Atención: lunes
            a viernes, 8:00 a.m. – 5:00 p.m.
          </p>
        </div>

        <div>
          <p className="footer-title">GEA</p>
          <ul className="footer-links">
            <li>
              <Link to="/sesiones">Sesiones</Link>
            </li>
            <li>
              <Link to="/recursos">Recursos</Link>
            </li>
            <li>
              <Link to="/tutores">Tutores</Link>
            </li>
            <li>
              <Link to="/contacto">Contacto</Link>
            </li>
            <li>
              <Link to="/mis-reservas">Mis reservas</Link>
            </li>
            <li>
              <Link to="/tutor">Panel del tutor</Link>
            </li>
            <li>
              <Link to="/admin">Administración</Link>
            </li>
          </ul>
        </div>

        <div>
          <p className="footer-title">Institucional</p>
          <ul className="footer-links">
            <li>
              <a href="https://unal.edu.co/regimen-legal" target="_blank" rel="noreferrer">
                Régimen legal
              </a>
            </li>
            <li>
              <a href="https://unal.edu.co" target="_blank" rel="noreferrer">
                Talento humano
              </a>
            </li>
            <li>
              <a href="https://unal.edu.co" target="_blank" rel="noreferrer">
                Contratación
              </a>
            </li>
            <li>
              <a href="https://unal.edu.co" target="_blank" rel="noreferrer">
                Rendición de cuentas
              </a>
            </li>
            <li>
              <a href="https://unal.edu.co/proteccion-de-datos" target="_blank" rel="noreferrer">
                Política de datos
              </a>
            </li>
            <li>
              <a href="https://unal.edu.co/transparencia" target="_blank" rel="noreferrer">
                Transparencia
              </a>
            </li>
          </ul>
        </div>
      </div>

      <div className="footer-bottom">
        <div className="container footer-bottom-inner">
          <p>© 2026 Universidad Nacional de Colombia. Todos los derechos reservados.</p>
          <div className="footer-seals">
            <a href="https://www.gov.co" target="_blank" rel="noreferrer">
              GOV.CO
            </a>
            <a href="https://www.contaduria.gov.co" target="_blank" rel="noreferrer">
              Contaduría General
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}
