import { useState } from "react";

export function useNotificaciones() {
  const [notificaciones, setNotificaciones] = useState([]);

  function mostrarNotificacion(titulo, descripcion = "") {
    const id = `${Date.now()}-${Math.random()}`;
    setNotificaciones((actuales) => [...actuales, { id, titulo, descripcion }]);

    setTimeout(() => {
      setNotificaciones((actuales) => actuales.filter((item) => item.id !== id));
    }, 4400);
  }

  return { notificaciones, mostrarNotificacion };
}

export function Notificaciones({ notificaciones }) {
  return (
    <div className="toast-region" role="status" aria-live="polite">
      {notificaciones.map((notificacion) => (
        <div className="toast" key={notificacion.id}>
          <strong>{notificacion.titulo}</strong>
          {notificacion.descripcion && <p>{notificacion.descripcion}</p>}
        </div>
      ))}
    </div>
  );
}
