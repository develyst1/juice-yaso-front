export const FLAVOR_COLOR: Record<string, string> = {
  orange: "#EA580C",
  grape: "#7C3AED",
  cocoa: "#78350F",
  lychee: "#EC4899",
  blueberry: "#2563EB",
};

export const PHONE_RE = /^0\d{9}$/;

export function digitsOnly(value: string): string {
  return value.replace(/\D/g, "").slice(0, 10);
}
