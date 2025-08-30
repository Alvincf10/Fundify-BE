import dotenv from "dotenv"; // load di sini juga, paling aman

dotenv.config({ path: ".env.local" });

export const ENV = {
  TELEGRAM_BOT_TOKEN: process.env.TELEGRAM_BOT_TOKEN || "",
  TELEGRAM_CHAT_ID: process.env.TELEGRAM_CHAT_ID || "",
  TELEGRAM_ENABLED: process.env.TELEGRAM_ENABLED !== "false",
};

export function assertEnv() {
  if (!ENV.TELEGRAM_ENABLED) return;
  if (!ENV.TELEGRAM_BOT_TOKEN || !ENV.TELEGRAM_CHAT_ID) {
    throw new Error("Telegram env missing. Set TELEGRAM_BOT_TOKEN & TELEGRAM_CHAT_ID or set TELEGRAM_ENABLED=false");
  }
}
