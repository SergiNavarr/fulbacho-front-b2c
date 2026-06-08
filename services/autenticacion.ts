import clienteHttp from "./clienteHttp";

export interface LoginJugadorDto {
  email: string;
  contrasena: string;
}

export interface RegistroJugadorDto {
  nombre: string;
  email: string;
  contrasena: string;
  telefono?: string;
}

export interface UsuarioAutenticado {
  username: string;
  email: string;
  rol: string;
}

export interface RespuestaLogin {
  token: string;
  usuario: UsuarioAutenticado;
}

// Refleja exactamente el RespuestaLoginDto del backend
interface RespuestaLoginBackend {
  token: string;
  username: string;
  email: string;
  rol: string;
  expiracion: string;
}

export const autenticacionService = {
  login: async (credenciales: LoginJugadorDto): Promise<RespuestaLogin> => {
    const { data } = await clienteHttp.post<RespuestaLoginBackend>(
      "/Autenticacion/login",
      { email: credenciales.email, password: credenciales.contrasena }
    );
    return {
      token: data.token,
      usuario: {
        username: data.username,
        email: data.email,
        rol: data.rol,
      },
    };
  },

  registrar: async (datos: RegistroJugadorDto): Promise<RespuestaLogin> => {
    const { data } = await clienteHttp.post<RespuestaLoginBackend>(
      "/Autenticacion/registro",
      {
        username: datos.nombre,
        email: datos.email,
        password: datos.contrasena,
        telefono: datos.telefono,
      }
    );
    return {
      token: data.token,
      usuario: {
        username: data.username,
        email: data.email,
        rol: data.rol,
      },
    };
  },
};
