import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import { existsSync, mkdtempSync, readFileSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join, resolve } from "node:path";
import test from "node:test";

const script = resolve(import.meta.dirname, "..", "scripts", "install-pi-lens-config.mjs");

function invoke(args, expectedStatus = 0) {
	const result = spawnSync(process.execPath, [script, ...args], { encoding: "utf8" });
	assert.equal(result.status, expectedStatus, result.stderr || result.stdout);
	return JSON.parse(result.stdout);
}

test("pi-lens merge preserves unrelated keys and is idempotent", () => {
	const dir = mkdtempSync(join(tmpdir(), "zhui-pi-lens-"));
	const target = join(dir, "config.json");
	writeFileSync(target, JSON.stringify({ diagnostics: { enabled: true }, tests: { timeout: 91 } }));
	const first = invoke(["--target", target]);
	assert.equal(first.changed, true);
	assert.deepEqual(JSON.parse(readFileSync(target, "utf8")), {
		diagnostics: { enabled: true },
		tests: { timeout: 91, enabled: false },
	});
	const second = invoke(["--target", target]);
	assert.equal(second.changed, false);
	assert.equal(invoke(["--check", "--target", target]).ok, true);
});

test("dry-run is non-mutating and check reports drift", () => {
	const dir = mkdtempSync(join(tmpdir(), "zhui-pi-lens-"));
	const target = join(dir, "config.json");
	writeFileSync(target, JSON.stringify({ tests: { enabled: true }, custom: "keep" }));
	const dry = invoke(["--dry-run", "--target", target]);
	assert.equal(dry.changed, true);
	assert.deepEqual(JSON.parse(readFileSync(target, "utf8")), {
		tests: { enabled: true },
		custom: "keep",
	});
	const check = invoke(["--check", "--target", target], 1);
	assert.equal(check.ok, false);
	assert.equal(JSON.parse(readFileSync(target, "utf8")).custom, "keep");
});

test("invalid existing JSON fails closed", () => {
	const dir = mkdtempSync(join(tmpdir(), "zhui-pi-lens-"));
	const target = join(dir, "config.json");
	writeFileSync(target, "not-json\n");
	const result = spawnSync(process.execPath, [script, "--target", target], { encoding: "utf8" });
	assert.notEqual(result.status, 0);
	assert.equal(readFileSync(target, "utf8"), "not-json\n");
});

test("missing --target value fails closed with no default-target side effect", () => {
	const home = mkdtempSync(join(tmpdir(), "zhui-pi-lens-home-"));
	const result = spawnSync(process.execPath, [script, "--target"], {
		encoding: "utf8",
		env: { ...process.env, HOME: home },
	});
	assert.equal(result.status, 1, result.stderr || result.stdout);
	const receipt = JSON.parse(result.stdout);
	assert.equal(receipt.ok, false);
	assert.match(receipt.error, /missing value for --target/);
	assert.equal(existsSync(join(home, ".pi-lens", "config.json")), false);
});

test("--target followed by another flag fails closed without writing the receipt target", () => {
	const dir = mkdtempSync(join(tmpdir(), "zhui-pi-lens-"));
	const receiptTarget = join(dir, "receipt.json");
	const result = spawnSync(process.execPath, [script, "--target", "--receipt", receiptTarget], {
		encoding: "utf8",
	});
	assert.equal(result.status, 1, result.stderr || result.stdout);
	const receipt = JSON.parse(result.stdout);
	assert.equal(receipt.ok, false);
	assert.match(receipt.error, /missing value for --target/);
	assert.equal(existsSync(receiptTarget), false);
});

test("missing --receipt value fails closed with no target side effect", () => {
	const dir = mkdtempSync(join(tmpdir(), "zhui-pi-lens-"));
	const target = join(dir, "config.json");
	const result = spawnSync(process.execPath, [script, "--target", target, "--receipt"], {
		encoding: "utf8",
	});
	assert.equal(result.status, 1, result.stderr || result.stdout);
	const receipt = JSON.parse(result.stdout);
	assert.equal(receipt.ok, false);
	assert.match(receipt.error, /missing value for --receipt/);
	assert.equal(existsSync(target), false);
});

test("default target without --target still applies to $HOME/.pi-lens/config.json", () => {
	const home = mkdtempSync(join(tmpdir(), "zhui-pi-lens-home-"));
	const env = { ...process.env, HOME: home };
	const first = spawnSync(process.execPath, [script], { encoding: "utf8", env });
	assert.equal(first.status, 0, first.stderr || first.stdout);
	assert.equal(JSON.parse(first.stdout).ok, true);
	const target = join(home, ".pi-lens", "config.json");
	assert.equal(existsSync(target), true);
	assert.equal(JSON.parse(readFileSync(target, "utf8")).tests.enabled, false);
	const second = spawnSync(process.execPath, [script], { encoding: "utf8", env });
	assert.equal(second.status, 0, second.stderr || second.stdout);
	assert.equal(JSON.parse(second.stdout).changed, false);
});
