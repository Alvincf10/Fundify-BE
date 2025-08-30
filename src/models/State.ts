import { Schema, model } from "mongoose";

const stateSchema = new Schema({
  pool: { type: Number, default: 0 },
});

export const State = model("State", stateSchema);
