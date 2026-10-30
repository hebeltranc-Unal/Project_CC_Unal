import { useEffect, useRef } from "react";

export default function Modal({ abierto, alCerrar, clase = "modal", etiqueta, children }) {
  const referencia = useRef(null);

  useEffect(() => {
    const dialogo = referencia.current;
    if (!dialogo) return;

    if (abierto && !dialogo.open) {
      dialogo.showModal();
    }

    if (!abierto && dialogo.open) {
      dialogo.close();
    }
  }, [abierto]);

  function manejarClic(evento) {
    if (evento.target === referencia.current) {
      alCerrar();
    }
  }

  return (
    <dialog
      ref={referencia}
      className={clase}
      aria-label={etiqueta}
      onClick={manejarClic}
      onClose={alCerrar}
    >
      {children}
    </dialog>
  );
}
