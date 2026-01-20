import React, { useEffect, useMemo, useState } from 'react';
import { ExternalLink } from 'lucide-react';
import { useSearchFilters } from '../hooks/useSearchFilters';
import { highlightText } from '../utils/highlight';
import '../styles/search.css';
import './Blog.css';

const POST_SOURCES = [
  `${process.env.PUBLIC_URL || ''}/posts.json`,
  'https://www.abap34.com/posts.json'
];

async function fetchPosts() {
  for (const source of POST_SOURCES) {
    if (!source) continue;
    try {
      const response = await fetch(source);
      if (!response.ok) throw new Error(`Failed to fetch posts from ${source}`);
      return await response.json();
    } catch (error) {
      console.warn(`Error fetching posts from ${source}:`, error);
    }
  }

  console.error('All post sources failed to load.');
  return [];
}

function extractDomain(url) {
  try {
    const domain = new URL(url).hostname;
    return domain.replace(/^www\./, '');
  } catch (e) {
    return '';
  }
}

function stripHtml(html = '') {
  if (!html) return '';

  try {
    if (typeof window !== 'undefined' && window.DOMParser) {
      const parser = new DOMParser();
      const doc = parser.parseFromString(html, 'text/html');
      return doc.body.textContent || '';
    }
  } catch (error) {
    console.warn('Failed to parse HTML content, falling back to regex.', error);
  }

  return html.replace(/<[^>]+>/g, ' ');
}

function buildSnippet(content = '', keywords = [], snippetLength = 140) {
  if (!content) return '';

  const normalized = content.replace(/\s+/g, ' ').trim();
  if (!normalized) return '';

  if (keywords.length === 0) {
    return normalized.length > snippetLength
      ? `${normalized.slice(0, snippetLength)}…`
      : normalized;
  }

  const lowerContent = normalized.toLowerCase();
  const keywordPositions = keywords
    .map((kw) => lowerContent.indexOf(kw))
    .filter((index) => index >= 0)
    .sort((a, b) => a - b);

  const start =
    keywordPositions.length > 0
      ? Math.max(keywordPositions[0] - 20, 0)
      : 0;
  const end = Math.min(start + snippetLength, normalized.length);

  const prefix = start > 0 ? '…' : '';
  const suffix = end < normalized.length ? '…' : '';

  return `${prefix}${normalized.slice(start, end)}${suffix}`;
}

export default function Blog() {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const { keyword, tags: selectedTags, setKeyword, addTag, removeTag, clearTags } = useSearchFilters();
  const [searchInput, setSearchInput] = useState(keyword);
  const keywordTokens = useMemo(
    () => keyword.trim().toLowerCase().split(/\s+/).filter(Boolean),
    [keyword]
  );

  useEffect(() => {
    fetchPosts().then((data) => {
      setPosts(data);
      setLoading(false);
    });
  }, []);

  useEffect(() => {
    setSearchInput(keyword);
  }, [keyword]);

  const normalizedPosts = useMemo(
    () =>
      posts.map((post) => ({
        ...post,
        plainContent: stripHtml(post.content || '')
      })),
    [posts]
  );

  const filteredPosts = useMemo(() => {
    const loweredTags = selectedTags.map((tag) => tag.toLowerCase());

    return normalizedPosts.filter((post) => {
      const postTags = post.tags || [];
      const matchesTags = loweredTags.every((tag) =>
        postTags.some((postTag) => postTag.toLowerCase() === tag)
      );
      if (!matchesTags) return false;

      const searchTarget = [
        post.title,
        post.post_date,
        postTags.join(' '),
        post.plainContent
      ]
        .filter(Boolean)
        .join(' ')
        .toLowerCase();

      return keywordTokens.every((kw) => searchTarget.includes(kw));
    });
  }, [normalizedPosts, keywordTokens, selectedTags]);

  if (loading) {
    return <div className="loading">Loading...</div>;
  }

  const hasActiveFilters = keyword.trim().length > 0 || selectedTags.length > 0;
  const resultsCount = filteredPosts.length;

  const handleSearchSubmit = (event) => {
    event.preventDefault();
    setKeyword(searchInput);
  };

  return (
    <div className="blog-page">
      <div className="page-header">
        <h1>Blog</h1>
        <form className="search-form" onSubmit={handleSearchSubmit}>
          <input
            type="text"
            placeholder="Search posts..."
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            className="search-input"
          />
          <button type="submit" className="search-submit">
            Search
          </button>
        </form>
        {selectedTags.length > 0 && (
          <div className="active-filters">
            <span className="active-filters-label">Tags:</span>
            <div className="active-tags">
              {selectedTags.map((tag) => (
                <button
                  type="button"
                  key={tag}
                  className="filter-chip"
                  onClick={() => removeTag(tag)}
                >
                  {tag}
                </button>
              ))}
              <button type="button" className="filter-clear" onClick={clearTags}>
                Clear
              </button>
            </div>
          </div>
        )}
        <div className="search-meta">
          <span>
            <strong>{resultsCount}</strong> posts
          </span>
          {hasActiveFilters && <span>matching current filters</span>}
        </div>
      </div>

      {resultsCount === 0 ? (
        <div className="empty-state">
          該当する記事が見つかりませんでした。キーワードやタグを変更してみてください。
        </div>
      ) : (
        <div className="posts-list">
          {filteredPosts.map((post, index) => (
            <article key={index} className="post-card">
              <div className="post-header">
                <div className="post-date">{post.post_date}</div>
                {post.external && (
                  <div className="post-external">
                    <ExternalLink size={14} />
                    <span>{extractDomain(post.url)}</span>
                  </div>
                )}
              </div>
              <a href={post.url} target="_blank" rel="noopener noreferrer" className="post-title">
                {highlightText(post.title, keywordTokens, `title-${index}`)}
              </a>
              {post.plainContent && (
                <p className="post-snippet">
                  {highlightText(
                    buildSnippet(post.plainContent, keywordTokens),
                    keywordTokens,
                    `snippet-${index}`
                  )}
                </p>
              )}
              {post.tags && post.tags.length > 0 && (
                <div className="tags">
                  {post.tags.map((tag, i) => (
                    <button
                      type="button"
                      key={`${post.title}-${tag}-${i}`}
                      className="tag tag-button"
                      onClick={() => addTag(tag)}
                    >
                      {tag}
                    </button>
                  ))}
                </div>
              )}
            </article>
          ))}
        </div>
      )}
    </div>
  );
}
