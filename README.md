# AsciiDoc Files

AsciiDoc Files opens the `.adoc` and `.asciidoc` files in your vault in their own tab. You get a source editor with AsciiDoc highlighting, a rendered preview, or both side by side. The preview uses Asciidoctor.js, the official JavaScript port of Asciidoctor, so headings, tables, admonitions, lists, footnotes and source blocks look the way your other AsciiDoc tools render them.

The editor, the preview, cross reference links and code colors are free. Pro resolves `include::` directives from the vault, adds a side panel with the outline and the links of a document, and exports standalone HTML files. Pro costs $5 a month, or $15 once, through GitHub Sponsors. When you have paid $15 in total, Pro stays on.

## Features

<img src="https://raw.githubusercontent.com/theluckystrike/asciidoc-files/HEAD/docs/asciidoc-files.gif" alt="An AsciiDoc file opens in the preview, switches to source and preview side by side, and a cross reference opens the target document" width="720">

### Rendered preview with the theme's look

<img src="https://raw.githubusercontent.com/theluckystrike/asciidoc-files/HEAD/docs/preview.png" alt="The rendered preview of a handbook with a table of contents, a note, a table and a tip" width="720">

Click an `.adoc` file in the file explorer and it opens in the preview. Section titles, tables, admonitions, sidebars, quotes, callouts, keyboard keys and the table of contents use the colors and fonts of your theme, in light and dark mode. Source blocks get the same code colors as Markdown notes.

Asciidoctor warnings, such as a reference to a missing attribute, show in a small list under the preview. They never fill the developer console.

### Source editor with highlighting

<img src="https://raw.githubusercontent.com/theluckystrike/asciidoc-files/HEAD/docs/source.png" alt="Source and preview side by side, with highlighted titles, attributes, blocks and macros on the left" width="720">

The source editor is CodeMirror 6, the same editor the app uses for notes. It highlights titles, attribute entries, block delimiters, comments, lists, admonition labels, macros and inline marks. Undo, redo and the usual text keys work. The file saves as you type, and in side by side mode the preview follows after a short delay.

Use the buttons in the tab header to switch between preview, source, and source with preview. Each tab keeps its own mode.

### Cross references open the target

`<<anchor>>` scrolls the preview to that anchor. `xref:other.adoc#section[]` opens the other file and scrolls to the section. Hold Ctrl or Cmd to open it in a new tab. Web links open in your browser. Relative image paths show the images from the vault.

<img src="https://raw.githubusercontent.com/theluckystrike/asciidoc-files/HEAD/docs/xref.png" alt="The command reference opened from a cross reference, scrolled to the exit codes" width="720">

### Includes from the vault (Pro)

<img src="https://raw.githubusercontent.com/theluckystrike/asciidoc-files/HEAD/docs/includes.png" alt="Chapters and a tagged part of a shell script come in through include directives" width="720">

With Pro, `include::chapters/install.adoc[]` shows the included file in place. The path is relative to the file that holds the directive, and a path that starts with `/` starts at the vault root. If the file is not next to the source, the plugin also tries the same path from the vault root, which suits a shared folder of partials.

The directive options that matter for documentation work: `leveloffset`, `lines`, `tag` and `tags` (with `!name`, `*` and `**`), `indent` and `opts=optional`. Attribute references such as `{snippets}/deploy.sh` use the attributes set above the directive. A missing file, a file that includes itself, and a chain deeper than the depth setting each show a clear note instead of breaking the page. Without Pro, each directive shows a short note.

### Outline and links panel (Pro)

<img src="https://raw.githubusercontent.com/theluckystrike/asciidoc-files/HEAD/docs/links-panel.png" alt="The side panel with the outline, the includes, the cross references with one missing target, and the files that link here" width="720">

Run "Open the outline and links panel" to get a side panel for the AsciiDoc tab in focus. It lists the section outline, the includes and their status, every cross reference with missing targets in red, and the files that point to this one: xrefs and includes in other AsciiDoc files, and `[[Handbook.adoc]]` links in Markdown notes. Click an entry to go there.

### HTML export and copy (Pro)

<img src="https://raw.githubusercontent.com/theluckystrike/asciidoc-files/HEAD/docs/export.png" alt="The export notice and the new HTML file next to the AsciiDoc source in the file explorer" width="720">

"Export the current file to HTML" writes `Handbook.html` next to `Handbook.adoc`, with the includes resolved and the Asciidoctor default stylesheet inside the file. Cross references to other documents point to their `.html` files, so a folder of exports links up. The page has no script and loads no fonts from the web. To make a PDF, open the HTML file in a browser and print it. "Copy the current file as HTML" puts the HTML body on the clipboard for a CMS or an email.

## Install

When AsciiDoc Files is listed in the community directory, open Settings, then Community plugins, then Browse, and search for "AsciiDoc Files". Select Install, then Enable.

