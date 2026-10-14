"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { KeyRound, Mail } from "lucide-react";
import { useState, type FormEvent } from "react";
import { toast } from "sonner";
import Input from "../componentes/input";
import { guardarSesion, iniciarSesion } from "../_api/auth";

export default function LoginPage() {
  const router = useRouter();
  const [correo, setCorreo] = useState("");
  const [contrasena, setContrasena] = useState("");
  const [cargando, setCargando] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (cargando) {
      return;
    }

    setCargando(true);
    try {
      const respuesta = await iniciarSesion(correo, contrasena);
      guardarSesion(respuesta);
      router.push("/dashboard");
    } catch (error) {
      toast.error(
        error instanceof Error
          ? error.message
          : "No fue posible completar la solicitud. Intenta de nuevo.",
      );
    } finally {
      setCargando(false);
    }
  }

  return (
    <div className="flex w-full max-w-md flex-col gap-4">
      <section className="card w-full bg-base-100 shadow-md">
        <div className="card-body gap-4">
          <h1 className="card-title text-2xl">Iniciar sesión</h1>
          <form className="flex flex-col gap-3" onSubmit={handleSubmit}>
            <Input
              autoComplete="email"
              icon={Mail}
              onChange={(event) => setCorreo(event.target.value)}
              required
              title="Correo"
              type="text"
              value={correo}
            />
            <Input
              autoComplete="current-password"
              icon={KeyRound}
              onChange={(event) => setContrasena(event.target.value)}
              required
              title="Contraseña"
              type="password"
              value={contrasena}
            />
            <button className="btn btn-primary mt-2 w-full" disabled={cargando} type="submit">
              {cargando && <span className="loading loading-spinner loading-sm" />}
              Iniciar sesión
            </button>
          </form>
        </div>
      </section>

      <Link className="btn btn-link self-center" href="/registro">
        ¿No tienes cuenta? Regístrate aquí
      </Link>
    </div>
  );
}
