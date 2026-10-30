import { X } from "lucide-react";

export default function BotonCerrar({ alCerrar, clase = "modal-close", etiqueta = "Cerrar" }) {
  return (
    <button className={clase} type="button" aria-label={etiqueta} onClick={alCerrar}>
      <X className="icon" aria-hidden="true" />
    </button>
  );
}
