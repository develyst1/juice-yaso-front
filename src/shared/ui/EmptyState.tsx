"use client";

import { Stack, Text, ThemeIcon } from "@mantine/core";
import type { ReactNode } from "react";

export function EmptyState({
  icon,
  title,
  detail,
}: {
  icon: ReactNode;
  title: string;
  detail?: string;
}) {
  return (
    <Stack align="center" gap="sm" py="xl">
      <ThemeIcon size={56} radius="xl" variant="light" color="brand">
        {icon}
      </ThemeIcon>
      <Text fw={700} c="brand.9">
        {title}
      </Text>
      {detail && (
        <Text size="sm" c="dimmed" ta="center" maw={360}>
          {detail}
        </Text>
      )}
    </Stack>
  );
}
