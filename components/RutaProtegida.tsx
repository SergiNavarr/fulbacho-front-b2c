"use client";

import { ReactNode } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { Spinner } from "@/components/ui/spinner";

interface RutaProtegidaProps {
  children: ReactNode;
  fallback?: ReactNode;
}

export default function RutaProtegida({ children, fallback }: RutaProtegidaProps) {
  const { isAuthenticated, cargando } = useAuth();

  if (cargando) {
    return (
      <div className="min-h-[100dvh] flex items-center justify-center bg-background">
        <Spinner className="size-8 text-primary" />
      </div>
    );
  }

  if (!isAuthenticated) {
    return fallback ? <>{fallback}</> : null;
  }

  return <>{children}</>;
}
