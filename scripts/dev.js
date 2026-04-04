import { spawn } from "child_process";
import path from "path";
import process from "process";

const root = process.cwd();
const npmCommand = process.platform === "win32" ? "npm.cmd" : "npm";

function run(name, cwd, command, args) {
  const child = spawn(command, args, {
    cwd,
    stdio: "inherit",
    shell: process.platform === "win32",
  });

  child.on("exit", (code) => {
    if (code !== 0) {
      console.error(`${name} exited with code ${code}`);
      process.exitCode = code || 1;
    }
  });

  return child;
}

const server = run(
  "server",
  path.join(root, "server"),
  npmCommand,
  ["run", "dev"]
);

const client = run(
  "client",
  path.join(root, "client"),
  npmCommand,
  ["run", "dev", "--", "--host", "127.0.0.1"]
);

function shutdown() {
  server.kill();
  client.kill();
}

process.on("SIGINT", shutdown);
process.on("SIGTERM", shutdown);
