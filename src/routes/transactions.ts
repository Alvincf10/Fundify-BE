import { Router } from "express";
import mongoose from "mongoose";
import { Transaction } from "../models/Transaction.js";
import { Pool } from "../models/Pool.js";
import { Member } from "../models/Member.js";

const router = Router();

router.get("/", async (_req, res) => {
  const txs = await Transaction.find().sort({ date: -1, createdAt: -1 }).lean();
  res.json(txs);
});

router.post("/", async (req, res) => {
  const { type, source, amount, desc, date } = req.body;
  const amt = Number(amount);

  if (!["income", "expense"].includes(type)) return res.status(400).json({ error: "type invalid" });
  if (!source || !source.kind || (source.kind === "personal" && !source.memberId)) return res.status(400).json({ error: "source invalid" });
  if (!Number.isFinite(amt) || amt <= 0) return res.status(400).json({ error: "amount invalid" });

  const session = await mongoose.startSession();
  try {
    await session.withTransaction(async () => {
      // adjust balances
      if (type === "expense") {
        if (source.kind === "pool") {
          const pool = await Pool.findById("main").session(session);
          const current = pool?.amount ?? 0;
          if (current < amt) throw new Error("Saldo kas tidak cukup");
          await Pool.findByIdAndUpdate("main", { $inc: { amount: -amt } }, { upsert: true, session });
        } else {
          const m = await Member.findById(source.memberId).session(session);
          if (!m) throw new Error("Member not found");
          if (m.balance < amt) throw new Error(`Saldo ${m.name} tidak cukup`);
          await Member.updateOne({ _id: source.memberId }, { $inc: { balance: -amt } }, { session });
        }
      } else { // income
        if (source.kind === "pool") {
          await Pool.findByIdAndUpdate("main", { $inc: { amount: amt } }, { upsert: true, session });
        } else {
          const m = await Member.findById(source.memberId).session(session);
          if (!m) throw new Error("Member not found");
          await Member.updateOne({ _id: source.memberId }, { $inc: { balance: amt } }, { session });
        }
      }

      // save transaction
      const tx = new Transaction({ type, source, amount: amt, desc, date, createdAt: new Date().toISOString() });
      await tx.save({ session });
      res.status(201).json(tx);
    });
  } catch (err: any) {
    res.status(400).json({ error: err.message || "Failed to create transaction" });
  } finally {
    session.endSession();
  }
});

router.delete("/:id", async (req, res) => {
  const { id } = req.params;
  if (!mongoose.isValidObjectId(id)) return res.status(400).json({ error: "invalid id" });

  const session = await mongoose.startSession();
  try {
    await session.withTransaction(async () => {
      const tx = await Transaction.findById(id).session(session);
      if (!tx) { res.status(404).json({ error: "Transaction not found" }); return; }

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
