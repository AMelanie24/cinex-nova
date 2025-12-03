// src/api/orders.ts
import type { CartItem } from "@/types";
import { API_NODE } from "@/config";

// =============================
// Tipos para carrito / órdenes
// =============================

export type CartTicketItem = {
  type: "ticket";
  showtimeId: number;
  seatId: string; // ej: "B7"
  price: number;
};

export type CartProductItem = {
  type: "product";
  productId: number;
  name: string;
  price: number;
  quantity: number;
};

export type OrderItemPayload =
  | {
      type: "ticket";
      showtime_id: number;
      seat_row: string;
      seat_number: number;
      quantity: number;
      unit_price: number;
      subtotal: number;
    }
  | {
      type: "product";
      product_id: number;
      quantity: number;
      unit_price: number;
      subtotal: number;
    };

// =============================
// API EXISTENTE (create_order, get_orders, get_tickets)
// =============================

export async function createOrder(params: {
  customerName: string;
  customerEmail: string;
  items: OrderItemPayload[];
}): Promise<{ ok: boolean; order_id: number }> {
  const res = await fetch(`${API_NODE}/api/orders`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      customer_name: params.customerName,
      customer_email: params.customerEmail,
      items: params.items,
    }),
  });

  if (!res.ok) {
    const txt = await res.text();
    console.error("Error HTTP createOrder:", res.status, txt);
    throw new Error("Error al crear la orden");
  }

  return res.json();
}

export async function fetchOrdersByEmail(email: string) {
  const res = await fetch(
    `${API_NODE}/api/orders?email=${encodeURIComponent(email)}`
  );
  if (!res.ok) throw new Error("Error al obtener órdenes");
  return res.json();
}

export async function fetchTicketsByEmail(email: string) {
  const res = await fetch(
    `${API_NODE}/api/orders?email=${encodeURIComponent(email)}`
  );
  if (!res.ok) throw new Error("Error al obtener tickets");
  return res.json();
}

// =============================
// GUARDAR VENTA PARA EL QR
// =============================

export interface RemoteSalePayload {
  folio: string;
  subtotal: number;
  tax: number;
  total: number;
  items: CartItem[];
}

export const createRemoteSale = async (payload: RemoteSalePayload) => {
  // Por ahora guardamos la venta localmente (ya se guarda en orders)
  console.log("Venta creada:", payload);
  return { ok: true, folio: payload.folio };
};
