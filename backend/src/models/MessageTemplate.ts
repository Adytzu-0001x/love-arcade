import { Schema, model } from "mongoose";

const MessageTemplateSchema = new Schema({
  category: { type: String, required: true },
  text: { type: String, required: true },
  weight: { type: Number, default: 1 },
  createdAt: { type: Date, default: Date.now }
});

export type MessageTemplate = {
  category: string;
  text: string;
  weight?: number;
  createdAt: Date;
};

export default model<MessageTemplate>("MessageTemplate", MessageTemplateSchema);



