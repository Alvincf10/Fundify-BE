export const fmtIDR = (n: number) =>
  new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", maximumFractionDigits: 0 }).format(n);

export const signAmount = (type: "income" | "expense", amt: number) =>
  (type === "expense" ? "− " : "+ ") + fmtIDR(amt);
