export type FlavorCode = "orange" | "grape" | "cocoa" | "lychee" | "blueberry";

export type CrateSize = 30 | 50 | 60 | 100;

export type OrderStatus =
  | "awaiting_payment"
  | "awaiting_slip_review"
  | "slip_rejected"
  | "in_queue"
  | "packing"
  | "ready_for_pickup"
  | "picked_up"
  | "cancelled";

export type PaymentChannel = {
  qrImageUrl: string | null;
  bankAccountNumber: string;
  bankName: string;
};

export type Pricing = {
  basePricePerCup: number;
  bulkThresholdCups: number;
  bulkPricePerCup: number;
};

export type Catalog = {
  flavors: { code: FlavorCode | string; nameTh: string }[];
  crateSizes: number[];
  depositBySize: Record<string, number>;
  pricing: Pricing;
  paymentChannel: PaymentChannel;
};

export type OrderLine = {
  crateSize: number;
  quantity: number;
  flavor: string;
  lineCups: number;
  lineDeposit: number;
};

export type QueueOrder = {
  orderId: string;
  queueCode: string;
  customerName: string;
  customerPhone: string;
  status: OrderStatus;
  cupsTotal: number;
  productTotal: number;
  depositTotal: number;
  unitPriceApplied: number;
  slipRejectReason: string | null;
  lines: OrderLine[];
  paymentChannel?: PaymentChannel;
  createdAt: string;
  updatedAt: string;
  cancelledAt: string | null;
  depositReturnedAt: string | null;
  cratesReturnedAt: string | null;
};

export type AdminOrder = {
  orderId: string;
  queueCode: string;
  customerName: string;
  customerPhone: string;
  status: OrderStatus;
  cupsTotal: number;
  productTotal: number;
  depositTotal: number;
  slipRejectReason: string | null;
  createdAt: string;
  updatedAt: string;
};

export type ApiError = {
  error: string;
  code?: string;
};
