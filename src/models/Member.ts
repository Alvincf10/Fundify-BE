import { Schema, model } from "mongoose";

const memberSchema = new Schema({
  name: { type: String, required: true },
  balance: { type: Number, default: 0 },
});

export const Member = model("Member", memberSchema);
