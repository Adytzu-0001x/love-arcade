import { Schema, model } from "mongoose";

const BucketItemSchema = new Schema({
  listKey: { type: String, required: true, index: true },
  text: { type: String, required: true },
  done: { type: Boolean, default: false },
  createdAt: { type: Date, default: Date.now },
  doneAt: { type: Date, default: null }
});

export type BucketItem = {
  listKey: string;
  text: string;
  done: boolean;
  createdAt: Date;
  doneAt?: Date | null;
};

export default model<BucketItem>("BucketItem", BucketItemSchema);
