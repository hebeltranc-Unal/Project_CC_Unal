import { useEffect, useState } from "react";
import {
  ArrowRight,
  BookOpen,
  CalendarCheck,
  ChevronLeft,
  ChevronRight,
  Home,
  Lightbulb,
  Mic,
  Palette,
  Pause,
  Play,
  Search,
  Users,
} from "lucide-react";
import { Link } from "react-router-dom";
import TarjetaRecurso from "../componentes/TarjetaRecurso";
import TarjetaSesion from "../componentes/TarjetaSesion";
import TarjetaTutor from "../componentes/TarjetaTutor";
import TituloSeccion from "../componentes/TituloSeccion";
import { api } from "../servicios/api";

const diapositivas = [
  {
    imagen: "/img/hero-1.jpg",
    etiqueta: "Grupos de Estudio Autónomo",
    titulo: "Te esperamos con las puertas abiertas",
    texto:
      "Acompañamiento entre pares para que estudies con confianza, método y compañía.",
    enlace: "/sesiones",
    textoEnlace: "Ver sesiones",
  },
  {
    imagen: "/img/hero-2.jpg",
    etiqueta: "Pares tutores",
    titulo: "Aprende de quien ya recorrió el camino",
    texto: "Estudiantes de la UNAL te apoyan en las asignaturas que más te retan.",
    enlace: "/tutores",
    textoEnlace: "Conoce a los tutores",
  },
  {
    imagen: "/img/hero-3.jpg",
    etiqueta: "Recursos",
    titulo: "Estudia a tu ritmo, donde estés",
    texto: "Guías, métodos y material de apoyo para tu vida académica.",
    enlace: "/recursos",
    textoEnlace: "Explorar recursos",
  },
  {
    imagen: "/img/expresa.jpg",
    etiqueta: "Exprésa3",
    titulo: "Tu voz también se aprende",
    texto: "Participa en el concurso de comunicación oral, escrita y gráfica.",
    enlace: "/recursos",
    textoEnlace: "Saber más",
  },
];

const pasos = [
  {
    numero: "01",
    titulo: "Elige tu asignatura",
    texto: "Explora las sesiones por área, materia o modalidad.",
    icono: <BookOpen className="icon" aria-hidden="true" />,
  },
  {
    numero: "02",
    titulo: "Reserva tu cupo",
    texto: "Confirma con tu correo institucional en segundos.",
    icono: <CalendarCheck className="icon" aria-hidden="true" />,
  },
  {
    numero: "03",
    titulo: "Estudia con un par",
    texto: "Un tutor estudiante te acompaña con cercanía y método.",
    icono: <Users className="icon" aria-hidden="true" />,
  },
];

const estadisticas = [
  { valor: "12.400+", texto: "estudiantes atendidos" },
  { valor: "85", texto: "pares tutores" },
  { valor: "60", texto: "asignaturas apoyadas" },
  { valor: "9.800", texto: "sesiones realizadas" },
];

const consejos = [
  {
    titulo: "Bitácora de aprendizaje",
    texto: "Registra lo que aprendes cada día para reconocer avances y dificultades.",
    icono: <BookOpen className="icon" aria-hidden="true" />,
  },
  {
    titulo: "Estudiar en casa",
    texto: "Recomendaciones para crear un espacio y una rutina que favorezcan la concentración.",
    icono: <Home className="icon" aria-hidden="true" />,
  },
  {
    titulo: "Método Feynman",
    texto: "Explica un concepto con palabras simples: si puedes enseñarlo, lo entendiste.",
    icono: <Lightbulb className="icon" aria-hidden="true" />,
  },
];

const materiales = [
  {
    titulo: "Comunicación oral",
    texto: "Herramientas para exponer, argumentar y hablar en público con seguridad.",
    icono: <Mic className="icon" aria-hidden="true" />,
  },
  {
    titulo: "Comunicación gráfica y visual",
    texto: "Diseña presentaciones, pósteres e infografías claras y efectivas.",
    icono: <Palette className="icon" aria-hidden="true" />,
  },
  {
    titulo: "Metodología de la investigación",
    texto: "Desde la pregunta hasta el informe final: guías para investigar con rigor.",
    icono: <Search className="icon" aria-hidden="true" />,
  },
];

