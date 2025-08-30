// src/services/templates.ts
import { fmtIDR, signAmount } from "../lib/money.js";

export function makeTxMessage({
  type, srcLabel, amount, balance, desc, when
}: {
  type: "income" | "expense",
  srcLabel: string,
  amount: number,
  balance: number,
  desc?: string,
  when: Date
}) {
  const title = type === "income" ? "Pemasukan Baru" : "Pengeluaran Baru";
  const humanDate = when.toLocaleString("id-ID", { dateStyle: "medium", timeStyle: "short" });
  const esc = (s: string) => s.replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;");
  return (
    `<b>${title}</b>\n` +
    `Sumber: <b>${esc(srcLabel)}</b>\n` +
    `Tanggal: ${humanDate}\n` +
    `Nominal: <b>${signAmount(type, amount)}</b>\n` +
    `Sisa Saldo: <b>${fmtIDR(balance)}</b>\n` +
    (desc ? `Keterangan: ${esc(desc)}\n` : "")
  );
}
