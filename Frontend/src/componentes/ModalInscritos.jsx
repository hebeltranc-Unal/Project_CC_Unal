import Modal from "./Modal";
import BotonCerrar from "./BotonCerrar";

export default function ModalInscritos({
  abierto,
  alCerrar,
  titulo,
  subtitulo,
  estudiantes,
  mensajeVacio,
  claseMensajeVacio = "empty-state",
}) {
  return (
    <Modal abierto={abierto} alCerrar={alCerrar} etiqueta={titulo}>
      <div className="modal-card">
        <BotonCerrar alCerrar={alCerrar} />
        <h2 className="modal-title">{titulo}</h2>
        <p className="modal-desc">{subtitulo}</p>
        <div className="modal-body">
          <div className="enrolled-list">
            {estudiantes.length === 0 ? (
              <p className={claseMensajeVacio}>{mensajeVacio}</p>
            ) : (
              estudiantes.map((estudiante, indice) => (
                <div className="enrolled-item" key={`${estudiante.email}-${indice}`}>
                  <span className="enrolled-index">
                    {String(indice + 1).padStart(2, "0")}
                  </span>
                  <div className="enrolled-body">
                    <strong>{estudiante.name}</strong>
                    <span>
                      {estudiante.email} · {estudiante.program}
                    </span>
                  </div>
                  <span className="tag tag-primary">{estudiante.status}</span>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </Modal>
  );
}
