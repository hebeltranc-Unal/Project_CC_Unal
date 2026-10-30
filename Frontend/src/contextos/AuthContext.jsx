import { createContext, useContext, useEffect, useState } from "react";
import { api } from "../servicios/api";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [usuario, setUsuario] = useState(null);
  const [cargando, setCargando] = useState(true);

  useEffect(() => {
    api
      .get("/auth/me")
      .then((datos) => setUsuario(datos))
      .catch(() => setUsuario(null))
      .finally(() => setCargando(false));
  }, []);

  async function iniciarSesion(email, password) {
    const datos = await api.post("/auth/login", { email, password });
    setUsuario(datos);
    return datos;
  }

  async function cerrarSesion() {
    try {
      await api.post("/auth/logout");
    } finally {
      setUsuario(null);
    }
  }

  return (
    <AuthContext.Provider
      value={{ usuario, cargando, iniciarSesion, cerrarSesion }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const contexto = useContext(AuthContext);
  if (!contexto) {
    throw new Error("useAuth debe usarse dentro de AuthProvider");
  }
  return contexto;
}