export default function Inicio() {
  const [diapositivaActual, setDiapositivaActual] = useState(0);
  const [reproduciendo, setReproduciendo] = useState(
    () => !window.matchMedia("(prefers-reduced-motion: reduce)").matches
  );
  const [sesiones, setSesiones] = useState([]);
  const [tutores, setTutores] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    Promise.all([api.get("/sesiones?kind=sesion"), api.get("/usuarios?rol=tutor")])
      .then(([listaSesiones, listaTutores]) => {
        setSesiones(listaSesiones.slice(0, 6));
        setTutores(listaTutores.slice(0, 3));
      })
      .catch((err) => setError(err.message))
      .finally(() => setCargando(false));
  }, []);

  useEffect(() => {
    if (!reproduciendo) return;

    const intervalo = setInterval(() => {
      setDiapositivaActual((actual) => (actual + 1) % diapositivas.length);
    }, 6500);

    return () => clearInterval(intervalo);
  }, [reproduciendo]);

  function irA(indice) {
    setDiapositivaActual((indice + diapositivas.length) % diapositivas.length);
  }

  return (
    <>
      <section className="hero" aria-roledescription="carrusel" aria-label="Destacados">
        <div className="hero-shell">
          <div className="hero-viewport">
            <div
              className="hero-track"
              style={{ transform: `translateX(-${diapositivaActual * 100}%)` }}
            >
              {diapositivas.map((diapositiva, indice) => (
                <article
                  className="hero-slide"
                  role="group"
                  aria-roledescription="diapositiva"
                  aria-label={`${indice + 1} de ${diapositivas.length}`}
                  aria-hidden={indice !== diapositivaActual}
                  inert={indice !== diapositivaActual}
                  key={diapositiva.titulo}
                >
                  <img
                    src={diapositiva.imagen}
                    alt=""
                    width="1920"
                    height="1088"
                    loading={indice === 0 ? "eager" : "lazy"}
                  />
                  <div className="hero-overlay"></div>
                  <div className="hero-content">
                    <div className="container hero-content-inner">
                      <div className="hero-copy">
                        <p className="hero-eyebrow">{diapositiva.etiqueta}</p>
                        {indice === 0 ? (
                          <h1 className="hero-title">{diapositiva.titulo}</h1>
                        ) : (
                          <h2 className="hero-title">{diapositiva.titulo}</h2>
                        )}
                        <p className="hero-sub">{diapositiva.texto}</p>
                        <Link
                          className="btn btn-secondary btn-lg btn-pill"
                          to={diapositiva.enlace}
                        >
                          {diapositiva.textoEnlace}
                          <ArrowRight className="icon" aria-hidden="true" />
                        </Link>
                      </div>
                    </div>
                  </div>
                </article>
              ))}
            </div>
          </div>

          <div className="hero-controls">
            <div className="container hero-controls-inner">
              <div className="hero-dots">
                {diapositivas.map((diapositiva, indice) => (
                  <button
                    className="hero-dot"
                    type="button"
                    key={diapositiva.titulo}
                    aria-label={`Ir a diapositiva ${indice + 1}`}
                    aria-current={indice === diapositivaActual}
                    onClick={() => irA(indice)}
                  ></button>
                ))}
              </div>

              <div className="hero-arrows">
                <button
                  className="hero-arrow"
                  type="button"
                  aria-label={reproduciendo ? "Pausar" : "Reproducir"}
                  aria-pressed={!reproduciendo}
                  onClick={() => setReproduciendo(!reproduciendo)}
                >
                  {reproduciendo ? (
                    <Pause className="icon" aria-hidden="true" />
                  ) : (
                    <Play className="icon" aria-hidden="true" />
                  )}
                </button>
                <button
                  className="hero-arrow"
                  type="button"
                  aria-label="Anterior"
                  onClick={() => irA(diapositivaActual - 1)}
                >
                  <ChevronLeft className="icon" aria-hidden="true" />
                </button>
                <button
                  className="hero-arrow"
                  type="button"
                  aria-label="Siguiente"
                  onClick={() => irA(diapositivaActual + 1)}
                >
                  <ChevronRight className="icon" aria-hidden="true" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="section">
        <div className="container">
          <TituloSeccion
            etiqueta="Agenda"
            titulo="Próximas sesiones"
            accion={
              <Link className="btn btn-outline btn-pill" to="/sesiones">
                Ver todas
                <ArrowRight className="icon" aria-hidden="true" />
              </Link>
            }
          />

          {cargando && <p className="estado-pagina">Cargando sesiones…</p>}
          {error && <p className="field-error">{error}</p>}
          <div className="grid-3">
            {sesiones.map((sesion) => (
              <TarjetaSesion sesion={sesion} key={sesion.id} />
            ))}
          </div>
        </div>
      </section>

      <section className="section section-soft">
        <div className="container">
          <TituloSeccion etiqueta="Cómo funciona" titulo="Tres pasos para estudiar acompañado" />

          <ol className="steps-grid">
            {pasos.map((paso) => (
              <li key={paso.numero}>
                <div className="step-card">
                  <div className="step-top">
                    <span className="step-icon">{paso.icono}</span>
                    <span className="step-number">{paso.numero}</span>
                  </div>
                  <h3>{paso.titulo}</h3>
                  <p>{paso.texto}</p>
                </div>
              </li>
            ))}
          </ol>
        </div>
      </section>

      <section className="section">
        <div className="container">
          <TituloSeccion etiqueta="Impacto" titulo="Una comunidad que aprende junta" />

          <dl className="stats">
            {estadisticas.map((estadistica) => (
              <div key={estadistica.texto}>
                <dt className="sr-only">{estadistica.texto}</dt>
                <dd>{estadistica.valor}</dd>
                <p>{estadistica.texto}</p>
              </div>
            ))}
          </dl>
        </div>
      </section>

      <section className="section-tight">
        <div className="container">
          <TituloSeccion etiqueta="Consejos" titulo="Para estudiar mejor" />

          <div className="grid-3">
            {consejos.map((consejo) => (
              <TarjetaRecurso
                key={consejo.titulo}
                icono={consejo.icono}
                titulo={consejo.titulo}
                texto={consejo.texto}
              />
            ))}
          </div>
        </div>
      </section>

      <section className="section">
        <div className="container">
          <TituloSeccion
            etiqueta="Material de apoyo"
            titulo="Recursos para tu formación"
          />

          <div className="grid-3">
            {materiales.map((material) => (
              <TarjetaRecurso
                key={material.titulo}
                icono={material.icono}
                titulo={material.titulo}
                texto={material.texto}
              />
            ))}
          </div>
        </div>
      </section>

      <section className="container">
        <div className="grid-2">
          <article className="banner card-lift grain">
            <img src="/img/expresa.jpg" alt="" loading="lazy" width="1280" height="960" />
            <div className="banner-overlay"></div>
            <div className="banner-content">
              <p className="banner-eyebrow">Concurso</p>
              <h3>Exprésa3</h3>
              <p>
                Comunicación oral, escrita y gráfica: muestra tu voz y gana reconocimiento
                institucional.
              </p>
              <Link className="btn btn-secondary btn-pill" to="/recursos">
                Explorar
                <ArrowRight className="icon" aria-hidden="true" />
              </Link>
            </div>
          </article>

          <article className="banner card-lift grain">
            <img src="/img/hero-2.jpg" alt="" loading="lazy" width="1280" height="960" />
            <div className="banner-overlay"></div>
            <div className="banner-content">
              <p className="banner-eyebrow">Formación</p>
              <h3>Escuela de Pares Tutores</h3>
              <p>
                Fórmate como tutor y acompaña a otros estudiantes en su proceso de aprendizaje.
              </p>
              <Link className="btn btn-secondary btn-pill" to="/recursos">
                Explorar
                <ArrowRight className="icon" aria-hidden="true" />
              </Link>
            </div>
          </article>
        </div>
      </section>

      <section className="section">
        <div className="container">
          <TituloSeccion
            etiqueta="Nuestro equipo"
            titulo="Conoce a los pares tutores"
            accion={
              <Link className="btn btn-outline btn-pill" to="/tutores">
                Ver todas
              </Link>
            }
          />

          {cargando && <p className="estado-pagina">Cargando tutores…</p>}
          <div className="grid-3">
            {tutores.map((tutor) => (
              <TarjetaTutor tutor={tutor} key={tutor.id} />
            ))}
          </div>
        </div>
      </section>

      <section className="container">
        <div className="cta">
          <h2>Hablemos</h2>
          <p>gea_bog@unal.edu.co · Edificio Uriel Gutiérrez, piso 2</p>
          <Link className="btn btn-secondary btn-lg btn-pill" to="/contacto">
            Contacto
          </Link>
        </div>
      </section>
    </>
  );
}