To install by hand, put `main.js`, `manifest.json` and `styles.css` from the latest release in `<vault>/.obsidian/plugins/asciidoc-files/`, then turn on the plugin.

Only one plugin can open a file type. Turn off any other AsciiDoc plugin first. If another plugin already has `.adoc`, AsciiDoc Files shows a notice and the settings tab names the extension. The plugin needs Obsidian 1.13.4 or newer. It was tested on desktop with 1.13.4 and the latest version. It uses no desktop-only API, so it also loads on mobile, but mobile is not tested yet.

## Usage

1. Open any `.adoc` or `.asciidoc` file, or run "Create a new .adoc file". The folder menu of the file explorer also has "New .adoc file".
2. Switch modes with the tab header buttons, or with "Switch between source and preview" and "Show source and preview side by side".
3. For Pro, sponsor on GitHub, then open the settings and select "Sign in with GitHub".

The plugin sets no default hotkeys.

## Settings

<img src="https://raw.githubusercontent.com/theluckystrike/asciidoc-files/HEAD/docs/settings.png" alt="Settings with the Pro section, the open mode, the preview delay and the Pro options for includes and exports" width="720">

| Setting | Default | Allowed values |
| --- | --- | --- |
| Open files in | Preview | Preview, Source, or source and preview side by side |
| Preview delay | 300 | 100 to 2000 milliseconds |
| Resolve include directives | On | On or off (Pro) |
| Include depth | 8 | 1 to 8 levels (Pro) |
| Stylesheet in exports | On | On or off (Pro) |

If a saved value is out of range, the plugin moves it to the nearest allowed value.

## FAQ

### Do search, backlinks and the graph see my AsciiDoc files?

Only in part, and this is a limit of the app. Core search, the backlinks pane, the outgoing links pane and the graph read Markdown files only. A plugin cannot add other file types to them without private API. The files show in the file explorer and the quick switcher, and a Markdown link such as `[[Handbook.adoc]]` works. The Pro links panel lists AsciiDoc cross references in both directions.

### Is the preview safe for files from other people?

Asciidoctor runs in safe mode, so a document cannot read files or URLs. The HTML then goes through the sanitizer of the app, which removes scripts, event handlers and `javascript:` links, also inside passthrough blocks. The end-to-end test checks this with a hostile sample file.

### Why is main.js so large?

Asciidoctor.js is about 0.8 MB minified. It loads the first time you open an AsciiDoc file, not when the app starts.

### Are Antora ids and URL includes supported?

No. Antora ids such as `partial$intro.adoc` need the Antora site structure. URL includes would need a network request for each render, so they show a note.

## Payment, account and network

The core features are free and stay free. Pro features need a GitHub Sponsors sponsorship of theluckystrike: $5 a month or more, or $15 once. When you have paid $15 in total, Pro stays on. Your notes stay readable and editable with or without Pro.

GitHub handles the payment. Sponsor at https://github.com/sponsors/theluckystrike. You need no account for the free features. Pro needs the GitHub account that sponsors.

The preview loads web media that a document names. For `image::https://example.com/a.png[]`, the preview asks that address for the file, with or without Pro, and that host sees the request. A relative path reads a vault file and sends nothing.

Until you select "Sign in with GitHub" in the settings, AsciiDoc Files makes no network requests of its own. Sign in uses the GitHub device flow. AsciiDoc Files sends its public client ID and the scope `read:user` to `https://github.com/login/device/code` and shows you a code. While you enter the code at https://github.com/login/device, it asks `https://github.com/login/oauth/access_token` every few seconds whether sign in is done. The scope `read:user` is read-only access to your profile, which GitHub needs to show the sponsorship tier. It gives no access to repositories and no write access.

After sign in, AsciiDoc Files sends one query to `https://api.github.com/graphql`: does the signed-in account sponsor theluckystrike, at which tier, and how much it has paid theluckystrike in total. It asks again at most once every 7 days, or when you select Refresh. It sends no note content, file names or other vault data, and it has no telemetry.

Pro keeps working for 14 days without a successful check. The GitHub token stays in the secret storage of Obsidian on this device. It is not written to data.json or other vault files, so it does not sync or reach a git repository. The local storage of this device keeps your GitHub login, the tier and the time of the last check. Sign out deletes the token. You can also revoke the access in your GitHub settings, under Applications.

## Support

Report a bug or ask for a feature in the issue tracker of this repository. Please include your Obsidian version and a short AsciiDoc sample that shows the problem.

To build from source:

```
npm ci
npm run build
npm test
```

The tests check golden cases for include expansion, outline and cross reference parsing, link handling and the export page. An end-to-end test opens AsciiDoc files in Obsidian, edits one, follows a cross reference, checks the sanitizer and checks the Pro lock with a stubbed GitHub reply.

## License

MIT. The bundled Asciidoctor.js 3.0.4, its Opal runtime and the Asciidoctor default stylesheet are MIT licensed by their authors.
