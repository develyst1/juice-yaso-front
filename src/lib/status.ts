import type { OrderStatus } from "./types";

export const STATUS_TH: Record<OrderStatus, string> = {
  awaiting_payment: "รอชำระ",
  awaiting_slip_review: "รอตรวจสลิป",
  slip_rejected: "ปฏิเสธสลิป",
  in_queue: "อยู่ในคิว",
  packing: "กำลังแพ็ค",
  ready_for_pickup: "พร้อมรับ",
  picked_up: "รับแล้ว",
  cancelled: "ยกเลิก",
};

export const CANCELABLE: ReadonlySet<OrderStatus> = new Set([
  "awaiting_payment",
  "awaiting_slip_review",
  "slip_rejected",
  "in_queue",
]);

export const SLIP_UPLOADABLE: ReadonlySet<OrderStatus> = new Set([
  "awaiting_payment",
  "slip_rejected",
]);

export function nextAdminStatuses(status: OrderStatus): OrderStatus[] {
  if (status === "in_queue") return ["packing"];
  if (status === "packing") return ["ready_for_pickup"];
  if (status === "ready_for_pickup") return ["picked_up"];
  return [];
}
