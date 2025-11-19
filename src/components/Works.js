import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { FaGithub, FaTag } from "react-icons/fa6";
import { X } from "lucide-react";
import ReactMarkdown from "react-markdown";
import yaml from "yaml";
import SearchBar from './SearchBar';
import Tag from './Tag';
import TagList from './TagList';
import './SearchResult.css';
import './Works.css';

// URLパラメータから検索クエリを取得
function getSearchQueries() {
    const params = new URLSearchParams(window.location.search);
    return params.getAll('q');
}

// URLパラメータからタグを取得
function getSearchTags() {
    const params = new URLSearchParams(window.location.search);
    return params.getAll('tag');
}

// クエリでworksをフィルタリング
function filterWorksByQuery(works, query) {
    if (!query) return works;
    return works.filter(([_, work]) => {
        const searchTarget = `${work.title} ${work.desc} ${work.short_desc || ''} ${work.tags?.join(' ') || ''}`.toLowerCase();
        return searchTarget.includes(query.toLowerCase());
    });
}

// 複数のクエリでworksをフィルタリング
function filterWorksByQueries(works, queries) {
    if (queries.length === 0) return works;
    return queries.reduce((acc, query) => filterWorksByQuery(acc, query), works);
}

// タグでworksをフィルタリング
function filterWorksByTag(works, tag) {
    if (!tag) return works;
    return works.filter(([_, work]) => work.tags?.includes(tag));
}

// 複数のタグでworksをフィルタリング
function filterWorksByTags(works, tags) {
    if (tags.length === 0) return works;
    return tags.reduce((acc, tag) => filterWorksByTag(acc, tag), works);
}

// クエリを削除
function deleteSearchQuery(query) {
    const params = new URLSearchParams(window.location.search);
    const queries = params.getAll('q');
    const newQueries = queries.filter((q) => q !== query);

    params.delete('q');
    newQueries.forEach((q) => params.append('q', q));

    window.location.href = `/works?${params.toString()}`;
}

// タグを削除
function deleteSearchTag(tag) {
    const params = new URLSearchParams(window.location.search);
    const tags = params.getAll('tag');
    const newTags = tags.filter((t) => t !== tag);

    params.delete('tag');
    newTags.forEach((t) => params.append('tag', t));

    window.location.href = `/works?${params.toString()}`;
}

// 削除可能なクエリコンポーネント
function DeletableQuery({ query }) {
    const handleClick = () => {
        deleteSearchQuery(query);
    };

    return (
        <span is-="badge" variant-="blue" className="search-query" style={{ cursor: 'pointer' }}>
            <span>{query}</span>
            <X onClick={handleClick} className="search-query-close" size={16} />
        </span>
    );
}

// 削除可能なタグコンポーネント
function DeletableTag({ name, label }) {
    const handleClick = () => {
        deleteSearchTag(name);
    };

    return (
        <span is-="badge" variant-="background2" className="search-tag" style={{ cursor: 'pointer' }}>
            <FaTag className="search-tag-icon" />
            <span>{label}</span>
            <X onClick={handleClick} className="search-tag-close" size={16} />
        </span>
    );
}

const WorkModal = ({ work, open, onClose }) => {
    if (!open) return null

    const modalContent = (
        <div
            className="works-modal-overlay"
            onClick={onClose}
        >
            <column
                box-="square"
                shear-="top"
                className="works-modal-content"
                onClick={(e) => e.stopPropagation()}
            >
                <button
                    is-="button"
                    variant-="background2"
                    onClick={onClose}
                    className="works-modal-close-button"
                    aria-label="Close modal"
                >
                    <X />
                </button>


                <column pad-="2 1" className="works-modal-body">

                    <column className="works-modal-title">
                        <h1 className="works-modal-title-text">{work.title}</h1>
                    </column>

                    <column style={{ marginBottom: '1lh' }}>
                        <div className="works-modal-period">{work.period}</div>
                    </column>


                    {work.img && (
                        <column style={{ marginBottom: '1lh' }}>
                            <img
                                src={work.img}
                                alt={work.title}
                                className="works-modal-img"
                            />
                        </column>
                    )}



                    {work.repo && (
                        <row style={{ alignItems: 'center', gap: '1ch', marginBottom: '1lh' }}>
                            <FaGithub className="works-modal-repo-icon" />
                            <a
                                href={`https://github.com/${work.repo}`}
                                target="_blank"
                                rel="noreferrer"
                                className="works-modal-repo-link"
                            >
                                {work.repo}
                            </a>
                        </row>
                    )}

                    <column style={{ marginBottom: '1lh' }}>
                        <ReactMarkdown
                            components={{
                                a: ({ node, children, ...props }) => (
                                    <a {...props} className="works-modal-markdown-link" target="_blank" rel="noreferrer">
                                        {children}
                                    </a>
                                ),
                                p: ({ node, children, ...props }) => <p {...props} className="works-modal-markdown-p">{children}</p>,
                            }}
                        >
                            {work.desc}
                        </ReactMarkdown>
                    </column>


                    {work.relatedlinks && work.relatedlinks.length > 0 && (
                        <column style={{ marginBottom: '1lh' }}>
                            <div style={{ fontWeight: 'var(--font-weight-bold)', marginBottom: '0.5lh' }}>Related Links</div>
                            {work.relatedlinks.map((link, index) => (
                                <div key={index}>
                                    <a
                                        href={link}
                                        target="_blank"
                                        rel="noreferrer"
                                        className="works-modal-link"
                                    >
                                        {link} →
                                    </a>
                                </div>
                            ))}
                        </column>
                    )}

                </column>
            </column>
        </div>
    );

    return createPortal(modalContent, document.body);
}

