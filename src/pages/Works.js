import React, { useEffect, useMemo, useState } from 'react';
import { useYamlData } from '../hooks/useYamlData';
import { FaGithub, FaExternalLinkAlt } from 'react-icons/fa';
import { useSearchFilters } from '../hooks/useSearchFilters';
import { highlightText } from '../utils/highlight';
import '../styles/search.css';
import './Works.css';

export default function Works({ limit = null, showSearch = true, showTitle = true }) {
  const { data: worksData, isLoading } = useYamlData('/data/works.yaml');
  const [selectedWork, setSelectedWork] = useState(null);
  const { keyword, tags: selectedTags, setKeyword, addTag, removeTag, clearTags } = useSearchFilters();
  const activeKeyword = showSearch ? keyword : '';
  const activeTags = showSearch ? selectedTags : [];
  const [searchInput, setSearchInput] = useState(activeKeyword);
  const keywordTokens = useMemo(
    () => activeKeyword.trim().toLowerCase().split(/\s+/).filter(Boolean),
    [activeKeyword]
  );

  useEffect(() => {
    setSearchInput(activeKeyword);
  }, [activeKeyword]);

  const works = useMemo(() => Object.entries(worksData || {}), [worksData]);

  const filteredWorks = useMemo(() => {
    const keywords = keywordTokens;
    const loweredTags = activeTags.map((tag) => tag.toLowerCase());

    return works.filter(([_, work]) => {
      const workTags = work.tags || [];

      const matchesTags = loweredTags.every((tag) =>
        workTags.some((workTag) => workTag.toLowerCase() === tag)
      );
      if (!matchesTags) return false;

      const searchableText = [
        work.title,
        work.short_desc,
        work.desc,
        work.repo,
        work.period,
        (work.lang || []).join(' '),
        workTags.join(' ')
      ]
        .filter(Boolean)
        .join(' ')
        .toLowerCase();

      return keywords.every((kw) => searchableText.includes(kw));
    });
  }, [works, keywordTokens, activeTags]);

  const displayWorks = limit ? filteredWorks.slice(0, limit) : filteredWorks;
  const resultsCount = displayWorks.length;
  const hasActiveFilters = activeKeyword.trim().length > 0 || activeTags.length > 0;

  if (isLoading) {
    return <div className="loading">Loading...</div>;
  }

  const handleSearchSubmit = (event) => {
    event.preventDefault();
    setKeyword(searchInput);
  };

  const handleTagFilter = (tag, event) => {
    if (!showSearch) return;
    if (event?.stopPropagation) {
      event.stopPropagation();
    }
    addTag(tag);
    setSelectedWork(null);
  };

  return (
    <div className="works-page">
      {showTitle && (
        <div className="page-header">
          <h1>Works</h1>
          {showSearch && (
            <>
              <form className="search-form" onSubmit={handleSearchSubmit}>
                <input
                  type="text"
                  placeholder="Search projects..."
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
                  <strong>{resultsCount}</strong> works
                </span>
                {hasActiveFilters && <span>matching current filters</span>}
              </div>
            </>
          )}
        </div>
      )}

      {resultsCount === 0 ? (
        <div className="empty-state">
          条件に一致する作品がありません。別のキーワードやタグを試してみてください。
        </div>
      ) : (
        <div className="works-grid">
          {displayWorks.map(([id, work]) => (
            <article
              key={id}
              className="work-card"
              onClick={() => setSelectedWork(work)}
            >
              {work.img && (
                <div className="work-image-container">
                  <img src={work.img} alt={work.title} className="work-image" />
                  <div className="work-image-overlay">
                    <span>View Details</span>
                  </div>
                </div>
              )}
              <div className="work-content">
                <div className="work-header">
                  <h3 className="work-title">
                    {highlightText(work.title, keywordTokens, `work-title-${id}`)}
                  </h3>
                  <span className="work-period">{work.period}</span>
                </div>
                {work.short_desc || work.desc ? (
                  <p className="work-description">
                    {highlightText(
                      `${(work.short_desc || work.desc || '').substring(0, 80)}${
                        (work.short_desc || work.desc || '').length > 80 ? '...' : ''
                      }`,
                      keywordTokens,
                      `work-desc-${id}`
                    )}
                  </p>
                ) : null}
                {work.repo && (
                  <div className="work-repo">
                    <FaGithub size={12} />
                    <span>{work.repo.split('/').pop()}</span>
                  </div>
                )}
                {work.tags && work.tags.length > 0 && (
                  <div className="tags">
                    {work.tags.slice(0, 3).map((tag, i) =>
                      showSearch ? (
                        <button
                          type="button"
                          key={`${id}-${tag}-${i}`}
                          className="tag tag-button"
                          onClick={(event) => handleTagFilter(tag, event)}
                        >
                          {tag}
                        </button>
                      ) : (
                        <span key={`${id}-${tag}-${i}`} className="tag">
                          {tag}
                        </span>
                      )
                    )}
                    {work.tags.length > 3 && (
                      <span className="tag-more">+{work.tags.length - 3}</span>
                    )}
                  </div>
                )}
              </div>
            </article>
          ))}
        </div>
      )}

      {selectedWork && (
        <div className="modal" onClick={() => setSelectedWork(null)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <button className="modal-close" onClick={() => setSelectedWork(null)}>×</button>
            <h2>{highlightText(selectedWork.title, keywordTokens, 'modal-title')}</h2>
            <p className="modal-period">{selectedWork.period}</p>
            {selectedWork.img && (
              <img src={selectedWork.img} alt={selectedWork.title} className="modal-image" />
            )}
            {selectedWork.repo && (
              <a
                href={`https://github.com/${selectedWork.repo}`}
                target="_blank"
                rel="noopener noreferrer"
                className="modal-repo"
              >
                <FaGithub /> {selectedWork.repo}
              </a>
            )}
            {selectedWork.desc && (
              <div className="modal-description">
                {highlightText(selectedWork.desc, keywordTokens, 'modal-desc')}
              </div>
            )}
            {selectedWork.tags && selectedWork.tags.length > 0 && (
              <div className="modal-tags">
                {selectedWork.tags.map((tag, i) =>
                  showSearch ? (
                    <button
                      type="button"
                      key={`${selectedWork.title}-${tag}-${i}`}
                      className="tag tag-button"
                      onClick={(event) => handleTagFilter(tag, event)}
                    >
                      {tag}
                    </button>
                  ) : (
                    <span key={`${selectedWork.title}-${tag}-${i}`} className="tag">
                      {tag}
                    </span>
                  )
                )}
              </div>
            )}
            {selectedWork.relatedlinks && selectedWork.relatedlinks.length > 0 && (
              <div className="modal-links">
                <h3>Related Links</h3>
                {selectedWork.relatedlinks.map((link, i) => (
                  <a key={i} href={link} target="_blank" rel="noopener noreferrer">
                    <FaExternalLinkAlt size={12} />
                    {link}
                  </a>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
