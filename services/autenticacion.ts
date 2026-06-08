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
  id: number;
  nombre: string;
  email: string;
}

export interface RespuestaLogin {
  token: string;
  usuario: UsuarioAutenticado;
}

export const autenticacionService = {
  login: async (credenciales: LoginJugadorDto): Promise<RespuestaLogin> => {
    const payloadBackend = {
      email: credenciales.email,
      password: credenciales.contrasena
    };

    const { data } = await clienteHttp.post<RespuestaLogin>(
      "/Autenticacion/login",
      payloadBackend
    );
    return data;
  },

  registrar: async (datos: RegistroJugadorDto): Promise<RespuestaLogin> => {
    const payloadBackend = {
      username: datos.nombre,
      email: datos.email,
      password: datos.contrasena,
      telefono: datos.telefono
    };

    const { data } = await clienteHttp.post<RespuestaLogin>(
      "/Autenticacion/registro",
      payloadBackend
    );
    return data;
  },
};