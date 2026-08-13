// @ts-check

import { spawnSync } from "node:child_process";

/** @typedef {"not_started" | "provider_auth_or_quota" | "watchdog_or_infrastructure" | "timeout_after_changes" | "test_failure" | "missing_acceptance_report" | "acceptance_rejected" | "accepted_completion"} FailureKind */
/** @typedef {"satisfied" | "not-satisfied" | "not-applicable"} AcceptanceCriterionStatus */
/** @typedef {"passed" | "failed" | "not-run"} AcceptanceCommandResult */
/**
 * @typedef {object} AcceptanceCriterion
 * @property {string} criterion
 * @property {AcceptanceCriterionStatus} status
 * @property {string} evidence
 */
/**
 * @typedef {object} AcceptanceCommand
 * @property {string} command
 * @property {AcceptanceCommandResult} result
 */
/**
 * @typedef {object} AcceptanceReport
 * @property {AcceptanceCriterion[]} criteriaSatisfied
 * @property {string[]} changedFiles
 * @property {string[]} testsAddedOrUpdated
 * @property {AcceptanceCommand[]} commandsRun
 * @property {string[]} validationOutput
 * @property {string[]} residualRisks
 * @property {boolean} noStagedFiles
 * @property {string} diffSummary
 * @property {string[]} reviewFindings
 * @property {string[]} manualNotes
 */
/**
 * @typedef {
 *   | {status: "missing" | "invalid", report: null, error: string}
 *   | {status: "rejected", report: AcceptanceReport, error: string}
 *   | {status: "accepted", report: AcceptanceReport, error?: never}
 * } AcceptanceOutcome
 */
/**
 * @typedef {object} PreflightReport
 * @property {string} agent
 * @property {string | null} model
 * @property {string | null} provider
 * @property {"missing" | "resolved"} modelCatalog
 * @property {"missing" | "available"} executable
 * @property {"missing" | "available"} auth
 * @property {"not-run" | "ready" | "timeout" | "failed"} readiness
 * @property {number} readinessTimeoutMs
 * @property {boolean} ok
 * @property {FailureKind} [failureKind]
 * @property {string} [error]
 */
/**
 * @typedef {object} DispatchPreflightDependencies
 * @property {(provider: string, model: string) => unknown} resolveModel
 * @property {(model: unknown) => boolean} hasAuth
 * @property {() => boolean} checkExecutable
 * @property {(model: unknown, signal: AbortSignal) => Promise<void>} checkReadiness
 */
/**
 * @typedef {object} DispatchPreflightArgs
 * @property {string} agent
 * @property {string} [modelRef]
 * @property {DispatchPreflightDependencies} dependencies
 * @property {number} [readinessTimeoutMs]
 */
/**
 * @typedef {object} ExecutionOutcome
 * @property {boolean} started
 * @property {boolean} failed
 * @property {boolean} timedOut
 * @property {string[]} changedFiles
 * @property {boolean} failedValidation
 * @property {string} errorText
 */

const ACCEPTANCE_FENCE = /```acceptance-report\s*\n([\s\S]*?)\n```/g;
const READINESS_TIMEOUT_MS = 15_000;

/**
 * @param {string} modelRef
 * @returns {{provider: string, model: string} | null}
 */
function splitModelRef(modelRef) {
	const withoutThinking = modelRef.replace(/:(off|minimal|low|medium|high|xhigh|max)$/i, "");
	const slash = withoutThinking.indexOf("/");
	if (slash <= 0 || slash === withoutThinking.length - 1) return null;
	return { provider: withoutThinking.slice(0, slash), model: withoutThinking.slice(slash + 1) };
}

/**
 * @param {number | undefined} value
 * @returns {number}
 */
function boundedTimeout(value) {
	if (typeof value !== "number" || !Number.isFinite(value)) return READINESS_TIMEOUT_MS;
	return Math.max(250, Math.min(30_000, Math.floor(value)));
}

/**
 * @param {unknown} error
 * @returns {string}
 */
function errorMessage(error) {
	return error instanceof Error ? error.message : String(error);
}

/**
 * @param {string} text
 * @returns {boolean}
 */
