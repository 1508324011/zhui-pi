import assert from "node:assert/strict";
import { accessSync } from "node:fs";
import { resolve } from "node:path";
import test from "node:test";
import {
	classifyOutcome,
	parseAcceptanceReport,
	runDispatchPreflight,
} from "../templates/project-trellis/extensions/trellis/runtime-contract.js";

const model = { provider: "deepseek", id: "deepseek-v4-pro" };
const executable = process.execPath;

function deps(overrides = {}) {
	return {
		resolveModel: () => model,
		hasAuth: () => true,
		checkExecutable: () => {
			accessSync(executable);
			return true;
		},
		checkReadiness: async () => undefined,
		...overrides,
	};
}

function validReport(overrides = {}) {
	return {
		criteriaSatisfied: [{ criterion: "works", status: "satisfied", evidence: "test" }],
		changedFiles: ["a.ts"],
		testsAddedOrUpdated: ["a.test.ts"],
		commandsRun: [{ command: "node --test", result: "passed" }],
		validationOutput: ["ok"],
		residualRisks: [],
		noStagedFiles: true,
		diffSummary: "done",
		reviewFindings: [],
		manualNotes: [],
		...overrides,
	};
}

function fenced(report) {
	return `result\n\n\`\`\`acceptance-report\n${JSON.stringify(report)}\n\`\`\``;
}

test("preflight succeeds with resolved model, executable, auth, and readiness", async () => {
	const report = await runDispatchPreflight({
		agent: "trellis-implement",
		modelRef: "deepseek/deepseek-v4-pro",
		dependencies: deps(),
		readinessTimeoutMs: 100,
	});
	assert.equal(report.ok, true);
	assert.equal(report.provider, "deepseek");
	assert.equal(report.modelCatalog, "resolved");
});

test("preflight rejects model, executable, and auth failures before readiness", async () => {
	let readinessCalls = 0;
	for (const failure of ["model", "executable", "auth"]) {
		const report = await runDispatchPreflight({
			agent: "agent",
			modelRef: "deepseek/deepseek-v4-pro",
			dependencies: deps({
				resolveModel: () => (failure === "model" ? undefined : model),
				checkExecutable: () => failure !== "executable",
				hasAuth: () => failure !== "auth",
				checkReadiness: async () => {
					readinessCalls += 1;
				},
			}),
		});
		assert.equal(report.ok, false);
		assert.equal(report.failureKind, failure === "auth" ? "provider_auth_or_quota" : "not_started");
	}
	assert.equal(readinessCalls, 0);
});

test("readiness failures and timeout are bounded provider failures", async () => {
	const failed = await runDispatchPreflight({
		agent: "agent",
		modelRef: "deepseek/deepseek-v4-pro",
		dependencies: deps({ checkReadiness: async () => { throw new Error("quota exceeded"); } }),
	});
	assert.equal(failed.failureKind, "provider_auth_or_quota");

	const timed = await runDispatchPreflight({
		agent: "agent",
		modelRef: "deepseek/deepseek-v4-pro",
		dependencies: deps({ checkReadiness: async (_model, signal) => new Promise((_, reject) => signal.addEventListener("abort", () => reject(new Error("aborted")))) }),
		readinessTimeoutMs: 10,
	});
	assert.equal(timed.ok, false);
	assert.equal(timed.readiness, "timeout");
});

test("acceptance parser requires the exact formal report contract", () => {
	assert.equal(parseAcceptanceReport("ordinary success").status, "missing");
	assert.equal(parseAcceptanceReport("```acceptance-report\n{}\n```").status, "invalid");
	assert.equal(parseAcceptanceReport(fenced(validReport())).status, "accepted");
	assert.equal(parseAcceptanceReport(fenced(validReport({ commandsRun: [] }))).status, "accepted");

	const missingRootField = validReport();
	delete missingRootField.manualNotes;
	const invalidReports = [
		missingRootField,
		{ ...validReport(), unexpected: true },
		validReport({ criteriaSatisfied: [{ status: "satisfied", evidence: "test" }] }),
		validReport({ criteriaSatisfied: [{ criterion: "works", status: "satisfied" }] }),
		validReport({ criteriaSatisfied: [{ criterion: "", status: "satisfied", evidence: "test" }] }),
		validReport({ criteriaSatisfied: [{ criterion: "works", status: "satisfied", evidence: " " }] }),
		validReport({ criteriaSatisfied: [{ criterion: "works", status: "satisfied", evidence: "test", extra: true }] }),
		validReport({ commandsRun: [{ result: "passed" }] }),
		validReport({ commandsRun: [{ command: "", result: "passed" }] }),
		validReport({ commandsRun: [{ command: "node --test", result: "passed", extra: true }] }),
		validReport({ changedFiles: [""] }),
		validReport({ testsAddedOrUpdated: [42] }),
		validReport({ validationOutput: [true] }),
		validReport({ residualRisks: [{}] }),
		validReport({ reviewFindings: [null] }),
		validReport({ manualNotes: [1] }),
		validReport({ diffSummary: " " }),
	];
	for (const report of invalidReports)
		assert.equal(parseAcceptanceReport(fenced(report)).status, "invalid");

	assert.equal(
		parseAcceptanceReport(`${fenced(validReport())}\n${fenced(validReport())}`).status,
		"invalid",
	);
});

test("acceptance parser rejects unmet, failed, or staged formal reports", () => {
	assert.equal(parseAcceptanceReport(fenced(validReport({
		criteriaSatisfied: [{ criterion: "works", status: "not-satisfied", evidence: "still failing" }],
	}))).status, "rejected");
	assert.equal(parseAcceptanceReport(fenced(validReport({
		commandsRun: [{ command: "node --test", result: "failed" }],
	}))).status, "rejected");
	assert.equal(parseAcceptanceReport(fenced(validReport({ noStagedFiles: false }))).status, "rejected");
});

test("outcome taxonomy separates execution from acceptance", () => {
	const accepted = parseAcceptanceReport(fenced(validReport()));
	assert.equal(classifyOutcome({ started: false, failed: true, timedOut: false, changedFiles: [], failedValidation: false }, parseAcceptanceReport("")), "not_started");
	assert.equal(classifyOutcome({ started: true, failed: true, timedOut: false, changedFiles: ["a.ts"], failedValidation: false }, parseAcceptanceReport("")), "watchdog_or_infrastructure");
	assert.equal(classifyOutcome({ started: true, failed: true, timedOut: true, changedFiles: ["a.ts"], failedValidation: false }, parseAcceptanceReport("")), "timeout_after_changes");
	assert.equal(classifyOutcome({ started: true, failed: true, timedOut: false, changedFiles: ["a.ts"], failedValidation: true }, parseAcceptanceReport("")), "test_failure");
	assert.equal(classifyOutcome({ started: true, failed: false, timedOut: false, changedFiles: [], failedValidation: false }, parseAcceptanceReport("")), "missing_acceptance_report");
	assert.equal(classifyOutcome({ started: true, failed: false, timedOut: false, changedFiles: [], failedValidation: false }, accepted), "accepted_completion");
	assert.equal(classifyOutcome({ started: true, failed: true, timedOut: false, changedFiles: [], failedValidation: false }, parseAcceptanceReport("")), "watchdog_or_infrastructure");
});
