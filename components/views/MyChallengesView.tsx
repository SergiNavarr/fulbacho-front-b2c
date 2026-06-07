import React from "react";
import { Inbox, Send } from "lucide-react";
import { ChallengeSubTab } from "@/app/page";

interface MyChallengesViewProps {
  subTab: ChallengeSubTab;
  setSubTab: React.Dispatch<React.SetStateAction<ChallengeSubTab>>;
}

export default function MyChallengesView({
  subTab,
  setSubTab,
}: MyChallengesViewProps) {
  return (
    <div className="flex flex-col h-full">
      {/* Sub-navigation */}
      <div className="sticky top-0 z-10 bg-card border-b border-border p-4">
        <h2 className="text-lg font-bold text-foreground mb-4">Mis Desafíos</h2>
        <div className="flex gap-2 p-1 bg-secondary rounded-xl">
          <button
            onClick={() => setSubTab("received")}
            className={`flex-1 h-11 rounded-lg font-medium text-sm transition-all flex items-center justify-center gap-2 ${
              subTab === "received"
                ? "bg-card text-foreground shadow-sm"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            <Inbox className="w-4 h-4" />
            Recibidos
          </button>
          <button
            onClick={() => setSubTab("sent")}
            className={`flex-1 h-11 rounded-lg font-medium text-sm transition-all flex items-center justify-center gap-2 ${
              subTab === "sent"
                ? "bg-card text-foreground shadow-sm"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            <Send className="w-4 h-4" />
            Enviados
          </button>
        </div>
      </div>

      {/* Empty State */}
      <div className="flex-1 flex flex-col items-center justify-center p-8 text-center">
        <div className="w-24 h-24 rounded-3xl bg-secondary flex items-center justify-center mb-6">
          {subTab === "received" ? (
            <Inbox className="w-12 h-12 text-muted-foreground/40" />
          ) : (
            <Send className="w-12 h-12 text-muted-foreground/40" />
          )}
        </div>
        <h3 className="text-lg font-semibold text-foreground mb-2">
          {subTab === "received"
            ? "No tenés desafíos recibidos"
            : "No enviaste desafíos todavía"}
        </h3>
        <p className="text-sm text-muted-foreground max-w-[240px]">
          {subTab === "received"
            ? "Cuando otros equipos te desafíen, los verás acá"
            : "Buscá un rival y enviá tu primer desafío"}
        </p>
      </div>
    </div>
  );
}