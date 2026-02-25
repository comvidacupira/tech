import { createClerkClient } from "@clerk/backend";
import { getRequiredEnv } from "../api/lib/env.mjs";

const allowedRoles = new Set(["admin", "editor", "viewer"]);

function readArg(name) {
  const index = process.argv.indexOf(name);
  if (index < 0) return "";
  return String(process.argv[index + 1] || "").trim();
}

function exitWithUsage(message = "") {
  if (message) {
    console.error(message);
  }
  console.error(
    [
      "Uso:",
      "  node scripts/clerk-set-role.mjs --userId <clerk_user_id> --role <admin|editor|viewer>",
      "  node scripts/clerk-set-role.mjs --email <email@dominio.com> --role <admin|editor|viewer>",
    ].join("\n"),
  );
  process.exit(1);
}

const userIdArg = readArg("--userId");
const emailArg = readArg("--email");
const roleArg = readArg("--role").toLowerCase();

if (!roleArg || !allowedRoles.has(roleArg)) {
  exitWithUsage("Role invalida. Use: admin, editor ou viewer.");
}

if (!userIdArg && !emailArg) {
  exitWithUsage("Informe --userId ou --email.");
}

if (userIdArg && emailArg) {
  exitWithUsage("Use apenas um identificador: --userId ou --email.");
}

const secretKey = getRequiredEnv("CLERK_SECRET_KEY");
const clerkClient = createClerkClient({ secretKey });

let targetUserId = userIdArg;

if (!targetUserId) {
  const users = await clerkClient.users.getUserList({
    emailAddress: [emailArg],
    limit: 1,
  });

  if (!users?.data?.length) {
    console.error("Usuario nao encontrado para email:", emailArg);
    process.exit(1);
  }

  targetUserId = String(users.data[0].id);
}

const currentUser = await clerkClient.users.getUser(targetUserId);
const previousMetadata = currentUser?.publicMetadata || {};
const previousRole = String(previousMetadata.role || "viewer").toLowerCase();
const nextMetadata = { ...previousMetadata, role: roleArg };

await clerkClient.users.updateUserMetadata(targetUserId, {
  publicMetadata: nextMetadata,
});

console.log(
  JSON.stringify(
    {
      ok: true,
      userId: targetUserId,
      previousRole,
      role: roleArg,
    },
    null,
    2,
  ),
);
