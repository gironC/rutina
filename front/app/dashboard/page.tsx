"use client";

import { useEffect, useState } from "react";
import { toast } from "sonner";
import { logout, refreshAccessToken } from "../_api/auth";
import { getApiErrorMessage } from "../_api/client";
import { getProfile, type UserProfile } from "../_api/usuario";
import { listarFecha, type Tarea } from "../_api/tareas";
import TemplateDashboard from "./componentes/template_dashboard";

function getToday(): string {
  const today = new Date();
  const month = String(today.getMonth() + 1).padStart(2, "0");
  const day = String(today.getDate()).padStart(2, "0");
  return `${today.getFullYear()}-${month}-${day}`;
}

function getStatusLabel(estado: Tarea["ocurrencias"][number]["estado"]): string {
  if (estado === "completada") return "Completada";
  if (estado === "cancelada") return "Cancelada";
  if (estado === "pospuesta") return "Pospuesta";
  return "Pendiente";
}

export default function DashboardPage() {
  const [isLoading, setIsLoading] = useState(true);
  const [usuario, setUsuario] = useState<UserProfile | null>(null);
  const [tareas, setTareas] = useState<Tarea[]>([]);

  useEffect(() => {
    let isMounted = true;

    async function loadDashboard() {
      try {
        const { jwt } = await refreshAccessToken();
        window.localStorage.setItem("jwt", jwt);

        const [profileData, taskData] = await Promise.all([
          getProfile(jwt),
          listarFecha(jwt, getToday()),
        ]);

        if (isMounted) {
          setUsuario(profileData);
          setTareas(taskData);
          setIsLoading(false);
        }
      } catch (error) {
        if (isMounted) {
          toast.error(await getApiErrorMessage(error));
        }

        try {
          await logout();
        } catch {
          // A missing or expired session is expected when dashboard auth fails.
        }
        window.localStorage.removeItem("jwt");

        if (isMounted) {
          window.location.replace("/login");
        }
      }
    }

    void loadDashboard();
    return () => {
      isMounted = false;
    };
  }, []);

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center gap-3 p-4">
        <span aria-label="Cargando" className="loading loading-spinner loading-md" />
        <span>Verificando tu sesión y cargando tus tareas…</span>
      </div>
    );
  }

  return (
    <TemplateDashboard pageTitle="Tareas de hoy">
      <div className="mb-2">
        <h2 className="text-xl font-semibold">
          Hola{usuario?.nombres ? `, ${usuario.nombres}` : ""}
        </h2>
        <p className="text-sm text-base-content/70">Tus tareas para hoy</p>
      </div>

      {tareas.length === 0 ? (
        <p className="py-6 text-center text-base-content/70">
          No tienes tareas programadas para hoy.
        </p>
      ) : (
        <ul className="list w-full rounded-box bg-base-100">
          {tareas.map((tarea) => {
            const ocurrencia = tarea.ocurrencias[0];
            const descripcion = ocurrencia?.descripcion ?? tarea.descripcion;

            return (
              <li className="list-row" key={tarea.id}>
                <div className="list-col-grow">
                  <h3 className="font-semibold">{tarea.nombre}</h3>
                  {descripcion && (
                    <p className="mt-1 text-sm text-base-content/70">{descripcion}</p>
                  )}
                </div>
                <span className="badge badge-outline self-center">
                  {getStatusLabel(ocurrencia?.estado ?? null)}
                </span>
              </li>
            );
          })}
        </ul>
      )}
    </TemplateDashboard>
  );
}
