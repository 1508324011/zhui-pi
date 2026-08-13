#!/usr/bin/env node
import { existsSync, mkdirSync, readFileSync, renameSync, unlinkSync, writeFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const repoRoot = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const templatePath = resolve(repoRoot, "templates/pi-lens/config.json");
const argv = process.argv.slice(2);
const mode = argv.includes("--check") ? "check" : argv.includes("--dry-run") ? "dry-run" : "apply";

function valueAfter(flag) {
	const index = argv.indexOf(flag);
	return index >= 0 ? argv[index + 1] : undefined;
}

// 显式出现的 --target/--receipt 其后必须有值，且不能是另一个 flag；否则 fail closed。
function missingValueFlag() {
	for (const flag of ["--target", "--receipt"]) {
		if (!argv.includes(flag)) continue;
		const value = valueAfter(flag);
		if (value === undefined || value.startsWith("-")) return flag;
	}
	return undefined;
}

function isObject(value) {
	return value !== null && typeof value === "object" && !Array.isArray(value);
}

function merge(base, desired) {
	const result = isObject(base) ? { ...base } : {};
	for (const [key, value] of Object.entries(desired)) {
		result[key] = isObject(value) ? merge(isObject(result[key]) ? result[key] : {}, value) : value;
	}
	return result;
}

function readJson(path, fallback) {
	if (!existsSync(path)) return fallback;
	const parsed = JSON.parse(readFileSync(path, "utf8"));
	if (!isObject(parsed)) throw new Error(`JSON root must be an object: ${path}`);
	return parsed;
}

function atomicWrite(path, content) {
	mkdirSync(dirname(path), { recursive: true });
	const temporary = resolve(dirname(path), `.${process.pid}-${Date.now()}.tmp`);
	try {
		writeFileSync(temporary, content, "utf8");
		renameSync(temporary, path);
	} finally {
		if (existsSync(temporary)) unlinkSync(temporary);
	}
}

let receipt;
let exitCode = 0;
let target = null;
let receiptPath;
const invalidFlag = missingValueFlag();
if (invalidFlag) {
	receipt = {
		schemaVersion: 1,
		kind: "zhui-pi-pi-lens-config",
		mode,
		target,
		changed: false,
		preservedTopLevelKeys: [],
		applied: { tests: { enabled: false } },
		ok: false,
		error: `missing value for ${invalidFlag}`,
	};
	exitCode = 1;
} else {
	target = resolve(valueAfter("--target") ?? `${process.env.HOME || ""}/.pi-lens/config.json`);
	receiptPath = valueAfter("--receipt");
	try {
		const existing = readJson(target, {});
		const desired = readJson(templatePath, {});
		const merged = merge(existing, desired);
		const content = `${JSON.stringify(merged, null, 2)}\n`;
		const current = existsSync(target) ? readFileSync(target, "utf8") : "";
		const changed = current !== content;
		if (mode === "apply" && changed) atomicWrite(target, content);
		receipt = {
			schemaVersion: 1,
			kind: "zhui-pi-pi-lens-config",
			mode,
			target,
			changed,
			preservedTopLevelKeys: Object.keys(existing).filter((key) => key !== "tests").sort(),
			applied: { tests: { enabled: false } },
			ok: mode !== "check" || !changed,
		};
		if (!receipt.ok) exitCode = 1;
	} catch (error) {
		receipt = {
			schemaVersion: 1,
			kind: "zhui-pi-pi-lens-config",
			mode,
			target,
			changed: false,
			preservedTopLevelKeys: [],
			applied: { tests: { enabled: false } },
			ok: false,
			error: error instanceof Error ? error.message : String(error),
		};
		exitCode = 1;
	}
}
const output = `${JSON.stringify(receipt, null, 2)}\n`;
if (receiptPath) {
	const path = resolve(receiptPath);
	atomicWrite(path, output);
}
process.stdout.write(output);
process.exitCode = exitCode;
