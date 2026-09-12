"use client";

import { useEffect, useState } from "react";
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
} from "@/lib/api";
import { baht } from "@/lib/money";
import { nextAdminStatuses, STATUS_TH } from "@/lib/status";
import type { AdminOrder, OrderStatus, PaymentChannel, Pricing } from "@/lib/types";

const TOKEN_KEY = "jy-admin-token";
const ALL_STATUS: (OrderStatus | "")[] = [
  "",
  "awaiting_payment",
  "awaiting_slip_review",
  "slip_rejected",
  "in_queue",
  "packing",
  "ready_for_pickup",
  "picked_up",
  "cancelled",
];

export default function AdminPage() {
  const [token, setToken] = useState("");
  const [filter, setFilter] = useState<string>("");
  const [orders, setOrders] = useState<AdminOrder[]>([]);
  const [pricing, setPricing] = useState<Pricing | null>(null);
  const [pay, setPay] = useState<PaymentChannel | null>(null);
  const [qr, setQr] = useState<File | null>(null);
  const [slipIds, setSlipIds] = useState<Record<string, string>>({});
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
    <div className="space-y-5">
      <h1 className="text-2xl font-bold text-orange-700">แอดมินร้าน</h1>
      <p className="text-sm text-orange-900/70">
        ใส่โทเคนในเครื่องนี้เท่านั้น ไม่เก็บใน repo · ลิสต์ออเดอร์ไม่มี slipId จาก API
        (ช่องกรอกด้านล่าง)
      </p>

      {error && <p className="rounded-xl bg-red-50 px-3 py-2 text-sm text-red-700">{error}</p>}
      {info && <p className="text-sm text-orange-800/70">{info}</p>}

      <section className="card space-y-2">
        <input
          className="field"
          type="password"
          placeholder="X-Admin-Token"
          value={token}
          onChange={(e) => persistToken(e.target.value)}
        />
        <div className="flex gap-2">
          <select className="field" value={filter} onChange={(e) => setFilter(e.target.value)}>
            {ALL_STATUS.map((s) => (
              <option key={s || "all"} value={s}>
                {s ? STATUS_TH[s] : "ทุกสถานะ"}
              </option>
            ))}
          </select>
          <button type="button" className="btn btn-primary" onClick={() => void load()}>
            โหลด
          </button>
        </div>
      </section>

      <section className="space-y-3">
        {orders.map((o) => (
          <article key={o.orderId} className="card space-y-2 text-sm">
            <div className="flex justify-between gap-2">
              <a className="font-mono font-semibold text-orange-700" href={`/q/${o.queueCode}`}>
                {o.queueCode}
              </a>
              <span className="badge">{STATUS_TH[o.status]}</span>
            </div>
            <p>
              {o.customerName} · {o.customerPhone} · {o.cupsTotal} แก้ว · {baht(o.productTotal + o.depositTotal)}
            </p>
            {o.slipRejectReason && <p className="text-red-700">เหตุผลปฏิเสธ: {o.slipRejectReason}</p>}

            {o.status === "awaiting_slip_review" && (
              <div className="space-y-2 rounded-xl bg-orange-50 p-3">
                <input
                  className="field"
                  placeholder="slipId จาก back"
                  value={slipIds[o.orderId] ?? ""}
                  onChange={(e) =>
                    setSlipIds((m) => ({ ...m, [o.orderId]: e.target.value }))
                  }
                />
                <textarea
                  className="field"
                  placeholder="เหตุผลถ้าจะปฏิเสธ"
                  value={reasons[o.orderId] ?? ""}
                  onChange={(e) =>
                    setReasons((m) => ({ ...m, [o.orderId]: e.target.value }))
                  }
                />
                <div className="flex flex-wrap gap-2">
                  <button
                    type="button"
                    className="btn btn-primary"
                    onClick={() =>
                      act(() => adminApproveSlip(token, slipIds[o.orderId] ?? ""))
                    }
                  >
                    อนุมัติสลิป
                  </button>
                  <button
                    type="button"
                    className="btn btn-danger"
                    onClick={() =>
                      act(() =>
                        adminRejectSlip(
                          token,
                          slipIds[o.orderId] ?? "",
                          reasons[o.orderId] ?? "",
                        ),
                      )
                    }
                  >
                    ปฏิเสธสลิป
                  </button>
                </div>
              </div>
            )}

            <div className="flex flex-wrap gap-2">
              {nextAdminStatuses(o.status).map((s) => (
                <button
                  key={s}
                  type="button"
                  className="btn btn-ghost"
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
                </button>
              ))}
              {o.status === "picked_up" && (
                <button
                  type="button"
                  className="btn btn-ghost"
                  onClick={() => act(() => adminDepositReturn(token, o.orderId))}
                >
                  บันทึกคืนลัง / คืนมัดจำ
                </button>
              )}
            </div>
          </article>
        ))}
      </section>

      {pricing && (
        <section className="card space-y-2">
          <h2 className="font-semibold">ราคา (มีผลออเดอร์ใหม่)</h2>
          <label className="text-sm">
            ฐาน/แก้ว
            <input
              className="field"
              type="number"
              step="0.1"
              value={pricing.basePricePerCup}
              onChange={(e) =>
                setPricing({ ...pricing, basePricePerCup: Number(e.target.value) })
              }
            />
          </label>
          <label className="text-sm">
            เกณฑ์แก้ว
            <input
              className="field"
              type="number"
              value={pricing.bulkThresholdCups}
              onChange={(e) =>
                setPricing({ ...pricing, bulkThresholdCups: Number(e.target.value) })
              }
            />
          </label>
          <label className="text-sm">
            ราคาหลังเกณฑ์
            <input
              className="field"
              type="number"
              step="0.1"
              value={pricing.bulkPricePerCup}
              onChange={(e) =>
                setPricing({ ...pricing, bulkPricePerCup: Number(e.target.value) })
              }
            />
          </label>
          <button
            type="button"
            className="btn btn-primary"
            onClick={() => act(() => adminPutPricing(token, pricing))}
          >
            บันทึกราคา
          </button>
        </section>
      )}

      {pay && (
        <section className="card space-y-2">
          <h2 className="font-semibold">ช่องทางโอน</h2>
          {mediaUrl(pay.qrImageUrl) && (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={mediaUrl(pay.qrImageUrl) ?? ""}
              alt="QR"
              className="max-h-40 rounded-xl border"
            />
          )}
          <input
            className="field"
            placeholder="เลขบัญชี"
            value={pay.bankAccountNumber}
            onChange={(e) => setPay({ ...pay, bankAccountNumber: e.target.value })}
          />
          <input
            className="field"
            placeholder="ชื่อธนาคาร"
            value={pay.bankName}
            onChange={(e) => setPay({ ...pay, bankName: e.target.value })}
          />
          <input
            type="file"
            accept="image/*"
            className="field"
            onChange={(e) => setQr(e.target.files?.[0] ?? null)}
          />
          <button
            type="button"
            className="btn btn-primary"
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
          </button>
        </section>
      )}
    </div>
  );
}
