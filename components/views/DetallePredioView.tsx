"use client";

import { useState, useEffect } from "react";
import axios from "axios";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
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

// Los turnos arrancan en horas enteras de 08:00 a 23:00.
const HORAS_TURNO = Array.from({ length: 16 }, (_, i) => `${String(i + 8).padStart(2, "0")}:00`);

// Duraciones permitidas (en horas). El back recalcula el precio igual.
const DURACIONES = [
  { value: "1", label: "1 hora" },
  { value: "1.5", label: "1 hora y media" },
  { value: "2", label: "2 horas" },
];

// "HH:mm" + duración (horas) => "HH:mm". Puede cruzar medianoche (ej. 23:00 + 2h).
const sumarDuracion = (horaInicio: string, duracionHoras: number): string => {
  const [h, m] = horaInicio.split(":").map(Number);
  const total = h * 60 + m + Math.round(duracionHoras * 60);
  const hh = Math.floor(total / 60) % 24;
  const mm = total % 60;
  return `${String(hh).padStart(2, "0")}:${String(mm).padStart(2, "0")}`;
};

// Una hora "HH:mm" se envía al back como TimeSpan "HH:mm:ss".
const aTimeSpan = (hora: string) => (hora.length === 5 ? `${hora}:00` : hora);

// Serializa una fecha en hora LOCAL sin convertir a UTC (sin la "Z" de toISOString).
// Así la hora que elige el usuario es exactamente la que llega al back. Ver nota
// sobre el bug de zona horaria en confirmarReserva.
const aISOLocal = (fecha: Date): string => {
  const pad = (n: number) => String(n).padStart(2, "0");
  return (
    `${fecha.getFullYear()}-${pad(fecha.getMonth() + 1)}-${pad(fecha.getDate())}` +
    `T${pad(fecha.getHours())}:${pad(fecha.getMinutes())}:00`
  );
};

// Lee el mensaje real del back ({ error: "..." }) cuando una escritura falla.
const mensajeDeError = (error: unknown, generico: string): string => {
  if (axios.isAxiosError(error)) {
    const data = error.response?.data as { error?: string; message?: string } | undefined;
    return data?.error ?? data?.message ?? generico;
  }
  return generico;
};

