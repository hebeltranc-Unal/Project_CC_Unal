import { ArrowUpRight } from "lucide-react";

export default function TarjetaRecurso({ icono, titulo, texto }) {
  return (
    <article className="resource-card card-lift">
      <span className="resource-icon">{icono}</span>
      <h3>{titulo}</h3>
      <p>{texto}</p>
      <span className="resource-more">
        Ver más
        <ArrowUpRight className="icon" aria-hidden="true" />
      </span>
    </article>
  );
}
