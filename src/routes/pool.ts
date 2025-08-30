import { Router } from "express";
import { Pool } from "../models/Pool.js";

const router = Router();

router.get("/", async (_req, res) => {
  const doc = await Pool.findById("main").lean();
  res.json({ pool: doc?.amount ?? 0 });
});

router.patch("/", async (req, res) => {
  const { pool } = req.body;
  if (typeof pool !== "number" || pool < 0) {
    return res.status(400).json({ error: "pool invalid" });
  }
  const doc = await Pool.findByIdAndUpdate(
    "main",
    { amount: pool },
    { upsert: true, new: true, setDefaultsOnInsert: true }
  );
  res.json({ pool: doc.amount });
});

export default router;
