import { useEffect } from "react";
import { Navigate, Route, Routes, useLocation } from "react-router-dom";
import LayoutSitio from "./componentes/LayoutSitio";
import RutaProtegida from "./componentes/RutaProtegida";
import Admin from "./paginas/Admin";
import Contacto from "./paginas/Contacto";
import DetalleSesion from "./paginas/DetalleSesion";
import Inicio from "./paginas/Inicio";
import Login from "./paginas/Login";
import MisReservas from "./paginas/MisReservas";
import PanelTutor from "./paginas/PanelTutor";
import Recursos from "./paginas/Recursos";
import Sesiones from "./paginas/Sesiones";
import Tutores from "./paginas/Tutores";

function SubirAlInicio() {
  const { pathname } = useLocation();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);

  return null;
}

export default function App() {
  return (
    <>
      <SubirAlInicio />
      <Routes>
        <Route element={<LayoutSitio />}>
          <Route index element={<Inicio />} />
          <Route path="sesiones" element={<Sesiones />} />
          <Route path="sesiones/:id" element={<DetalleSesion />} />
          <Route path="recursos" element={<Recursos />} />
          <Route path="tutores" element={<Tutores />} />
          <Route path="contacto" element={<Contacto />} />
          <Route path="login" element={<Login />} />
          <Route
            path="mis-reservas"
            element={
              <RutaProtegida roles={["estudiante"]}>
                <MisReservas />
              </RutaProtegida>
            }
          />
          <Route
            path="tutor"
            element={
              <RutaProtegida roles={["tutor"]}>
                <PanelTutor />
              </RutaProtegida>
            }
          />
        </Route>
        <Route
          path="admin"
          element={
            <RutaProtegida roles={["coordinador"]}>
              <Admin />
            </RutaProtegida>
          }
        />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </>
  );
}
