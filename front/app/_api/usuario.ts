import { api } from "./client";

export type UserProfile = {
  id: string;
  nombres: string;
  apellidos: string;
  telefono: string;
  correo: string;
};

export async function getProfile(jwt: string): Promise<UserProfile> {
  return api
    .get("usuario/perfil", { headers: { Authorization: `Bearer ${jwt}` } })
    .json<UserProfile>();
}
