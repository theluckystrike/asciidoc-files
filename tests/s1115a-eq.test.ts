// s1115a A2. eslint-plugin-obsidianmd 0.6.0 regex-lookbehind (iOS before 16.4 has no lookbehind). Equivalence of the
// rewrite with the old lookbehind expression, on a table of edge cases and on seeded fuzz input (as lanes/R1-A1/eq/eq.mts).
import { describe, expect, it } from 'vitest';
import { inlineSpans, type Span } from '../src/adoc/highlight';
import { plainTitle } from '../src/adoc/outline';

let seed = 1115;
const rnd = () => ((seed = (seed * 1103515245 + 12345) & 0x7fffffff) / 0x7fffffff);
const gen = (alpha: string[], len: number) => Array.from({ length: Math.floor(rnd() * len) }, () => alpha[Math.floor(rnd() * alpha.length)]).join('');
const FUZZ = 20000;
const j = (x: unknown) => JSON.stringify(x);
/** Runs old and new on each input. Returns the inputs where they differ. */
function differ(inputs: string[], oldF: (s: string) => unknown, newF: (s: string) => unknown): string[] {
	return inputs.filter((s) => j(oldF(s)) !== j(newF(s)));
}

const OLD_INLINE: { re: RegExp; cls: string }[] = [
	{ re: /\b(?:xref|link|image|include|kbd|btn|menu|footnote|anchor|pass|stem|latexmath|asciimath):{1,2}[^\s[]*\[[^\]]*\]/g, cls: 'macro' },
	{ re: /\bhttps?:\/\/[^\s[<>]+(?:\[[^\]]*\])?/g, cls: 'url' },
	{ re: /<<[^<>]+>>/g, cls: 'xref' },
	{ re: /\[\[[^\]]+\]\]/g, cls: 'anchor' },
	{ re: /\{[\w-]+\}/g, cls: 'attr-ref' },
	{ re: /`[^`\n]+`/g, cls: 'mono' },
	{ re: /(?<![\w*])\*[^*\s](?:[^*]*[^*\s])?\*(?![\w*])|\*\*[^*]+\*\*/g, cls: 'strong' },
	{ re: /(?<![\w_])_[^_\s](?:[^_]*[^_\s])?_(?![\w_])|__[^_]+__/g, cls: 'em' },
	{ re: /#[^#\s](?:[^#]*[^#\s])?#/g, cls: 'mark' },
];
function oldSpans(line: string): Span[] {
	const spans: Span[] = [];
	for (const { re, cls } of OLD_INLINE) {
		for (const m of line.matchAll(re)) {
			const from = m.index ?? 0;
			const to = from + m[0].length;
			if (!spans.some((s) => from < s.to && to > s.from)) spans.push({ from, to, cls });
		}
	}
	return spans.sort((a, b) => a.from - b.from);
}
const oldTitle = (title: string) =>
	title
		.replace(/<[^>]+>/g, '')
		.replace(/\+\+?\+?([^+]*)\+?\+?\+/g, '$1')
		.replace(/(?<![\w\\])[*_`#~^]+|[*_`#~^]+(?!\w)/g, '')
		.replace(/\s+/g, ' ')
		.trim();

const SPAN_TABLE = ['', '*a*', 'x*a*', '**a**', 'x**a**', '*a**', '**a*', 'a*b*c', '*a* *b*', '_a_', 'x_a_', '__a__', 'snake_case_name', '*a_b_*', '***a***', '* a *', '*a *', '_a_b', 'a__b__c', '`*a*` *b*', '#a# *b*', '😀*a*', '*😀*', '\\*a*', '**a** *b* __c__ _d_'];
const TITLE_TABLE = ['', '*Bold* title', 'x*y', '_a_ b', 'a_b_c', '\\*not*', '**', 'snake_case', '`code`', '#mark#', 'a~b~c', 'x^2^', 'pass:[x] +++y+++', '<b>t</b>', '*a*b', 'é*a*', 'a\\*b*'];

describe('asciidoc strong and em spans without lookbehind', () => {
	it('match the old spans on the table', () => {
		expect(differ(SPAN_TABLE, oldSpans, (s) => inlineSpans(s))).toEqual([]);
	});
	it('match the old spans on fuzz input', () => {
		const A = ['*', '**', '_', '__', 'a', 'b', ' ', '`', '#', '\\', '1', 'é', '[', ']'];
		expect(differ(Array.from({ length: FUZZ }, () => gen(A, 24)), oldSpans, (s) => inlineSpans(s))).toEqual([]);
	});
});

describe('asciidoc plainTitle without lookbehind', () => {
	it('matches the old title on the table', () => {
		expect(differ(TITLE_TABLE, oldTitle, plainTitle)).toEqual([]);
	});
	it('matches the old title on fuzz input', () => {
		const A = ['*', '_', '`', '#', '~', '^', 'a', 'Z', '1', ' ', '\\', '+', '<b>', 'é', '\n'];
		expect(differ(Array.from({ length: FUZZ }, () => gen(A, 20)), oldTitle, plainTitle)).toEqual([]);
	});
});
