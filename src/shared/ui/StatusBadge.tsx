"use client";

import { Badge } from "@mantine/core";
import { STATUS_TH } from "@/shared/lib/status";
import type { OrderStatus } from "@/shared/lib/types";

const COLOR: Record<OrderStatus, string> = {
  awaiting_payment: "orange",
  awaiting_slip_review: "yellow",
  slip_rejected: "red",
  in_queue: "cyan",
  packing: "violet",
  ready_for_pickup: "green",
  picked_up: "teal",
  cancelled: "gray",
};

export function StatusBadge({ status }: { status: OrderStatus }) {
  return (
    <Badge color={COLOR[status]} variant="light" size="lg" radius="xl">
      {STATUS_TH[status]}
    </Badge>
  );
}
