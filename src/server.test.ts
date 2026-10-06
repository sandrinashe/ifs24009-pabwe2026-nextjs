import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { EventEmitter } from "node:events";

const spawnMock = vi.fn();
const existsSyncMock = vi.fn();
const readFileSyncMock = vi.fn();

vi.mock("node:child_process", () => {
  const spawn = (...args: unknown[]) => spawnMock(...args);
  return { default: { spawn }, spawn };
});
vi.mock("node:fs", () => ({
  default: {
    existsSync: (...args: unknown[]) => existsSyncMock(...args),
    readFileSync: (...args: unknown[]) => readFileSyncMock(...args),
  },
}));

const originalArgv = process.argv;
const originalEnv = { ...process.env };

async function loadServer(action?: string) {
  process.argv = ["bun", "server.ts", ...(action ? [action] : [])];
  const child = new EventEmitter();
  spawnMock.mockReturnValue(child);
  vi.resetModules();
  await import("./server");
  return child;
}

describe("server launcher", () => {
  beforeEach(() => {
    spawnMock.mockReset();
    existsSyncMock.mockReset().mockReturnValue(false);
    readFileSyncMock.mockReset();
    delete process.env.APP_PORT;
    delete process.env.PORT;
  });

  afterEach(() => {
    process.argv = originalArgv;
    process.env = { ...originalEnv };
    vi.restoreAllMocks();
  });

  it("uses APP_PORT and runs dev with turbopack by default", async () => {
    process.env.APP_PORT = " 4100 ";
    await loadServer();
    const [, args, options] = spawnMock.mock.calls[0];
    expect(args.slice(1)).toEqual(["dev", "--turbopack", "-p", "4100"]);
    expect(options.env.PORT).toBe("4100");
  });

  it("uses PORT and runs start", async () => {
    process.env.PORT = "4200";
    await loadServer("start");
    expect(spawnMock.mock.calls[0][1].slice(1)).toEqual(["start", "-p", "4200"]);
  });

  it.each([
    ["# komentar\nAPP_PORT=5000\nPORT=6000", "5000"],
    ["PORT=6000", "6000"],
    ["OTHER=1", "3000"],
  ])("reads the port from .env (%s)", async (content, expected) => {
    existsSyncMock.mockReturnValue(true);
    readFileSyncMock.mockReturnValue(content);
    await loadServer();
    expect(spawnMock.mock.calls[0][1].at(-1)).toBe(expected);
  });

  it("falls back to 3000 when .env cannot be read", async () => {
    existsSyncMock.mockReturnValue(true);
    readFileSyncMock.mockImplementation(() => {
      throw new Error("denied");
    });
    await loadServer();
    expect(spawnMock.mock.calls[0][1].at(-1)).toBe("3000");
  });

  it("exits with the child exit code, or 0 when it is null", async () => {
    const exit = vi.spyOn(process, "exit").mockImplementation((() => undefined) as never);
    const child = await loadServer();
    child.emit("exit", 2, null);
    expect(exit).toHaveBeenCalledWith(2);
    child.emit("exit", null, null);
    expect(exit).toHaveBeenCalledWith(0);
  });

  it("forwards the signal that terminated the child", async () => {
    const kill = vi.spyOn(process, "kill").mockImplementation((() => true) as never);
    const child = await loadServer();
    child.emit("exit", null, "SIGTERM");
    expect(kill).toHaveBeenCalledWith(process.pid, "SIGTERM");
  });
});
