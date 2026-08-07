/// <reference path="../../../types/fixed-editor-peer-shims.d.ts" />

/**
 * Probe widget and lifecycle for the fixed editor compositor.
 *
 * A "probe" widget is registered via `ctx.ui.setWidget` with
 * `placement: "aboveEditor"`. On first render it provides the TUI instance,
 * which the compositor needs to patch internal methods.
 *
 * @internal
 */

import type { ExtensionContext } from "@earendil-works/pi-coding-agent";
import { type Component, type TUI, visibleWidth } from "@earendil-works/pi-tui";

import type { PolishedTuiConfig } from "../config";
import type { SessionLifecycle } from "../session-lifecycle";
import { renderStyleForSourceOrFallback } from "../style";
import { TerminalSplitCompositor } from "./compositor";
import { inspectPiTui } from "./pi-compat";

let compositor: TerminalSplitCompositor | null = null;
let compositorTui: TUI | null = null;
let didWarnUnsupported = false;
let copyNoticeTimer: ReturnType<typeof setTimeout> | null = null;
let storedCtx: ExtensionContext | null = null;
let cancelProbeInstall: (() => void) | null = null;
let cancelProbeRetry: (() => void) | null = null;
let probeRetryCount = 0;
let editorTuiSeen = false;
const COPY_NOTICE_KEY = "zentui-copy-notice";
const COPY_NOTICE_MS = 2500;
const PROBE_RETRY_DELAY_MS = 100;
const PROBE_RETRY_LIMIT = 80;

function clearCopyNotice(ctx: ExtensionContext): void {
	if (copyNoticeTimer) {
		clearTimeout(copyNoticeTimer);
		copyNoticeTimer = null;
	}
	if (!ctx.hasUI || typeof ctx.ui.setWidget !== "function") return;
	ctx.ui.setWidget(COPY_NOTICE_KEY, undefined);
}

/** Centered bordered box showing the copy notice. */
class CopyNoticeComponent implements Component {
	private readonly text: string;
	private readonly border: string;

	constructor(text: string, border: string) {
		this.text = text;
		this.border = border;
	}

	render(width: number): string[] {
		const inner = " ".repeat(2) + this.text + " ".repeat(2);
		const innerWidth = visibleWidth(inner);
		const leftPad = Math.max(0, Math.floor((width - innerWidth - 2) / 2));
		const pad = " ".repeat(leftPad);
		const bar = "─".repeat(innerWidth);
		return [
			`${pad}${this.border}┌${bar}┐`,
			`${pad}${this.border}│${inner}│`,
			`${pad}${this.border}└${bar}┘`,
		];
	}

	invalidate(): void {}
}

function showCopyNotice(
	ctx: ExtensionContext,
	getConfig: () => PolishedTuiConfig,
): void {
	if (!ctx.hasUI || typeof ctx.ui.setWidget !== "function") return;
	const config = getConfig();
	ctx.ui.setWidget(COPY_NOTICE_KEY, (_tui, theme) => {
		const text = renderStyleForSourceOrFallback(
			theme,
			config.colorSources.editor,
			undefined,
			{ terminal: "yellow", theme: "warning" },
			"Copied to clipboard",
		);
		const border = renderStyleForSourceOrFallback(
			theme,
			config.colorSources.editor,
			config.colors.editorBorder,
			{ terminal: "yellow", theme: "border" },
			"",
		);
		return new CopyNoticeComponent(text, border);
	});
	if (copyNoticeTimer) clearTimeout(copyNoticeTimer);
	copyNoticeTimer = setTimeout(() => {
		copyNoticeTimer = null;
		if (storedCtx !== ctx) return;
		if (!ctx.hasUI || typeof ctx.ui.setWidget !== "function") return;
		ctx.ui.setWidget(COPY_NOTICE_KEY, undefined);
	}, COPY_NOTICE_MS);
}

/**
 * Minimal component that triggers a callback on first render, then returns [].
 */
class ProbeComponent implements Component {
	private readonly onInstall: () => void;

	constructor(onInstall: () => void) {
		this.onInstall = onInstall;
	}

	render(): string[] {
		if (
			!editorTuiSeen &&
			!compositor &&
			!cancelProbeInstall &&
			probeRetryCount < PROBE_RETRY_LIMIT
		) {
			this.onInstall();
		}
		return [];
	}

	invalidate(): void {}
}

function warnUnsupported(ctx: ExtensionContext): void {
	if (didWarnUnsupported || !ctx.hasUI) return;
	didWarnUnsupported = true;
}

type InstallSource = "editor" | "probe";

