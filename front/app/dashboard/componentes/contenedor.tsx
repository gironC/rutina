"use client";

import {
  CalendarDays,
  CalendarRange,
  CirclePlus,
  House,
  LogOut,
  UserRound,
} from "lucide-react";
import { useRouter } from "next/navigation";
import type { ReactNode } from "react";
import { toast } from "sonner";
import DashboardTemplate, {
  type TemplateMenuOption,
} from "../../componentes/template";
import {
  cerrarSesion,
  JWT_STORAGE_KEY,
  obtenerUsuarioId,
} from "../../_api/auth";

interface DashboardContenedorProps {
  children: ReactNode;
  pageTitle: string;
}

export default function DashboardContenedor({
  children,
  pageTitle,
}: DashboardContenedorProps) {
  const router = useRouter();

  async function handleLogout() {
    const jwt = window.localStorage.getItem(JWT_STORAGE_KEY) ?? "";
    const usuario_id = obtenerUsuarioId(jwt);

    try {
      await cerrarSesion(usuario_id);
    } catch (error) {
      toast.error(
        error instanceof Error
          ? error.message
          : "No fue posible cerrar la sesión. Intenta de nuevo.",
      );
    } finally {
      window.localStorage.removeItem(JWT_STORAGE_KEY);
      router.push("/login");
    }
  }

  const menuOptions: TemplateMenuOption[] = [
    { icon: House, title: "Inicio", onClick: () => router.push("/dashboard") },
    {
      icon: CalendarDays,
      title: "Semana",
      onClick: () => router.push("/dashboard/semana"),
    },
    {
      icon: CalendarRange,
      title: "Mes",
      onClick: () => router.push("/dashboard/mes"),
    },
    {
      icon: CirclePlus,
      title: "Crear tarea",
      onClick: () => router.push("/dashboard/crear"),
    },
    {
      icon: UserRound,
      title: "Perfil",
      onClick: () => router.push("/dashboard/perfil"),
    },
    { icon: LogOut, title: "Cerrar sesión", onClick: handleLogout },
  ];

  return (
    <DashboardTemplate
      menuOptions={menuOptions}
      pageTitle={pageTitle}
      projectIcon={CalendarDays}
      projectTitle="Rutina"
    >
      {children}
    </DashboardTemplate>
  );
}
