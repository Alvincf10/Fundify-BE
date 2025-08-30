// src/server.ts
import "dotenv/config"; // load .env lebih awal
import { app } from "./app.js";         // ← perhatikan .js
import { connectDB } from "./config/db.js"; // ← perhatikan .js

const PORT = process.env.PORT || 4000;
const MONGO_URI =
  process.env.MONGO_URI || "mongodb://127.0.0.1:27018/finance?replicaSet=rs0&directConnection=true";

async function main() {
  await connectDB(MONGO_URI);
  app.listen(PORT, () => {
    console.log(`🚀 Server running at http://localhost:${PORT}`);
    console.log(`📘 Swagger docs at http://localhost:${PORT}/docs`);
  });
}

main().catch((err) => {
  console.error("Fatal bootstrap error:", err);
  process.exit(1);
});
