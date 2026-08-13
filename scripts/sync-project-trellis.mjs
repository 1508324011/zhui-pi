#!/usr/bin/env node
import { createHash } from "node:crypto";
import { execFileSync } from "node:child_process";
import {
	existsSync,
	lstatSync,
	mkdirSync,
	readdirSync,
	readFileSync,
	realpathSync,
	renameSync,
	unlinkSync,
	writeFileSync,
} from "node:fs";
import { dirname, join, relative, resolve, sep } from "node:path";
import { fileURLToPath } from "node:url";

const scriptDir = dirname(fileURLToPath(import.meta.url));
const repoRoot = dirname(scriptDir);
const templateRoot = join(repoRoot, "templates", "project-trellis");
const argv = process.argv.slice(2);
const mode = argv.includes("--check") ? "check" : argv.includes("--dry-run") ? "dry-run" : "apply";
const receiptArg = valueAfter("--receipt");
const targetArg = valueAfter("--target") ?? argv.find((arg) => !arg.startsWith("--"));

function valueAfter(flag) {
	const index = argv.indexOf(flag);
	if (index < 0) return undefined;
	if (!argv[index + 1] || argv[index + 1].startsWith("--")) fail(`${flag} requires a value.`);
	return argv[index + 1];
}

function fail(message) {
	const error = new Error(message);
	error.code = "USAGE";
	throw error;
}

function isInside(parent, child) {
	const rel = relative(parent, child);
	return rel === "" || (!rel.startsWith(`..${sep}`) && rel !== "..");
}

function revision() {
	try {
		const hash = execFileSync("git", ["-C", repoRoot, "rev-parse", "HEAD"], { encoding: "utf8" }).trim();
		const dirty = execFileSync("git", ["-C", repoRoot, "status", "--porcelain"], { encoding: "utf8" }).trim();
		return `${hash}${dirty ? "-dirty" : ""}`;
	} catch {
		return "unknown-dirty";
	}
}

function filesUnder(root, prefix = "") {
	const result = [];
	for (const entry of readdirSync(join(root, prefix), { withFileTypes: true })) {
		const rel = join(prefix, entry.name);
		if (entry.isDirectory()) result.push(...filesUnder(root, rel));
		else if (entry.isFile()) result.push(rel);
	}
	return result.sort();
}

function sha256(buffer) {
	return createHash("sha256").update(buffer).digest("hex");
}

function assertSafeTarget(input) {
	if (!input) fail("A target repository is required. Use --target <path>.");
	const target = resolve(input);
	if (!existsSync(target) || !lstatSync(target).isDirectory()) fail(`Target is not a directory: ${target}`);
	if (lstatSync(target).isSymbolicLink()) fail(`Symlink targets are rejected: ${target}`);
	const canonical = realpathSync(target);
	if (canonical === sep || canonical === resolve(process.env.HOME || "/nonexistent")) fail(`Unsafe target rejected: ${canonical}`);
	let gitRoot;
	try {
		gitRoot = realpathSync(execFileSync("git", ["-C", canonical, "rev-parse", "--show-toplevel"], { encoding: "utf8" }).trim());
	} catch {
		fail(`Target is not a Git repository: ${canonical}`);
	}
	if (gitRoot !== canonical) fail(`Target is not a repository root: ${canonical}`);
	const gitMarker = join(canonical, ".git");
	if (existsSync(gitMarker) && lstatSync(gitMarker).isSymbolicLink()) fail(`Symlink .git marker is rejected: ${gitMarker}`);
	const piRoot = join(canonical, ".pi");
	if (existsSync(piRoot) && lstatSync(piRoot).isSymbolicLink()) fail(`Symlink .pi directory is rejected: ${piRoot}`);
	return canonical;
}

function atomicWrite(path, content) {
	mkdirSync(dirname(path), { recursive: true });
	const temporary = join(dirname(path), `.${process.pid}-${Date.now()}-${Math.random().toString(16).slice(2)}.tmp`);
	try {
		writeFileSync(temporary, content);
		renameSync(temporary, path);
	} finally {
		if (existsSync(temporary)) unlinkSync(temporary);
	}
}

function validateAssetPaths(piRoot, assets) {
	const rejected = [];
	for (const rel of assets) {
		if (rel.split(sep).some((part) => part === ".." || part === "")) {
			rejected.push({ path: rel, reason: "unsafe_relative_path" });
			continue;
		}
		const destination = resolve(piRoot, rel);
		if (!isInside(piRoot, destination)) {
			rejected.push({ path: rel, reason: "path_traversal" });
			continue;
		}
		let cursor = piRoot;
		for (const part of rel.split(sep).slice(0, -1)) {
			cursor = join(cursor, part);
			if (!existsSync(cursor)) continue;
			const stat = lstatSync(cursor);
			if (stat.isSymbolicLink() || !stat.isDirectory()) {
				rejected.push({ path: rel, reason: stat.isSymbolicLink() ? "symlink_parent" : "non_directory_parent" });
				break;
			}
		}
		if (existsSync(destination)) {
			const stat = lstatSync(destination);
			if (stat.isSymbolicLink() || !stat.isFile())
				rejected.push({ path: rel, reason: stat.isSymbolicLink() ? "symlink_destination" : "non_file_destination" });
		}
	}
	return rejected;
}

function writeReceipt(receipt, path) {
	const text = `${JSON.stringify(receipt, null, 2)}\n`;
	if (path) {
		const destination = resolve(path);
		atomicWrite(destination, text);
	}
	process.stdout.write(text);
}

let receipt;
let exitCode = 0;
try {
	const target = assertSafeTarget(targetArg);
	const piRoot = join(target, ".pi");
	const assets = filesUnder(templateRoot);
	const rejected = validateAssetPaths(piRoot, assets);
	const copied = [];
	const unchanged = [];
	if (rejected.length === 0) for (const rel of assets) {
		const source = join(templateRoot, rel);
		const destination = resolve(piRoot, rel);
		const sourceBytes = readFileSync(source);
		if (existsSync(destination) && sha256(readFileSync(destination)) === sha256(sourceBytes)) {
			unchanged.push(rel.replaceAll(sep, "/"));
			continue;
		}
		copied.push(rel.replaceAll(sep, "/"));
		if (mode === "apply") atomicWrite(destination, sourceBytes);
	}
	receipt = {
		schemaVersion: 1,
		kind: "zhui-pi-project-trellis-sync",
		mode,
		sourceRevision: revision(),
		sourceTemplate: "templates/project-trellis",
		target,
		copied,
		unchanged,
		rejected,
		deleted: [],
		changed: copied.length > 0,
		ok: rejected.length === 0 && (mode !== "check" || copied.length === 0),
	};
	if (!receipt.ok) exitCode = 1;
} catch (error) {
	receipt = {
		schemaVersion: 1,
		kind: "zhui-pi-project-trellis-sync",
		mode,
		sourceRevision: revision(),
		target: targetArg ? resolve(targetArg) : null,
		copied: [],
		unchanged: [],
		rejected: [{ path: targetArg ?? "", reason: error instanceof Error ? error.message : String(error) }],
		deleted: [],
		changed: false,
		ok: false,
	};
	exitCode = 1;
}
writeReceipt(receipt, receiptArg);
process.exitCode = exitCode;
