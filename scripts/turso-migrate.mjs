import fs from "node:fs";
import path from "node:path";
import { createClient } from "@libsql/client";
import { config as dotenvConfig } from "dotenv";

function loadEnv(filePath) {
  if (fs.existsSync(filePath)) {
    dotenvConfig({ path: filePath, override: false });
  }
}

const root = process.cwd();
loadEnv(path.join(root, ".env.local"));
loadEnv(path.join(root, "scripts", ".env.local"));
loadEnv(path.join(root, "_cursos", ".env.local"));

const url = process.env.DATABASE_URL;
const authToken = process.env.DATABASE_AUTH_TOKEN;

if (!url || !authToken) {
  throw new Error("DATABASE_URL e DATABASE_AUTH_TOKEN sao obrigatorias para migracao.");
}

const schemaPath = path.join(root, "db", "schema.sql");
const sql = fs.readFileSync(schemaPath, "utf8");

const client = createClient({ url, authToken });

const statements = sql
  .split(";")
  .map((s) => s.trim())
  .filter(Boolean);

for (const statement of statements) {
  await client.execute(statement);
}

console.log("Migracao aplicada com sucesso.");
