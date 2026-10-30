import {
  BookOpen,
  GraduationCap,
  Home,
  Lightbulb,
  Mic,
  Palette,
  Search,
  Trophy,
} from "lucide-react";
import TarjetaRecurso from "../componentes/TarjetaRecurso";
import TituloSeccion from "../componentes/TituloSeccion";

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

const recursosVirtuales = [
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

const programas = [
  {
    titulo: "Exprésa3",
    texto:
      "Concurso anual de comunicación oral, escrita y gráfica para estudiantes de la sede.",
    icono: <Trophy className="icon" aria-hidden="true" />,
  },
  {
    titulo: "Escuela de Pares Tutores",
    texto:
      "Programa de formación para estudiantes que quieren acompañar a otros en su aprendizaje.",
    icono: <GraduationCap className="icon" aria-hidden="true" />,
  },
];

export default function Recursos() {
  return (
    <div className="container page-pad">
      <p className="eyebrow">Recursos</p>
      <h1 className="page-title">Aprende a tu manera</h1>

      <section style={{ marginTop: "4rem" }}>
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
      </section>

      <section style={{ marginTop: "6rem" }}>
        <TituloSeccion etiqueta="Material de apoyo" titulo="Recursos virtuales" />
        <div className="grid-3">
          {recursosVirtuales.map((recurso) => (
            <TarjetaRecurso
              key={recurso.titulo}
              icono={recurso.icono}
              titulo={recurso.titulo}
              texto={recurso.texto}
            />
          ))}
        </div>
      </section>

      <section className="grid-2" style={{ marginTop: "6rem" }}>
        {programas.map((programa) => (
          <TarjetaRecurso
            key={programa.titulo}
            icono={programa.icono}
            titulo={programa.titulo}
            texto={programa.texto}
          />
        ))}
      </section>
    </div>
  );
}
