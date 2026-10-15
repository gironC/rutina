"use client";

import { format } from "date-fns";
import { ClipboardCheck, Clock, Logs } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useState, type FormEvent } from "react";
import { toast } from "sonner";
import {
  cerrarSesion,
  JWT_STORAGE_KEY,
  obtenerUsuarioId,
  renovarSesion,
  USER_DATA_STORAGE_KEY,
} from "../../_api/auth";
import { crearTarea, type TipoTarea } from "../../_api/tareas";
import DatePicker from "../../componentes/datePicker";
import Input from "../../componentes/input";
import DashboardContenedor from "../componentes/contenedor";

const diasSemana = ["L", "M", "X", "J", "V", "S", "D"] as const;

function mensajeError(error: unknown): string {
  return error instanceof Error
    ? error.message
    : "No fue posible completar la solicitud. Intenta de nuevo.";
}

function tipoDeTarea(
  fechaInicio: Date,
  fechaFin: Date | undefined,
  diasSeleccionados: string[],
): TipoTarea {
  if (diasSeleccionados.length > 0) {
    return "recurrente";
  }

  if (fechaFin && format(fechaFin, "yyyy-MM-dd") > format(fechaInicio, "yyyy-MM-dd")) {
    return "flexible";
  }

  return "unica";
}

function descripcionTipo(tipo: TipoTarea): string {
  switch (tipo) {
    case "flexible":
      return "Puedes ejecutar esta tarea una vez en cualquier día del periodo definido.";
    case "recurrente":
      return "Esta tarea se ejecutará cada día de la semana que seleccionaste.";
    default:
      return "Esta tarea se ejecutará una sola vez.";
  }
}

function nombreTipo(tipo: TipoTarea): string {
  switch (tipo) {
    case "flexible":
      return "Flexible";
    case "recurrente":
      return "Repetitiva";
    default:
      return "Única";
  }
}

