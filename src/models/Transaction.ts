import { Schema, model } from "mongoose";

const transactionSchema = new Schema({
  type: { type: String, enum: ["income", "expense"], required: true },
  source: {
    kind: { type: String, enum: ["pool", "personal"], required: true },
    memberId: { type: Schema.Types.ObjectId, ref: "Member" },
  },
  amount: { type: Number, required: true },
  desc: { type: String, required: true },
  date: { type: String, required: true }, // YYYY-MM-DD
  createdAt: { type: Date, default: Date.now },
});

export const Transaction = model("Transaction", transactionSchema);
