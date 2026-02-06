import { Schema, model } from "mongoose";

const ScoreSchema = new Schema({
  visitorId: { type: String, required: true, index: true },
  game: { type: String, enum: ["flappy", "tetris", "2048"], required: true, index: true },
  score: { type: Number, required: true },
  meta: { type: Object },
  createdAt: { type: Date, default: Date.now }
});

export type Score = {
  visitorId: string;
  game: "flappy" | "tetris" | "2048";
  score: number;
  meta?: Record<string, unknown>;
  createdAt: Date;
};

export default model<Score>("Score", ScoreSchema);



