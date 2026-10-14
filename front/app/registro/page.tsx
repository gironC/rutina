"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { KeyRound, Mail, User } from "lucide-react";
import { useState, type FormEvent } from "react";
import { toast } from "sonner";
import Input from "../componentes/input";
import { guardarSesion, iniciarSesion, registrarUsuario } from "../_api/auth";

export default function RegistroPage() {
  const router = useRouter();
  const [correo, setCorreo] = useState("");
  const [nombres, setNombres] = useState("");
  const [apellidos, setApellidos] = useState("");
  const [contrasena, setContrasena] = useState("");
  const [confirmarContrasena, setConfirmarContrasena] = useState("");
  const [cargando, setCargando] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (cargando) {
      return;
    }

    if (contrasena !== confirmarContrasena) {
      toast.error("Las contraseñas no coinciden.");
      return;
    }

    setCargando(true);
    try {
      await registrarUsuario({ correo, nombres, apellidos, contrasena });
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
    <div className="flex w-full max-w-lg flex-col gap-4">
      <section className="card w-full bg-base-100 shadow-md">
        <div className="card-body gap-4">
          <h1 className="card-title text-2xl">Crear cuenta</h1>
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
            <Input
              autoComplete="new-password"
              icon={KeyRound}
              onChange={(event) => setContrasena(event.target.value)}
              required
              title="Contraseña"
              type="password"
              value={contrasena}
            />
            <Input
              autoComplete="new-password"
              icon={KeyRound}
              onChange={(event) => setConfirmarContrasena(event.target.value)}
              required
              title="Confirmar contraseña"
              type="password"
              value={confirmarContrasena}
            />
            <button className="btn btn-primary mt-2 w-full" disabled={cargando} type="submit">
              {cargando && <span className="loading loading-spinner loading-sm" />}
              Registrarse
            </button>
          </form>
        </div>
      </section>

      <Link className="btn btn-link self-center" href="/login">
        ¿Ya tienes usuario? Inicia sesión
      </Link>
    </div>
  );
}
