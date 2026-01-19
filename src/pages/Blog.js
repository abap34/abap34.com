import React, { useState, useEffect } from 'react';
import { ExternalLink } from 'lucide-react';
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

export default function Blog() {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    fetchPosts().then((data) => {
      setPosts(data);
      setLoading(false);
    });
  }, []);

  if (loading) {
    return <div className="loading">Loading...</div>;
  }

  const filteredPosts = posts.filter((post) => {
    const searchTarget = `${post.title} ${post.tags?.join(' ') || ''}`.toLowerCase();
    return searchTarget.includes(searchQuery.toLowerCase());
  });

  return (
    <div className="blog-page">
      <div className="page-header">
        <h1>Blog</h1>
        <input
          type="text"
          placeholder="Search posts..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="search-input"
        />
      </div>

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
                  <span key={i} className="tag">{tag}</span>
                ))}
              </div>
            )}
          </article>
        ))}
      </div>
    </div>
  );
}
