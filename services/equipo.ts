import { API_BASE_URL } from "./api";

export interface CrearEquipoRequest {
  nombre: string;
  escudoUrl?: string;
  idNivel: number;
}

export interface EquipoResponse {
  id: number;
  nombre: string;
  nivel: string;
  escudoUrl: string;
}

export const equipoService = {
  // Función específica para crear un equipo
  crear: async (data: CrearEquipoRequest): Promise<boolean> => {
    try {
      const response = await fetch(`${API_BASE_URL}/b2c/Equipos`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        throw new Error("Error al guardar en el backend");
      }

      return true;
    } catch (error) {
      console.error("Error en equipoService.crear:", error);
      throw error; 
    }
  },
  actualizar: async (id: number, data: CrearEquipoRequest): Promise<boolean> => {
    try {
      const response = await fetch(`${API_BASE_URL}/b2c/Equipos/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      if (!response.ok) throw new Error("Error al actualizar");
      return true;
    } catch (error) {
      console.error("Error en equipoService.actualizar:", error);
      throw error;
    }
  },
  obtenerMisEquipos: async (): Promise<EquipoResponse[]> => {
    try {
      const response = await fetch(`${API_BASE_URL}/b2c/Equipos/mis-equipos`);
      if (!response.ok) throw new Error("Error al obtener los equipos");
      
      const data = await response.json();
      return data;
    } catch (error) {
      console.error("Error en equipoService.obtenerMisEquipos:", error);
      return []; 
    }
  },
};