function authOrQuota(text) {
	return /\b(401|403|429|auth(?:entication|orization)?|credential|api[ _-]?key|quota|rate[ _-]?limit|insufficient[ _-]?balance)\b/i.test(text);
}

/**
 * @param {DispatchPreflightArgs} args
 * @returns {Promise<PreflightReport>}
 */
export async function runDispatchPreflight(args) {
	const timeoutMs = boundedTimeout(args.readinessTimeoutMs);
	const parsed = args.modelRef ? splitModelRef(args.modelRef) : null;
	/** @type {PreflightReport} */
	const report = {
		agent: args.agent,
		model: args.modelRef ?? null,
		provider: parsed?.provider ?? null,
		modelCatalog: "missing",
		executable: "missing",
		auth: "missing",
		readiness: "not-run",
		readinessTimeoutMs: timeoutMs,
		ok: false,
	};
	if (!parsed) {
		return { ...report, failureKind: "not_started", error: "A fully qualified provider/model is required." };
	}
	const model = args.dependencies.resolveModel(parsed.provider, parsed.model);
	if (!model) {
		return { ...report, failureKind: "not_started", error: `Model is absent from the Pi catalog: ${args.modelRef}` };
	}
	report.modelCatalog = "resolved";
	if (!args.dependencies.checkExecutable()) {
		return { ...report, failureKind: "not_started", error: "Pi executable is unavailable." };
	}
	report.executable = "available";
	if (!args.dependencies.hasAuth(model)) {
		return { ...report, failureKind: "provider_auth_or_quota", error: `Credentials are unavailable for ${parsed.provider}.` };
	}
	report.auth = "available";

	const controller = new AbortController();
	/** @type {ReturnType<typeof setTimeout> | undefined} */
	let timer;
	try {
		await Promise.race([
			args.dependencies.checkReadiness(model, controller.signal),
			new Promise((_resolve, reject) => {
				timer = setTimeout(() => {
					controller.abort();
					reject(new Error(`Provider readiness timed out after ${timeoutMs}ms.`));
				}, timeoutMs);
			}),
		]);
		report.readiness = "ready";
		report.ok = true;
		return report;
	} catch (error) {
		const message = errorMessage(error);
		report.readiness = /timed out/i.test(message) ? "timeout" : "failed";
		return {
			...report,
			failureKind: authOrQuota(message) ? "provider_auth_or_quota" : "watchdog_or_infrastructure",
			error: message,
		};
	} finally {
		if (timer) clearTimeout(timer);
	}
}

