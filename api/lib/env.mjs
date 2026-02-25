import fs from "node:fs";
import path from "node:path";
import { config as dotenvConfig } from "dotenv";

function loadEnvFile(filePath) {
  if (fs.existsSync(filePath)) {
    dotenvConfig({ path: filePath, override: false });
  }
}

const root = process.cwd();
loadEnvFile(path.join(root, ".env.local"));
loadEnvFile(path.join(root, "scripts", ".env.local"));
loadEnvFile(path.join(root, "_cursos", ".env.local"));

export function getEnv(name, fallback = "") {
  const value = process.env[name];
  if (typeof value === "string" && value.length > 0) {
    return value;
  }
  return fallback;
}

export function getRequiredEnv(name) {
  const value = getEnv(name);
  if (!value) {
    throw new Error(`Variavel obrigatoria ausente: ${name}`);
  }
  return value;
}
