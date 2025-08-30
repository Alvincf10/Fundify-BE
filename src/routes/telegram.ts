// src/routes/telegram.ts
import { Router } from "express";
import { Pool } from "../models/Pool.js";
import { Member } from "../models/Member.js";
import { fmtIDR } from "../lib/money.js";
import { sendTelegramMessage } from "../lib/telegram.js";

const router = Router();

router.post("/", async (req, res) => {
  try {
    const msg = req.body?.message;
    const chatId = msg?.chat?.id;
    const text: string = msg?.text || "";

    if (!chatId || !text) {
      return res.sendStatus(200);
    }

    // Cek command /saldo
    if (/^\/saldo\b/i.test(text.trim())) {
      const pool = await Pool.findById("main").lean();
      const members = await Member.find().lean();

      let response = `<b>💰 Saldo Saat Ini</b>\n\n`;
      response += `🏦 Kas Bersama: <b>${fmtIDR(pool?.amount ?? 0)}</b>\n\n`;

      if (members.length > 0) {
        response += `👥 Dompet Anggota:\n`;
        for (const m of members) {
          response += `- ${m.name}: <b>${fmtIDR(m.balance ?? 0)}</b>\n`;
        }
      }

      await sendTelegramMessage(response, String(chatId));
    }

    res.sendStatus(200);
  } catch (err) {
    console.error("❌ Telegram webhook error:", err);
    res.sendStatus(200);
  }
});

export default router;
