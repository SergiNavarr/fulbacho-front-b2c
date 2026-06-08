"use client";

import {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from "react";
import {
  autenticacionService,
  LoginJugadorDto,
  RegistroJugadorDto,
  UsuarioAutenticado,
} from "@/services/autenticacion";

interface AuthContextType {
  usuario: UsuarioAutenticado | null;
  token: string | null;
  isAuthenticated: boolean;
  cargando: boolean;
  loginAsync: (credenciales: LoginJugadorDto) => Promise<void>;
  registrarAsync: (datos: RegistroJugadorDto) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [usuario, setUsuario] = useState<UsuarioAutenticado | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [cargando, setCargando] = useState(true);

  useEffect(() => {
    const tokenGuardado = localStorage.getItem("token");
    const usuarioGuardado = localStorage.getItem("usuario");
    if (tokenGuardado && usuarioGuardado) {
      try {
        // Validar que el string sea JSON parseable antes de intentarlo
        if (usuarioGuardado === "undefined" || usuarioGuardado === "null") {
          throw new Error("Valor inválido en localStorage");
        }
        setToken(tokenGuardado);
        setUsuario(JSON.parse(usuarioGuardado));
      } catch {
        // El valor en localStorage está corrupto (p.ej. "undefined" literal).
        // Limpiar y forzar un nuevo login.
        localStorage.removeItem("token");
        localStorage.removeItem("usuario");
      }
    }
    setCargando(false);
  }, []);

  const loginAsync = async (credenciales: LoginJugadorDto) => {
    const respuesta = await autenticacionService.login(credenciales);
    localStorage.setItem("token", respuesta.token);
    localStorage.setItem("usuario", JSON.stringify(respuesta.usuario));
    setToken(respuesta.token);
    setUsuario(respuesta.usuario);
  };

  const registrarAsync = async (datos: RegistroJugadorDto) => {
    const respuesta = await autenticacionService.registrar(datos);
    localStorage.setItem("token", respuesta.token);
    localStorage.setItem("usuario", JSON.stringify(respuesta.usuario));
    setToken(respuesta.token);
    setUsuario(respuesta.usuario);
  };

  const logout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("usuario");
    setToken(null);
    setUsuario(null);
  };

  return (
    <AuthContext.Provider
      value={{
        usuario,
        token,
        isAuthenticated: !!token,
        cargando,
        loginAsync,
        registrarAsync,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth debe usarse dentro de AuthProvider");
  }
  return context;
}
