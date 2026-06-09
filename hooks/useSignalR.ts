"use client";

import { useEffect, useRef, useState } from "react";
import { HubConnectionBuilder, HubConnection } from "@microsoft/signalr";

// Contrato real del back: emite SIEMPRE el método "DesafioActualizado" con UN
// solo payload que trae el estado ("Creado"|"Aceptado"|"Rechazado") y los datos
// del desafío. El casing depende de cómo serialice el JSON el back (C# es
// PascalCase, pero SignalR puede mandar camelCase), por eso aceptamos ambas
// variantes y la discriminación real la hace el consumidor.
export interface DesafioEventoPayload {
  id?: number;
  Id?: number;
  desafioId?: number;
  DesafioId?: number;
  estado?: string;
  Estado?: string;
  [key: string]: unknown;
}

interface Opciones {
  idEquipo: number | null;
  onDesafioActualizado: (payload: DesafioEventoPayload) => void;
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

    conexion.on("DesafioActualizado", (payload: DesafioEventoPayload) => {
      callbackRef.current(payload);
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
