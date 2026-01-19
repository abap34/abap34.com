import React, { useState } from 'react';
import { useYamlData } from '../hooks/useYamlData';
import { FaGithub } from 'react-icons/fa';
import './Works.css';

export default function Works({ limit = null, showSearch = true, showTitle = true }) {
  const { data: worksData, isLoading } = useYamlData('/data/works.yaml');
  const [selectedWork, setSelectedWork] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');

  if (isLoading) {
    return <div className="loading">Loading...</div>;
  }

  const works = Object.entries(worksData || {});

  const filteredWorks = works.filter(([_, work]) => {
    const searchTarget = `${work.title} ${work.desc} ${work.tags?.join(' ') || ''}`.toLowerCase();
    return searchTarget.includes(searchQuery.toLowerCase());
  });

  const displayWorks = limit ? filteredWorks.slice(0, limit) : filteredWorks;

  return (
    <div className="works-page">
      {showTitle && (
        <div className="page-header">
          <h1>Works</h1>
          {showSearch && (
            <input
              type="text"
              placeholder="Search projects..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="search-input"
            />
          )}
        </div>
      )}

      <div className="works-grid">
        {displayWorks.map(([id, work]) => (
          <div
            key={id}
            className="work-card"
            onClick={() => setSelectedWork(work)}
          >
            {work.img && (
              <img src={work.img} alt={work.title} className="work-image" />
            )}
            <div className="work-content">
              <h3>{work.title}</h3>
              <p className="work-period">{work.period}</p>
              <p className="work-description">{work.short_desc || work.desc}</p>
              {work.repo && (
                <div className="work-repo">
                  <FaGithub />
                  <span>{work.repo}</span>
                </div>
              )}
              {work.tags && (
                <div className="tags">
                  {work.tags.map((tag, i) => (
                    <span key={i} className="tag">{tag}</span>
                  ))}
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      {selectedWork && (
        <div className="modal" onClick={() => setSelectedWork(null)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <button className="modal-close" onClick={() => setSelectedWork(null)}>×</button>
            <h2>{selectedWork.title}</h2>
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
            <div className="modal-description">{selectedWork.desc}</div>
            {selectedWork.relatedlinks && selectedWork.relatedlinks.length > 0 && (
              <div className="modal-links">
                <h3>Related Links</h3>
                {selectedWork.relatedlinks.map((link, i) => (
                  <a key={i} href={link} target="_blank" rel="noopener noreferrer">
                    {link} →
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
