import swaggerUi from "swagger-ui-express";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

// Fix __dirname for ES Modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load swagger.json safely (NO JSON IMPORT)
const swaggerPath = path.join(__dirname, "./swagger.json");
const swaggerDocument = JSON.parse(
  fs.readFileSync(swaggerPath, "utf-8")
);

export const swaggerDocs = (app) => {
  app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerDocument));
};
