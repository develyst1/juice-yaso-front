"use client";

import { Card, Image, Stack, Text } from "@mantine/core";
import { IconBuildingBank, IconQrcode } from "@tabler/icons-react";
import { mediaUrl } from "@/shared/api/client";
import type { PaymentChannel } from "@/shared/lib/types";

export function PaymentChannelCard({
  channel,
  hint,
}: {
  channel: PaymentChannel;
  hint?: string;
}) {
  const qr = mediaUrl(channel.qrImageUrl);
  return (
    <Card withBorder radius="lg" shadow="sm" padding="lg">
      <Stack gap="sm">
        <Text fw={700}>โอนแล้วแนบสลิป</Text>
        {qr ? (
          <Image src={qr} alt="QR โอนเงิน" maw={220} mx="auto" radius="md" />
        ) : (
          <IconQrcode size={36} color="var(--mantine-color-brand-6)" />
        )}
        <Text size="sm">
          <IconBuildingBank size={16} style={{ verticalAlign: "middle" }} />{" "}
          {channel.bankName} · {channel.bankAccountNumber}
        </Text>
        {hint && (
          <Text size="xs" c="dimmed">
            {hint}
          </Text>
        )}
      </Stack>
    </Card>
  );
}
