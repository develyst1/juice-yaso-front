import type { Pricing } from "@/shared/lib/types";

export function baht(n: number): string {
  return new Intl.NumberFormat("th-TH", {
    style: "currency",
    currency: "THB",
    maximumFractionDigits: 2,
  }).format(n);
}

export function unitPriceForCups(cups: number, pricing: Pricing): number {
  return cups > pricing.bulkThresholdCups
    ? pricing.bulkPricePerCup
    : pricing.basePricePerCup;
}
