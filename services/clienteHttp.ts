import axios from "axios";
import { API_BASE_URL } from "./api";

const clienteHttp = axios.create({
  baseURL: `${API_BASE_URL}/b2c`,
  headers: {
    "Content-Type": "application/json",
  },
});

clienteHttp.interceptors.request.use((config) => {
  if (typeof window !== "undefined") {
    const token = localStorage.getItem("token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
  }
  return config;
});

clienteHttp.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401 && typeof window !== "undefined") {
      localStorage.removeItem("token");
      localStorage.removeItem("usuario");
    }
    return Promise.reject(error);
  }
);

export default clienteHttp;
