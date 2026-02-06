import express from "express";
import mongoose from "mongoose";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";
import rateLimit from "express-rate-limit";
import { env } from "./utils/env";
import { sendError } from "./utils/errors";
import { z } from "zod";
import MessageTemplate from "./models/MessageTemplate";
import FavoriteMessage from "./models/FavoriteMessage";
import Score from "./models/Score";

const app = express();
app.use(express.json());
app.use(helmet());
app.use(morgan("tiny"));
app.use(
  cors({
    origin: env.CORS_ORIGINS,
    credentials: false
  })
);

const limiter = rateLimit({
  windowMs: 60 * 1000,
  max: env.RATE_LIMIT_PER_MIN,
  standardHeaders: true,
  legacyHeaders: false
});
app.use("/messages", limiter);
app.use("/scores", limiter);

const getVisitorId = (req: express.Request) =>
  (req.headers["x-visitor-id"] as string) ||
  (req.body?.visitorId as string) ||
  (req.query?.visitorId as string) ||
  "";

app.get("/health", (_req, res) => res.json({ ok: true }));

const scoreSchema = z.object({
  game: z.enum(["flappy", "tetris", "2048"]),
  score: z.number().int().nonnegative(),
  meta: z.record(z.any()).optional()
});

app.post("/scores", async (req, res) => {
  const visitorId = getVisitorId(req);
  if (!visitorId) return sendError(res, "MISSING_VISITOR", "visitorId is required", 400);
  const parsed = scoreSchema.safeParse(req.body);
  if (!parsed.success) return sendError(res, "INVALID_BODY", parsed.error.message, 400);
  const doc = await Score.create({ visitorId, ...parsed.data });
  res.json({ success: true, score: doc });
});

app.get("/leaderboard", async (req, res) => {
  const game = req.query.game;
  if (!["flappy", "tetris", "2048"].includes(String(game)))
    return sendError(res, "INVALID_GAME", "game required", 400);
  const limit = Number(req.query.limit) || 20;
  const scores = await Score.find({ game }).sort({ score: -1, createdAt: 1 }).limit(limit);
  res.json({ scores });
});

app.get("/my-best", async (req, res) => {
  const visitorId = getVisitorId(req);
  const game = req.query.game;
  if (!visitorId) return sendError(res, "MISSING_VISITOR", "visitorId is required", 400);
  if (!["flappy", "tetris", "2048"].includes(String(game)))
    return sendError(res, "INVALID_GAME", "game required", 400);
  const best = await Score.findOne({ visitorId, game }).sort({ score: -1 });
  res.json({ best });
});

const categoryEnum = ["birthday", "good_morning", "good_luck", "compliment", "encourage"];

const nameReplace = (text: string, name?: string) =>
  text.replace("{NAME}", name || "Alexandra");

const pickWeighted = (list: { text: string; weight?: number }[]) => {
  const total = list.reduce((s, i) => s + (i.weight || 1), 0);
  let r = Math.random() * total;
  for (const item of list) {
    r -= item.weight || 1;
    if (r <= 0) return item;
  }
  return list[0];
};

app.get("/messages/random", async (req, res) => {
  const category = String(req.query.category || "");
  if (!categoryEnum.includes(category)) return sendError(res, "INVALID_CATEGORY", "bad category", 400);
  const name = String(req.query.name || "");
  const templates = await MessageTemplate.find({ category });
  if (!templates.length) return sendError(res, "NO_TEMPLATES", "No templates", 404);
  const chosen = pickWeighted(templates);
  res.json({ message: nameReplace(chosen.text, name) });
});

app.get("/messages/generate", async (req, res) => {
  const category = String(req.query.category || "");
  if (!categoryEnum.includes(category)) return sendError(res, "INVALID_CATEGORY", "bad category", 400);
  const name = String(req.query.name || "");
  const templates = await MessageTemplate.find({ category });
  if (!templates.length) return sendError(res, "NO_TEMPLATES", "No templates", 404);
  const chosen = pickWeighted(templates);
  res.json({ message: nameReplace(chosen.text, name) });
});

const favSchema = z.object({
  text: z.string().min(1),
  category: z.string().min(1)
});

app.post("/favorites", async (req, res) => {
  const visitorId = getVisitorId(req);
  if (!visitorId) return sendError(res, "MISSING_VISITOR", "visitorId is required", 400);
  const parsed = favSchema.safeParse(req.body);
  if (!parsed.success) return sendError(res, "INVALID_BODY", parsed.error.message, 400);
  const fav = await FavoriteMessage.create({ visitorId, ...parsed.data });
  res.json({ favorite: fav });
});

app.get("/favorites", async (req, res) => {
  const visitorId = getVisitorId(req);
  if (!visitorId) return sendError(res, "MISSING_VISITOR", "visitorId is required", 400);
  const favs = await FavoriteMessage.find({ visitorId }).sort({ createdAt: -1 });
  res.json({ favorites: favs });
});

app.delete("/favorites/:id", async (req, res) => {
  const visitorId = getVisitorId(req);
  if (!visitorId) return sendError(res, "MISSING_VISITOR", "visitorId is required", 400);
  const deleted = await FavoriteMessage.findOneAndDelete({ _id: req.params.id, visitorId });
  if (!deleted) return sendError(res, "NOT_FOUND", "Favorite not found", 404);
  res.json({ success: true });
});

mongoose
  .connect(env.MONGODB_URI)
  .then(() => {
    app.listen(env.PORT, () => console.log(`API on ${env.PORT}`));
  })
  .catch(err => {
    console.error("Mongo connect error", err);
    process.exit(1);
  });