const ACCEPTANCE_REPORT_KEYS = [
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
const ACCEPTANCE_CRITERION_KEYS = ["criterion", "status", "evidence"];
const ACCEPTANCE_COMMAND_KEYS = ["command", "result"];
const ACCEPTANCE_STATUSES = new Set(["satisfied", "not-satisfied", "not-applicable"]);
const COMMAND_RESULTS = new Set(["passed", "failed", "not-run"]);

/**
 * @param {Record<string, unknown>} value
 * @param {string[]} expected
 * @returns {boolean}
 */
function hasExactKeys(value, expected) {
	const actual = Object.keys(value);
	return actual.length === expected.length && expected.every((key) => Object.hasOwn(value, key));
}

/**
 * @param {unknown} value
 * @returns {value is string}
 */
function isNonEmptyString(value) {
	return typeof value === "string" && value.trim().length > 0;
}

/**
 * @param {unknown} value
 * @param {boolean} [requireNonEmptyItems]
 * @returns {value is string[]}
 */
function isStringArray(value, requireNonEmptyItems = false) {
	return Array.isArray(value) && value.every((item) =>
		typeof item === "string" && (!requireNonEmptyItems || item.trim().length > 0));
}

/**
 * @param {unknown} value
 * @returns {AcceptanceReport | null}
 */
function validateAcceptance(value) {
	if (!value || typeof value !== "object" || Array.isArray(value)) return null;
	const report = /** @type {Record<string, unknown>} */ (value);
	if (!hasExactKeys(report, ACCEPTANCE_REPORT_KEYS)) return null;
	if (!Array.isArray(report.criteriaSatisfied) || report.criteriaSatisfied.length === 0) return null;
	if (!report.criteriaSatisfied.every((item) => {
		if (!item || typeof item !== "object" || Array.isArray(item)) return false;
		const criterion = item;
		return hasExactKeys(criterion, ACCEPTANCE_CRITERION_KEYS)
			&& isNonEmptyString(criterion.criterion)
			&& typeof criterion.status === "string"
			&& ACCEPTANCE_STATUSES.has(criterion.status)
			&& isNonEmptyString(criterion.evidence);
	})) return null;
	if (!Array.isArray(report.commandsRun) || !report.commandsRun.every((item) => {
		if (!item || typeof item !== "object" || Array.isArray(item)) return false;
		const command = item;
		return hasExactKeys(command, ACCEPTANCE_COMMAND_KEYS)
			&& isNonEmptyString(command.command)
			&& typeof command.result === "string"
			&& COMMAND_RESULTS.has(command.result);
	})) return null;
	for (const key of ["changedFiles", "testsAddedOrUpdated"])
		if (!isStringArray(report[key], true)) return null;
	for (const key of ["validationOutput", "residualRisks", "reviewFindings", "manualNotes"])
		if (!isStringArray(report[key])) return null;
	if (typeof report.noStagedFiles !== "boolean" || !isNonEmptyString(report.diffSummary)) return null;
	return /** @type {AcceptanceReport} */ (report);
}

/**
 * @param {string} output
 * @returns {AcceptanceOutcome}
 */
export function parseAcceptanceReport(output) {
	const matches = [...output.matchAll(ACCEPTANCE_FENCE)];
	if (matches.length === 0) return { status: "missing", report: null, error: "No fenced acceptance-report JSON block was returned." };
	if (matches.length !== 1) return { status: "invalid", report: null, error: "Exactly one acceptance-report block is required." };
	let parsed;
	try {
		parsed = JSON.parse(matches[0][1]);
	} catch (error) {
		return { status: "invalid", report: null, error: `Invalid acceptance-report JSON: ${errorMessage(error)}` };
	}
	const report = validateAcceptance(parsed);
	if (!report) return { status: "invalid", report: null, error: "acceptance-report does not match the required contract." };
	const criteriaAccepted = report.criteriaSatisfied.every((item) => item.status !== "not-satisfied");
	const commandsAccepted = report.commandsRun.every((item) => item.result !== "failed");
	if (!criteriaAccepted || !commandsAccepted || !report.noStagedFiles)
		return { status: "rejected", report, error: "acceptance-report contains an unmet criterion, failed command, or staged files." };
	return { status: "accepted", report };
}

/**
 * @param {AcceptanceReport} report
 * @returns {boolean}
 */
function hasFailedCommand(report) {
	return report.commandsRun.some((command) => command.result === "failed");
}

/**
 * @param {ExecutionOutcome} execution
 * @param {AcceptanceOutcome} acceptance
 * @param {PreflightReport | null | undefined} [preflight]
 * @returns {FailureKind}
 */
export function classifyOutcome(execution, acceptance, preflight) {
	if (preflight && !preflight.ok) return preflight.failureKind ?? "not_started";
	if (authOrQuota(execution.errorText)) return "provider_auth_or_quota";
	if (!execution.started) return "not_started";
	if (execution.timedOut && execution.changedFiles.length > 0) return "timeout_after_changes";
	if (execution.failedValidation || (acceptance.report && hasFailedCommand(acceptance.report))) return "test_failure";
	if (execution.failed) return "watchdog_or_infrastructure";
	if (acceptance.status === "missing" || acceptance.status === "invalid") return "missing_acceptance_report";
	if (acceptance.status !== "accepted") return "acceptance_rejected";
	return "accepted_completion";
}

/**
 * @param {string} command
 * @param {string[]} args
 * @returns {boolean}
 */
export function executableAvailable(command, args) {
	const result = spawnSync(command, [...args, "--version"], {
		encoding: "utf8",
		timeout: 2_000,
		windowsHide: true,
	});
	return !result.error && result.status === 0;
}
