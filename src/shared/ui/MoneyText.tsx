"use client";

import { Text, type TextProps } from "@mantine/core";
import { baht } from "@/shared/lib/money";

export function MoneyText({
  value,
  ...props
}: { value: number } & TextProps) {
  return (
    <Text fw={600} {...props}>
      {baht(value)}
    </Text>
  );
}
