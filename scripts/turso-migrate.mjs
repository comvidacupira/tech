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
const isLocalUrl =
  typeof url === "string" &&
  (url.startsWith("file:") ||
    url.startsWith("http://localhost") ||
    url.startsWith("https://localhost") ||
    url.startsWith("http://127.0.0.1") ||
    url.startsWith("https://127.0.0.1"));

if (!url) {
  throw new Error("DATABASE_URL obrigatoria para migracao.");
}

if (!authToken && !isLocalUrl) {
  throw new Error("DATABASE_AUTH_TOKEN obrigatoria para migracao em Turso remoto.");
}

const schemaPath = path.join(root, "db", "schema.sql");
const sql = fs.readFileSync(schemaPath, "utf8");

const client = createClient({
  url,
  ...(authToken ? { authToken } : {}),
});

const statements = sql
  .split(";")
  .map((s) => s.trim())
  .filter(Boolean);

for (const statement of statements) {
  await client.execute(statement);
}

console.log("Migracao aplicada com sucesso.");
