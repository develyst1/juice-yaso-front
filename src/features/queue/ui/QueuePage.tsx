"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import {
  Alert,
  Button,
  Card,
  Container,
  FileButton,
  Group,
  List,
  Modal,
  Stack,
  Text,
  Title,
} from "@mantine/core";
import {
  IconAlertCircle,
  IconCopy,
  IconHome,
  IconRefresh,
  IconUpload,
  IconX,
} from "@tabler/icons-react";
import { cancelQueue, getQueue, uploadSlip } from "@/shared/api/client";
import { CANCELABLE, SLIP_UPLOADABLE } from "@/shared/lib/status";
import { MoneyText } from "@/shared/ui/MoneyText";
import { StatusBadge } from "@/shared/ui/StatusBadge";
import { EmptyState } from "@/shared/ui/EmptyState";
import { PaymentChannelCard } from "@/features/payment/ui/PaymentChannelCard";
import type { QueueOrder } from "@/shared/lib/types";

export function QueuePage() {
  const params = useParams<{ queueCode: string }>();
  const queueCode = decodeURIComponent(params.queueCode ?? "");
  const [order, setOrder] = useState<QueueOrder | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [notFound, setNotFound] = useState(false);
  const [busy, setBusy] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [cancelOpen, setCancelOpen] = useState(false);

  async function loadCode(code: string) {
    const o = await getQueue(code);
    setOrder(o);
    setNotFound(false);
  }

  async function refresh() {
    try {
      await loadCode(queueCode);
    } catch (e) {
      const status = (e as Error & { status?: number }).status;
      if (status === 404) setNotFound(true);
      else setError(e instanceof Error ? e.message : "โหลดบัตรคิวไม่สำเร็จ");
    }
  }

  useEffect(() => {
    if (queueCode) void refresh();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [queueCode]);

  async function onUpload() {
    if (!file) return;
    setBusy(true);
    setError(null);
    try {
      await uploadSlip(queueCode, file);
      setFile(null);
      await refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "อัปสลิปไม่สำเร็จ");
    } finally {
      setBusy(false);
    }
  }

  async function confirmCancel() {
    const code = queueCode;
    setBusy(true);
    setError(null);
    try {
      await cancelQueue(code);
      setCancelOpen(false);
      await loadCode(code);
    } catch (err) {
      setError(err instanceof Error ? err.message : "ยกเลิกไม่ได้");
    } finally {
      setBusy(false);
    }
  }

  if (notFound) {
    return (
      <Container size="sm" py="xl">
        <EmptyState
          icon={<IconAlertCircle size={28} />}
          title="ไม่พบบัตรคิว"
          detail="รหัสนี้ไม่มีในระบบ — v1 ไม่มีดูออเดอร์เก่า ต้องมีรหัสบัตรคิวปัจจุบัน"
        />
        <Button component={Link} href="/" leftSection={<IconHome size={16} />} fullWidth>
          กลับไปสั่งใหม่
        </Button>
      </Container>
    );
  }

  if (!order) {
    return (
      <Container size="sm" py="xl">
        <Text c="dimmed">กำลังโหลดบัตรคิว</Text>
      </Container>
    );
  }

  const canPay = SLIP_UPLOADABLE.has(order.status);

  return (
    <Container size="sm" py="md">
      <Group justify="space-between" mb="md">
        <div>
          <Text size="sm" c="dimmed">
            บัตรคิว
          </Text>
          <Title order={2} ff="monospace" c="brand.7">
            {order.queueCode}
          </Title>
        </div>
        <StatusBadge status={order.status} />
      </Group>

      {error && (
        <Alert color="red" icon={<IconAlertCircle size={18} />} mb="md">
          {error}
        </Alert>
      )}

      <Stack gap="md">
        <Card withBorder shadow="sm" radius="lg" padding="lg">
          <Text size="sm" mb="xs">
            {order.customerName} · {order.customerPhone}
          </Text>
          <List size="sm" spacing={4}>
            {(order.crates ?? []).map((c, i) => (
              <List.Item key={`c${i}`}>
                ลัง {c.crateSize} · {c.fills.map((f) => `${f.flavor} ${f.cups}`).join(" + ")}
              </List.Item>
            ))}
            {(order.lines ?? []).map((l, i) => (
              <List.Item key={`l${i}`}>
                ลัง {l.crateSize} × {l.quantity} · {l.flavor} ({l.lineCups} แก้ว)
              </List.Item>
            ))}
          </List>
          <Group justify="space-between" mt="sm">
            <Text size="sm">ค่าน้ำ</Text>
            <MoneyText value={order.productTotal} />
          </Group>
          <Group justify="space-between">
            <Text size="sm">มัดจำ</Text>
            <MoneyText value={order.depositTotal} />
          </Group>
          <Group justify="space-between">
            <Text fw={700}>รวม</Text>
            <MoneyText value={order.productTotal + order.depositTotal} c="brand.6" />
          </Group>
        </Card>

        {order.status === "slip_rejected" && order.slipRejectReason && (
          <Alert color="red" title="สลิปถูกปฏิเสธ" icon={<IconAlertCircle size={18} />}>
            {order.slipRejectReason}
            <Text size="sm" mt={4}>
              อัปสลิปใหม่ได้จากบัตรคิวนี้
            </Text>
          </Alert>
        )}

        {canPay && order.paymentChannel && (
          <PaymentChannelCard
            channel={order.paymentChannel}
            hint="รอตรวจได้ประมาณถึง 1 ชม."
          />
        )}

        {canPay && (
          <Card withBorder radius="lg" padding="lg">
            <Group>
              <FileButton onChange={setFile} accept="image/*">
                {(props) => (
                  <Button {...props} variant="light" leftSection={<IconUpload size={16} />}>
                    เลือกสลิป
                  </Button>
                )}
              </FileButton>
              <Text size="sm" c="dimmed">
                {file ? file.name : "ยังไม่ได้เลือกไฟล์"}
              </Text>
            </Group>
            <Button
              mt="sm"
              fullWidth
              leftSection={<IconUpload size={16} />}
              disabled={!file}
              loading={busy}
              onClick={() => void onUpload()}
            >
              อัปสลิป
            </Button>
          </Card>
        )}

        {order.status === "awaiting_slip_review" && (
          <Alert color="yellow" icon={<IconRefresh size={18} />}>
            ส่งสลิปแล้ว รอร้านตรวจ
          </Alert>
        )}
        {order.status === "ready_for_pickup" && (
          <Alert color="green">แพ็คเสร็จแล้ว มารับที่ร้านได้</Alert>
        )}

        <Group>
          <Button
            variant="light"
            leftSection={<IconCopy size={16} />}
            onClick={() => navigator.clipboard.writeText(window.location.href)}
          >
            คัดลอกลิงก์บัตรคิว
          </Button>
          {CANCELABLE.has(order.status) && (
            <Button
              type="button"
              color="red"
              leftSection={<IconX size={16} />}
              onClick={() => setCancelOpen(true)}
            >
              ยกเลิกออเดอร์
            </Button>
          )}
        </Group>
      </Stack>

      <Modal
        opened={cancelOpen}
        onClose={() => !busy && setCancelOpen(false)}
        title="ยกเลิกออเดอร์"
        centered
        closeOnClickOutside={!busy}
      >
        <Text size="sm" mb="md">
          ยืนยันยกเลิกบัตรคิว {queueCode} หรือไม่ สถานะจะเป็นยกเลิกทันที
        </Text>
        <Group justify="flex-end">
          <Button type="button" variant="light" disabled={busy} onClick={() => setCancelOpen(false)}>
            อยู่ต่อ
          </Button>
          <Button
            type="button"
            color="red"
            loading={busy}
            leftSection={<IconX size={16} />}
            onClick={() => void confirmCancel()}
          >
            ยืนยันยกเลิก
          </Button>
        </Group>
      </Modal>
    </Container>
  );
}
