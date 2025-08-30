// src/app.ts
import express from "express";
import cors from "cors";
import morgan from "morgan";

// (opsional) swagger
import swaggerJsdoc from "swagger-jsdoc";
import swaggerUi from "swagger-ui-express";

import membersRoute from "./routes/members.js";
import transactionsRoute from "./routes/transactions.js";
import poolRoute from "./routes/pool.js";

export const app = express();

app.use(cors());
app.use(express.json());
app.use(morgan("dev"));

app.get("/health", (_req, res) => {
  res.json({ ok: true, ts: new Date().toISOString() });
});

app.use("/members", membersRoute);
app.use("/transactions", transactionsRoute);
app.use("/pool", poolRoute);

// --- Swagger (contoh minimal; sesuaikan globs dengan strukturmu)
const swaggerSpec = swaggerJsdoc({
  definition: {
    openapi: "3.0.0",
    info: {
      title: "Finance API",
      version: "1.0.0",
      description: "API untuk pool, members, transactions",
    },
  },
  apis: ["./src/routes/*.ts"], // baca JSDoc dari file routes TS
});

app.use("/docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec));
