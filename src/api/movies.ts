// src/api/movies.ts
import { Movie } from "@/types";

// 👇 La API vive en el MISMO dominio que la app
// Queda relativo, así: /movies.php, /upload_movie_image.php, etc.
const API_BASE = "";

// 🔹 Obtener TODAS las películas (cliente y admin usan esto)
export async function fetchMovies(): Promise<Movie[]> {
  const res = await fetch(`${API_BASE}/movies.php`);

  if (!res.ok) {
    console.error("Error HTTP fetchMovies:", res.status);
    throw new Error("Error al obtener películas");
  }

  const data = await res.json();
  console.log("Películas desde API:", data);

  return data.map((m: any) => ({
    id: Number(m.id),
    title: m.title,
    duration: Number(m.duration),
    rating: m.rating,
    genre: m.genre,
    image: m.image, // aquí ya viene la URL absoluta que guardas en la BD
    description: m.description,
    format: (m.format ?? "2D") as "2D" | "3D", // por si viene null/undefined
  }));
}

// 🔹 Crear película (usado solo en admin)
export async function createMovie(movie: Movie): Promise<Movie> {
  const res = await fetch(`${API_BASE}/movies.php?action=create`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(movie),
  });

  if (!res.ok) {
    console.error("Error HTTP createMovie:", res.status);
    const txt = await res.text();
    console.error("Respuesta servidor createMovie:", txt);
    throw new Error("Error al crear película");
  }

  return res.json();
}

// 🔹 Actualizar película (admin)
export async function updateMovie(movie: Movie): Promise<void> {
  const res = await fetch(
    `${API_BASE}/movies.php?action=update&id=${movie.id}`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(movie),
    }
  );

  if (!res.ok) {
    console.error("Error HTTP updateMovie:", res.status);
    const txt = await res.text();
    console.error("Respuesta servidor updateMovie:", txt);
    throw new Error("Error al actualizar película");
  }
}

// 🔹 Eliminar película (admin)
export async function deleteMovie(id: number): Promise<void> {
  const res = await fetch(`${API_BASE}/movies.php?action=delete&id=${id}`, {
    method: "POST",
  });

  if (!res.ok) {
    console.error("Error HTTP deleteMovie:", res.status);
    const txt = await res.text();
    console.error("Respuesta servidor deleteMovie:", txt);
    throw new Error("Error al eliminar película");
  }
}

// 🔹 Subir imagen y devolver URL ABSOLUTA (admin)
export async function uploadMovieImage(file: File): Promise<string> {
  const formData = new FormData();
  formData.append("image", file);

  const res = await fetch(`${API_BASE}/upload_movie_image.php`, {
    method: "POST",
    body: formData,
  });

  if (!res.ok) {
    console.error("Error HTTP uploadMovieImage:", res.status);
    const txt = await res.text();
    console.error("Respuesta servidor uploadMovieImage:", txt);
    throw new Error("Error al subir imagen");
  }

  const data = await res.json();
  // data.url ≈ "https://starlightcine.page.gd/uploads/movies/xxxxx.jpg"
  return data.url as string;
}
