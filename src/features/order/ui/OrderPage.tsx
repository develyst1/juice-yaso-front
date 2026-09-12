"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import {
  Alert,
  Button,
  Card,
  Container,
  Divider,
  Group,
  Image,
  NumberInput,
  Select,
  SimpleGrid,
  Stack,
  Text,
  TextInput,
  Title,
} from "@mantine/core";
import { IconAlertCircle, IconCup, IconPlus, IconShoppingCart, IconTrash } from "@tabler/icons-react";
import { createOrder, getCatalog } from "@/shared/api/client";
import { unitPriceForCups } from "@/shared/lib/money";
import { MoneyText } from "@/shared/ui/MoneyText";
import type { Catalog } from "@/shared/lib/types";
import crateImg from "@/shared/assets/brand/crate-orange-cups.jpg";
import drinkImg from "@/shared/assets/brand/drink-orange-cream.jpg";
import stallImg from "@/shared/assets/brand/brand-stall-scene.jpg";

type DraftLine = { id: string; crateSize: string; quantity: number; flavor: string };

function nid() {
  return Math.random().toString(36).slice(2, 9);
}

export function OrderPage() {
  const router = useRouter();
  const [catalog, setCatalog] = useState<Catalog | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [lines, setLines] = useState<DraftLine[]>([
    { id: nid(), crateSize: "30", quantity: 1, flavor: "orange" },
  ]);

  useEffect(() => {
    getCatalog()
      .then((c) => {
        setCatalog(c);
        setLines((prev) =>
          prev.map((l) => ({
            ...l,
            crateSize: String(c.crateSizes[0] ?? 30),
            flavor: String(c.flavors[0]?.code ?? "orange"),
          })),
        );
      })
      .catch((e: Error) => setError(e.message));
  }, []);

  const estimate = useMemo(() => {
    if (!catalog) return null;
    const cups = lines.reduce((s, l) => s + Number(l.crateSize) * l.quantity, 0);
    const deposit = lines.reduce((s, l) => {
      const per = catalog.depositBySize[l.crateSize] ?? 0;
      return s + per * l.quantity;
    }, 0);
    const unit = unitPriceForCups(cups, catalog.pricing);
    return { cups, unit, product: cups * unit, deposit, total: cups * unit + deposit };
  }, [catalog, lines]);

  function updateLine(id: string, patch: Partial<DraftLine>) {
    setLines((ls) => ls.map((l) => (l.id === id ? { ...l, ...patch } : l)));
  }

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    if (!name.trim() || !phone.trim()) {
      setError("กรอกชื่อและเบอร์ก่อนชำระ");
      return;
    }
    setBusy(true);
    try {
      const res = await createOrder({
        customerName: name.trim(),
        customerPhone: phone.trim(),
        lines: lines.map((l) => ({
          crateSize: Number(l.crateSize),
          quantity: l.quantity,
          flavor: l.flavor,
        })),
      });
      router.push(`/q/${res.queueCode}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : "สั่งไม่สำเร็จ");
    } finally {
      setBusy(false);
    }
  }

  return (
    <Container size="sm" py="md">
      <Image src={stallImg.src} alt="ร้าน Juice Yaso" radius="lg" mb="md" />
      <Title order={2} c="brand.9" mb={4}>
        สั่งน้ำเกร็ดหิมะ
      </Title>
      <Text c="dimmed" mb="md">
        รับที่ร้าน · ปนหลายรสได้ · ไม่มีส่งในรอบนี้
      </Text>

      {error && (
        <Alert color="red" icon={<IconAlertCircle size={18} />} mb="md">
          {error}
        </Alert>
      )}

      <form onSubmit={onSubmit}>
        <Stack gap="md">
          <Card withBorder shadow="sm" radius="lg" padding="lg">
            <Group mb="sm">
              <Image src={crateImg.src} alt="ลังแก้ว" w={56} h={56} radius="md" />
              <Title order={4}>ลังและรส</Title>
            </Group>
            <Stack gap="sm">
              {lines.map((line) => (
                <SimpleGrid key={line.id} cols={{ base: 1, xs: 4 }} spacing="xs">
                  <Select
                    leftSection={<IconCup size={16} />}
                    data={(catalog?.crateSizes ?? [30, 50, 60, 100]).map((s) => ({
                      value: String(s),
                      label: `ลัง ${s} แก้ว`,
                    }))}
                    value={line.crateSize}
                    onChange={(v) => v && updateLine(line.id, { crateSize: v })}
                  />
                  <NumberInput
                    min={1}
                    step={1}
                    value={line.quantity}
                    onChange={(v) =>
                      updateLine(line.id, { quantity: typeof v === "number" ? v : 1 })
                    }
                  />
                  <Select
                    data={(catalog?.flavors ?? []).map((f) => ({
                      value: String(f.code),
                      label: f.nameTh,
                    }))}
                    value={line.flavor}
                    onChange={(v) => v && updateLine(line.id, { flavor: v })}
                  />
                  <Button
                    variant="light"
                    color="red"
                    leftSection={<IconTrash size={16} />}
                    disabled={lines.length === 1}
                    onClick={() => setLines((ls) => ls.filter((l) => l.id !== line.id))}
                  >
                    ลบ
                  </Button>
                </SimpleGrid>
              ))}
              <Button
                variant="light"
                leftSection={<IconPlus size={16} />}
                onClick={() =>
                  setLines((ls) => [
                    ...ls,
                    {
                      id: nid(),
                      crateSize: String(catalog?.crateSizes[0] ?? 30),
                      quantity: 1,
                      flavor: String(catalog?.flavors[0]?.code ?? "orange"),
                    },
                  ])
                }
              >
                เพิ่มรส / ลัง
              </Button>
            </Stack>
          </Card>

          <Card withBorder shadow="sm" radius="lg" padding="lg">
            <Title order={4} mb="sm">
              ชื่อและเบอร์ (บังคับ)
            </Title>
            <Stack>
              <TextInput
                label="ชื่อผู้รับ"
                value={name}
                onChange={(e) => setName(e.currentTarget.value)}
                required
              />
              <TextInput
                label="เบอร์โทร"
                inputMode="tel"
                value={phone}
                onChange={(e) => setPhone(e.currentTarget.value)}
                required
              />
            </Stack>
          </Card>

          {estimate && catalog && (
            <Card withBorder shadow="sm" radius="lg" padding="lg">
              <Group align="flex-start" wrap="nowrap">
                <Image src={drinkImg.src} alt="น้ำเกร็ดหิมะ" w={72} h={72} radius="md" />
                <Stack gap={4} style={{ flex: 1 }}>
                  <Text size="sm">
                    รวม {estimate.cups} แก้ว · ราคา/แก้ว{" "}
                    <MoneyText span value={estimate.unit} />
                    {estimate.cups > catalog.pricing.bulkThresholdCups
                      ? " (ส่วนลดลังใหญ่)"
                      : ""}
                  </Text>
                  <Group justify="space-between">
                    <Text size="sm">ค่าน้ำ</Text>
                    <MoneyText value={estimate.product} />
                  </Group>
                  <Group justify="space-between">
                    <Text size="sm">มัดจำลัง</Text>
                    <MoneyText value={estimate.deposit} />
                  </Group>
                  <Divider />
                  <Group justify="space-between">
                    <Text fw={700}>รวม</Text>
                    <MoneyText value={estimate.total} c="brand.6" fz="lg" />
                  </Group>
                </Stack>
              </Group>
            </Card>
          )}

          <Button
            type="submit"
            size="lg"
            loading={busy}
            leftSection={<IconShoppingCart size={18} />}
          >
            สั่งแล้วไปชำระ
          </Button>
        </Stack>
      </form>
    </Container>
  );
}
