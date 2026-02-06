import { Schema, model } from "mongoose";

const FavoriteMessageSchema = new Schema({
  visitorId: { type: String, required: true, index: true },
  text: { type: String, required: true },
  category: { type: String, required: true },
  createdAt: { type: Date, default: Date.now }
});

export type FavoriteMessage = {
  visitorId: string;
  text: string;
  category: string;
  createdAt: Date;
};

export default model<FavoriteMessage>("FavoriteMessage", FavoriteMessageSchema);



