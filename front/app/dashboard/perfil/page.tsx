"use client";

import { useRouter } from "next/navigation";
import { User } from "lucide-react";
import { useEffect, useState, type FormEvent } from "react";
import { toast } from "sonner";
import DashboardContenedor from "../componentes/contenedor";
import Input from "../../componentes/input";
import {
  actualizarPerfil,
  cerrarSesion,
  type DatosUsuarioLocal,
  JWT_STORAGE_KEY,
  obtenerUsuarioId,
  renovarSesion,
  USER_DATA_STORAGE_KEY,
} from "../../_api/auth";

const alfanumerico = /^[\p{L}\p{M}\d]+(?: [\p{L}\p{M}\d]+)*$/u;

function leerDatosUsuario(): DatosUsuarioLocal {
  try {
    const datos_serializados = window.localStorage.getItem(USER_DATA_STORAGE_KEY);
    if (!datos_serializados) {
      return { correo: "", nombres: "", apellidos: "" };
    }

    const datos: unknown = JSON.parse(datos_serializados);
    if (typeof datos !== "object" || datos === null) {
      return { correo: "", nombres: "", apellidos: "" };
    }

    const datos_usuario = datos as Record<string, unknown>;
    return {
      correo: typeof datos_usuario.correo === "string" ? datos_usuario.correo : "",
      nombres: typeof datos_usuario.nombres === "string" ? datos_usuario.nombres : "",
      apellidos: typeof datos_usuario.apellidos === "string" ? datos_usuario.apellidos : "",
    };
  } catch {
    return { correo: "", nombres: "", apellidos: "" };
  }
}

function mensajeError(error: unknown): string {
  return error instanceof Error
    ? error.message
    : "No fue posible completar la solicitud. Intenta de nuevo.";
}

export default function PerfilPage() {
  const router = useRouter();
  const [nombres, setNombres] = useState("");
  const [apellidos, setApellidos] = useState("");
  const [comprobando, setComprobando] = useState(true);
  const [guardando, setGuardando] = useState(false);

  useEffect(() => {
    let mounted = true;

    async function comprobarSesion() {
      try {
        const respuesta = await renovarSesion();
        if (!mounted) {
          return;
        }

        window.localStorage.setItem(JWT_STORAGE_KEY, respuesta.jwt);
        const datos_usuario = leerDatosUsuario();
        setNombres(datos_usuario.nombres);
        setApellidos(datos_usuario.apellidos);
        setComprobando(false);
      } catch (error) {
        if (!mounted) {
          return;
        }

        toast.error(mensajeError(error));
        const jwt = window.localStorage.getItem(JWT_STORAGE_KEY) ?? "";

        try {
          await cerrarSesion(obtenerUsuarioId(jwt));
        } catch (error_logout) {
          if (mounted) {
            toast.error(mensajeError(error_logout));
          }
        } finally {
          window.localStorage.removeItem(JWT_STORAGE_KEY);
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

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (guardando) {
      return;
    }

    const nombres_limpios = nombres.trim();
    const apellidos_limpios = apellidos.trim();
    if (!alfanumerico.test(nombres_limpios) || !alfanumerico.test(apellidos_limpios)) {
      toast.error("Nombres y apellidos solo pueden contener letras, números y espacios.");
      return;
    }

    setGuardando(true);
    try {
      const actualizado = await actualizarPerfil({
        nombres: nombres_limpios,
        apellidos: apellidos_limpios,
      });
      if (!actualizado) {
        toast.error("No fue posible actualizar el perfil.");
        return;
      }

      const datos_usuario = leerDatosUsuario();
      window.localStorage.setItem(
        USER_DATA_STORAGE_KEY,
        JSON.stringify({
          ...datos_usuario,
          nombres: nombres_limpios,
          apellidos: apellidos_limpios,
        }),
      );
      setNombres(nombres_limpios);
      setApellidos(apellidos_limpios);
      toast.success("Perfil actualizado.");
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
    <DashboardContenedor pageTitle="Perfil">
      <form onSubmit={handleSubmit}>
        <Input
          autoComplete="given-name"
          icon={User}
          onChange={(event) => setNombres(event.target.value)}
          required
          title="Nombres"
          type="text"
          value={nombres}
        />
        <Input
          autoComplete="family-name"
          icon={User}
          onChange={(event) => setApellidos(event.target.value)}
          required
          title="Apellidos"
          type="text"
          value={apellidos}
        />
        <button className="btn btn-primary" disabled={guardando} type="submit">
          {guardando && <span className="loading loading-spinner loading-sm" />}
          Guardar cambios
        </button>
      </form>
    </DashboardContenedor>
  );
}
