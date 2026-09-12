"use client";

import { ActionIcon, Button, Group, Stack, Text, UnstyledButton } from "@mantine/core";
import { IconMinus, IconPlus } from "@tabler/icons-react";
import { FLAVOR_COLOR } from "@/shared/lib/flavors";

export function FlavorStepper({
  nameTh,
  flavor,
  cups,
  remaining,
  onAdd,
  onMinus,
}: {
  nameTh: string;
  flavor: string;
  cups: number;
  remaining: number;
  onAdd: (n: number) => void;
  onMinus: () => void;
}) {
  const color = FLAVOR_COLOR[flavor] ?? "#EA580C";
  const canPlus = remaining > 0;
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
          onClick={() => onAdd(1)}
          aria-label={`เพิ่ม${nameTh}`}
        >
          <IconPlus size={18} />
        </ActionIcon>
      </Group>
      <Group gap={4} justify="center">
        {[5, 10].map((n) => (
          <UnstyledButton
            key={n}
            type="button"
            disabled={!canPlus}
            onClick={() => onAdd(n)}
            aria-label={`เพิ่ม ${n} แก้ว${nameTh}`}
            style={{
              minWidth: 32,
              height: 26,
              padding: "0 8px",
              borderRadius: 999,
              fontSize: 12,
              fontWeight: 700,
              color: canPlus ? "#C2410C" : "#A3A3A3",
              background: canPlus ? "#FFF7ED" : "#F5F5F5",
              border: `1px solid ${canPlus ? "#FDBA74" : "#E5E5E5"}`,
              cursor: canPlus ? "pointer" : "not-allowed",
            }}
          >
            +{n}
          </UnstyledButton>
        ))}
      </Group>
      <Button
        type="button"
        size="compact-xs"
        variant="light"
        color="brand"
        radius="xl"
        disabled={!canPlus}
        onClick={() => onAdd(remaining)}
        aria-label={`เต็มที่เหลือ${nameTh}`}
        styles={{ root: { fontSize: 11, paddingInline: 8 } }}
      >
        เต็มที่เหลือ
      </Button>
    </Stack>
  );
}
