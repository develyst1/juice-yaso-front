"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import {
  Alert,
  Button,
  Card,
  Collapse,
  Container,
  Group,
  Image,
  Modal,
  SimpleGrid,
  Stack,
  Text,
  TextInput,
  Title,
  UnstyledButton,
} from "@mantine/core";
import {
  IconAlertCircle,
  IconPackage,
  IconPlus,
  IconShoppingCart,
  IconTrash,
} from "@tabler/icons-react";
import { createOrder, getCatalog } from "@/shared/api/client";
import { digitsOnly, PHONE_RE } from "@/shared/lib/flavors";
import { unitPriceForCups } from "@/shared/lib/money";
import { MoneyText } from "@/shared/ui/MoneyText";
import type { Catalog } from "@/shared/lib/types";
import crateImg from "@/shared/assets/brand/crate-orange-cups.jpg";
import stallImg from "@/shared/assets/brand/brand-stall-scene.jpg";
import { FlavorStepper } from "./FlavorStepper";

type DraftCrate = {
  id: string;
  crateSize: number;
  fills: Record<string, number>;
};

function nid() {
  return Math.random().toString(36).slice(2, 9);
}

function filledCups(c: DraftCrate) {
  return Object.values(c.fills).reduce((s, n) => s + n, 0);
}

