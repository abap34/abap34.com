import { useEffect, useState } from "react";
import { FaGithub } from "react-icons/fa6";
import ReactMarkdown from "react-markdown";
import yaml from "yaml";
import './Works.css';

const WorkModal = ({ work, open, onClose }) => {
    if (!open) return null

    return (
        <div
            className="works-modal-overlay"
            onClick={onClose}
        >
            <div
                className="works-modal-content"
                onClick={(e) => e.stopPropagation()}
            >
                <div className="works-modal-header">
                    <div>
                        <div className="works-modal-title">{work.title}</div>
                        <div className="works-modal-period">{work.period}</div>
                    </div>
                    <button
                        is-="button"
                        variant-="background2"
                        className="works-modal-close"
                        onClick={onClose}
                    >
                        ✕
                    </button>
                </div>

                <div className="works-modal-body">
                    {work.img && (
                        <div className="works-modal-image">
                            <img
                                src={work.img}
                                alt={work.title}
                                className="works-modal-img"
                            />
                        </div>
                    )}

                    {work.repo && (
                        <div className="works-modal-repo">
                            <FaGithub className="works-modal-repo-icon" />
                            <a
                                href={`https://github.com/${work.repo}`}
                                target="_blank"
                                rel="noreferrer"
                                className="works-modal-repo-link"
                            >
                                {work.repo}
                            </a>
                        </div>
                    )}

                    {work.relatedlinks && work.relatedlinks.length > 0 && (
                        <div className="works-modal-links">
                            <div className="works-modal-links-title">Related Links</div>
                            {work.relatedlinks.map((link, index) => (
                                <div key={index} className="works-modal-link-item">
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
                        </div>
                    )}

                    <div className="works-modal-description">
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
                    </div>

                    <div className="works-modal-tags">
                        {work.tags?.map((tag, i) => (
                            <span
                                key={i}
                                className="works-modal-tag"
                            >
                                {tag}
                            </span>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    )
}

export default function Works({ title, path, defaultVisibleCount = 6, compact = false }) {
    const [works, setWorks] = useState({})
    const [selectedWork, setSelectedWork] = useState(null)
    const [visibleCount, setVisibleCount] = useState(defaultVisibleCount)
    const [isLoading, setIsLoading] = useState(true)

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

    const handleWorkClick = (work) => {
        setSelectedWork(work)
    }

    const handleCloseModal = () => {
        setSelectedWork(null)
    }

    const workEntries = Object.entries(works)

    if (compact) {
        return (
            <div>
                {isLoading ? (
                    <div className="works-loading">Loading projects...</div>
                ) : (
                    <div className="terminal-table">
                        <table>
                            <thead>
                                <tr>
                                    <th>Project</th>
                                    <th>Period</th>
                                    <th>Tags</th>
                                </tr>
                            </thead>
                            <tbody>
                                {workEntries.slice(0, visibleCount).map(([index, work]) => (
                                    <tr
                                        key={index}
                                        className="works-table-row"
                                        onClick={() => handleWorkClick(work)}
                                    >
                                        <td className="works-table-title">{work.title}</td>
                                        <td className="works-table-period">{work.period}</td>
                                        <td>
                                            <div className="works-table-tags">
                                                {work.tags?.slice(0, 2).map((tag, i) => (
                                                    <span
                                                        key={i}
                                                        className="works-table-tag"
                                                    >
                                                        {tag}
                                                    </span>
                                                ))}
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
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
                    <div className={compact ? 'works-grid-compact' : 'works-grid'}>
                        {workEntries.slice(0, visibleCount).map(([index, work]) => (
                            <div
                                key={index}
                                className="works-card"
                                onClick={() => handleWorkClick(work)}
                            >
                                <div className="works-card-header">
                                    <div>
                                        <h3 className="works-card-title">{work.title}</h3>
                                        <div className="works-card-period">{work.period}</div>
                                    </div>
                                    {work.img && !compact && (
                                        <img
                                            src={work.img}
                                            alt={work.title}
                                            className="works-card-image"
                                        />
                                    )}
                                </div>

                                <div className="works-card-description">
                                    {work.short_desc}
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
                                    {work.tags?.slice(0, 3).map((tag, i) => (
                                        <span
                                            key={i}
                                            className="works-card-tag"
                                        >
                                            {tag}
                                        </span>
                                    ))}
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
