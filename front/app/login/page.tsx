"use client";

import { KeyRound, Mail } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, type FormEvent } from "react";
import { toast } from "sonner";
import { getApiErrorMessage } from "../_api/client";
import { login } from "../_api/auth";
import Input from "../componentes/input";

export default function LoginPage() {
  const router = useRouter();
  const [correo, setCorreo] = useState("");
  const [pass, setPass] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setIsSubmitting(true);

    try {
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
          <h1 className="card-title mb-3 text-2xl">Iniciar sesión</h1>
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
            autoComplete="current-password"
            icon={KeyRound}
            onChange={(event) => setPass(event.target.value)}
            required
            title="Contraseña"
            type="password"
            value={pass}
          />
          <button className="btn btn-primary mt-2" disabled={isSubmitting} type="submit">
            {isSubmitting ? "Ingresando…" : "Iniciar sesión"}
          </button>
        </div>
      </form>
      <div className="mt-3 text-center">
        <Link className="btn btn-link" href="/registro">
          ¿No tienes cuenta? Regístrate aquí
        </Link>
      </div>
    </div>
  );
}
