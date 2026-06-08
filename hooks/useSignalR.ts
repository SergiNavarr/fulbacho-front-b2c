"use client";

import { useEffect, useRef, useState } from "react";
import { HubConnectionBuilder, HubConnection } from "@microsoft/signalr";

interface Opciones {
  idEquipo: number | null;
  onDesafioActualizado: (desafioId: number, evento: string) => void;
}

export function useSignalR({ idEquipo, onDesafioActualizado }: Opciones) {
  const [conectado, setConectado] = useState(false);
  const callbackRef = useRef(onDesafioActualizado);

  useEffect(() => {
    callbackRef.current = onDesafioActualizado;
  });

  useEffect(() => {
    if (!idEquipo) return;

    const hubUrl =
      process.env.NEXT_PUBLIC_SIGNALR_URL || "http://localhost:5211/hubs/fulbacho";

    const conexion: HubConnection = new HubConnectionBuilder()
      .withUrl(hubUrl, {
        accessTokenFactory: () => {
          if (typeof window !== "undefined") {
            return localStorage.getItem("token") || "";
          }
          return "";
        },
      })
      .withAutomaticReconnect()
      .build();

    conexion.on("DesafioActualizado", (desafioId: number, evento: string) => {
      callbackRef.current(desafioId, evento);
    });

    conexion.onreconnecting(() => setConectado(false));
    conexion.onreconnected(() => {
      setConectado(true);
      conexion.invoke("UnirseAGrupoEquipo", idEquipo).catch(console.error);
    });

    conexion
      .start()
      .then(() => {
        setConectado(true);
        return conexion.invoke("UnirseAGrupoEquipo", idEquipo);
      })
      .catch((err: Error) => {
        console.error("Error al conectar con SignalR:", err);
      });

    return () => {
      conexion.stop().catch(console.error);
      setConectado(false);
    };
  }, [idEquipo]);

  return { conectado };
}
