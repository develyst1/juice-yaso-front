"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  Alert,
  Button,
  Card,
  Container,
  FileButton,
  Group,
  Image,
  NumberInput,
  PasswordInput,
  Select,
  Stack,
  Tabs,
  Text,
  Textarea,
  TextInput,
  Title,
} from "@mantine/core";
import {
  IconAlertCircle,
  IconBan,
  IconCheck,
  IconPackage,
  IconShieldLock,
  IconUpload,
} from "@tabler/icons-react";
import {
  adminApproveSlip,
  adminDepositReturn,
  adminGetPayment,
  adminGetPricing,
  adminListOrders,
  adminPatchStatus,
  adminPutPayment,
  adminPutPricing,
  adminRejectSlip,
  mediaUrl,
} from "@/shared/api/client";
import { nextAdminStatuses, STATUS_TH } from "@/shared/lib/status";
import { MoneyText } from "@/shared/ui/MoneyText";
import { StatusBadge } from "@/shared/ui/StatusBadge";
import { EmptyState } from "@/shared/ui/EmptyState";
import type { AdminOrder, OrderStatus, PaymentChannel, Pricing } from "@/shared/lib/types";

const TOKEN_KEY = "jy-admin-token";
const ALL_STATUS: { value: string; label: string }[] = [
  { value: "", label: "ทุกสถานะ" },
  ...(["awaiting_payment","awaiting_slip_review","slip_rejected","in_queue","packing","ready_for_pickup","picked_up","cancelled"] as OrderStatus[]).map(
    (s) => ({ value: s, label: STATUS_TH[s] }),
  ),
];

