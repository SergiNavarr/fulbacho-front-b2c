"use client";

import { useState, useEffect } from "react";
import { ArrowLeft, MapPin, CalendarPlus, Swords, Shield } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Spinner } from "@/components/ui/spinner";
import { CanchaResponse, PredioResponse } from "@/services/predio";
import { reservaService } from "@/services/reserva";
import { desafioService, RivalResponse } from "@/services/desafio";

interface Props {
  predio: PredioResponse;
  // Necesario para el flujo de desafío (equipo local del usuario).
  idEquipoLocal?: number | null;
  showToast: (msg: string) => void;
  onBack: () => void;
}

// El input type="time" devuelve "HH:mm"; el back espera un TimeSpan "HH:mm:ss".
const aTimeSpan = (hora: string) => (hora.length === 5 ? `${hora}:00` : hora);

export default function DetallePredioView({ predio, idEquipoLocal, showToast, onBack }: Props) {
  const canchas = predio.canchas ?? [];

  // Estado del modal de Reserva
  const [canchaReserva, setCanchaReserva] = useState<CanchaResponse | null>(null);
  const [fechaHoraReserva, setFechaHoraReserva] = useState("");
  const [horaFinReserva, setHoraFinReserva] = useState("");
  const [reservando, setReservando] = useState(false);

  // Estado del modal de Desafío
  const [canchaDesafio, setCanchaDesafio] = useState<CanchaResponse | null>(null);
  const [rivales, setRivales] = useState<RivalResponse[]>([]);
  const [cargandoRivales, setCargandoRivales] = useState(false);
  const [idRival, setIdRival] = useState("");
  const [fechaDesafio, setFechaDesafio] = useState("");
  const [horaInicioDesafio, setHoraInicioDesafio] = useState("");
  const [horaFinDesafio, setHoraFinDesafio] = useState("");
  const [desafiando, setDesafiando] = useState(false);

  // --- Reserva ---
  const abrirReserva = (cancha: CanchaResponse) => {
    setCanchaReserva(cancha);
    setFechaHoraReserva("");
    setHoraFinReserva("");
  };

  const confirmarReserva = async () => {
    if (!canchaReserva || !fechaHoraReserva || !horaFinReserva) return;
    // La reserva es del mismo día: reusamos la fecha del inicio y la combinamos
    // con la hora de fin (mismo patrón que el modal de Desafío).
    const fechaInicio = fechaHoraReserva.split("T")[0];
    const inicio = new Date(fechaHoraReserva);
    const fin = new Date(`${fechaInicio}T${horaFinReserva}`);
    if (fin <= inicio) {
      showToast("La hora de fin debe ser posterior al inicio.");
      return;
    }
    setReservando(true);
    try {
      await reservaService.crear({
        idCancha: canchaReserva.id,
        fechaHoraInicio: inicio.toISOString(),
        fechaHoraFin: fin.toISOString(),
      });
      setCanchaReserva(null);
      showToast("¡Reserva creada con éxito!");
    } catch {
      showToast("Error al crear la reserva. Intentá de nuevo.");
    } finally {
      setReservando(false);
    }
  };

  // --- Desafío ---
  const abrirDesafio = (cancha: CanchaResponse) => {
    if (!idEquipoLocal) {
      showToast("Primero debés crear un equipo para desafiar.");
      return;
    }
    setCanchaDesafio(cancha);
    setIdRival("");
    setFechaDesafio("");
    setHoraInicioDesafio("");
    setHoraFinDesafio("");
  };

  // Cargamos los rivales recién cuando se abre el modal de desafío.
  useEffect(() => {
    if (!canchaDesafio || !idEquipoLocal) return;
    setCargandoRivales(true);
    desafioService
      .buscarRivales(idEquipoLocal)
      .then(setRivales)
      .catch(() => showToast("Error al cargar rivales."))
      .finally(() => setCargandoRivales(false));
  }, [canchaDesafio, idEquipoLocal]);

  const confirmarDesafio = async () => {
    if (!idEquipoLocal || !canchaDesafio || !idRival || !fechaDesafio || !horaInicioDesafio || !horaFinDesafio)
      return;
    // El idZona sale del predio (NO se pide a mano).
    const idZona = predio.idZona;
    setDesafiando(true);
    try {
      await desafioService.crear({
        idEquipoVisitante: parseInt(idRival, 10),
        fechaPropuesta: fechaDesafio,
        horaInicio: aTimeSpan(horaInicioDesafio),
        horaFin: aTimeSpan(horaFinDesafio),
        idZona,
        idCanchaSugerida: canchaDesafio.id,
      });
      setCanchaDesafio(null);
      showToast("¡Desafío enviado con éxito!");
    } catch {
      showToast("Error al enviar el desafío. Intentá de nuevo.");
    } finally {
      setDesafiando(false);
    }
  };

  return (
    <div className="flex flex-col h-full">
      {/* Encabezado con volver */}
      <div className="sticky top-0 z-10 bg-card border-b border-border p-4">
        <button
          onClick={onBack}
          className="flex items-center gap-2 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
        >
          <ArrowLeft className="w-4 h-4" /> Volver a predios
        </button>
      </div>

      <div className="flex-1 overflow-y-auto">
        {/* Imagen / placeholder */}
        {predio.imagenUrl ? (
          <img src={predio.imagenUrl} alt={predio.nombre} className="w-full h-48 object-cover" />
        ) : (
          <div className="w-full h-48 bg-green-50 dark:bg-green-950 flex items-center justify-center">
            <MapPin className="w-14 h-14 text-green-500" />
          </div>
        )}

        {/* Datos del predio */}
        <div className="p-4 space-y-1 border-b border-border">
          <h2 className="text-xl font-bold text-foreground">{predio.nombre}</h2>
          <p className="text-sm text-muted-foreground flex items-center gap-1.5">
            <MapPin className="w-4 h-4 flex-shrink-0" /> {predio.direccion}
          </p>
          <Badge variant="secondary" className="mt-1">
            {predio.zona}
          </Badge>
        </div>

        {/* Listado de canchas */}
        <div className="p-4 space-y-3">
          <h3 className="text-sm font-semibold text-foreground">
            Canchas {canchas.length > 0 && `(${canchas.length})`}
          </h3>

          {canchas.length === 0 ? (
            <p className="text-sm text-muted-foreground py-6 text-center">
              Este predio todavía no tiene canchas cargadas.
            </p>
          ) : (
            canchas.map((cancha) => (
              <Card key={cancha.id} className="overflow-hidden">
                <CardContent className="p-4 space-y-3">
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <p className="font-semibold text-foreground truncate">{cancha.nombre}</p>
                      <p className="text-sm text-muted-foreground">{cancha.tipoCancha}</p>
                    </div>
                    <p className="text-base font-bold text-primary flex-shrink-0">
                      ${cancha.precioPorHora}
                      <span className="text-xs font-normal text-muted-foreground">/h</span>
                    </p>
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <Button size="sm" onClick={() => abrirReserva(cancha)}>
                      <CalendarPlus className="w-4 h-4 mr-1.5" /> Reservar
                    </Button>
                    <Button size="sm" variant="secondary" onClick={() => abrirDesafio(cancha)}>
                      <Swords className="w-4 h-4 mr-1.5" /> Desafiar
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>
      </div>

      {/* Modal Reservar */}
      <Dialog open={!!canchaReserva} onOpenChange={(open) => !open && setCanchaReserva(null)}>
        <DialogContent className="w-[calc(100vw-2rem)] max-w-md rounded-2xl">
          <DialogHeader>
            <DialogTitle>Reservar {canchaReserva?.nombre}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="space-y-2">
              <label className="text-sm font-medium">Fecha y hora de inicio</label>
              <Input
                type="datetime-local"
                value={fechaHoraReserva}
                onChange={(e) => setFechaHoraReserva(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Hora de fin</label>
              <Input
                type="time"
                value={horaFinReserva}
                onChange={(e) => setHoraFinReserva(e.target.value)}
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              className="w-full"
              disabled={reservando || !fechaHoraReserva || !horaFinReserva}
              onClick={confirmarReserva}
            >
              {reservando && <Spinner className="w-4 h-4 mr-2" />}
              Confirmar reserva
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Modal Desafiar */}
      <Dialog open={!!canchaDesafio} onOpenChange={(open) => !open && setCanchaDesafio(null)}>
        <DialogContent className="w-[calc(100vw-2rem)] max-w-md rounded-2xl">
          <DialogHeader>
            <DialogTitle>Desafiar en {canchaDesafio?.nombre}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="space-y-2">
              <label className="text-sm font-medium">Rival</label>
              {cargandoRivales ? (
                <div className="flex items-center justify-center py-4">
                  <Spinner className="w-6 h-6 text-primary" />
                </div>
              ) : rivales.length === 0 ? (
                <p className="text-sm text-muted-foreground flex items-center gap-2 py-2">
                  <Shield className="w-4 h-4" /> No hay rivales disponibles con tu nivel.
                </p>
              ) : (
                <select
                  value={idRival}
                  onChange={(e) => setIdRival(e.target.value)}
                  className="w-full h-12 px-4 rounded-xl bg-input border border-border text-foreground focus:outline-none focus:ring-2 focus:ring-ring transition-all appearance-none cursor-pointer"
                >
                  <option value="">Elegí un rival...</option>
                  {rivales.map((rival) => (
                    <option key={rival.id} value={rival.id}>
                      {rival.nombre} · {rival.nivel}
                    </option>
                  ))}
                </select>
              )}
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Fecha propuesta</label>
              <Input
                type="date"
                value={fechaDesafio}
                onChange={(e) => setFechaDesafio(e.target.value)}
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-2">
                <label className="text-sm font-medium">Hora inicio</label>
                <Input
                  type="time"
                  value={horaInicioDesafio}
                  onChange={(e) => setHoraInicioDesafio(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Hora fin</label>
                <Input
                  type="time"
                  value={horaFinDesafio}
                  onChange={(e) => setHoraFinDesafio(e.target.value)}
                />
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button
              className="w-full"
              disabled={
                desafiando ||
                !idRival ||
                !fechaDesafio ||
                !horaInicioDesafio ||
                !horaFinDesafio
              }
              onClick={confirmarDesafio}
            >
              {desafiando && <Spinner className="w-4 h-4 mr-2" />}
              Enviar desafío
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
