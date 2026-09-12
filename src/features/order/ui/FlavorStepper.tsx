"use client";

import { ActionIcon, Button, Group, Stack, Text, UnstyledButton } from "@mantine/core";
import { IconMinus, IconPlus } from "@tabler/icons-react";
import { FLAVOR_COLOR } from "@/shared/lib/flavors";
import orangeImg from "@/shared/assets/flavors/flavor-orange.jpg";
import grapeImg from "@/shared/assets/flavors/flavor-grape.jpg";
import cocoaImg from "@/shared/assets/flavors/flavor-cocoa.jpg";
import lycheeImg from "@/shared/assets/flavors/flavor-lychee.jpg";
import blueberryImg from "@/shared/assets/flavors/flavor-blueberry.jpg";

const FLAVOR_IMG: Record<string, { src: string }> = {
  orange: orangeImg,
  grape: grapeImg,
  cocoa: cocoaImg,
  lychee: lycheeImg,
  blueberry: blueberryImg,
};

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
  const img = FLAVOR_IMG[flavor];
  const canPlus = remaining > 0;
  return (
    <Stack align="center" gap={6} style={{ minWidth: 72 }}>
      <div
        style={{
          position: "relative",
          width: 72,
          height: 72,
          borderRadius: 999,
          overflow: "hidden",
          background: color,
          boxShadow: cups > 0 ? `0 8px 18px ${color}55` : "0 0 0 1px #FED7AA",
          transform: cups > 0 ? "scale(1.06)" : "scale(1)",
          transition: "transform 160ms ease, box-shadow 160ms ease",
        }}
      >
        {img ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={img.src}
            alt={nameTh}
            style={{ width: "100%", height: "100%", objectFit: "cover" }}
          />
        ) : null}
        <div
          style={{
            position: "absolute",
            inset: 0,
            display: "flex",
            alignItems: "flex-end",
            justifyContent: "center",
            paddingBottom: 4,
            background: "linear-gradient(to top, rgba(0,0,0,0.5), transparent 50%)",
          }}
        >
          <Text
            c="white"
            fw={800}
            fz="lg"
            lh={1}
            style={{ textShadow: "0 1px 3px rgba(0,0,0,0.65)" }}
          >
            {cups}
          </Text>
        </div>
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