export function AdminPage() {
  const [token, setToken] = useState("");
  const [filter, setFilter] = useState<string>("");
  const [orders, setOrders] = useState<AdminOrder[]>([]);
  const [pricing, setPricing] = useState<Pricing | null>(null);
  const [pay, setPay] = useState<PaymentChannel | null>(null);
  const [qr, setQr] = useState<File | null>(null);
  const [reasons, setReasons] = useState<Record<string, string>>({});
  const [error, setError] = useState<string | null>(null);
  const [info, setInfo] = useState<string | null>(null);

  useEffect(() => {
    const saved = sessionStorage.getItem(TOKEN_KEY);
    if (saved) setToken(saved);
  }, []);

  function persistToken(v: string) {
    setToken(v);
    sessionStorage.setItem(TOKEN_KEY, v);
  }

  async function load() {
    if (!token) {
      setError("ใส่แอดมินโทเคนก่อน");
      return;
    }
    setError(null);
    try {
      const [list, p, ch] = await Promise.all([
        adminListOrders(token, filter || undefined),
        adminGetPricing(token),
        adminGetPayment(token),
      ]);
      setOrders(list.orders);
      setPricing(p);
      setPay(ch);
      setInfo(`โหลด ${list.orders.length} ออเดอร์`);
    } catch (e) {
      setError(e instanceof Error ? e.message : "โหลดไม่สำเร็จ");
    }
  }

  async function act(fn: () => Promise<unknown>) {
    setError(null);
    try {
      await fn();
      await load();
    } catch (e) {
      setError(e instanceof Error ? e.message : "ทำรายการไม่สำเร็จ");
    }
  }

  return (
    <Container size="md" py="md">
      <Group gap="xs" mb="md">
        <IconShieldLock size={22} color="var(--mantine-color-brand-6)" />
        <Title order={2} c="brand.9">
          แอดมินร้าน
        </Title>
      </Group>
      <Text size="sm" c="dimmed" mb="md">
        โทเคนเก็บในเครื่องนี้เท่านั้น · ไม่ commit ลง repo
      </Text>

      {error && (
        <Alert color="red" icon={<IconAlertCircle size={18} />} mb="md">
          {error}
        </Alert>
      )}
      {info && (
        <Text size="sm" c="dimmed" mb="sm">
          {info}
        </Text>
      )}

      <Card withBorder shadow="sm" radius="lg" mb="md">
        <Group align="flex-end">
          <PasswordInput
            label="X-Admin-Token"
            style={{ flex: 1 }}
            value={token}
            onChange={(e) => persistToken(e.currentTarget.value)}
          />
          <Select
            label="สถานะ"
            data={ALL_STATUS}
            value={filter}
            onChange={(v) => setFilter(v ?? "")}
            w={180}
          />
          <Button onClick={() => void load()}>โหลด</Button>
        </Group>
      </Card>

      <Tabs defaultValue="orders" radius="lg">
        <Tabs.List mb="md">
          <Tabs.Tab value="orders">ออเดอร์</Tabs.Tab>
          <Tabs.Tab value="config">ตั้งค่าร้าน</Tabs.Tab>
        </Tabs.List>

        <Tabs.Panel value="orders">
          <Stack>
            {orders.length === 0 && (
              <EmptyState
                icon={<IconPackage size={28} />}
                title="ยังไม่มีออเดอร์ในตัวกรองนี้"
                detail="กดโหลดหลังใส่โทเคน"
              />
            )}
            {orders.map((o) => (
              <Card key={o.orderId} withBorder shadow="sm" radius="lg">
                <Group justify="space-between" mb="xs">
                  <Text
                    component={Link}
                    href={`/q/${o.queueCode}`}
                    ff="monospace"
                    fw={700}
                    c="brand.7"
                    td="none"
                  >
                    {o.queueCode}
                  </Text>
                  <StatusBadge status={o.status} />
                </Group>
                <Text size="sm">
                  {o.customerName} · {o.customerPhone} · {o.cupsTotal} แก้ว
                </Text>
                <MoneyText value={o.productTotal + o.depositTotal} />
                {o.slipRejectReason && (
                  <Text size="sm" c="red">
                    เหตุผลปฏิเสธ: {o.slipRejectReason}
                  </Text>
                )}

                {o.status === "awaiting_slip_review" && (
                  <Stack gap="xs" mt="sm">
                    <Text size="xs" c="dimmed">
                      slipId: {o.pendingSlipId ?? "ไม่มีในรายการ"}
                    </Text>
                    <Textarea
                      placeholder="เหตุผลถ้าจะปฏิเสธ"
                      value={reasons[o.orderId] ?? ""}
                      onChange={(e) =>
                        setReasons((m) => ({ ...m, [o.orderId]: e.currentTarget.value }))
                      }
                    />
                    <Group>
                      <Button
                        leftSection={<IconCheck size={16} />}
                        disabled={!o.pendingSlipId}
                        onClick={() =>
                          act(() => adminApproveSlip(token, o.pendingSlipId ?? ""))
                        }
                      >
                        อนุมัติสลิป
                      </Button>
                      <Button
                        color="red"
                        leftSection={<IconBan size={16} />}
                        disabled={!o.pendingSlipId}
                        onClick={() =>
                          act(() =>
                            adminRejectSlip(
                              token,
                              o.pendingSlipId ?? "",
                              reasons[o.orderId] ?? "",
                            ),
                          )
                        }
                      >
                        ปฏิเสธสลิป
                      </Button>
                    </Group>
                  </Stack>
                )}

                <Group mt="sm">
                  {nextAdminStatuses(o.status).map((s) => (
                    <Button
                      key={s}
                      variant="light"
                      leftSection={<IconPackage size={16} />}
                      onClick={() =>
                        act(() =>
                          adminPatchStatus(
                            token,
                            o.orderId,
                            s as "packing" | "ready_for_pickup" | "picked_up",
                          ),
                        )
                      }
                    >
                      เลื่อนเป็น {STATUS_TH[s]}
                    </Button>
                  ))}
                  {o.status === "picked_up" && (
                    <Button
                      variant="light"
                      onClick={() => act(() => adminDepositReturn(token, o.orderId))}
                    >
                      บันทึกคืนลัง
                    </Button>
                  )}
                </Group>
              </Card>
            ))}
          </Stack>
        </Tabs.Panel>

        <Tabs.Panel value="config">
          <Stack>
            {pricing && (
              <Card withBorder shadow="sm" radius="lg">
                <Title order={4} mb="sm">
                  ราคา (มีผลออเดอร์ใหม่)
                </Title>
                <NumberInput
                  label="ฐาน/แก้ว"
                  value={pricing.basePricePerCup}
                  decimalScale={2}
                  onChange={(v) =>
                    setPricing({
                      ...pricing,
                      basePricePerCup: typeof v === "number" ? v : pricing.basePricePerCup,
                    })
                  }
                />
                <NumberInput
                  label="เกณฑ์แก้ว"
                  value={pricing.bulkThresholdCups}
                  onChange={(v) =>
                    setPricing({
                      ...pricing,
                      bulkThresholdCups:
                        typeof v === "number" ? v : pricing.bulkThresholdCups,
                    })
                  }
                />
                <NumberInput
                  label="ราคาหลังเกณฑ์"
                  value={pricing.bulkPricePerCup}
                  decimalScale={2}
                  onChange={(v) =>
                    setPricing({
                      ...pricing,
                      bulkPricePerCup: typeof v === "number" ? v : pricing.bulkPricePerCup,
                    })
                  }
                />
                <Button mt="sm" onClick={() => act(() => adminPutPricing(token, pricing))}>
                  บันทึกราคา
                </Button>
              </Card>
            )}

            {pay && (
              <Card withBorder shadow="sm" radius="lg">
                <Title order={4} mb="sm">
                  ช่องทางโอน
                </Title>
                {mediaUrl(pay.qrImageUrl) && (
                  <Image src={mediaUrl(pay.qrImageUrl) ?? ""} alt="QR" maw={180} radius="md" />
                )}
                <TextInput
                  label="เลขบัญชี"
                  value={pay.bankAccountNumber}
                  onChange={(e) =>
                    setPay({ ...pay, bankAccountNumber: e.currentTarget.value })
                  }
                />
                <TextInput
                  label="ชื่อธนาคาร"
                  value={pay.bankName}
                  onChange={(e) => setPay({ ...pay, bankName: e.currentTarget.value })}
                />
                <FileButton onChange={setQr} accept="image/*">
                  {(props) => (
                    <Button {...props} variant="light" mt="sm" leftSection={<IconUpload size={16} />}>
                      อัปรูป QR
                    </Button>
                  )}
                </FileButton>
                {qr && (
                  <Text size="sm" c="dimmed">
                    {qr.name}
                  </Text>
                )}
                <Button
                  mt="sm"
                  onClick={() =>
                    act(() =>
                      adminPutPayment(
                        token,
                        { bankAccountNumber: pay.bankAccountNumber, bankName: pay.bankName },
                        qr,
                      ),
                    )
                  }
                >
                  บันทึกช่องทางโอน
                </Button>
              </Card>
            )}
          </Stack>
        </Tabs.Panel>
      </Tabs>
    </Container>
  );
}
