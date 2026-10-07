const { spawn } = require("child_process");
const path = require("path");

console.log("\x1b[36m%s\x1b[0m", "==================================================");
console.log("\x1b[36m%s\x1b[0m", "🚀 Starting PERN ERP System (Backend & Frontend)");
console.log("\x1b[36m%s\x1b[0m", "==================================================");

const isWin = process.platform === "win32";
const npmCmd = isWin ? "npm.cmd" : "npm";

// Spawn backend
const backend = spawn(npmCmd, ["run", "dev"], {
  cwd: path.join(__dirname, "backend"),
  shell: true,
  stdio: "pipe",
});

backend.stdout.on("data", (data) => {
  process.stdout.write(`\x1b[35m[BACKEND]\x1b[0m ${data}`);
});

backend.stderr.on("data", (data) => {
  process.stderr.write(`\x1b[31m[BACKEND-ERR]\x1b[0m ${data}`);
});

backend.on("error", (err) => {
  console.error("\x1b[31mFailed to start backend:\x1b[0m", err);
});

// Spawn frontend
const frontend = spawn(npmCmd, ["run", "dev"], {
  cwd: path.join(__dirname, "frontend"),
  shell: true,
  stdio: "pipe",
});

frontend.stdout.on("data", (data) => {
  process.stdout.write(`\x1b[34m[FRONTEND]\x1b[0m ${data}`);
});

frontend.stderr.on("data", (data) => {
  process.stderr.write(`\x1b[31m[FRONTEND-ERR]\x1b[0m ${data}`);
});

frontend.on("error", (err) => {
  console.error("\x1b[31mFailed to start frontend:\x1b[0m", err);
});

// Handle termination
function cleanup() {
  console.log("\nShutting down backend and frontend processes...");
  try {
    if (isWin) {
      if (backend.pid) spawn("taskkill", ["/pid", backend.pid, "/f", "/t"]);
      if (frontend.pid) spawn("taskkill", ["/pid", frontend.pid, "/f", "/t"]);
    } else {
      backend.kill();
      frontend.kill();
    }
  } catch (e) {}
  process.exit(0);
}

process.on("SIGINT", cleanup);
process.on("SIGTERM", cleanup);
