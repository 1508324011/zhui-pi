declare const process: {
	once(event: "exit", listener: () => void): void;
	removeListener(event: "exit", listener: () => void): void;
};

type FixedEditorThemeLike = {
	fg(color: string, text: string): string;
	bold?: (text: string) => string;
	italic?: (text: string) => string;
	underline?: (text: string) => string;
};

declare module "@earendil-works/pi-tui" {
	export interface Component {
		render(width: number): string[];
		invalidate?(): void;
		handleInput?(data: string): void;
	}

	export interface TUI {
		requestRender?(force?: boolean): void;
	}

	export interface EditorTheme extends FixedEditorThemeLike {}
	export interface MarkdownTheme extends FixedEditorThemeLike {}
	export interface SettingsListTheme extends FixedEditorThemeLike {}

	export type AutocompleteItem = Record<string, unknown>;
	export type AutocompleteProvider = (...args: unknown[]) => unknown;
	export type SettingItem = Record<string, unknown>;

	export interface EditorComponent extends Component {
		focused?: boolean;
		borderColor?: (str: string) => string;
		onSubmit?: (text: string) => void;
		onChange?: (text: string) => void;
		onEscape?: () => void;
		onCtrlD?: () => void;
		onPasteImage?: () => void;
		onExtensionShortcut?: (data: string) => boolean;
		actionHandlers?: Map<unknown, () => void>;
		wantsKeyRelease?: boolean;
		disableSubmit?: boolean;
		getText(): string;
		setText(text: string): void;
		addToHistory?(text: string): void;
		insertTextAtCursor?(text: string): void;
		getExpandedText?(): string;
		setAutocompleteProvider?(provider: AutocompleteProvider): void;
		setPaddingX?(padding: number): void;
		setAutocompleteMaxVisible?(maxVisible: number): void;
	}

	export class Markdown implements Component {
		constructor(...args: unknown[]);
		render(width: number): string[];
	}

	export class SettingsList implements Component {
		constructor(...args: unknown[]);
		render(width: number): string[];
		handleInput(data: string): void;
	}

	export const Key: {
		tab: string;
		shift(key: string): string;
	};

	export const CURSOR_MARKER: string;
	export function isKeyRelease(data: string): boolean;
	export function matchesKey(data: string, key: string): boolean;
	export function truncateToWidth(
		text: string,
		width: number,
		ellipsis?: string,
		preserveAnsi?: boolean,
	): string;
	export function visibleWidth(text: string): number;
}

declare module "@earendil-works/pi-coding-agent" {
	import type {
		Component,
		EditorComponent,
		EditorTheme,
		TUI,
	} from "@earendil-works/pi-tui";

	export interface Theme extends FixedEditorThemeLike {}
	export type ThemeColor = string;
	export type KeybindingsManager = Record<string, unknown>;
	export type PiModel = Record<string, unknown>;
	export type ExtensionCommandContext = ExtensionContext;
	export type EditorFactory = (
		tui: TUI,
		theme: EditorTheme,
		keybindings: KeybindingsManager,
	) => EditorComponent;

	export interface ExtensionContext {
		cwd: string;
		mode?: string;
		hasUI: boolean;
		model?: PiModel;
		modelRegistry: {
			getApiKeyAndHeaders(model: PiModel): Promise<Record<string, unknown>>;
			getAvailable(): PiModel[];
			getAll(): PiModel[];
		};
		ui: {
			theme: Theme;
			custom<T>(
				render: (
					tui: TUI,
					theme: Theme,
					keybindings: KeybindingsManager,
					done: (value: T) => void,
				) => Component,
			): Promise<T>;
			getEditorComponent(): EditorFactory | undefined;
			notify(message: string, level?: string): void;
			setEditorComponent(factory: EditorFactory | undefined): void;
			setFooter(
				factory:
					| ((tui: TUI, theme: Theme, footerData: unknown) => Component)
					| undefined,
			): void;
			setHeader(
				factory:
					| ((tui: TUI) => Component | { render(width: number): string[] })
					| undefined,
			): void;
			setStatus(key: string, value: string | undefined): void;
			setWidget(
				key: string,
				factory: string[] | ((tui: TUI, theme: Theme) => Component) | undefined,
				options?: { placement?: string },
			): void;
			setWorkingIndicator(value?: unknown): void;
			setWorkingMessage(value?: string): void;
			setWorkingVisible(value: boolean): void;
		};
	}

	export type ExtensionEvent = {
		message: {
			role?: string;
			stopReason?: string;
			[key: string]: unknown;
		};
		[key: string]: unknown;
	};

	export interface ExtensionAPI {
		on(
			event: string,
			handler: (event: ExtensionEvent, ctx: ExtensionContext) => unknown,
		): void;
		registerCommand(
			name: string,
			command: {
				description?: string;
				handler: (args: string, ctx: ExtensionCommandContext) => unknown;
			},
		): void;
		getThinkingLevel(): string | undefined;
	}

	export class CustomEditor implements EditorComponent {
		constructor(...args: unknown[]);
		focused?: boolean;
		borderColor?: (str: string) => string;
		onSubmit?: (text: string) => void;
		onChange?: (text: string) => void;
		onEscape?: () => void;
		onCtrlD?: () => void;
		onPasteImage?: () => void;
		onExtensionShortcut?: (data: string) => boolean;
		actionHandlers?: Map<unknown, () => void>;
		wantsKeyRelease?: boolean;
		disableSubmit?: boolean;
		protected tui?: TUI;
		render(width: number): string[];
		invalidate(): void;
		handleInput(data: string): void;
		getText(): string;
		setText(text: string): void;
		addToHistory(text: string): void;
		submitValue(): void;
	}

	export class AssistantMessageComponent implements Component {
		constructor(...args: unknown[]);
		render(width: number): string[];
	}
	export class BashExecutionComponent implements Component {
		constructor(...args: unknown[]);
		render(width: number): string[];
	}
	export class ModelSelectorComponent implements Component {
		constructor(...args: unknown[]);
		render(width: number): string[];
	}
	export class SettingsSelectorComponent implements Component {
		constructor(...args: unknown[]);
		render(width: number): string[];
	}
	export class ToolExecutionComponent implements Component {
		constructor(...args: unknown[]);
		render(width: number): string[];
	}
	export class UserMessageComponent implements Component {
		constructor(...args: unknown[]);
		render(width: number): string[];
	}

	export function copyToClipboard(text: string): void | Promise<void>;
	export function getAgentDir(): string;
	export function getSettingsListTheme(
		theme: Theme,
	): import("@earendil-works/pi-tui").SettingsListTheme;
}
