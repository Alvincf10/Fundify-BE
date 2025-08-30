import swaggerJsdoc from "swagger-jsdoc";
import swaggerUi from "swagger-ui-express";
import type { Express } from "express";  // 👈 pakai `import type`

const options = {
  definition: {
    openapi: "3.0.0",
    info: {
      title: "Finance API",
      version: "1.0.0",
      description: "API untuk mengelola pool, members, dan transactions",
    },
    components: {
      schemas: {
        Member: {
          type: "object",
          properties: { _id:{type:"string"}, name:{type:"string"}, balance:{type:"number"} }
        },
        Transaction: {
          type: "object",
          properties: {
            _id:{type:"string"},
            type:{type:"string", enum:["income","expense"]},
            source:{ type:"object", properties:{ kind:{type:"string"}, memberId:{type:"string"} } },
            amount:{type:"number"}, desc:{type:"string"},
            date:{type:"string", example:"2025-08-29"},
            createdAt:{type:"string", format:"date-time"}
          }
        },
        Pool: { type:"object", properties:{ pool:{type:"number"} } }
      }
    }
  },
  apis: ["./src/routes/*.ts"], // baca komentar JSDoc di routes
};

const swaggerSpec = swaggerJsdoc(options);

export function setupSwagger(app: Express) {
  app.use("/docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec));
}