// Standalone HTML page for the export (pure). The page has no script and loads nothing from the network:
// the stylesheet is inline and the body is the Asciidoctor output of the document.
import { withExt } from './paths';

export function escapeHtml(s: string): string {
	return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}

/** Vault path of the export: the source path with the extension ".html". */
export function exportPath(sourcePath: string): string {
	return withExt(sourcePath, 'html');
}

/** Removes remote @import rules from a stylesheet so the page makes no request for fonts. */
export function localCss(css: string): string {
	return css.replace(/@import\s+(?:url\()?["']?(?:https?:)?\/\/[^;]*;\s*/gi, '');
}

export interface PageInput {
	title: string;
	body: string;
	css: string;
	lang?: string;
	generator?: string;
}

/** A complete HTML5 document around the embedded Asciidoctor output. */
export function standalonePage(input: PageInput): string {
	const lang = /^[a-zA-Z]{2,3}(?:-[a-zA-Z0-9]{2,8})*$/.test(input.lang ?? '') ? (input.lang as string) : 'en';
	return [
		'<!DOCTYPE html>',
		`<html lang="${lang}">`,
		'<head>',
		'<meta charset="UTF-8">',
		'<meta name="viewport" content="width=device-width, initial-scale=1.0">',
		`<meta name="generator" content="${escapeHtml(input.generator ?? 'AsciiDoc Files')}">`,
		`<title>${escapeHtml(input.title)}</title>`,
		`<style>\n${localCss(input.css).trim()}\n</style>`,
		'</head>',
		'<body class="article">',
		'<div id="content">',
		input.body.trim(),
		'</div>',
		'</body>',
		'</html>',
		'',
	].join('\n');
}
