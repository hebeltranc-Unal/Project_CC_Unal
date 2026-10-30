export default function TituloSeccion({ etiqueta, titulo, accion, enLinea = false, idTitulo }) {
  return (
    <div className={enLinea ? "section-heading section-heading-inline" : "section-heading"}>
      <div className="section-heading-copy">
        <p className="eyebrow">{etiqueta}</p>
        <h2 id={idTitulo}>{titulo}</h2>
      </div>
      {accion}
    </div>
  );
}
