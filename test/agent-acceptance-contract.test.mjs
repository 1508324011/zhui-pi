import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import test from "node:test";

const repoRoot = resolve(import.meta.dirname, "..");
const agentsDir = resolve(repoRoot, "templates", "project-trellis", "agents");

const AGENT_FILES = [
	"trellis-implement.md",
	"trellis-check.md",
	"trellis-research.md",
];

const REPORT_FIELDS = [
	"criteriaSatisfied",
	"changedFiles",
	"testsAddedOrUpdated",
	"commandsRun",
	"validationOutput",
	"residualRisks",
	"noStagedFiles",
	"diffSummary",
	"reviewFindings",
	"manualNotes",
];

const STATUS_ENUMS = ["satisfied", "not-satisfied", "not-applicable"];
const RESULT_ENUMS = ["passed", "failed", "not-run"];

for (const file of AGENT_FILES) {
	test(`${file} defines the full acceptance-report contract`, () => {
		const content = readFileSync(resolve(agentsDir, file), "utf8");
		assert.ok(
			content.includes("```acceptance-report"),
			`${file} must contain the literal acceptance-report fence`,
		);
		assert.match(
			content,
			/`json`[^\n]*is not a substitute/,
			`${file} must forbid a plain json fence as a substitute`,
		);
		for (const field of REPORT_FIELDS)
			assert.ok(content.includes(field), `${file} must name field ${field}`);
		for (const value of [...STATUS_ENUMS, ...RESULT_ENUMS])
			assert.ok(content.includes(value), `${file} must name enum value ${value}`);
	});
}
