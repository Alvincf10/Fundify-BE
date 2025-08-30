import { Router } from "express";
import { Member } from "../models/Member.js"; // model Member kamu

const router = Router();

router.get("/", async (_req, res) => {
  const list = await Member.find().lean();
  res.json(list);
});

router.post("/", async (req, res) => {
  const m = new Member(req.body);
  await m.save();
  res.status(201).json(m);
});

router.patch("/:id", async (req, res) => {
  const { id } = req.params;
  const update: any = {};
  if (typeof req.body.name === "string") update.name = req.body.name;
  if (typeof req.body.balance === "number" && req.body.balance >= 0) update.balance = req.body.balance;

  const m = await Member.findByIdAndUpdate(id, update, { new: true });
  if (!m) return res.status(404).json({ error: "Member not found" });
  res.json(m);
});

export default router;