function installFromProbe(
	ctx: ExtensionContext,
	tui: TUI,
	getConfig: () => PolishedTuiConfig,
	source: InstallSource,
): boolean {
	if (compositor) {
		if (compositorTui === tui) return true;
		if (source === "probe") return true;
		compositor.dispose();
		compositor = null;
		compositorTui = null;
	}
	try {
		const config = getConfig();
		if (!config.fixedEditor?.enabled) return true;

		const capabilities = inspectPiTui(tui);
		if (!capabilities) return false;

		const next = new TerminalSplitCompositor(
			capabilities,
			() => ({
				enabled: getConfig().fixedEditor?.enabled ?? false,
				mouseScroll: getConfig().fixedEditor?.mouseScroll ?? false,
				copyNotice: getConfig().fixedEditor?.copyNotice ?? true,
			}),
			ctx.hasUI ? () => showCopyNotice(ctx, getConfig) : undefined,
			ctx.hasUI ? () => clearCopyNotice(ctx) : undefined,
		);

		if (!next.install()) return false;

		compositor = next;
		compositorTui = tui;
		return true;
	} catch {
		return false;
	}
}

function cancelPendingProbeWork(): void {
	cancelProbeInstall?.();
	cancelProbeInstall = null;
	cancelProbeRetry?.();
	cancelProbeRetry = null;
}

function scheduleProbeAttempt(
	ctx: ExtensionContext,
	tui: TUI,
	getConfig: () => PolishedTuiConfig,
	lifecycle: SessionLifecycle,
	source: InstallSource,
): void {
	cancelProbeRetry?.();
	cancelProbeRetry = null;
	if (!lifecycle.isCurrent()) return;

	const installed = installFromProbe(ctx, tui, getConfig, source);
	if (installed) {
		cancelPendingProbeWork();
		probeRetryCount = 0;
		return;
	}

	probeRetryCount += 1;
	if (probeRetryCount >= PROBE_RETRY_LIMIT) {
		warnUnsupported(ctx);
		return;
	}

	cancelProbeRetry = lifecycle.defer(() => {
		cancelProbeRetry = null;
		scheduleProbeAttempt(ctx, tui, getConfig, lifecycle, source);
	}, PROBE_RETRY_DELAY_MS);
}

export function scheduleFixedEditorInstall(
	ctx: ExtensionContext,
	tui: TUI,
	getConfig: () => PolishedTuiConfig,
	lifecycle: SessionLifecycle,
): void {
	if (!lifecycle.isCurrent() || !ctx.hasUI) return;
	editorTuiSeen = true;
	if (!getConfig().fixedEditor?.enabled) return;
	cancelPendingProbeWork();
	probeRetryCount = 0;
	scheduleProbeAttempt(ctx, tui, getConfig, lifecycle, "editor");
}

const WIDGET_KEY = "zentui-fixed-editor-probe";

/**
 * Register the fixed-editor probe widget.
 * Call from session_start after editor + footer install.
 * Only activates when `fixedEditor.enabled` is true.
 */
export function installFixedEditorProbe(
	ctx: ExtensionContext,
	getConfig: () => PolishedTuiConfig,
	lifecycle: SessionLifecycle,
): void {
	if (!lifecycle.isCurrent() || !ctx.hasUI) return;
	if (typeof ctx.ui.setWidget !== "function") return;
	didWarnUnsupported = false;
	storedCtx = ctx;
	if (!editorTuiSeen) {
		cancelPendingProbeWork();
		probeRetryCount = 0;
	}

	ctx.ui.setWidget(
		WIDGET_KEY,
		(tui: TUI) =>
			new ProbeComponent(() => {
				cancelProbeInstall = lifecycle.queueMicrotask(() => {
					cancelProbeInstall = lifecycle.queueMicrotask(() => {
						cancelProbeInstall = null;
						scheduleProbeAttempt(ctx, tui, getConfig, lifecycle, "probe");
					});
				});
			}),
		{ placement: "aboveEditor" },
	);
}

/**
 * Dispose the compositor if active.
 * Call from session_shutdown and cleanupUi.
 */
export function disposeFixedEditor(ctx?: ExtensionContext): void {
	cancelPendingProbeWork();
	probeRetryCount = 0;
	editorTuiSeen = false;
	compositor?.dispose();
	compositor = null;
	compositorTui = null;
	if (copyNoticeTimer) {
		clearTimeout(copyNoticeTimer);
		copyNoticeTimer = null;
	}
	storedCtx = null;
	if (ctx) clearCopyNotice(ctx);
}

/**
 * Remove the probe widget without disposing an active compositor.
 * Useful for full UI cleanup.
 */
export function removeFixedEditorProbe(ctx: ExtensionContext): void {
	cancelPendingProbeWork();
	probeRetryCount = 0;
	if (!ctx.hasUI) return;
	if (typeof ctx.ui.setWidget !== "function") return;
	ctx.ui.setWidget(WIDGET_KEY, undefined);
}
