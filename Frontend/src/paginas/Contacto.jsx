import { useState } from "react";
import { Clock, Mail, MapPin } from "lucide-react";
import { useOutletContext } from "react-router-dom";
import { api } from "../servicios/api";

export default function Contacto() {
  const { mostrarNotificacion } = useOutletContext();
  const [enviando, setEnviando] = useState(false);
  const [error, setError] = useState("");

  async function enviarMensaje(evento) {
    evento.preventDefault();
    setError("");
    setEnviando(true);

    const formulario = evento.currentTarget;
    const datos = new FormData(formulario);

    try {
      await api.post("/contacto", {
        name: datos.get("name"),
        email: datos.get("email"),
        message: datos.get("message"),
      });
      formulario.reset();
      mostrarNotificacion("Mensaje enviado. Te responderemos pronto.");
    } catch (err) {
      setError(err.message);
    } finally {
      setEnviando(false);
    }
  }

  return (
    <div className="container contact-grid">
      <div>
        <p className="eyebrow">Contacto</p>
        <h1 className="page-title">Hablemos</h1>

        <ul className="contact-info">
          <li>
            <span className="contact-info-icon">
              <Mail className="icon" aria-hidden="true" />
            </span>
            <span>gea_bog@unal.edu.co</span>
          </li>
          <li>
            <span className="contact-info-icon">
              <MapPin className="icon" aria-hidden="true" />
            </span>
            <span>Edificio Uriel Gutiérrez, piso 2 · Bogotá</span>
          </li>
          <li>
            <span className="contact-info-icon">
              <Clock className="icon" aria-hidden="true" />
            </span>
            <span>Lunes a viernes, 8:00 a.m. – 5:00 p.m.</span>
          </li>
        </ul>
      </div>

      <form className="contact-form" onSubmit={enviarMensaje}>
        <div className="field">
          <label htmlFor="c-name">Nombre</label>
          <input id="c-name" name="name" type="text" autoComplete="name" required />
        </div>
        <div className="field">
          <label htmlFor="c-email">Correo</label>
          <input id="c-email" name="email" type="email" autoComplete="email" required />
        </div>
        <div className="field">
          <label htmlFor="c-msg">Mensaje</label>
          <textarea id="c-msg" name="message" rows="5" required></textarea>
        </div>
        {error && <p className="field-error">{error}</p>}
        <button
          className="btn btn-primary btn-pill btn-block"
          type="submit"
          disabled={enviando}
        >
          {enviando ? "Enviando…" : "Enviar"}
        </button>
      </form>
    </div>
  );
}
