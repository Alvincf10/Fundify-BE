// src/lib/telegram.ts
import axios from "axios";
import { ENV, assertEnv } from "../config/env.js";

let checked = false;
async function ensureEnv() {
  if (!checked) {
    assertEnv();
    checked = true;
  }
}

export async function sendTelegramMessage(html: string, chatIdOverride?: string) {
  await ensureEnv();

  if (!ENV.TELEGRAM_ENABLED) {
    console.log("🔕 Telegram disabled by ENV");
    return;
  }

  const chatId = chatIdOverride || ENV.TELEGRAM_CHAT_ID;
  console.log("📦 TELEGRAM_BOT_TOKEN:", ENV.TELEGRAM_BOT_TOKEN ? "[SET]" : "[MISSING]");
  console.log("📦 TELEGRAM_CHAT_ID:", chatId);

  const url = `https://api.telegram.org/bot${ENV.TELEGRAM_BOT_TOKEN}/sendMessage`;
  try {
    const resp = await axios.post(
        url,
        {
        chat_id: chatId,
        text: html,
        parse_mode: "HTML",
        disable_web_page_preview: true,
        },
        { timeout: 8000 }
    );
    console.log("✅ Telegram response:", JSON.stringify(resp.data, null, 2));
    } catch (err: any) {
    console.error("❌ Telegram request failed:", err.response?.data || err.message);
    throw err;
    }
}
