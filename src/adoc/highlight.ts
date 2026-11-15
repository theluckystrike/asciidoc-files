// Line tokenizer for the AsciiDoc source editor (pure). The editor turns spans into CodeMirror mark decorations.
import { NO_BLOCK, isLineComment, stepBlock, type BlockState } from './blocks';
import { matchAlts, type Alt } from './no-lookbehind';

export interface Span {
	from: number;
	to: number;
	cls: string;
}

// strong and em had a lookbehind before the single mark (no lookbehind on iOS before 16.4). They are alternatives now.
const INLINE: { re?: RegExp; alts?: Alt[]; cls: string }[] = [
	{ re: /\b(?:xref|link|image|include|kbd|btn|menu|footnote|anchor|pass|stem|latexmath|asciimath):{1,2}[^\s[]*\[[^\]]*\]/g, cls: 'macro' },
	{ re: /\bhttps?:\/\/[^\s[<>]+(?:\[[^\]]*\])?/g, cls: 'url' },
	{ re: /<<[^<>]+>>/g, cls: 'xref' },
	{ re: /\[\[[^\]]+\]\]/g, cls: 'anchor' },
	{ re: /\{[\w-]+\}/g, cls: 'attr-ref' },
	{ re: /`[^`\n]+`/g, cls: 'mono' },
	{ alts: [{ re: /\*[^*\s](?:[^*]*[^*\s])?\*(?![\w*])/, notAfter: /[\w*]/ }, { re: /\*\*[^*]+\*\*/ }], cls: 'strong' },
	{ alts: [{ re: /_[^_\s](?:[^_]*[^_\s])?_(?![\w_])/, notAfter: /[\w_]/ }, { re: /__[^_]+__/ }], cls: 'em' },
	{ re: /#[^#\s](?:[^#]*[^#\s])?#/g, cls: 'mark' },
];

/** Inline spans of a text line, first match wins on overlap. */
export function inlineSpans(line: string, offset = 0): Span[] {
	const spans: Span[] = [];
	for (const { re, alts, cls } of INLINE) {
		const found = alts ? matchAlts(line, alts) : [...line.matchAll(re!)].map((m) => ({ index: m.index ?? 0, text: m[0] }));
		for (const m of found) {
			const from = m.index + offset;
			const to = from + m.text.length;
			if (!spans.some((s) => from < s.to && to > s.from)) spans.push({ from, to, cls });
		}
	}
	return spans.sort((a, b) => a.from - b.from);
}

function wholeLine(line: string, cls: string): Span[] {
	return line.length ? [{ from: 0, to: line.length, cls }] : [];
}

/** Spans of a line outside any block (titles, attribute entries, block attributes, lists, admonitions). */
function structural(line: string): Span[] {
	const title = /^(={1,6}|#{1,6})[ \t]+\S/.exec(line);
	if (title) return wholeLine(line, `heading heading-${Math.min(6, (title[1] ?? '=').length)}`);
	if (isLineComment(line)) return wholeLine(line, 'comment');
	const attr = /^(:!?[\w][\w-]*!?:)(.*)$/.exec(line);
	if (attr) return [{ from: 0, to: (attr[1] ?? '').length, cls: 'attr-name' }, ...(attr[2] ? [{ from: (attr[1] ?? '').length, to: line.length, cls: 'attr-value' }] : [])];
	if (/^\[[^\]]*\]\s*$/.test(line) && !/^\[\[/.test(line)) return wholeLine(line, 'meta');
	if (/^\.[^\s.]/.test(line)) return wholeLine(line, 'block-title');
	if (/^(?:ifdef|ifndef|ifeval|endif|include)::/.test(line)) return wholeLine(line, 'directive');
	const adm = /^(NOTE|TIP|IMPORTANT|WARNING|CAUTION):\s/.exec(line);
	if (adm) return [{ from: 0, to: (adm[1] ?? '').length + 1, cls: 'admonition' }, ...inlineSpans(line.slice((adm[1] ?? '').length + 1), (adm[1] ?? '').length + 1)];
	const list = /^([ \t]*)(\*{1,5}|\.{1,5}|-|\d+\.|[a-z]\.)[ \t]+/.exec(line);
	if (list) {
		const from = (list[1] ?? '').length;
		const to = from + (list[2] ?? '').length;
		return [{ from, to, cls: 'list' }, ...inlineSpans(line.slice(to), to)];
	}
	const term = /^(.+?)(::|;;)(\s|$)/.exec(line);
	if (term && !/:\/\//.test(term[1] ?? '')) return [{ from: 0, to: (term[1] ?? '').length + 2, cls: 'term' }, ...inlineSpans(line.slice((term[1] ?? '').length + 2), (term[1] ?? '').length + 2)];
	if (/^(?:'{3,}|<{3,}|={4,}|\*{4,}|_{4,}|--|\|===)\s*$/.test(line)) return wholeLine(line, 'delim');
	return inlineSpans(line);
}

/** Spans of one line and the block state after it. */
export function tokenizeLine(line: string, state: BlockState): { spans: Span[]; state: BlockState } {
	const step = stepBlock(state, line);
	if (step.delimiter) return { spans: wholeLine(line, 'delim'), state: step.state };
	if (state.kind === 'comment') return { spans: wholeLine(line, 'comment'), state: step.state };
	if (state.kind === 'verbatim') return { spans: wholeLine(line, 'code'), state: step.state };
	return { spans: structural(line), state: step.state };
}

/** Spans of a whole text; line numbers are 0-based, offsets are per line. */
export function tokenize(text: string): Span[][] {
	let state: BlockState = NO_BLOCK;
	return text.split('\n').map((line) => {
		const r = tokenizeLine(line, state);
		state = r.state;
		return r.spans;
	});
}