export default function DetallePredioView({ predio, idEquipoLocal, showToast, onBack }: Props) {
  const canchas = predio.canchas ?? [];

  // Estado del modal de Reserva
  const [canchaReserva, setCanchaReserva] = useState<CanchaResponse | null>(null);
  const [fechaReserva, setFechaReserva] = useState("");
  const [horaInicioReserva, setHoraInicioReserva] = useState("");
  const [duracionReserva, setDuracionReserva] = useState("1");
  const [reservando, setReservando] = useState(false);

  // Estado del modal de Desafío
  const [canchaDesafio, setCanchaDesafio] = useState<CanchaResponse | null>(null);
  const [rivales, setRivales] = useState<RivalResponse[]>([]);
  const [cargandoRivales, setCargandoRivales] = useState(false);
  const [idRival, setIdRival] = useState("");
  const [fechaDesafio, setFechaDesafio] = useState("");
  const [horaInicioDesafio, setHoraInicioDesafio] = useState("");
  const [duracionDesafio, setDuracionDesafio] = useState("1");
  const [desafiando, setDesafiando] = useState(false);

  // Precio estimado del turno = precio/hora de la cancha × duración elegida.
  // Informativo: el back recalcula el total al confirmar.
  const totalEstimadoReserva = canchaReserva
    ? canchaReserva.precioPorHora * parseFloat(duracionReserva)
    : 0;

  // --- Reserva ---
  const abrirReserva = (cancha: CanchaResponse) => {
    setCanchaReserva(cancha);
    setFechaReserva("");
    setHoraInicioReserva("");
    setDuracionReserva("1");
  };

  const confirmarReserva = async () => {
    if (!canchaReserva || !fechaReserva || !horaInicioReserva) return;
    // Bug de zona horaria (arreglado): antes el inicio se armaba con
    // new Date(datetime-local) en hora local y se enviaba con toISOString() en
    // UTC, lo que en AR (UTC-3) corría la hora +3. Ahora construimos inicio y fin
    // de forma consistente y los serializamos con aISOLocal (sin "Z"), así la hora
    // que ve el usuario es exactamente la que recibe el back.
    const duracionHoras = parseFloat(duracionReserva);
    const inicio = new Date(`${fechaReserva}T${horaInicioReserva}:00`);
    const fin = new Date(inicio.getTime() + duracionHoras * 60 * 60 * 1000);
    setReservando(true);
    try {
      await reservaService.crear({
        idCancha: canchaReserva.id,
        fechaHoraInicio: aISOLocal(inicio),
        fechaHoraFin: aISOLocal(fin),
      });
      setCanchaReserva(null);
      showToast("¡Reserva creada con éxito!");
    } catch (error) {
      showToast(mensajeDeError(error, "Error al crear la reserva. Intentá de nuevo."));
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
    setDuracionDesafio("1");
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
    if (!idEquipoLocal || !canchaDesafio || !idRival || !fechaDesafio || !horaInicioDesafio)
      return;
    // El idZona sale del predio (NO se pide a mano). La hora de fin se deriva de
    // la duración elegida.
    const idZona = predio.idZona;
    const horaFin = sumarDuracion(horaInicioDesafio, parseFloat(duracionDesafio));
    setDesafiando(true);
    try {
      await desafioService.crear({
        idEquipoLocal: idEquipoLocal,
        idEquipoVisitante: parseInt(idRival, 10),
        fechaPropuesta: fechaDesafio,
        horaInicio: aTimeSpan(horaInicioDesafio),
        horaFin: aTimeSpan(horaFin),
        idZona,
        idCanchaSugerida: canchaDesafio.id,
      });
      setCanchaDesafio(null);
      showToast("¡Desafío enviado con éxito!");
    } catch (error) {
      showToast(mensajeDeError(error, "Error al enviar el desafío. Intentá de nuevo."));
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
              <label className="text-sm font-medium">Fecha</label>
              <Input
                type="date"
                value={fechaReserva}
                onChange={(e) => setFechaReserva(e.target.value)}
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-2">
                <label className="text-sm font-medium">Hora de inicio</label>
                <Select value={horaInicioReserva} onValueChange={setHoraInicioReserva}>
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Hora" />
                  </SelectTrigger>
                  <SelectContent>
                    {HORAS_TURNO.map((hora) => (
                      <SelectItem key={hora} value={hora}>
                        {hora}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Duración</label>
                <Select value={duracionReserva} onValueChange={setDuracionReserva}>
                  <SelectTrigger className="w-full">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {DURACIONES.map((d) => (
                      <SelectItem key={d.value} value={d.value}>
                        {d.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Costo estimado en vivo (el back recalcula al confirmar). */}
            {canchaReserva && (
              <div className="flex items-center justify-between rounded-xl bg-secondary px-4 py-3">
                <span className="text-sm text-muted-foreground">Total estimado</span>
                <span className="text-base font-bold text-foreground">
                  ${totalEstimadoReserva} por {DURACIONES.find((d) => d.value === duracionReserva)?.label}
                </span>
              </div>
            )}
          </div>
          <DialogFooter>
            <Button
              className="w-full"
              disabled={reservando || !fechaReserva || !horaInicioReserva}
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
                <Select value={horaInicioDesafio} onValueChange={setHoraInicioDesafio}>
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Hora" />
                  </SelectTrigger>
                  <SelectContent>
                    {HORAS_TURNO.map((hora) => (
                      <SelectItem key={hora} value={hora}>
                        {hora}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Duración</label>
                <Select value={duracionDesafio} onValueChange={setDuracionDesafio}>
                  <SelectTrigger className="w-full">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {DURACIONES.map((d) => (
                      <SelectItem key={d.value} value={d.value}>
                        {d.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
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
                !horaInicioDesafio
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
