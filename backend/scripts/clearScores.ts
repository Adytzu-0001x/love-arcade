import mongoose from "mongoose";
import { env } from "../src/utils/env";
import Score from "../src/models/Score";

const run = async () => {
  if (!env.MONGODB_URI) {
    console.error("Missing MONGODB_URI");
    process.exit(1);
  }
  await mongoose.connect(env.MONGODB_URI);
  const result = await Score.deleteMany({});
  console.log(`Deleted scores: ${result.deletedCount || 0}`);
  await mongoose.disconnect();
};

run().catch(err => {
  console.error("Failed to clear scores:", err);
  process.exit(1);
});
