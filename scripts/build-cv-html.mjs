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
const sourcePath = resolve(root, 'public/cv/cv-ja.md');
const outputPath = resolve(root, 'public/cv/cv-ja.html');

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

const renderedMarkdown = String(
  await unified()
    .use(remarkParse)
    .use(remarkGfm)
    .use(normalizeHeadings)
    .use(remarkRehype, { allowDangerousHtml: true })
    .use(rehypeRaw)
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
