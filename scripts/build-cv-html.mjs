import { readFileSync, writeFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import GithubSlugger from 'github-slugger';
import { toString } from 'mdast-util-to-string';
import rehypeRaw from 'rehype-raw';
import rehypeStringify from 'rehype-stringify';
import remarkGfm from 'remark-gfm';
import remarkParse from 'remark-parse';
import remarkRehype from 'remark-rehype';
import { unified } from 'unified';
import { visit } from 'unist-util-visit';

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = resolve(__dirname, '..');
const sourcePath = resolve(root, 'public/cv/resume-ja.md');
const outputPath = resolve(root, 'public/cv/resume-ja.html');

const markdown = readFileSync(sourcePath, 'utf8');
const headings = [];

function escapeHtml(value) {
  return value
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;');
}

function escapeAttr(value) {
  return escapeHtml(value).replaceAll("'", '&#39;');
}

function normalizeHeadings() {
  return (tree) => {
    const slugger = new GithubSlugger();
    let isFirstHeading = true;

    visit(tree, 'heading', (node) => {
      const text = toString(node);
      const id = slugger.slug(text);

      node.depth = isFirstHeading ? 1 : Math.min(6, Math.max(2, node.depth - 1));
      node.data ??= {};
      node.data.hProperties ??= {};
      node.data.hProperties.id = id;

      headings.push({ id, level: node.depth, text });
      isFirstHeading = false;
    });
  };
}

function renderToc(items) {
  const tocHeadings = items.filter((heading) => heading.level >= 2 && heading.level <= 3);

  if (tocHeadings.length === 0) {
    return '';
  }

  return `<nav class="toc" aria-label="目次">
<ol>
${tocHeadings
  .map((heading) => {
    const className = heading.level === 3 ? ' class="toc-child"' : '';
    return `<li${className}><a href="#${escapeAttr(heading.id)}">${escapeHtml(heading.text)}</a></li>`;
  })
  .join('\n')}
</ol>
</nav>`;
}

function alignHistoryDates() {
  return (tree) => {
    let inHistory = false;
    for (const section of tree.children) {
      if (section.type !== 'element') continue;
      if (section.tagName === 'h2') {
        inHistory = section.properties.id === '経歴';
      }
      if (!inHistory || !['ul', 'ol'].includes(section.tagName)) continue;

      visit(section, 'element', (node) => {
        if (node.tagName !== 'li') return;
        const first = node.children.find(
          (child) => child.type !== 'text' || child.value.trim(),
        );
        const label = first?.tagName === 'details'
          ? first.children.find((child) => child.type === 'element' && child.tagName === 'summary')
          : first?.tagName === 'p' ? first : node;
        const text = label?.children?.[0];
        if (text?.type !== 'text') return;

        const match = /^\s*(\d{4})\s*年(?:\s*(\d{1,2})\s*月)?(?:\s*([-–—〜])\s*(?:(\d{4})\s*年(?:\s*(\d{1,2})\s*月)?)?)?\s+(?=\S)/.exec(text.value);
        if (!match) return;

        const [, startYear, startMonth, separator, endYear, endMonth] = match;
        const time = (year, month) => {
          const paddedMonth = month?.padStart(2, '0');
          return {
            type: 'element',
            tagName: 'time',
            properties: { dateTime: paddedMonth ? `${year}-${paddedMonth}` : year },
            children: [{ type: 'text', value: paddedMonth ? `${year}/${paddedMonth}` : year }],
          };
        };
        const period = [time(startYear, startMonth)];
        if (separator) period.push({ type: 'text', value: ' – ' });
        if (endYear) period.push(time(endYear, endMonth));

        const listIndex = label.children.findIndex(
          (child) => child.type === 'element' && ['ul', 'ol'].includes(child.tagName),
        );
        const labelEnd = listIndex < 0 ? label.children.length : listIndex;
        const nestedLists = label.children.slice(labelEnd);
        label.children = [{
          type: 'element',
          tagName: 'span',
          properties: { className: ['cv-history-entry'] },
          children: [
            {
              type: 'element', tagName: 'span',
              properties: { className: ['cv-period'] }, children: period,
            },
            {
              type: 'element', tagName: 'span', properties: {},
              children: [
                { type: 'text', value: text.value.slice(match[0].length) },
                ...label.children.slice(1, labelEnd),
              ],
            },
          ],
        }, ...nestedLists];
      });
    }
  };
}

const renderedMarkdown = String(
  await unified()
    .use(remarkParse)
    .use(remarkGfm)
    .use(normalizeHeadings)
    .use(remarkRehype, { allowDangerousHtml: true })
    .use(rehypeRaw)
    .use(alignHistoryDates)
    .use(rehypeStringify)
    .process(markdown),
);

const toc = renderToc(headings);
const body = toc
  ? renderedMarkdown.replace(/(<h2\b)/, `${toc}\n$1`)
  : renderedMarkdown;

const html = `<!doctype html>
<html lang="ja">
  <head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <title>Resume - abap34</title>
    <meta name="description" content="Resume of abap34">
    <script async src="https://www.googletagmanager.com/gtag/js?id=G-10Y7GMS7GV"></script>
    <script>
      if (!['localhost', '127.0.0.1', '[::1]'].includes(location.hostname)) {
        window.dataLayer = window.dataLayer || [];
        function gtag() { dataLayer.push(arguments); }
        gtag('js', new Date());
        gtag('config', 'G-10Y7GMS7GV');
      }
    </script>
    <style>
      :root {
        color-scheme: light dark;
        --bg: #ffffff;
        --text: #111111;
        --muted: #555555;
        --border: #dddddd;
        --accent: #0000ee;
        --code-bg: #f5f5f5;
      }

      @media (prefers-color-scheme: dark) {
        :root {
          --bg: #111111;
          --text: #f2f2f2;
          --muted: #c4c4c4;
          --border: #2b2b2b;
          --accent: #8ab4f8;
          --code-bg: #1d1d1d;
        }
      }

      * {
        box-sizing: border-box;
      }

      body {
        margin: 0;
        background: var(--bg);
        color: var(--text);
        font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", "Helvetica Neue", Arial, "Hiragino Kaku Gothic ProN", "Yu Gothic", Meiryo, sans-serif;
        font-size: 16px;
        line-height: 1.65;
      }

      main {
        max-width: 760px;
        margin: 0 auto;
        padding: 2.5rem 1.25rem 4rem;
      }

      nav {
        margin-bottom: 2rem;
        font-size: 0.95rem;
      }

      h1, h2, h3 {
        line-height: 1.3;
      }

      h1 {
        font-size: 2rem;
        margin: 0 0 1.5rem;
        padding-bottom: 0.75rem;
        border-bottom: 1px solid var(--border);
      }

      h2 {
        font-size: 1.35rem;
        margin: 2rem 0 0.75rem;
      }

      h3 {
        font-size: 1.05rem;
        margin: 1.4rem 0 0.55rem;
      }

      p {
        margin: 0.65rem 0;
      }

      ul, ol {
        margin: 0.45rem 0 0.85rem 1.35rem;
        padding: 0;
      }

      li {
        margin: 0.2rem 0;
      }

      .cv-history-entry {
        display: grid;
        grid-template-columns: 18ch minmax(0, 1fr);
        column-gap: 0.75rem;
        flex: 1;
        min-width: 0;
      }

      .cv-period {
        white-space: nowrap;
        font-variant-numeric: tabular-nums;
        color: var(--muted);
      }

      @media (max-width: 520px) {
        .cv-history-entry {
          grid-template-columns: minmax(0, 1fr);
        }
      }

      details > summary {
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: 1rem;
        list-style: none;
        cursor: pointer;
      }

      details > summary::-webkit-details-marker {
        display: none;
      }

      details > summary::after {
        content: '';
        flex: 0 0 0.4rem;
        height: 0.4rem;
        margin-right: 0.15rem;
        border-right: 1.5px solid var(--muted);
        border-bottom: 1.5px solid var(--muted);
        transform: rotate(45deg);
      }

      details[open] > summary::after {
        transform: rotate(225deg);
      }

      details > summary:hover {
        text-decoration: underline;
        text-decoration-color: var(--muted);
        text-underline-offset: 0.2em;
      }

      details > summary:focus-visible {
        outline: 2px solid var(--accent);
        outline-offset: 3px;
      }

      details > ul,
      details > ol {
        margin: 0.2rem 0 0.4rem 1.35rem;
      }

      details > ul {
        list-style-type: circle;
      }

      details > ul > li > p,
      details > ol > li > p {
        margin: 0.2rem 0;
      }

      a {
        color: var(--accent);
        text-underline-offset: 0.15em;
      }

      code {
        border-radius: 4px;
        background: var(--code-bg);
        padding: 0.08em 0.3em;
        font-family: "SF Mono", Consolas, "Liberation Mono", Menlo, monospace;
        font-size: 0.92em;
      }

      img {
        max-width: 100%;
      }

      .cv-name {
        margin: 0 0 0.75rem;
        font-size: 1.2rem;
        font-weight: 600;
      }

      .toc {
        margin: 1.5rem 0 2rem;
        padding: 1rem 1.1rem;
        border: 1px solid var(--border);
      }

      .toc ol {
        margin: 0;
        padding: 0;
        list-style: none;
      }

      .toc li {
        margin: 0.15rem 0;
      }

      .toc-child {
        padding-left: 1rem;
        font-size: 0.95rem;
      }
    </style>
  </head>
  <body>
    <main>
      <nav><a href="/">abap34.com</a></nav>
${body
  .split('\n')
  .map((line) => `      ${line}`)
  .join('\n')}
    </main>
  </body>
</html>
`;

writeFileSync(outputPath, html);
console.log(`Generated ${outputPath}`);
