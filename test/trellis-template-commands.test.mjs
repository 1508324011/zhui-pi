import assert from "node:assert/strict";
import { readdirSync, readFileSync, statSync } from "node:fs";
import { join, resolve } from "node:path";
import test from "node:test";

const templateRoot = resolve(import.meta.dirname, "../templates/project-trellis");

function readTemplateFiles(directory) {
	return readdirSync(directory).flatMap((name) => {
		const path = join(directory, name);
		return statSync(path).isDirectory()
			? readTemplateFiles(path)
			: [{ path, content: readFileSync(path, "utf8") }];
	});
}

test("project Trellis templates use only supported get_context.py modes", () => {
	const files = readTemplateFiles(templateRoot);
	const source = files.map(({ path, content }) => `${path}\n${content}`).join("\n");

	assert.doesNotMatch(source, /get_context\.py[^\n`]*--mode\s+phase/u);
	assert.doesNotMatch(source, /get_context\.py[^\n`]*--step(?:\s|=)/u);
	assert.doesNotMatch(source, /get_context\.py[^\n`]*--platform(?:\s|=)/u);
	assert.doesNotMatch(source, /runContextScript\([^)]*\[\s*["']--mode["']\s*,\s*["']phase["']/su);

	assert.match(source, /get_context\.py --mode packages/u);
	assert.match(source, /get_context\.py[^\n`]*--mode\s+record|["']--mode["']\s*,\s*["']record["']/u);
	assert.match(source, /const args = \[["']--mode["'], ["']json["'], ["']-p["'], ["']--no-session["']\]/u);
});

test("project Trellis startup context keeps one session overview without fabricating workflow content", () => {
	const extension = readFileSync(
		join(templateRoot, "extensions", "trellis", "index.ts"),
		"utf8",
	);

	assert.match(
		extension,
		/function sessionOverview[\s\S]*?runContextScript\(root, key, \[\]\)[\s\S]*?<session-overview>/u,
	);
	assert.match(extension, /startup = buildStartupContext\(turn\.ov\)/u);
	assert.doesNotMatch(extension, /function workflowOverview\b/u);
	assert.doesNotMatch(extension, /<trellis-workflow>/u);
});
