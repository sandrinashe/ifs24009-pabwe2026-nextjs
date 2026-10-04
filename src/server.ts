import { spawn } from "node:child_process";
import fs from "node:fs";
import path from "node:path";

function getPort(): string {
  if (process.env.APP_PORT) return process.env.APP_PORT.trim();
  if (process.env.PORT) return process.env.PORT.trim();

  const envPath = path.resolve(process.cwd(), ".env");
  if (fs.existsSync(envPath)) {
    try {
      const content = fs.readFileSync(envPath, "utf-8");
      const match = content.match(/^\s*APP_PORT\s*=\s*(.+)$/m);
      if (match && match[1]) {
        return match[1].trim();
      }
      const portMatch = content.match(/^\s*PORT\s*=\s*(.+)$/m);
      if (portMatch && portMatch[1]) {
        return portMatch[1].trim();
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
