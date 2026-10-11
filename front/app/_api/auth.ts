import { api } from "./client";

export type LoginData = {
  correo: string;
  pass: string;
};

export type RegistrationData = LoginData & {
  nombres: string;
  apellidos: string;
  telefono: string;
};

export type LoginResponse = {
  correo: string;
  nombres: string;
  apellidos: string;
  telefono: string;
  jwt: string;
};

export async function login(data: LoginData): Promise<LoginResponse> {
  return api.post("auth/login", { json: data }).json<LoginResponse>();
}

export async function register(data: RegistrationData): Promise<{ id: string }> {
  return api.post("auth/registro", { json: data }).json<{ id: string }>();
}

export async function refreshAccessToken(): Promise<{ jwt: string }> {
  return api.post("auth/refresh").json<{ jwt: string }>();
}

export async function logout(): Promise<boolean> {
  return api.post("auth/logout").json<boolean>();
}

export async function getSystems(): Promise<Record<string, unknown>[]> {
  return api.get("auth/sistemas").json<Record<string, unknown>[]>();
}