export default function Works({ title, path, defaultVisibleCount = 6, compact = false, showTagFilter = false }) {
    const [works, setWorks] = useState({})
    const [selectedWork, setSelectedWork] = useState(null)
    const [visibleCount, setVisibleCount] = useState(defaultVisibleCount)
    const [isLoading, setIsLoading] = useState(true)
    const [allTags, setAllTags] = useState([])

    useEffect(() => {
        setIsLoading(true)
        fetch(path)
            .then((response) => response.text())
            .then((text) => yaml.parse(text))
            .then((data) => {
                setWorks(data)
                setIsLoading(false)
                // If defaultVisibleCount is null, show all works
                if (defaultVisibleCount === null) {
                    setVisibleCount(Object.keys(data).length)
                }
            })
            .catch((error) => {
                console.error("Error loading works:", error)
                setIsLoading(false)
            })
    }, [path, defaultVisibleCount])

    // タグの集計
    useEffect(() => {
        const workEntries = Object.entries(works);
        const tags = workEntries.reduce((acc, [_, work]) => {
            work.tags?.forEach((tag) => {
                if (acc[tag]) {
                    acc[tag] += 1;
                } else {
                    acc[tag] = 1;
                }
            });
            return acc;
        }, {});
        setAllTags(Object.entries(tags).sort((a, b) => b[1] - a[1]));
    }, [works]);

    const handleWorkClick = (work) => {
        setSelectedWork(work)
    }

    const handleCloseModal = () => {
        setSelectedWork(null)
    }

    const queries = getSearchQueries();
    const tags = getSearchTags();
    const workEntries = Object.entries(works);
    const filteredWorks = filterWorksByQueries(filterWorksByTags(workEntries, tags), queries);

    if (compact) {
        return (
            <div>
                {isLoading ? (
                    <div className="works-loading">Loading projects...</div>
                ) : (
                    <div className="works-grid-compact">
                        {filteredWorks.slice(0, visibleCount).map(([index, work]) => (
                            <div
                                key={index}
                                box-="square"
                                shear-="top"
                                className="works-card"
                                onClick={() => handleWorkClick(work)}
                            >
                                <span is-="badge" variant-="foreground0"
                                    style={{ '--badge-color': 'var(--background2)', '--badge-text': 'var(--foreground0)' }}>
                                    {work.title}
                                </span>

                                <div className="works-card-content">
                                    <div className="works-card-period">{work.period}</div>
                                    
                                    {work.img && (
                                        <div className="works-card-image-container">
                                            <img
                                                src={work.img}
                                                alt={work.title}
                                                className="works-card-image"
                                            />
                                        </div>
                                    )}

                                    <div className="works-card-description">
                                        {work.short_desc || work.desc || 'No description available'}
                                    </div>

                                    {work.repo && (
                                        <div className="works-card-repo">
                                            <FaGithub className="works-card-repo-icon" />
                                            <a
                                                href={`https://github.com/${work.repo}`}
                                                target="_blank"
                                                rel="noreferrer"
                                                className="works-card-repo-link"
                                                onClick={(e) => e.stopPropagation()}
                                            >
                                                {work.repo}
                                            </a>
                                        </div>
                                    )}

                                    <div className="works-card-tags">
                                        {work.tags?.map((tag, i) => (
                                            <Tag key={i} name={tag} targetPage="/works">{tag}</Tag>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}

                {selectedWork && (
                    <WorkModal
                        work={selectedWork}
                        open={!!selectedWork}
                        onClose={handleCloseModal}
                    />
                )}
            </div>
        )
    }

    // showTagFilter = trueの場合、SearchResult風のレイアウトを使用
    if (showTagFilter) {
        return (
            <main className="search-container">
                <div className="search-main">
                    {title && (
                        <div className="works-header">
                            <h1 className="works-title">{title}</h1>
                        </div>
                    )}

                    <SearchBar placeholder="Search projects by title, description, or tags" targetPage="/works" />

                    {(queries.length > 0 || tags.length > 0) && (
                        <div className="search-filters">
                            <span>Search for:</span>
                            {queries.map((query, index) => (
                                <DeletableQuery key={index} query={query} />
                            ))}
                            {tags.map((tag, index) => (
                                <DeletableTag key={index} name={tag} label={tag} />
                            ))}
                        </div>
                    )}

                    {isLoading ? (
                        <div className="works-loading">Loading projects...</div>
                    ) : (
                        <>
                            <div className="search-count">
                                Found <span className="search-count-number">{filteredWorks.length}</span> projects
                            </div>
                            <div className="works-grid">
                                {filteredWorks.slice(0, visibleCount).map(([index, work]) => (
                                    <div
                                        key={index}
                                        box-="square"
                                        shear-="top"
                                        className="works-card"
                                        onClick={() => handleWorkClick(work)}
                                    >
                                        <span is-="badge" variant-="foreground0"
                                            style={{ '--badge-color': 'var(--background2)', '--badge-text': 'var(--foreground0)' }}>
                                            {work.title}
                                        </span>

                                        <div className="works-card-content">
                                            <div className="works-card-period">{work.period}</div>

                                            {work.img && (
                                                <div className="works-card-image-container">
                                                    <img
                                                        src={work.img}
                                                        alt={work.title}
                                                        className="works-card-image"
                                                    />
                                                </div>
                                            )}

                                            <div className="works-card-description">
                                                {work.short_desc || work.desc || 'No description available'}
                                            </div>

                                            {work.repo && (
                                                <div className="works-card-repo">
                                                    <FaGithub className="works-card-repo-icon" />
                                                    <a
                                                        href={`https://github.com/${work.repo}`}
                                                        target="_blank"
                                                        rel="noreferrer"
                                                        className="works-card-repo-link"
                                                        onClick={(e) => e.stopPropagation()}
                                                    >
                                                        {work.repo}
                                                    </a>
                                                </div>
                                            )}

                                            <div className="works-card-tags">
                                                {work.tags?.map((tag, i) => (
                                                    <Tag key={i} name={tag}>{tag}</Tag>
                                                ))}
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </>
                    )}

                    {selectedWork && (
                        <WorkModal
                            work={selectedWork}
                            open={!!selectedWork}
                            onClose={handleCloseModal}
                        />
                    )}
                </div>

                <TagList allTags={allTags} header='Tags' className="search-sidebar" targetPage="/works" />
            </main>
        );
    }

    return (
        <div className="works-container">
            {title && !compact && (
                <div className="works-header">
                    <h1 className="works-title">{title}</h1>
                    <p className="works-subtitle">Click on any project to view details</p>
                </div>
            )}

            {isLoading ? (
                <div className="works-loading">Loading projects...</div>
            ) : (
                <>
                    <div className="works-grid">
                        {filteredWorks.slice(0, visibleCount).map(([index, work]) => (
                            <div
                                key={index}
                                box-="square"
                                shear-="top"
                                className="works-card"
                                onClick={() => handleWorkClick(work)}
                            >
                                <span is-="badge" variant-="foreground0"
                                    style={{ '--badge-color': 'var(--background2)', '--badge-text': 'var(--foreground0)' }}>
                                    {work.title}
                                </span>

                                <div className="works-card-content">
                                    <div className="works-card-period">{work.period}</div>
                                    
                                    {work.img && (
                                        <div className="works-card-image-container">
                                            <img
                                                src={work.img}
                                                alt={work.title}
                                                className="works-card-image"
                                            />
                                        </div>
                                    )}

                                    <div className="works-card-description">
                                        {work.short_desc || work.desc || 'No description available'}
                                    </div>

                                    {work.repo && (
                                        <div className="works-card-repo">
                                            <FaGithub className="works-card-repo-icon" />
                                            <a
                                                href={`https://github.com/${work.repo}`}
                                                target="_blank"
                                                rel="noreferrer"
                                                className="works-card-repo-link"
                                                onClick={(e) => e.stopPropagation()}
                                            >
                                                {work.repo}
                                            </a>
                                        </div>
                                    )}

                                    <div className="works-card-tags">
                                        {work.tags?.map((tag, i) => (
                                            <Tag key={i} name={tag} targetPage="/works">{tag}</Tag>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>

                    {selectedWork && (
                        <WorkModal
                            work={selectedWork}
                            open={!!selectedWork}
                            onClose={handleCloseModal}
                        />
                    )}
                </>
            )}
        </div>
    )
}
