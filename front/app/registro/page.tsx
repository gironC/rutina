"use client";

import { KeyRound, Mail, Phone, User } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, type FormEvent } from "react";
import { toast } from "sonner";
import { login, register } from "../_api/auth";
import { getApiErrorMessage } from "../_api/client";
import Input from "../componentes/input";

export default function RegistroPage() {
  const router = useRouter();
  const [correo, setCorreo] = useState("");
  const [nombres, setNombres] = useState("");
  const [apellidos, setApellidos] = useState("");
  const [telefono, setTelefono] = useState("");
  const [pass, setPass] = useState("");
  const [confirmarPass, setConfirmarPass] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!/^\d{8}$/.test(telefono)) {
      toast.error("El teléfono debe contener exactamente 8 dígitos.");
      return;
    }
    if (pass !== confirmarPass) {
      toast.error("Las contraseñas no coinciden.");
      return;
    }

    setIsSubmitting(true);
    try {
      await register({ correo, nombres, apellidos, telefono, pass });
      const response = await login({ correo, pass });
      window.localStorage.setItem("jwt", response.jwt);
      router.push("/dashboard");
    } catch (error) {
      toast.error(await getApiErrorMessage(error));
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="w-full max-w-md">
      <form
        className="card card-border border-base-content/10 bg-base-100 shadow-md"
        onSubmit={handleSubmit}
      >
        <div className="card-body gap-2">
          <h1 className="card-title mb-3 text-2xl">Crear cuenta</h1>
          <Input
            autoComplete="email"
            icon={Mail}
            onChange={(event) => setCorreo(event.target.value)}
            required
            title="Correo electrónico"
            type="email"
            value={correo}
          />
          <Input
            autoComplete="given-name"
            icon={User}
            onChange={(event) => setNombres(event.target.value)}
            required
            title="Nombres"
            value={nombres}
          />
          <Input
            autoComplete="family-name"
            icon={User}
            onChange={(event) => setApellidos(event.target.value)}
            required
            title="Apellidos"
            value={apellidos}
          />
          <Input
            autoComplete="tel"
            icon={Phone}
            inputMode="numeric"
            maxLength={8}
            onChange={(event) => setTelefono(event.target.value)}
            pattern="[0-9]{8}"
            required
            title="Teléfono (8 dígitos)"
            value={telefono}
          />
          <Input
            autoComplete="new-password"
            icon={KeyRound}
            onChange={(event) => setPass(event.target.value)}
            required
            title="Contraseña"
            type="password"
            value={pass}
          />
          <Input
            autoComplete="new-password"
            icon={KeyRound}
            onChange={(event) => setConfirmarPass(event.target.value)}
            required
            title="Confirmar contraseña"
            type="password"
            value={confirmarPass}
          />
          <button className="btn btn-primary mt-2" disabled={isSubmitting} type="submit">
            {isSubmitting ? "Registrando…" : "Registrarse"}
          </button>
        </div>
      </form>
      <div className="mt-3 text-center">
        <Link className="btn btn-link" href="/login">
          ¿Ya tienes usuario? Inicia sesión
        </Link>
      </div>
    </div>
  );
}
