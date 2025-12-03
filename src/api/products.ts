// src/api/products.ts
import { Product, Category } from "@/types";
import { API_NODE } from "@/config";

// Lo que viene crudo de la API
type RawProduct = {
  id: number | string;
  sku: string;
  name: string;
  description?: string | null;
  price: number | string;
  stock: number | string;
  category_id: number | string;
  image_url?: string | null;
  image?: string | null;
};

// 🔹 Obtener productos
export async function fetchProducts(): Promise<Product[]> {
  const res = await fetch(`${API_NODE}/api/products`);
  if (!res.ok) {
    console.error("HTTP error fetchProducts:", res.status, await res.text());
    throw new Error("Error al obtener productos");
  }

  const data: RawProduct[] = await res.json();

  return data.map((p) => ({
    id: Number(p.id),
    sku: p.sku,
    name: p.name,
    price: Number(p.price),
    stock: Number(p.stock),
    categoryId: Number(p.category_id),
    // usamos cualquiera de los dos que exista
    image: p.image_url ?? p.image ?? "",
  }));
}

// 🔹 Obtener categorías
export async function fetchCategories(): Promise<Category[]> {
  const res = await fetch(`${API_NODE}/api/categories`);
  if (!res.ok) {
    console.error(
      "HTTP error fetchCategories:",
      res.status,
      await res.text()
    );
    throw new Error("Error al obtener categorías");
  }
  return res.json();
}

// 🔹 Crear producto
export async function createProduct(prod: Product): Promise<Product> {
  const res = await fetch(`${API_NODE}/api/products`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      sku: prod.sku,
      name: prod.name,
      price: prod.price,
      stock: prod.stock,
      category_id: prod.categoryId,
      // mandamos ambos nombres de campo, como en movies
      image_url: prod.image ?? null,
      image: prod.image ?? null,
    }),
  });

  if (!res.ok) {
    console.error("HTTP error createProduct:", res.status, await res.text());
    throw new Error("Error al crear producto");
  }

  const p: RawProduct = await res.json();

  return {
    id: Number(p.id),
    sku: p.sku,
    name: p.name,
    price: Number(p.price),
    stock: Number(p.stock),
    categoryId: Number(p.category_id),
    image: p.image_url ?? p.image ?? "",
  };
}

// 🔹 Actualizar producto
export async function updateProduct(prod: Product): Promise<void> {
  const res = await fetch(`${API_NODE}/api/products/${prod.id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      sku: prod.sku,
      name: prod.name,
      price: prod.price,
      stock: prod.stock,
      category_id: prod.categoryId,
      image_url: prod.image ?? "",
    }),
  });

  if (!res.ok) {
    // útil para depurar si vuelve a fallar
    const text = await res.text().catch(() => "");
    console.error("Error updateProduct:", res.status, text);
    throw new Error("Error al actualizar producto");
  }
}


// 🔹 Eliminar producto
export async function deleteProduct(id: number): Promise<void> {
  const res = await fetch(`${API_NODE}/api/products/${id}`, {
    method: "DELETE",
  });

  if (!res.ok) {
    console.error("HTTP error deleteProduct:", res.status, await res.text());
    throw new Error("Error al eliminar producto");
  }
}

// 🔹 Subir imagen (placeholder - se puede implementar después)
export async function uploadProductImage(file: File): Promise<string> {
  // Por ahora retornamos una URL placeholder
  // TODO: Implementar subida de imágenes si es necesario
  console.log("Upload de imagen no implementado aún, usando placeholder");
  return `/dulceria/${file.name}`;
}
