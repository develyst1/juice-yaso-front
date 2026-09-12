"use client";

import { ActionIcon, Group, Stack, Text } from "@mantine/core";
import { IconMinus, IconPlus } from "@tabler/icons-react";
import { FLAVOR_COLOR } from "@/shared/lib/flavors";

export function FlavorStepper({
  nameTh,
  flavor,
  cups,
  canPlus,
  onPlus,
  onMinus,
}: {
  nameTh: string;
  flavor: string;
  cups: number;
  canPlus: boolean;
  onPlus: () => void;
  onMinus: () => void;
}) {
  const color = FLAVOR_COLOR[flavor] ?? "#EA580C";
  return (
    <Stack align="center" gap={6} style={{ minWidth: 72 }}>
      <div
        style={{
          width: 64,
          height: 72,
          borderRadius: "50% 50% 46% 46%",
          background: color,
          boxShadow: cups > 0 ? `0 8px 18px ${color}55` : "none",
          transform: cups > 0 ? "scale(1.06)" : "scale(1)",
          transition: "transform 160ms ease, box-shadow 160ms ease",
          display: "flex",
          alignItems: "flex-end",
          justifyContent: "center",
          paddingBottom: 10,
        }}
      >
        <Text c="white" fw={800} fz="lg">
          {cups}
        </Text>
      </div>
      <Text size="xs" fw={700} ta="center">
        {nameTh}
      </Text>
      <Group gap={6}>
        <ActionIcon
          type="button"
          variant="light"
          color="gray"
          radius="xl"
          size="lg"
          disabled={cups <= 0}
          onClick={onMinus}
          aria-label={`ลด${nameTh}`}
        >
          <IconMinus size={18} />
        </ActionIcon>
        <ActionIcon
          type="button"
          variant="filled"
          color="brand"
          radius="xl"
          size="lg"
          disabled={!canPlus}
          onClick={onPlus}
          aria-label={`เพิ่ม${nameTh}`}
        >
          <IconPlus size={18} />
        </ActionIcon>
      </Group>
    </Stack>
  );
}
