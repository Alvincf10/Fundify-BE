import { Router } from "express";
import mongoose from "mongoose";
import { Transaction } from "../models/Transaction.js";
import { Pool } from "../models/Pool.js";
import { Member } from "../models/Member.js";
import { sendTelegramMessage } from "../lib/telegram.js";
import { fmtIDR, signAmount } from "../lib/money.js";
import { isPersonalSource, type Source } from "../lib/source.js";
import { getBalanceForSource } from "../service/balance.js";

const router = Router();

router.get("/", async (_req, res) => {
  const txs = await Transaction.find().sort({ date: -1, createdAt: -1 }).lean();
  res.json(txs);
});

router.post("/", async (req, res) => {
  try {
    const { type, source, amount, desc, date } = req.body as {
      type: "income" | "expense";
      source: Source;
      amount: number | string;
      desc?: string;
      date?: string;
    };

    const amt = Number(amount);
    if (!["income", "expense"].includes(type)) return res.status(400).json({ error: "type invalid" });
    if (!source?.kind || (source.kind === "personal" && !(source as any).memberId))
      return res.status(400).json({ error: "source invalid" });
    if (!Number.isFinite(amt) || amt <= 0) return res.status(400).json({ error: "amount invalid" });

    // 1) simpan transaksi
    const tx = await Transaction.create({
      type,
      source,
      amount: amt,
      desc: desc?.trim() || "",
      date: date ? new Date(date) : new Date(),
    });

    // 2) update saldo sesuai sumber
    let newBalance = 0;
    if (source.kind === "pool") {
      const pool = await Pool.findByIdAndUpdate(
        "main",
        { $inc: { amount: type === "income" ? amt : -amt } },
        { new: true, upsert: true }
      ).lean();
      newBalance = pool?.amount ?? 0;
    } else {
      const member = await Member.findByIdAndUpdate(
        source.memberId,
        { $inc: { balance: type === "income" ? amt : -amt } },
        { new: true }
      ).lean();
      newBalance = member?.balance ?? 0;
    }

    // 3) siapkan label sumber
    let srcLabel = "Kas Bersama";
    if (isPersonalSource(source)) {
      const member = await Member.findById(source.memberId).lean();
      srcLabel = `Dompet ${member?.name ?? "?"}`;
    }

    // 4) rakit pesan HTML
    const now = new Date();
    const humanDate = now.toLocaleString("id-ID", { dateStyle: "medium", timeStyle: "short" });

    const title = type === "income" ? "Pemasukan Baru" : "Pengeluaran Baru";
    const html =
      `<b>${title}</b>\n` +
      `Sumber: <b>${srcLabel}</b>\n` +
      `Tanggal: ${humanDate}\n` +
      `Nominal: <b>${signAmount(type, amt)}</b>\n` +
      `Sisa Saldo: <b>${fmtIDR(newBalance)}</b>\n` +
      (tx.desc ? `Keterangan: ${escapeHtml(tx.desc)}\n` : "");

    // 5) kirim Telegram non-blocking
    sendTelegramMessage(html)
      .then(() => console.log("✅ Telegram sent"))
      .catch(err => console.error("❌ Telegram failed:", err.response?.data || err.message));

    // 6) response ke client
    res.json({ ok: true, tx, balance: newBalance });
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: "internal error" });
  }
});

router.delete("/:id", async (req, res) => {
  const { id } = req.params;

  const session = await mongoose.startSession();
  try {
    await session.withTransaction(async () => {
      const tx = await Transaction.findById(id).session(session);
      if (!tx) {
        res.status(404).json({ error: "Transaction not found" });
        return;
      }

      const amt = tx.amount;
      const source = tx.source as any;

      // reverse effect
      if (tx.type === "expense") {
        if (source.kind === "pool") {
          await Pool.findByIdAndUpdate("main", { $inc: { amount: amt } }, { upsert: true, session });
        } else {
          await Member.updateOne({ _id: source.memberId }, { $inc: { balance: amt } }, { session });
        }
      } else {
        if (source.kind === "pool") {
          await Pool.findByIdAndUpdate("main", { $inc: { amount: -amt } }, { upsert: true, session });
        } else {
          await Member.updateOne({ _id: source.memberId }, { $inc: { balance: -amt } }, { session });
        }
      }

      await Transaction.deleteOne({ _id: id }, { session });
      res.json({ ok: true });
    });
  } catch (err: any) {
    res.status(400).json({ error: err.message || "Failed to delete transaction" });
  } finally {
    session.endSession();
  }
});

export default router;
function escapeHtml(s: string) {
  return s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}