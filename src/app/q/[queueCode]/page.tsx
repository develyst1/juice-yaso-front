"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { cancelQueue, getQueue, mediaUrl, uploadSlip } from "@/lib/api";
import { baht } from "@/lib/money";
import { CANCELABLE, SLIP_UPLOADABLE, STATUS_TH } from "@/lib/status";
import type { QueueOrder } from "@/lib/types";

export default function QueuePage() {
  const params = useParams<{ queueCode: string }>();
  const queueCode = decodeURIComponent(params.queueCode ?? "");
  const [order, setOrder] = useState<QueueOrder | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [notFound, setNotFound] = useState(false);
  const [busy, setBusy] = useState(false);
  const [file, setFile] = useState<File | null>(null);

  async function refresh() {
    try {
      const o = await getQueue(queueCode);
      setOrder(o);
      setNotFound(false);
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

  async function onUpload(e: React.FormEvent) {
    e.preventDefault();
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

  async function onCancel() {
    if (!confirm("ยกเลิกออเดอร์นี้?")) return;
    setBusy(true);
    setError(null);
    try {
      await cancelQueue(queueCode);
      await refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "ยกเลิกไม่ได้");
    } finally {
      setBusy(false);
    }
  }

  if (notFound) {
    return (
      <div className="card space-y-3">
        <h1 className="text-xl font-bold">ไม่พบบัตรคิว</h1>
        <p className="text-sm text-orange-900/70">
          รหัสนี้ไม่มีในระบบ — v1 ไม่มีดูออเดอร์เก่า ต้องมีรหัสบัตรคิวปัจจุบัน
        </p>
        <Link href="/" className="btn btn-primary inline-flex">
          กลับไปสั่งใหม่
        </Link>
      </div>
    );
  }

  if (!order) return <p className="text-orange-800/70">กำลังโหลดบัตรคิว…</p>;

  const qr = mediaUrl(order.paymentChannel?.qrImageUrl);
  const canPay = SLIP_UPLOADABLE.has(order.status);

  return (
    <div className="space-y-5">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-sm text-orange-800/70">บัตรคิว</p>
          <h1 className="font-mono text-2xl font-bold text-orange-700">{order.queueCode}</h1>
        </div>
        <span className="badge">{STATUS_TH[order.status]}</span>
      </div>

      {error && (
        <p className="rounded-xl bg-red-50 px-3 py-2 text-sm text-red-700">{error}</p>
      )}

      <section className="card space-y-2 text-sm">
        <p>
          {order.customerName} · {order.customerPhone}
        </p>
        <ul className="space-y-1">
          {order.lines.map((l, i) => (
            <li key={i}>
              ลัง {l.crateSize} × {l.quantity} · {l.flavor} ({l.lineCups} แก้ว)
            </li>
          ))}
        </ul>
        <p>ค่าน้ำ {baht(order.productTotal)} · มัดจำ {baht(order.depositTotal)}</p>
        <p className="font-semibold">
          รวม {baht(order.productTotal + order.depositTotal)}
        </p>
      </section>

      {order.status === "slip_rejected" && order.slipRejectReason && (
        <section className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-800">
          <p className="font-semibold">สลิปถูกปฏิเสธ</p>
          <p>{order.slipRejectReason}</p>
          <p className="mt-1">อัปสลิปใหม่ได้จากบัตรคิวนี้</p>
        </section>
      )}

      {canPay && order.paymentChannel && (
        <section className="card space-y-3">
          <h2 className="font-semibold">โอนแล้วแนบสลิป</h2>
          {qr && (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={qr} alt="QR โอนเงิน" className="mx-auto max-h-56 rounded-xl border" />
          )}
          <p className="text-sm">
            {order.paymentChannel.bankName} · {order.paymentChannel.bankAccountNumber}
          </p>
          <p className="text-xs text-orange-900/60">รอตรวจได้ประมาณถึง 1 ชม.</p>
          <form onSubmit={onUpload} className="space-y-2">
            <input
              type="file"
              accept="image/*"
              className="field"
              onChange={(e) => setFile(e.target.files?.[0] ?? null)}
            />
            <button className="btn btn-primary w-full" disabled={busy || !file}>
              {busy ? "กำลังอัป…" : "อัปสลิป"}
            </button>
          </form>
        </section>
      )}

      {order.status === "awaiting_slip_review" && (
        <p className="card text-sm">ส่งสลิปแล้ว รอร้านตรวจ</p>
      )}
      {order.status === "ready_for_pickup" && (
        <p className="card text-sm font-semibold text-orange-700">แพ็คเสร็จแล้ว มารับที่ร้านได้</p>
      )}

      <div className="flex flex-wrap gap-2">
        <button
          type="button"
          className="btn btn-ghost"
          onClick={() => navigator.clipboard.writeText(window.location.href)}
        >
          คัดลอกลิงก์บัตรคิว
        </button>
        {CANCELABLE.has(order.status) && (
          <button type="button" className="btn btn-danger" disabled={busy} onClick={onCancel}>
            ยกเลิกออเดอร์
          </button>
        )}
      </div>
    </div>
  );
}
