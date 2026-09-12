"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { createOrder, getCatalog } from "@/lib/api";
import { baht, unitPriceForCups } from "@/lib/money";
import type { Catalog } from "@/lib/types";

type DraftLine = { id: string; crateSize: number; quantity: number; flavor: string };

function nid() {
  return Math.random().toString(36).slice(2, 9);
}

export default function OrderPage() {
  const router = useRouter();
  const [catalog, setCatalog] = useState<Catalog | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [lines, setLines] = useState<DraftLine[]>([
    { id: nid(), crateSize: 30, quantity: 1, flavor: "orange" },
  ]);

  useEffect(() => {
    getCatalog()
      .then((c) => {
        setCatalog(c);
        setLines((prev) =>
          prev.map((l) => ({
            ...l,
            crateSize: c.crateSizes[0] ?? 30,
            flavor: String(c.flavors[0]?.code ?? "orange"),
          })),
        );
      })
      .catch((e: Error) => setError(e.message));
  }, []);

  const estimate = useMemo(() => {
    if (!catalog) return null;
    const cups = lines.reduce((s, l) => s + l.crateSize * l.quantity, 0);
    const deposit = lines.reduce((s, l) => {
      const per = catalog.depositBySize[String(l.crateSize)] ?? 0;
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
          crateSize: l.crateSize,
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

  if (!catalog && !error) {
    return <p className="text-orange-800/70">กำลังโหลดเมนู…</p>;
  }

  return (
    <form onSubmit={onSubmit} className="space-y-5">
      <div>
        <h1 className="text-2xl font-bold text-orange-700">สั่งน้ำเกร็ดหิมะ</h1>
        <p className="mt-1 text-sm text-orange-900/70">
          รับที่ร้าน · ปนหลายรสได้ · ไม่มีส่งในรอบนี้
        </p>
      </div>

      {error && (
        <p className="rounded-xl bg-red-50 px-3 py-2 text-sm text-red-700">{error}</p>
      )}

      <section className="card space-y-3">
        <h2 className="font-semibold">ลังและรส</h2>
        {lines.map((line) => (
          <div key={line.id} className="grid grid-cols-2 gap-2 sm:grid-cols-4">
            <select
              className="field"
              value={line.crateSize}
              onChange={(e) => updateLine(line.id, { crateSize: Number(e.target.value) })}
            >
              {(catalog?.crateSizes ?? [30, 50, 60, 100]).map((s) => (
                <option key={s} value={s}>
                  ลัง {s} แก้ว
                </option>
              ))}
            </select>
            <input
              className="field"
              type="number"
              min={1}
              step={1}
              value={line.quantity}
              onChange={(e) =>
                updateLine(line.id, { quantity: Math.max(1, Number(e.target.value) || 1) })
              }
            />
            <select
              className="field"
              value={line.flavor}
              onChange={(e) => updateLine(line.id, { flavor: e.target.value })}
            >
              {(catalog?.flavors ?? []).map((f) => (
                <option key={f.code} value={f.code}>
                  {f.nameTh}
                </option>
              ))}
            </select>
            <button
              type="button"
              className="btn btn-ghost"
              disabled={lines.length === 1}
              onClick={() => setLines((ls) => ls.filter((l) => l.id !== line.id))}
            >
              ลบ
            </button>
          </div>
        ))}
        <button
          type="button"
          className="btn btn-ghost"
          onClick={() =>
            setLines((ls) => [
              ...ls,
              {
                id: nid(),
                crateSize: catalog?.crateSizes[0] ?? 30,
                quantity: 1,
                flavor: String(catalog?.flavors[0]?.code ?? "orange"),
              },
            ])
          }
        >
          + เพิ่มรส / ลัง
        </button>
      </section>

      <section className="card space-y-3">
        <h2 className="font-semibold">ชื่อและเบอร์ (บังคับ)</h2>
        <input
          className="field"
          placeholder="ชื่อผู้รับ"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
        />
        <input
          className="field"
          placeholder="เบอร์โทร"
          inputMode="tel"
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
          required
        />
      </section>

      {estimate && catalog && (
        <section className="card space-y-1 text-sm">
          <p>
            รวม {estimate.cups} แก้ว · ราคา/แก้ว {baht(estimate.unit)}
            {estimate.cups > catalog.pricing.bulkThresholdCups ? " (ส่วนลดลังใหญ่)" : ""}
          </p>
          <p>ค่าน้ำ {baht(estimate.product)}</p>
          <p>มัดจำลัง {baht(estimate.deposit)}</p>
          <p className="text-lg font-bold text-orange-700">รวม {baht(estimate.total)}</p>
        </section>
      )}

      <button className="btn btn-primary w-full" disabled={busy}>
        {busy ? "กำลังสร้างบัตรคิว…" : "สั่งแล้วไปชำระ"}
      </button>
    </form>
  );
}
