import assert from "node:assert/strict";
import { execFileSync, spawnSync } from "node:child_process";
import { existsSync, mkdtempSync, mkdirSync, readFileSync, symlinkSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join, resolve } from "node:path";
import test from "node:test";

const repoRoot = resolve(import.meta.dirname, "..");
const script = join(repoRoot, "scripts", "sync-project-trellis.mjs");

function tempRepo() {
	const root = mkdtempSync(join(tmpdir(), "zhui-pi-sync-"));
	execFileSync("git", ["init", "--quiet", root]);
	return root;
}

function run(args, expectedStatus = 0) {
	const result = spawnSync(process.execPath, [script, ...args], { encoding: "utf8" });
	assert.equal(result.status, expectedStatus, result.stderr || result.stdout);
	return JSON.parse(result.stdout);
}

test("synchronizer is idempotent and preserves unrelated .pi assets", () => {
	const target = tempRepo();
	mkdirSync(join(target, ".pi"), { recursive: true });
	writeFileSync(join(target, ".pi", "unrelated.txt"), "keep\n");
	const first = run(["--target", target]);
	assert.equal(first.ok, true);
	assert.ok(first.copied.includes("extensions/trellis/index.ts"));
	assert.match(first.sourceRevision, /^[0-9a-f]{40}(?:-dirty)?$/);
	const second = run(["--target", target]);
	assert.equal(second.changed, false);
	assert.deepEqual(second.copied, []);
	assert.equal(readFileSync(join(target, ".pi", "unrelated.txt"), "utf8"), "keep\n");
	const check = run(["--check", "--target", target]);
	assert.equal(check.ok, true);
});

test("dry-run reports updates without writing", () => {
	const target = tempRepo();
	const receipt = run(["--dry-run", "--target", target]);
	assert.equal(receipt.changed, true);
	assert.ok(receipt.copied.length > 0);
	assert.throws(() => readFileSync(join(target, ".pi", "settings.json")));
});

test("synchronizer rejects non-repositories and symlinked .pi directories", () => {
	const plain = mkdtempSync(join(tmpdir(), "zhui-pi-plain-"));
	const rejected = run(["--target", plain], 1);
	assert.equal(rejected.ok, false);
	assert.match(rejected.rejected[0].reason, /not a Git repository/);

	const target = tempRepo();
	const outside = mkdtempSync(join(tmpdir(), "zhui-pi-outside-"));
	symlinkSync(outside, join(target, ".pi"), "dir");
	const symlinked = run(["--target", target], 1);
	assert.match(symlinked.rejected[0].reason, /Symlink \.pi directory/);

	const nestedTarget = tempRepo();
	mkdirSync(join(nestedTarget, ".pi"));
	symlinkSync(outside, join(nestedTarget, ".pi", "agents"), "dir");
	const nested = run(["--target", nestedTarget], 1);
	assert.ok(nested.rejected.some((item) => item.reason === "symlink_parent"));
	assert.equal(existsSync(join(nestedTarget, ".pi", "settings.json")), false);
});

test("synchronizer accepts a Git worktree root", () => {
	const parent = mkdtempSync(join(tmpdir(), "zhui-pi-worktree-parent-"));
	execFileSync("git", ["init", "--quiet", parent]);
	execFileSync("git", ["-C", parent, "config", "user.email", "test@example.invalid"]);
	execFileSync("git", ["-C", parent, "config", "user.name", "Test"]);
	writeFileSync(join(parent, "seed"), "seed\n");
	execFileSync("git", ["-C", parent, "add", "seed"]);
	execFileSync("git", ["-C", parent, "commit", "--quiet", "-m", "seed"]);
	const worktree = mkdtempSync(join(tmpdir(), "zhui-pi-worktree-"));
	execFileSync("git", ["-C", parent, "worktree", "add", "--quiet", "--detach", worktree]);
	const receipt = run(["--dry-run", "--target", worktree]);
	assert.equal(receipt.ok, true);
});

test("machine-readable receipt can be written separately", () => {
	const target = tempRepo();
	const receiptPath = join(target, "receipt.json");
	run(["--target", target, "--receipt", receiptPath]);
	const receipt = JSON.parse(readFileSync(receiptPath, "utf8"));
	assert.equal(receipt.kind, "zhui-pi-project-trellis-sync");
	assert.equal(receipt.deleted.length, 0);
});
