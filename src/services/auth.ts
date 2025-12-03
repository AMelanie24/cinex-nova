// src/services/auth.ts
import { API_NODE } from "@/config";

export async function loginRequest(email: string, password: string) {
  try {
    const res = await fetch(`${API_NODE}/api/login`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ email, password }),
    });

    const data = await res.json().catch(() => null);

    if (!res.ok || !data) {
      throw new Error(
        (data && data.message) || "Error al conectar con el servidor"
      );
    }

    if (!data.ok) {
      throw new Error(data.message || "Credenciales incorrectas");
    }

    // data = { ok: true, email, role }
    return data;
  } catch (error: any) {
    throw new Error(error.message || "No se pudo conectar al servidor");
  }
}
