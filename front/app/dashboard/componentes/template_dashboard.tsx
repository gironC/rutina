"use client";

import {
  CalendarDays,
  CirclePlus,
  House,
  ListTodo,
  LogOut,
} from "lucide-react";
import type { ReactNode } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { logout } from "../../_api/auth";
import { getApiErrorMessage } from "../../_api/client";
import DashboardTemplate, {
  type TemplateMenuOption,
} from "../../componentes/template";

export default function TemplateDashboard({
  children,
  pageTitle,
}: {
  children: ReactNode;
  pageTitle: string;
}) {
  const router = useRouter();

  async function handleLogout() {
    try {
      await logout();
    } catch (error) {
      toast.error(await getApiErrorMessage(error));
    } finally {
      window.localStorage.removeItem("jwt");
      router.replace("/login");
    }
  }

  const menuOptions: TemplateMenuOption[] = [
    { icon: House, onClick: () => router.push("/dashboard"), title: "Inicio" },
    {
      icon: CirclePlus,
      onClick: () => router.push("/dashboard/crear"),
      title: "Crear tarea",
    },
    {
      icon: ListTodo,
      onClick: () => router.push("/dashboard/tareas"),
      title: "Tareas",
    },
    {
      icon: LogOut,
      onClick: () => {
        void handleLogout();
      },
      title: "Cerrar sesión",
    },
  ];

  return (
    <DashboardTemplate
      menuOptions={menuOptions}
      pageTitle={pageTitle}
      projectIcon={CalendarDays}
      projectTitle="Rutinas"
    >
      {children}
    </DashboardTemplate>
  );
}
