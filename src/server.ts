import { spawn } from "node:child_process";
import fs from "node:fs";
import path from "node:path";

// Parser .env sederhana tanpa regex (menghindari backtracking pada input besar)
function parseEnv(content: string): Record<string, string> {
  const result: Record<string, string> = {};
  for (const line of content.split("\n")) {
    const index = line.indexOf("=");
    if (index > 0) {
      result[line.slice(0, index).trim()] = line.slice(index + 1).trim();
    }
  }
  return result;
}

function getPort(): string {
  if (process.env.APP_PORT) return process.env.APP_PORT.trim();
  if (process.env.PORT) return process.env.PORT.trim();

  const envPath = path.resolve(process.cwd(), ".env");
  if (fs.existsSync(envPath)) {
    try {
      const values = parseEnv(fs.readFileSync(envPath, "utf-8"));
      const fromFile = values.APP_PORT || values.PORT;
      if (fromFile) {
        return fromFile;
      }
    } catch {
      // fallback jika file .env tidak dapat dibaca
    }
  }

  return "3000";
}

const action = process.argv[2] || "dev";
const port = getPort();

const nextArgs = action === "start" ? ["start", "-p", port] : ["dev", "--turbopack", "-p", port];

const nextBin = require.resolve("next/dist/bin/next");

const child = spawn(process.execPath, [nextBin, ...nextArgs], {
  stdio: "inherit",
  env: {
    ...process.env,
    PORT: port,
    APP_PORT: port,
  },
});

child.on("exit", (code, signal) => {
  if (signal) {
    process.kill(process.pid, signal);
  } else {
    process.exit(code ?? 0);
  }
});
