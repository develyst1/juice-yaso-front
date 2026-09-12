import type {
  AdminOrder,
  ApiError,
  Catalog,
  PaymentChannel,
  Pricing,
  QueueOrder,
} from "@/shared/lib/types";

import { API_BASE as BASE } from "@/shared/config/env";

export function apiBase(): string {
  return BASE;
}

export function mediaUrl(path: string | null | undefined): string | null {
  if (!path) return null;
  if (path.startsWith("http://") || path.startsWith("https://")) return path;
  return `${BASE}${path.startsWith("/") ? path : `/${path}`}`;
}

async function parse<T>(res: Response): Promise<T> {
  const data = (await res.json().catch(() => ({}))) as T & ApiError;
  if (!res.ok) {
    const err = new Error(data.error || `HTTP ${res.status}`) as Error & {
      status: number;
      code?: string;
    };
    err.status = res.status;
    err.code = data.code;
    throw err;
  }
  return data;
}

export function getCatalog(): Promise<Catalog> {
  return fetch(`${BASE}/api/v1/catalog`).then((r) => parse<Catalog>(r));
}

export function createOrder(body: {
  customerName: string;
  customerPhone: string;
  crates: { crateSize: number; fills: { flavor: string; cups: number }[] }[];
}): Promise<{
  orderId: string;
  queueCode: string;
  status: "awaiting_payment";
  cupsTotal: number;
  productTotal: number;
  depositTotal: number;
  paymentChannel: PaymentChannel;
}> {
  return fetch(`${BASE}/api/v1/orders`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  }).then((r) => parse(r));
}

export function getQueue(queueCode: string): Promise<QueueOrder> {
  return fetch(`${BASE}/api/v1/queue/${encodeURIComponent(queueCode)}`).then((r) =>
    parse<QueueOrder>(r),
  );
}

export function uploadSlip(
  queueCode: string,
  file: File,
): Promise<{ status: "awaiting_slip_review"; slipId: string }> {
  const fd = new FormData();
  fd.set("file", file);
  return fetch(`${BASE}/api/v1/queue/${encodeURIComponent(queueCode)}/slips`, {
    method: "POST",
    body: fd,
  }).then((r) => parse(r));
}

export function cancelQueue(
  queueCode: string,
): Promise<{ status: "cancelled" }> {
  return fetch(`${BASE}/api/v1/queue/${encodeURIComponent(queueCode)}/cancel`, {
    method: "POST",
  }).then((r) => parse(r));
}

function adminHeaders(token: string, json = false): HeadersInit {
  const h: Record<string, string> = { "X-Admin-Token": token };
  if (json) h["Content-Type"] = "application/json";
  return h;
}

export function adminListOrders(
  token: string,
  status?: string,
): Promise<{ orders: AdminOrder[] }> {
  const q = status ? `?status=${encodeURIComponent(status)}` : "";
  return fetch(`${BASE}/api/v1/admin/orders${q}`, {
    headers: adminHeaders(token),
  }).then((r) => parse(r));
}

export function adminApproveSlip(token: string, slipId: string) {
  return fetch(`${BASE}/api/v1/admin/slips/${encodeURIComponent(slipId)}/approve`, {
    method: "POST",
    headers: adminHeaders(token),
  }).then((r) => parse<{ orderId: string; status: "in_queue" }>(r));
}

export function adminRejectSlip(token: string, slipId: string, reason: string) {
  return fetch(`${BASE}/api/v1/admin/slips/${encodeURIComponent(slipId)}/reject`, {
    method: "POST",
    headers: adminHeaders(token, true),
    body: JSON.stringify({ reason }),
  }).then((r) =>
    parse<{ orderId: string; status: "slip_rejected"; reason: string }>(r),
  );
}

export function adminPatchStatus(
  token: string,
  orderId: string,
  status: "packing" | "ready_for_pickup" | "picked_up",
) {
  return fetch(`${BASE}/api/v1/admin/orders/${encodeURIComponent(orderId)}/status`, {
    method: "PATCH",
    headers: adminHeaders(token, true),
    body: JSON.stringify({ status }),
  }).then((r) => parse<{ orderId: string; status: string }>(r));
}

export function adminGetPricing(token: string): Promise<Pricing> {
  return fetch(`${BASE}/api/v1/admin/config/pricing`, {
    headers: adminHeaders(token),
  }).then((r) => parse<Pricing>(r));
}

export function adminPutPricing(token: string, body: Pricing): Promise<Pricing> {
  return fetch(`${BASE}/api/v1/admin/config/pricing`, {
    method: "PUT",
    headers: adminHeaders(token, true),
    body: JSON.stringify(body),
  }).then((r) => parse<Pricing>(r));
}

export function adminGetPayment(token: string): Promise<PaymentChannel> {
  return fetch(`${BASE}/api/v1/admin/config/payment-channel`, {
    headers: adminHeaders(token),
  }).then((r) => parse<PaymentChannel>(r));
}

export function adminPutPayment(
  token: string,
  fields: { bankAccountNumber: string; bankName: string },
  qr?: File | null,
): Promise<PaymentChannel> {
  if (qr) {
    const fd = new FormData();
    fd.set("bankAccountNumber", fields.bankAccountNumber);
    fd.set("bankName", fields.bankName);
    fd.set("qr", qr);
    return fetch(`${BASE}/api/v1/admin/config/payment-channel`, {
      method: "PUT",
      headers: { "X-Admin-Token": token },
      body: fd,
    }).then((r) => parse<PaymentChannel>(r));
  }
  return fetch(`${BASE}/api/v1/admin/config/payment-channel`, {
    method: "PUT",
    headers: adminHeaders(token, true),
    body: JSON.stringify(fields),
  }).then((r) => parse<PaymentChannel>(r));
}

export function adminDepositReturn(token: string, orderId: string) {
  return fetch(
    `${BASE}/api/v1/admin/orders/${encodeURIComponent(orderId)}/deposit-returns`,
    {
      method: "POST",
      headers: adminHeaders(token, true),
      body: JSON.stringify({ cratesReturned: true }),
    },
  ).then((r) => parse(r));
}
