import assert from "node:assert/strict";
import { existsSync, mkdtempSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join, resolve } from "node:path";
import test from "node:test";
import trellisExtension from "../templates/project-trellis/extensions/trellis/index.ts";

const agentDefinition = `---
name: trellis-implement
model: deepseek/deepseek-v4-pro
thinking: max
---
Implement the delegated task.
`;

test("ordinary cancellation after changes is not timeout evidence", async () => {
	const root = mkdtempSync(join(tmpdir(), "zhui-pi-extension-cancel-"));
	mkdirSync(join(root, ".pi", "agents"), { recursive: true });
	mkdirSync(join(root, ".trellis", "workspace"), { recursive: true });
	writeFileSync(join(root, ".pi", "agents", "trellis-implement.md"), agentDefinition);
	const fakeCli = join(root, "fake-pi.mjs");
	writeFileSync(fakeCli, `
if (process.argv.includes("--version")) process.exit(0);
process.stdout.write(JSON.stringify({ type: "agent_start" }) + "\\n");
setTimeout(() => {
  process.stdout.write(JSON.stringify({
    type: "tool_execution_start",
    toolCallId: "edit-1",
    toolName: "edit",
    args: { path: "changed.ts" },
  }) + "\\n");
  process.stdout.write(JSON.stringify({
    type: "tool_execution_end",
    toolCallId: "edit-1",
    toolName: "edit",
    isError: false,
  }) + "\\n");
}, 600);
setInterval(() => {}, 1_000);
`);

	let registered;
	const entries = [];
	const previous = process.cwd();
	const childMarker = process.env.TRELLIS_SUBAGENT_CHILD;
	const previousCli = process.env.TRELLIS_PI_CLI_JS;
	try {
		delete process.env.TRELLIS_SUBAGENT_CHILD;
		process.env.TRELLIS_PI_CLI_JS = fakeCli;
		process.chdir(root);
		trellisExtension({
			registerTool(tool) {
				if (tool.name === "trellis_subagent") registered = tool;
			},
			appendEntry(type, data) {
				entries.push({ type, data });
			},
			on() {},
		});
		assert.ok(registered);

		const controller = new AbortController();
		let cancelled = false;
		const result = await registered.execute(
			"call-cancel",
			{ agent: "trellis-implement", prompt: "Do the work." },
			controller.signal,
			(update) => {
				if (!cancelled && update.details.runs?.[0]?.tools?.length) {
					cancelled = true;
					controller.abort();
				}
			},
			{
				modelRegistry: {
					find() { return { provider: "deepseek", id: "deepseek-v4-pro" }; },
					hasConfiguredAuth() { return true; },
					async complete() { return { stopReason: "stop" }; },
				},
				ui: { notify() {} },
			},
		);
		assert.equal(cancelled, true);
		assert.equal(result.details.runs[0].status, "cancelled");
		assert.equal(typeof result.details.runs[0].startedAt, "number");
		assert.equal(result.details.outcome.execution.started, true);
		assert.equal(result.details.outcome.execution.timedOut, false);
		assert.deepEqual(result.details.outcome.execution.changedFiles, ["changed.ts"]);
		assert.equal(result.details.outcome.failureKind, "watchdog_or_infrastructure");
		assert.equal(entries.length, 1);
		assert.equal(entries[0].data.executionOutcome.timedOut, false);
		assert.equal(entries[0].data.failureKind, "watchdog_or_infrastructure");
	} finally {
		process.chdir(previous);
		if (childMarker === undefined) delete process.env.TRELLIS_SUBAGENT_CHILD;
		else process.env.TRELLIS_SUBAGENT_CHILD = childMarker;
		if (previousCli === undefined) delete process.env.TRELLIS_PI_CLI_JS;
		else process.env.TRELLIS_PI_CLI_JS = previousCli;
	}
});

test("extension preflight failure persists evidence and never starts a run", async () => {
	const root = mkdtempSync(join(tmpdir(), "zhui-pi-extension-"));
	mkdirSync(join(root, ".pi", "agents"), { recursive: true });
	mkdirSync(join(root, ".trellis", "workspace"), { recursive: true });
	writeFileSync(join(root, ".pi", "agents", "trellis-implement.md"), agentDefinition);

	let registered;
	const entries = [];
	const previous = process.cwd();
	const childMarker = process.env.TRELLIS_SUBAGENT_CHILD;
	try {
		delete process.env.TRELLIS_SUBAGENT_CHILD;
		process.chdir(root);
		trellisExtension({
			registerTool(tool) {
				if (tool.name === "trellis_subagent") registered = tool;
			},
			appendEntry(type, data) {
				entries.push({ type, data });
			},
			on() {},
		});
	} finally {
		process.chdir(previous);
		if (childMarker === undefined) delete process.env.TRELLIS_SUBAGENT_CHILD;
		else process.env.TRELLIS_SUBAGENT_CHILD = childMarker;
	}
	assert.ok(registered);

	const result = await registered.execute(
		"call-1",
		{ agent: "trellis-implement", prompt: "Do the work." },
		undefined,
		undefined,
		{
			modelRegistry: {
				find() { return undefined; },
				hasConfiguredAuth() { throw new Error("must not reach auth"); },
				complete() { throw new Error("must not reach readiness"); },
			},
			ui: { notify() {} },
		},
	);
	assert.equal(result.details.outcome.failureKind, "not_started");
	assert.deepEqual(result.details.runs, []);
	assert.equal(entries.length, 1);
	assert.equal(entries[0].data.failureKind, "not_started");
	const manifestPath = join(root, entries[0].data.artifact.manifestPath);
	assert.equal(existsSync(manifestPath), true);
	const manifest = JSON.parse(readFileSync(manifestPath, "utf8"));
	assert.equal(manifest.executionOutcome.started, false);
	assert.equal(manifest.acceptanceOutcome.status, "missing");
	assert.equal(manifest.failureKind, "not_started");
});
