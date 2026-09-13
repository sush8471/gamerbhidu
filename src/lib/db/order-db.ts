import { supabase } from "@/lib/supabase";
import type { CartItem } from "@/context/CartContext";

export interface DbOrder {
  id: string;
  user_id?: string | null;
  order_id: string;
  order_code: string;
  customer_name: string;
  customer_email: string;
  total: number;
  payment_method: string;
  utr_number: string;
  items: CartItem[];
  status: "pending" | "delivered" | "cancelled";
  delivery_status: "pending" | "delivered";
  delivery_notes: string;
  created_at: string;
  updated_at?: string;
}

export interface CustomerHistory {
  totalOrders: number;
  totalSpent: number;
  isRecurring: boolean;
  orders: DbOrder[];
}

/**
 * Generates a clean, memorable 4-digit verification bill code e.g. "GB-8492"
 */
export function generateOrderCode(): string {
  const randomDigits = Math.floor(1000 + Math.random() * 9000);
  return `GB-${randomDigits}`;
}

/**
 * Creates a new order in Supabase before redirecting to WhatsApp.
 */
export async function createOrder(params: {
  userId?: string | null;
  customerName: string;
  customerEmail: string;
  items: CartItem[];
  total: number;
  utrNumber: string;
}): Promise<DbOrder> {
  const orderCode = generateOrderCode();
  const dateStr = new Date().toISOString().slice(0, 10).replace(/-/g, "");
  const orderId = `${orderCode}-${dateStr}`;

  const payload = {
    user_id: params.userId || null,
    order_id: orderId,
    order_code: orderCode,
    customer_name: params.customerName || "Customer",
    customer_email: params.customerEmail || "",
    total: params.total,
    payment_method: "upi",
    utr_number: params.utrNumber.trim(),
    items: params.items.map((item) => ({
      id: item.id,
      name: item.name,
      price: item.price,
      image: item.image,
      originalPrice: item.originalPrice,
    })),
    status: "pending",
    delivery_status: "pending",
    delivery_notes: "",
  };

  const { data, error } = await supabase
    .from("orders")
    .insert(payload)
    .select()
    .single();

  if (error) {
    console.error("Error creating order:", error);
    throw new Error(error.message || "Failed to create order record.");
  }

  return data as DbOrder;
}

/**
 * Fetch all orders for the Admin Portal.
 */
export async function getAllOrders(): Promise<DbOrder[]> {
  const { data, error } = await supabase
    .from("orders")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Error fetching orders:", error);
    throw error;
  }

  return (data || []) as DbOrder[];
}

/**
 * Look up an order by its bill code (e.g. "GB-8492" or "8492") or UTR number,
 * AND fetch the recurring customer's lifetime purchase dossier!
 */
export async function verifyOrderCode(
  rawQuery: string
): Promise<{ order: DbOrder; customerHistory: CustomerHistory } | null> {
  const query = rawQuery.trim().toUpperCase();
  const cleanCode = query.startsWith("GB-") ? query : `GB-${query}`;

  // Find order by order_code, order_id, or utr_number
  const { data: orderData, error } = await supabase
    .from("orders")
    .select("*")
    .or(`order_code.eq.${cleanCode},order_code.eq.${query},order_id.eq.${query},utr_number.eq.${query}`)
    .limit(1)
    .maybeSingle();

  if (error || !orderData) {
    return null;
  }

  const order = orderData as DbOrder;

  // Now fetch all previous orders from this customer (by customer_email or user_id)
  let historyOrders: DbOrder[] = [];
  if (order.customer_email) {
    const { data: historyData } = await supabase
      .from("orders")
      .select("*")
      .eq("customer_email", order.customer_email)
      .order("created_at", { ascending: false });

    if (historyData) {
      historyOrders = historyData as DbOrder[];
    }
  }

  const totalSpent = historyOrders.reduce((sum, o) => sum + (Number(o.total) || 0), 0);

  return {
    order,
    customerHistory: {
      totalOrders: historyOrders.length,
      totalSpent,
      isRecurring: historyOrders.length > 1,
      orders: historyOrders,
    },
  };
}

/**
 * Update the delivery status and manual admin delivery notes.
 */
export async function updateOrderDelivery(
  orderId: string,
  deliveryStatus: "pending" | "delivered",
  deliveryNotes: string
): Promise<void> {
  const { error } = await supabase
    .from("orders")
    .update({
      delivery_status: deliveryStatus,
      status: deliveryStatus === "delivered" ? "delivered" : "pending",
      delivery_notes: deliveryNotes,
      updated_at: new Date().toISOString(),
    })
    .eq("order_id", orderId);

  if (error) {
    console.error("Error updating order delivery:", error);
    throw error;
  }
}
