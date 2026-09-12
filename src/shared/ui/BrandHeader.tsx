"use client";

import { Group, Image, Stack, Text, Title } from "@mantine/core";
import Link from "next/link";
import mascot from "@/shared/assets/brand/mascot-cup-wave.jpg";

export function BrandHeader({ subtitle }: { subtitle?: string }) {
  return (
    <Group justify="space-between" wrap="nowrap" py="sm">
      <Group gap="sm" wrap="nowrap">
        <Image src={mascot.src} alt="Juice Yaso" w={48} h={48} radius="xl" />
        <Stack gap={0}>
          <Title order={3} c="brand.6">
            <Link href="/" style={{ color: "inherit", textDecoration: "none" }}>
              Juice Yaso
            </Link>
          </Title>
          <Text size="sm" c="brand.8">
            {subtitle ?? "น้ำเกร็ดหิมะ · รับที่ร้าน"}
          </Text>
        </Stack>
      </Group>
    </Group>
  );
}
