import mongoose, { Schema, model, type Model, type InferSchemaType } from "mongoose";

const PoolSchema = new Schema(
  {
    _id: { type: String, default: "main" },
    amount: { type: Number, default: 0, min: 0 },
  },
  { _id: false, timestamps: true }
);

// tipe dokumen dari schema
type PoolDoc = InferSchemaType<typeof PoolSchema>; // { _id: string; amount: number; createdAt?: Date; updatedAt?: Date }

export const Pool: Model<PoolDoc> =
  (mongoose.models.Pool as Model<PoolDoc> | undefined) ?? model<PoolDoc>("Pool", PoolSchema);