export function OrderPage() {
  const router = useRouter();
  const [catalog, setCatalog] = useState<Catalog | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [crates, setCrates] = useState<DraftCrate[]>([]);
  const [checkout, setCheckout] = useState(false);
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");

  useEffect(() => {
    getCatalog()
      .then(setCatalog)
      .catch((e: Error) => setError(e.message));
  }, []);

  const estimate = useMemo(() => {
    if (!catalog || crates.length === 0) return null;
    const cups = crates.reduce((s, c) => s + c.crateSize, 0);
    const deposit = crates.reduce(
      (s, c) => s + (catalog.depositBySize[String(c.crateSize)] ?? 0),
      0,
    );
    const unit = unitPriceForCups(cups, catalog.pricing);
    return { cups, unit, product: cups * unit, deposit, total: cups * unit + deposit };
  }, [catalog, crates]);

  const allFull =
    crates.length > 0 && crates.every((c) => filledCups(c) === c.crateSize);

  function addCrate(size: number) {
    setCrates((cs) => [...cs, { id: nid(), crateSize: size, fills: {} }]);
  }

  function setFill(id: string, flavor: string, next: number) {
    setCrates((cs) =>
      cs.map((c) => {
        if (c.id !== id) return c;
        const fills = { ...c.fills };
        if (next <= 0) delete fills[flavor];
        else fills[flavor] = next;
        return { ...c, fills };
      }),
    );
  }

  function openCheckout() {
    setError(null);
    if (!allFull) {
      setError("จัดรสในทุกลังให้เต็มขนาดลังก่อนสั่ง");
      return;
    }
    setCheckout(true);
  }

  async function submitOrder() {
    setError(null);
    if (!name.trim()) {
      setError("กรอกชื่อผู้รับ");
      return;
    }
    if (!PHONE_RE.test(phone)) {
      setError("เบอร์ต้องเป็นตัวเลข 10 หลัก ขึ้นต้นด้วย 0");
      return;
    }
    setBusy(true);
    try {
      const res = await createOrder({
        customerName: name.trim(),
        customerPhone: phone,
        crates: crates.map((c) => ({
          crateSize: c.crateSize,
          fills: Object.entries(c.fills)
            .filter(([, cups]) => cups > 0)
            .map(([flavor, cups]) => ({ flavor, cups })),
        })),
      });
      setCheckout(false);
      router.push(`/q/${res.queueCode}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : "สั่งไม่สำเร็จ");
    } finally {
      setBusy(false);
    }
  }

  return (
    <Container size="sm" py="md">
      <Image
        src={stallImg.src}
        alt="ร้าน Juice Yaso"
        radius="lg"
        mb="md"
        style={{ animation: "pop 420ms ease" }}
      />
      <Title order={2} c="brand.9" mb={4}>
        จัดลังน้ำเกร็ดหิมะ
      </Title>
      <Text c="dimmed" mb="md">
        แตะแก้วสีเพิ่มรส · คละในลังเดียวกันได้ · ไม่ต้องพิมพ์จำนวน
      </Text>

      {error && (
        <Alert color="red" icon={<IconAlertCircle size={18} />} mb="md">
          {error}
        </Alert>
      )}

      <Card withBorder shadow="sm" radius="lg" mb="md">
        <Group mb="sm">
          <Image src={crateImg.src} alt="ลัง" w={48} h={48} radius="md" />
          <Title order={4}>เลือกขนาดลัง</Title>
        </Group>
        <Group gap="sm">
          {(catalog?.crateSizes ?? [30, 50, 60, 100]).map((s) => (
            <UnstyledButton
              key={s}
              type="button"
              onClick={() => addCrate(s)}
              style={{
                minWidth: 72,
                minHeight: 64,
                borderRadius: 16,
                background: "#FFF7ED",
                border: "2px solid #FED7AA",
                textAlign: "center",
                padding: 8,
              }}
            >
              <Text fw={800} c="brand.6">
                {s}
              </Text>
              <Text size="xs">แก้ว</Text>
            </UnstyledButton>
          ))}
        </Group>
      </Card>

      <Stack gap="md">
        {crates.map((crate, idx) => {
          const filled = filledCups(crate);
          const left = crate.crateSize - filled;
          return (
            <Collapse key={crate.id} in>
              <Card withBorder shadow="sm" radius="lg" padding="lg">
                <Group justify="space-between" mb="sm">
                  <Group gap={8}>
                    <IconPackage size={18} />
                    <Text fw={700}>
                      ลัง {idx + 1} · {crate.crateSize} แก้ว
                    </Text>
                  </Group>
                  <Button
                    type="button"
                    variant="subtle"
                    color="red"
                    size="compact-sm"
                    leftSection={<IconTrash size={14} />}
                    onClick={() => setCrates((cs) => cs.filter((c) => c.id !== crate.id))}
                  >
                    ลบลัง
                  </Button>
                </Group>
                <Text size="sm" c={left === 0 ? "green" : "orange"} mb="sm">
                  {left === 0 ? "เต็มลังแล้ว" : `เหลืออีก ${left} แก้ว`}
                </Text>
                <SimpleGrid cols={{ base: 3, xs: 5 }} spacing="sm">
                  {(catalog?.flavors ?? []).map((f) => {
                    const cups = crate.fills[String(f.code)] ?? 0;
                    return (
                      <FlavorStepper
                        key={f.code}
                        flavor={String(f.code)}
                        nameTh={f.nameTh}
                        cups={cups}
                        canPlus={left > 0}
                        onPlus={() => setFill(crate.id, String(f.code), cups + 1)}
                        onMinus={() => setFill(crate.id, String(f.code), cups - 1)}
                      />
                    );
                  })}
                </SimpleGrid>
              </Card>
            </Collapse>
          );
        })}
      </Stack>

      {crates.length === 0 && (
        <Text ta="center" c="dimmed" my="lg">
          แตะขนาดลังด้านบนเพื่อเริ่มจัดรส
        </Text>
      )}

      {estimate && (
        <Card withBorder shadow="sm" radius="lg" mt="md">
          <Text size="sm">
            {crates.length} ลัง · {estimate.cups} แก้ว
            {estimate.cups > (catalog?.pricing.bulkThresholdCups ?? 100)
              ? " · ได้ราคาลังใหญ่"
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
          <Group justify="space-between">
            <Text fw={700}>รวม</Text>
            <MoneyText value={estimate.total} c="brand.6" fz="lg" />
          </Group>
        </Card>
      )}

      <Button
        type="button"
        size="lg"
        mt="md"
        fullWidth
        leftSection={<IconShoppingCart size={18} />}
        disabled={!allFull}
        onClick={openCheckout}
      >
        สั่ง
      </Button>

      <Modal
        opened={checkout}
        onClose={() => !busy && setCheckout(false)}
        title="ชื่อและเบอร์ผู้รับ"
        centered
      >
        <Stack>
          <Text size="sm" c="dimmed">
            กรอกตอนยืนยันสั่ง · รับที่ร้าน
          </Text>
          <TextInput
            label="ชื่อ"
            value={name}
            onChange={(e) => setName(e.currentTarget.value)}
            required
          />
          <TextInput
            label="เบอร์โทร"
            inputMode="numeric"
            pattern="0[0-9]{9}"
            maxLength={10}
            value={phone}
            onChange={(e) => setPhone(digitsOnly(e.currentTarget.value))}
            description="ตัวเลข 10 หลัก ขึ้นต้นด้วย 0"
            required
          />
          <Button
            type="button"
            leftSection={<IconPlus size={16} />}
            loading={busy}
            onClick={() => void submitOrder()}
          >
            ยืนยันสั่ง
          </Button>
        </Stack>
      </Modal>

      <style>{`
        @keyframes pop { from { opacity: 0; transform: translateY(8px); } to { opacity: 1; transform: none; } }
      `}</style>
    </Container>
  );
}
