import { Outlet } from "react-router-dom";
import Encabezado from "./Encabezado";
import PieDePagina from "./PieDePagina";
import { Notificaciones, useNotificaciones } from "./Notificaciones";

export default function LayoutSitio() {
  const { notificaciones, mostrarNotificacion } = useNotificaciones();

  return (
    <>
      <Encabezado />
      <main id="main">
        <Outlet context={{ mostrarNotificacion }} />
      </main>
      <PieDePagina />
      <Notificaciones notificaciones={notificaciones} />
    </>
  );
}