export default function CrearPage() {
  const router = useRouter();
  const [comprobando, setComprobando] = useState(true);
  const [guardando, setGuardando] = useState(false);
  const [formResetKey, setFormResetKey] = useState(0);
  const [nombre, setNombre] = useState("");
  const [descripcion, setDescripcion] = useState("");
  const [fechaInicio, setFechaInicio] = useState<Date>();
  const [fechaFin, setFechaFin] = useState<Date>();
  const [diasSeleccionados, setDiasSeleccionados] = useState<string[]>([]);
  const [definirHorario, setDefinirHorario] = useState(false);
  const [horaInicio, setHoraInicio] = useState("");
  const [horaFin, setHoraFin] = useState("");

  useEffect(() => {
    let mounted = true;

    async function comprobarSesion() {
      try {
        const respuesta = await renovarSesion();
        if (!mounted) {
          return;
        }

        window.localStorage.setItem(JWT_STORAGE_KEY, respuesta.jwt);
        setComprobando(false);
      } catch (error) {
        if (!mounted) {
          return;
        }

        toast.error(mensajeError(error));
        const jwt = window.localStorage.getItem(JWT_STORAGE_KEY) ?? "";

        try {
          await cerrarSesion(obtenerUsuarioId(jwt));
        } catch (errorLogout) {
          if (mounted) {
            toast.error(mensajeError(errorLogout));
          }
        } finally {
          window.localStorage.removeItem(JWT_STORAGE_KEY);
          window.localStorage.removeItem(USER_DATA_STORAGE_KEY);
          if (mounted) {
            router.replace("/login");
          }
        }
      }
    }

    void comprobarSesion();
    return () => {
      mounted = false;
    };
  }, [router]);

  const tipo = fechaInicio
    ? tipoDeTarea(fechaInicio, fechaFin, diasSeleccionados)
    : "unica";

  function alternarDia(dia: string) {
    setDiasSeleccionados((actuales) =>
      actuales.includes(dia)
        ? actuales.filter((seleccionado) => seleccionado !== dia)
        : [...actuales, dia],
    );
  }

  function limpiarFormulario() {
    setNombre("");
    setDescripcion("");
    setFechaInicio(undefined);
    setFechaFin(undefined);
    setDiasSeleccionados([]);
    setDefinirHorario(false);
    setHoraInicio("");
    setHoraFin("");
    setFormResetKey((key) => key + 1);
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (guardando) {
      return;
    }

    if (!fechaInicio) {
      toast.error("Selecciona una fecha de inicio.");
      return;
    }

    if (
      fechaFin &&
      format(fechaFin, "yyyy-MM-dd") < format(fechaInicio, "yyyy-MM-dd")
    ) {
      toast.error("La fecha de finalización no puede ser anterior a la fecha de inicio.");
      return;
    }

    if (definirHorario && (!horaInicio || !horaFin)) {
      toast.error("Completa la hora de inicio y la hora de finalización.");
      return;
    }

    if (definirHorario && horaFin <= horaInicio) {
      toast.error("La hora de finalización debe ser posterior a la hora de inicio.");
      return;
    }

    const tipo_tarea = tipoDeTarea(fechaInicio, fechaFin, diasSeleccionados);
    setGuardando(true);
    try {
      await crearTarea({
        nombre: nombre.trim(),
        descripcion: descripcion.trim(),
        tipo: tipo_tarea,
        hora_inicio: definirHorario ? horaInicio : null,
        hora_fin: definirHorario ? horaFin : null,
        fecha_inicio: format(fechaInicio, "yyyy-MM-dd"),
        fecha_fin: fechaFin ? format(fechaFin, "yyyy-MM-dd") : null,
        recurrencia: diasSemana
          .filter((dia) => diasSeleccionados.includes(dia))
          .join(","),
      });
      toast.success("Tarea creada correctamente.");
      limpiarFormulario();
    } catch (error) {
      toast.error(mensajeError(error));
    } finally {
      setGuardando(false);
    }
  }

  if (comprobando) {
    return (
      <div className="flex min-h-[calc(100vh-2rem)] items-center justify-center">
        <span aria-label="Comprobando sesión" className="loading loading-spinner loading-lg" />
      </div>
    );
  }

  return (
    <DashboardContenedor pageTitle="Crear tarea">
      <form className="space-y-4" key={formResetKey} onSubmit={handleSubmit}>
        <section className="card border border-base-300 bg-base-100 p-4 shadow-none">
          <h2 className="mb-3 text-lg font-semibold">Datos generales</h2>
          <Input
            autoComplete="off"
            disabled={guardando}
            icon={ClipboardCheck}
            onChange={(event) => setNombre(event.target.value)}
            required
            title="Nombre"
            type="text"
            value={nombre}
          />
          <Input
            disabled={guardando}
            icon={Logs}
            onChange={(event) => setDescripcion(event.target.value)}
            required
            title="Descripción"
            type="text"
            value={descripcion}
          />
        </section>

        <section className="card border border-base-300 bg-base-100 p-4 shadow-none">
          <h2 className="mb-3 text-lg font-semibold">Planificación</h2>
          <DatePicker
            onSelect={setFechaInicio}
            selected={fechaInicio}
            title="Fecha de inicio"
          />
          <DatePicker
            disabled={fechaInicio ? { before: fechaInicio } : undefined}
            onSelect={setFechaFin}
            selected={fechaFin}
            title="Fecha de finalización (opcional)"
          />

          <fieldset className="mt-2">
            <legend className="mb-1 block text-xs">
              Si quieres que sea una tarea repetitiva, marca los días que se repite la tarea
            </legend>
            <div aria-label="Días de repetición" className="join">
              {diasSemana.map((dia) => (
                <input
                  aria-label={dia}
                  checked={diasSeleccionados.includes(dia)}
                  className="join-item btn"
                  disabled={guardando}
                  key={dia}
                  onChange={() => alternarDia(dia)}
                  type="checkbox"
                  value={dia}
                />
              ))}
            </div>
          </fieldset>
        </section>

        <section className="card border border-base-300 bg-base-100 p-4 shadow-none">
          <h2 className="mb-3 text-lg font-semibold">Horario (opcional)</h2>
          <label className="mb-3 flex cursor-pointer items-center gap-3">
            <input
              checked={definirHorario}
              className="toggle toggle-primary"
              disabled={guardando}
              onChange={(event) => setDefinirHorario(event.target.checked)}
              type="checkbox"
            />
            <span>Definir un horario para esta tarea</span>
          </label>
          {definirHorario && (
            <>
              <Input
                disabled={guardando}
                icon={Clock}
                onChange={(event) => setHoraInicio(event.target.value)}
                required
                title="Hora de inicio"
                type="time"
                value={horaInicio}
              />
              <Input
                disabled={guardando}
                icon={Clock}
                onChange={(event) => setHoraFin(event.target.value)}
                required
                title="Hora de finalización"
                type="time"
                value={horaFin}
              />
            </>
          )}
        </section>

        <div className="space-y-1">
          <p className="font-bold">Tipo de tarea {nombreTipo(tipo)}</p>
          <p>{descripcionTipo(tipo)}</p>
        </div>

        <button className="btn btn-primary" disabled={guardando} type="submit">
          {guardando && <span className="loading loading-spinner loading-sm" />}
          Crear tarea
        </button>
      </form>
    </DashboardContenedor>
  );
}
