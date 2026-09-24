// Accept conventional preview flags while retaining the native Next.js server.
import { spawn } from "node:child_process";
import { createRequire } from "node:module";
const require = createRequire(import.meta.url);
const input = process.argv.slice(2),
  args = [];
for (let i = 0; i < input.length; i++) {
  if (input[i] === "--strictPort") continue;
  args.push(input[i] === "--host" ? "--hostname" : input[i]);
}
const child = spawn(
  process.execPath,
  [require.resolve("next/dist/bin/next"), "dev", "--webpack", ...args],
  { stdio: "inherit", env: process.env },
);
for (const signal of ["SIGTERM", "SIGINT"])
  process.on(signal, () => child.kill(signal));
child.on("exit", (code) => process.exit(code ?? 1));
