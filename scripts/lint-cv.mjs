import { readFileSync, writeFileSync } from 'node:fs';
import { resolve } from 'node:path';

const args = process.argv.slice(2);
const fix = args.includes('--fix');
const files = args.filter((arg) => arg !== '--fix');
const targets = files.length > 0 ? files : ['public/cv/cv-ja.md'];

function splitInlineCode(line) {
  return line.split(/(`[^`]*`)/g);
}

function normalizeInternalSpaces(line) {
  const prefixMatch = /^(\s*(?:[-*+]\s+|\d+\.\s+)?)(.*)$/.exec(line);
  const prefix = prefixMatch?.[1] ?? '';
  const body = prefixMatch?.[2] ?? line;

  return `${prefix}${splitInlineCode(body)
    .map((part) => (part.startsWith('`') && part.endsWith('`') ? part : part.replace(/ {2,}/g, ' ')))
    .join('')}`;
}

function lintFile(file) {
  const path = resolve(file);
  const original = readFileSync(path, 'utf8');
  const hadFinalNewline = original.endsWith('\n');
  const lines = original.split(/\r?\n/);
  if (hadFinalNewline) {
    lines.pop();
  }

  const messages = [];
  const fixedLines = [];
  let blankRun = 0;
  let inFence = false;

  lines.forEach((line, index) => {
    const lineNumber = index + 1;
    let nextLine = line.replace(/[ \t]+$/g, '');

    if (nextLine !== line) {
      messages.push(`${file}:${lineNumber}: trailing whitespace`);
    }

    if (/^\s*```/.test(nextLine)) {
      inFence = !inFence;
      fixedLines.push(nextLine);
      blankRun = 0;
      return;
    }

    if (nextLine.trim() === '') {
      blankRun += 1;
      if (blankRun > 1) {
        messages.push(`${file}:${lineNumber}: too many consecutive blank lines`);
        if (fix) {
          return;
        }
      }
      fixedLines.push('');
      return;
    }

    blankRun = 0;

    if (!inFence) {
      const normalized = normalizeInternalSpaces(nextLine);
      if (normalized !== nextLine) {
        messages.push(`${file}:${lineNumber}: repeated ASCII spaces`);
        nextLine = normalized;
      }
    }

    fixedLines.push(nextLine);
  });

  let fixed = `${fixedLines.join('\n')}\n`;
  if (!hadFinalNewline) {
    messages.push(`${file}:${lines.length}: missing final newline`);
  }

  if (fix && fixed !== original) {
    writeFileSync(path, fixed);
  }

  return messages;
}

const messages = targets.flatMap(lintFile);

if (messages.length > 0) {
  console.error(messages.join('\n'));
  if (!fix) {
    process.exitCode = 1;
  }
}
