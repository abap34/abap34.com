import React from 'react';

const escapeRegExp = (text = '') =>
  text.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

export function highlightText(text = '', tokens = [], keyPrefix = 'highlight') {
  if (!text || tokens.length === 0) {
    return text;
  }

  const escapedTokens = tokens
    .filter(Boolean)
    .map((token) => escapeRegExp(token));

  if (escapedTokens.length === 0) {
    return text;
  }

  const regex = new RegExp(`(${escapedTokens.join('|')})`, 'gi');
  const parts = text.split(regex);

  return parts.map((part, index) => {
    if (index % 2 === 1) {
      return (
        <mark key={`${keyPrefix}-${index}`} className="highlight">
          {part}
        </mark>
      );
    }

    return part;
  });
}
