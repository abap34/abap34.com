import React, { useEffect, useMemo, useState } from 'react';
import { ExternalLink } from 'lucide-react';
import { useSearchFilters } from '../hooks/useSearchFilters';
import '../styles/search.css';
import './Blog.css';

async function fetchPosts() {
  try {
    const response = await fetch('https://www.abap34.com/posts.json');
    if (!response.ok) throw new Error('Failed to fetch posts');
    return await response.json();
  } catch (error) {
    console.error('Error fetching posts:', error);
    return [];
  }
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
  return html.replace(/<[^>]+>/g, ' ');
}

export default function Blog() {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const { keyword, tags: selectedTags, setKeyword, addTag, removeTag, clearTags } = useSearchFilters();
  const [searchInput, setSearchInput] = useState(keyword);

  useEffect(() => {
    fetchPosts().then((data) => {
      setPosts(data);
      setLoading(false);
    });
  }, []);

  useEffect(() => {
    setSearchInput(keyword);
  }, [keyword]);

  const filteredPosts = useMemo(() => {
    const keywords = keyword.trim().toLowerCase().split(/\s+/).filter(Boolean);
    const loweredTags = selectedTags.map((tag) => tag.toLowerCase());

    return posts.filter((post) => {
      const postTags = post.tags || [];
      const matchesTags = loweredTags.every((tag) =>
        postTags.some((postTag) => postTag.toLowerCase() === tag)
      );
      if (!matchesTags) return false;

      const searchTarget = [
        post.title,
        post.post_date,
        postTags.join(' '),
        stripHtml(post.content || '')
      ]
        .filter(Boolean)
        .join(' ')
        .toLowerCase();

      return keywords.every((kw) => searchTarget.includes(kw));
    });
  }, [posts, keyword, selectedTags]);

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
                {post.title}
              </a>
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
