"use client";

import { useState, useEffect } from "react";
import { Building2, Calendar, Shield, LogOut, Check, X, MapPin } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { Spinner } from "@/components/ui/spinner";
import VistaLogin from "@/components/views/VistaLogin";
import VistaRegistro from "@/components/views/VistaRegistro";
import MyTeamManager from "@/components/views/MyTeamManager";
import BuscarRivalView from "@/components/views/BuscarRivalView";
import MisDesafiosView from "@/components/views/MisDesafiosView";
import ExploracionPrediosView from "@/components/views/ExploracionPrediosView";
import { equipoService } from "@/services/equipo";

export type Tab = "predios" | "rivales" | "desafios" | "equipo";
type ModoAuth = "login" | "registro";

interface Toast {
  message: string;
  visible: boolean;
}

export default function FulbachoApp() {
  const { isAuthenticated, cargando, usuario, logout } = useAuth();
  const [modoAuth, setModoAuth] = useState<ModoAuth>("login");
  const [activeTab, setActiveTab] = useState<Tab>("equipo");
  const [toast, setToast] = useState<Toast>({ message: "", visible: false });
  const [idEquipoActivo, setIdEquipoActivo] = useState<number | null>(null);
  const [cargandoEquipo, setCargandoEquipo] = useState(false);

  useEffect(() => {
    if (!isAuthenticated) return;
    setCargandoEquipo(true);
    equipoService
      .obtenerMisEquipos()
      .then((equipos) => {
        if (equipos.length > 0) setIdEquipoActivo(equipos[0].id);
      })
      .catch(console.error)
      .finally(() => setCargandoEquipo(false));
  }, [isAuthenticated]);

  const showToast = (message: string) => {
    setToast({ message, visible: true });
    setTimeout(() => setToast({ message: "", visible: false }), 3000);
  };

  if (cargando) {
    return (
      <div className="min-h-[100dvh] flex items-center justify-center bg-background">
        <Spinner className="size-8 text-primary" />
      </div>
    );
  }

  if (!isAuthenticated) {
    return modoAuth === "login" ? (
      <VistaLogin onIrARegistro={() => setModoAuth("registro")} />
    ) : (
      <VistaRegistro onIrALogin={() => setModoAuth("login")} />
    );
  }

  const renderContenido = () => {
    if (activeTab === "equipo") return <MyTeamManager showToast={showToast} />;
    if (activeTab === "predios")
      return <ExploracionPrediosView idEquipoActivo={idEquipoActivo} showToast={showToast} />;

    if (cargandoEquipo) {
      return (
        <div className="flex-1 flex items-center justify-center">
          <Spinner className="size-8 text-primary" />
        </div>
      );
    }

    if (!idEquipoActivo) {
      return (
        <div className="flex-1 flex flex-col items-center justify-center p-8 text-center gap-3">
          <Shield className="w-16 h-16 text-muted-foreground/30" />
          <p className="text-muted-foreground text-sm">
            Primero debés crear un equipo para acceder a esta función.
          </p>
          <button
            className="text-sm font-medium text-primary underline"
            onClick={() => setActiveTab("equipo")}
          >
            Ir a Mis Equipos
          </button>
        </div>
      );
    }

    if (activeTab === "rivales")
      return <BuscarRivalView idEquipoLocal={idEquipoActivo} showToast={showToast} />;
    if (activeTab === "desafios")
      return <MisDesafiosView idEquipo={idEquipoActivo} showToast={showToast} />;
  };

  return (
    <div className="min-h-[100dvh] flex flex-col w-full max-w-md mx-auto bg-card sm:border-x sm:border-border sm:shadow-sm relative">
      <header className="sticky top-0 z-50 flex-shrink-0 flex items-center justify-between px-5 py-4 bg-primary text-primary-foreground shadow-sm">
        <h1 className="text-xl font-bold tracking-tight">⚽ Fulbacho</h1>
        <div className="flex items-center gap-3">
          {usuario && (
            <span className="text-sm font-medium opacity-80 truncate max-w-[120px]">
              {usuario.username}
            </span>
          )}
          <button
            onClick={logout}
            title="Cerrar sesión"
            className="w-9 h-9 rounded-full bg-primary-foreground/20 flex items-center justify-center hover:bg-primary-foreground/30 transition-colors"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </header>

      <main className="flex-1 flex flex-col bg-background overflow-hidden">
        {renderContenido()}
      </main>

      <nav className="sticky bottom-0 z-50 flex-shrink-0 border-t border-border bg-card">
        <div className="flex items-center justify-around py-2">
          <TabButton
            icon={<MapPin className="w-5 h-5" />}
            label="Predios"
            isActive={activeTab === "predios"}
            onClick={() => setActiveTab("predios")}
          />
          <TabButton
            icon={<Shield className="w-5 h-5" />}
            label="Rival"
            isActive={activeTab === "rivales"}
            onClick={() => setActiveTab("rivales")}
          />
          <TabButton
            icon={<Calendar className="w-5 h-5" />}
            label="Desafíos"
            isActive={activeTab === "desafios"}
            onClick={() => setActiveTab("desafios")}
          />
          <TabButton
            icon={<Building2 className="w-5 h-5" />}
            label="Mi Equipo"
            isActive={activeTab === "equipo"}
            onClick={() => setActiveTab("equipo")}
          />
        </div>
      </nav>

      {toast.visible && (
        <div className="fixed bottom-24 left-1/2 -translate-x-1/2 w-[calc(100%-2rem)] max-w-[calc(28rem-2rem)] bg-foreground text-background px-4 py-3 rounded-xl shadow-2xl flex items-center gap-3 animate-in fade-in slide-in-from-bottom-4 duration-300 z-[100]">
          <div className="w-6 h-6 rounded-full bg-background/20 flex items-center justify-center flex-shrink-0">
            <Check className="w-4 h-4 text-background" />
          </div>
          <span className="text-sm font-medium">{toast.message}</span>
          <button onClick={() => setToast({ message: "", visible: false })} className="ml-auto">
            <X className="w-4 h-4 opacity-70" />
          </button>
        </div>
      )}
    </div>
  );
}

function TabButton({
  icon,
  label,
  isActive,
  onClick,
}: {
  icon: React.ReactNode;
  label: string;
  isActive: boolean;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className={`flex flex-col items-center gap-1 px-3 py-2 min-h-[56px] rounded-xl transition-all duration-200 ${
        isActive ? "text-primary bg-primary/10" : "text-muted-foreground hover:text-foreground"
      }`}
    >
      {icon}
      <span className="text-xs font-medium">{label}</span>
    </button>
  );
}
