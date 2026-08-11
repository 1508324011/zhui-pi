#!/usr/bin/env node
import { execFileSync } from "node:child_process";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import {
  existsSync,
  lstatSync,
  mkdirSync,
  readFileSync,
  rmSync,
  symlinkSync,
  writeFileSync,
} from "node:fs";

const scriptDir = dirname(fileURLToPath(import.meta.url));
const repoRoot = dirname(scriptDir);
const agentDir = resolve(process.argv[2] || process.env.PI_CODING_AGENT_DIR || join(process.env.HOME || "", ".pi", "agent"));
const nodeModulesDir = join(agentDir, "npm", "node_modules");
const scopeDir = join(nodeModulesDir, "@earendil-works");
const piSubagentsDir = join(nodeModulesDir, "pi-subagents");

function readText(path) {
  return readFileSync(path, "utf8");
}

function writeText(path, text) {
  writeFileSync(path, text, "utf8");
}

function findPiCoreDir() {
  if (process.env.PI_CODING_AGENT_CORE_DIR && existsSync(process.env.PI_CODING_AGENT_CORE_DIR)) {
    return resolve(process.env.PI_CODING_AGENT_CORE_DIR);
  }

  try {
    const piBin = execFileSync("bash", ["-lc", "command -v pi"], { encoding: "utf8" }).trim();
    if (piBin) {
      const real = execFileSync("readlink", ["-f", piBin], { encoding: "utf8" }).trim();
      const candidate = resolve(dirname(real), "..", "lib", "node_modules", "@earendil-works", "pi-coding-agent");
      if (existsSync(candidate)) return candidate;
    }
  } catch {
    // Fall through to common Pi node prefix.
  }

  const home = process.env.HOME || "";
  const localShare = join(home, ".local", "share", "pi-node");
  if (existsSync(localShare)) {
    const matches = execFileSync("bash", ["-lc", `find ${JSON.stringify(localShare)} -path '*/lib/node_modules/@earendil-works/pi-coding-agent' -type d | sort | tail -n 1`], { encoding: "utf8" }).trim();
    if (matches && existsSync(matches)) return matches;
  }

  return undefined;
}

function ensureSymlink(name, source) {
  const target = join(scopeDir, name);
  if (!source || !existsSync(source)) return false;
  mkdirSync(scopeDir, { recursive: true });
  if (existsSync(target) || lstatExists(target)) {
    const stat = lstatSync(target);
    if (stat.isSymbolicLink()) {
      rmSync(target, { force: true });
    } else {
      rmSync(target, { recursive: true, force: true });
    }
  }
  symlinkSync(source, target, "dir");
  return true;
}

function lstatExists(path) {
  try {
    lstatSync(path);
    return true;
  } catch {
    return false;
  }
}

function replaceIfPresent(path, before, after) {
  const current = readText(path);
  if (current.includes(after)) return false;
  if (!current.includes(before)) {
    console.warn(`  ! 未找到预期补丁上下文: ${path}`);
    return false;
  }
  writeText(path, current.replace(before, after));
  return true;
}

function ensurePiSubagentsTsconfig() {
  if (!existsSync(piSubagentsDir)) return false;
  const tsconfigPath = join(piSubagentsDir, "tsconfig.json");
  const content = `${JSON.stringify({
    compilerOptions: {
      target: "ES2023",
      module: "NodeNext",
      moduleResolution: "NodeNext",
      lib: ["ES2023"],
      types: ["node"],
      allowImportingTsExtensions: true,
      skipLibCheck: true,
      strict: false,
      noEmit: true,
    },
    include: ["index.ts", "src/**/*.ts"],
  }, null, 2)}\n`;
  if (existsSync(tsconfigPath) && readText(tsconfigPath) === content) return false;
  writeText(tsconfigPath, content);
  return true;
}

function patchPiSubagentsWatchdog() {
  if (!existsSync(piSubagentsDir)) {
    console.warn(`  ! 未安装 pi-subagents，跳过 watchdog 补丁: ${piSubagentsDir}`);
    return 0;
  }

  let changes = 0;
  const changeSignature = join(piSubagentsDir, "src", "watchdog", "change-signature.ts");
  const registerChild = join(piSubagentsDir, "src", "watchdog", "register-child.ts");
  const registerMain = join(piSubagentsDir, "src", "watchdog", "register-main.ts");

  changes += Number(replaceIfPresent(
    changeSignature,
    'const IGNORED_CHANGE_PREFIXES = [".pi-subagents/", "tmp/", "node_modules/"];',
    'const IGNORED_CHANGE_PREFIXES = [".pi/", ".pi-subagents/", "tmp/", "node_modules/"];',
  ));
  changes += Number(replaceIfPresent(
    changeSignature,
    'return value.replaceAll(path.sep, "/").replace(/^\\.\\//, "");',
    'return value.split(path.sep).join("/").replace(/^\\.\\//, "");',
  ));
  changes += Number(replaceIfPresent(
    registerChild,
    'pi.sendMessage(createWatchdogWarningMessage(childDetails, { display: true, details: childDetails }));',
    'pi.sendMessage(createWatchdogWarningMessage(childDetails, { display: true, details: childDetails }), { deliverAs: "followUp" });',
  ));
  changes += Number(replaceIfPresent(
    registerMain,
    'return status.replaceAll("-", " ");',
    'return status.split("-").join(" ");',
  ));
  changes += Number(replaceIfPresent(
    registerMain,
    'pi.sendMessage(createWatchdogWarningMessage(details, { display: true, details }), delivery?.deliverAs === "steer" ? { deliverAs: "steer" } : undefined);',
    'pi.sendMessage(createWatchdogWarningMessage(details, { display: true, details }), delivery?.deliverAs === "steer" ? { deliverAs: "steer" } : { deliverAs: "followUp" });',
  ));
  changes += Number(ensurePiSubagentsTsconfig());
  return changes;
}

const coreDir = findPiCoreDir();
if (!coreDir) {
  console.warn("  ! 未找到 Pi core 包，跳过 peer symlink");
} else {
  const coreScope = join(coreDir, "node_modules", "@earendil-works");
  const links = [
    ["pi-coding-agent", coreDir],
    ["pi-agent-core", join(coreScope, "pi-agent-core")],
    ["pi-ai", join(coreScope, "pi-ai")],
    ["pi-tui", join(coreScope, "pi-tui")],
  ];
  for (const [name, source] of links) {
    if (ensureSymlink(name, source)) console.log(`  - ${name} peer symlink -> ${source}`);
  }
}

const patched = patchPiSubagentsWatchdog();
console.log(`  - pi-subagents watchdog patch: ${patched ? `${patched} change(s)` : "already applied"}`);
