import "dotenv/config";
import mongoose from "mongoose";
import fs from "fs/promises";

// === models sederhana (samakan dengan models kamu) ===
import { Schema, model } from "mongoose";
const Member = model("Member", new Schema({ name: String, balance: Number }));
const Transaction = model("Transaction", new Schema({
  type: { type: String, enum: ["income", "expense"] },
  source: { kind: String, memberId: { type: Schema.Types.ObjectId, ref: "Member" } },
  amount: Number, desc: String, date: String, createdAt: Date
}));
const State = model("State", new Schema({ pool: Number }));

async function main() {
  const uri = process.env.MONGO_URI || "mongodb://127.0.0.1:27017/finance";
  await mongoose.connect(uri);

  const raw = await fs.readFile("../finance/data/state.json", "utf-8");
  const state = JSON.parse(raw) as {
    pool: number;
    members: { id: string; name: string; balance: number }[];
    transactions: any[];
  };

  // kosongkan koleksi (opsional)
  await Promise.all([Member.deleteMany({}), Transaction.deleteMany({}), State.deleteMany({})]);

  // insert members, map oldId → ObjectId baru
  const membersDocs = await Member.insertMany(
    state.members.map((m) => ({ name: m.name, balance: m.balance }))
  );
  const mapId = new Map<string, string>();
  state.members.forEach((m, i) => mapId.set(m.id, membersDocs[i]._id.toString()));

  // insert transactions (translate memberId kalau personal)
  const txDocs = state.transactions.map((t) => {
    const source =
      t.source.kind === "personal"
        ? { kind: "personal", memberId: mapId.get(t.source.memberId) }
        : { kind: "pool" };
    return {
      type: t.type,
      source,
      amount: t.amount,
      desc: t.desc,
      date: t.date,
      createdAt: new Date(t.createdAt),
    };
  });
  await Transaction.insertMany(txDocs);

  // set pool
  await State.create({ pool: state.pool });

  console.log("✅ Seed selesai");
  await mongoose.disconnect();
}
main().catch((e) => { console.error(e); process.exit(1); });
