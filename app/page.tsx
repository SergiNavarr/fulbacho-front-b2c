"use client";

import { useState } from "react";
import { Search, Calendar, Shield, LogOut, Check, X } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { Spinner } from "@/components/ui/spinner";
import VistaLogin from "@/components/views/VistaLogin";
import VistaRegistro from "@/components/views/VistaRegistro";
import MyTeamManager from "@/components/views/MyTeamManager";
import SearchRivalView from "@/components/views/SearchRivalView";
import MyChallengesView from "@/components/views/MyChallengesView";

export type Tab = "team" | "search" | "challenges";
export type ChallengeSubTab = "received" | "sent";
type ModoAuth = "login" | "registro";

interface Toast {
  message: string;
  visible: boolean;
}

export default function FulbachoApp() {
  const { isAuthenticated, cargando, usuario, logout } = useAuth();
  const [modoAuth, setModoAuth] = useState<ModoAuth>("login");
  const [activeTab, setActiveTab] = useState<Tab>("team");
  const [challengeSubTab, setChallengeSubTab] = useState<ChallengeSubTab>("received");
  const [toast, setToast] = useState<Toast>({ message: "", visible: false });
  const [searchFilters, setSearchFilters] = useState({
    zone: "corrientes",
    startTime: "18:00",
    endTime: "22:00",
  });

  const showToast = (message: string) => {
    setToast({ message, visible: true });
    setTimeout(() => setToast({ message: "", visible: false }), 3000);
  };

  const mockRivals = [
    { id: 1, name: "Los Guerreros FC", level: "Intermedio", shield: "https://placehold.co/64x64/166534/white?text=LG" },
    { id: 2, name: "Deportivo Barrio Norte", level: "Amateur", shield: "https://placehold.co/64x64/0f766e/white?text=DB" },
    { id: 3, name: "Real Corrientes", level: "Competitivo", shield: "https://placehold.co/64x64/1e3a5f/white?text=RC" },
  ];

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

  return (
    <div className="min-h-[100dvh] flex flex-col w-full max-w-md mx-auto bg-card sm:border-x sm:border-border sm:shadow-sm relative">
      <header className="sticky top-0 z-50 flex-shrink-0 flex items-center justify-between px-5 py-4 bg-primary text-primary-foreground shadow-sm">
        <h1 className="text-xl font-bold tracking-tight">⚽ Fulbacho</h1>
        <div className="flex items-center gap-3">
          {usuario && (
            <span className="text-sm font-medium opacity-80 truncate max-w-[120px]">
              {usuario.nombre}
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

      <main className="flex-1 flex flex-col bg-background">
        {activeTab === "team" && <MyTeamManager showToast={showToast} />}
        {activeTab === "search" && (
          <SearchRivalView
            filters={searchFilters}
            setFilters={setSearchFilters}
            rivals={mockRivals}
          />
        )}
        {activeTab === "challenges" && (
          <MyChallengesView subTab={challengeSubTab} setSubTab={setChallengeSubTab} />
        )}
      </main>

      <nav className="sticky bottom-0 z-50 flex-shrink-0 border-t border-border bg-card">
        <div className="flex items-center justify-around py-2">
          <TabButton
            icon={<Search className="w-5 h-5" />}
            label="Buscar Rival"
            isActive={activeTab === "search"}
            onClick={() => setActiveTab("search")}
          />
          <TabButton
            icon={<Calendar className="w-5 h-5" />}
            label="Mis Desafíos"
            isActive={activeTab === "challenges"}
            onClick={() => setActiveTab("challenges")}
          />
          <TabButton
            icon={<Shield className="w-5 h-5" />}
            label="Mis Equipos"
            isActive={activeTab === "team"}
            onClick={() => setActiveTab("team")}
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
      className={`flex flex-col items-center gap-1 px-4 py-2 min-h-[56px] rounded-xl transition-all duration-200 ${
        isActive ? "text-primary bg-primary/10" : "text-muted-foreground hover:text-foreground"
      }`}
    >
      {icon}
      <span className="text-xs font-medium">{label}</span>
    </button>
  );
}
