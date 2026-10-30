import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import App from "./App.jsx";
import { AuthProvider } from "./contextos/AuthContext.jsx";

// Base y componentes generales
import "./estilos/base.css";
import "./estilos/componentes/encabezado.css";
import "./estilos/paginas/inicio.css";
import "./estilos/componentes/secciones.css";
import "./estilos/componentes/etiquetas.css";
import "./estilos/componentes/tarjetaSesion.css";
import "./estilos/componentes/pasos.css";
import "./estilos/componentes/estadisticas.css";
import "./estilos/componentes/tarjetaRecurso.css";
import "./estilos/componentes/banner.css";
import "./estilos/componentes/tarjetaTutor.css";
import "./estilos/componentes/cta.css";
import "./estilos/componentes/pieDePagina.css";

// Páginas del sitio
import "./estilos/paginas/comunes.css";
import "./estilos/paginas/sesiones.css";
import "./estilos/paginas/detalleSesion.css";
import "./estilos/componentes/progreso.css";
import "./estilos/paginas/contacto.css";
import "./estilos/paginas/login.css";

// Modales y avisos
import "./estilos/componentes/modal.css";
import "./estilos/componentes/notificaciones.css";

// Panel administrativo
import "./estilos/paginas/admin.css";
import "./estilos/componentes/admin/formularioReunion.css";
import "./estilos/componentes/admin/listaReuniones.css";
import "./estilos/componentes/admin/tablaAdmin.css";
import "./estilos/componentes/admin/reportesAdmin.css";
import "./estilos/componentes/admin/edicionAdmin.css";

// Vistas de estudiante y tutor
import "./estilos/paginas/misReservas.css";
import "./estilos/paginas/panelTutor.css";
import "./estilos/paginas/adminResponsive.css";
import "./estilos/componentes/formularioSesion.css";

// Accesibilidad siempre de último para respetar las preferencias del sistema
import "./estilos/accesibilidad.css";

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <BrowserRouter>
      <AuthProvider>
        <App />
      </AuthProvider>
    </BrowserRouter>
  </StrictMode>
);
