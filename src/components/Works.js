import { ChevronDown, ChevronUp, ExternalLink, Tag  } from "lucide-react";
import React, { useEffect, useState } from "react";
import { FaGithub } from "react-icons/fa6";
import ReactMarkdown from "react-markdown";
import yaml from "yaml";

const GithubLink = ({ repo }) => (
    <div className="flex items-center gap-2 my-2">
        <FaGithub className="h-4 w-4" />
        <a
            href={`https://github.com/${repo}`}
            target="_blank"
            rel="noreferrer"
            className="text-sm hover:text-blue-600 transition-colors duration-200  border-none break-all"
        >
            {repo}
        </a>
    </div>
)

const ExternalLinkComponent = ({ url }) => (
    <div className="flex items-center gap-2 my-2">
        <ExternalLink className="h-4 w-4 text-gray-500" />
        <a
            href={url}
            target="_blank"
            rel="noreferrer"
            className="text-sm hover:text-blue-600 transition-colors duration-200 underline underline-offset-2 break-all"
        >
            {url}
        </a>
    </div>
)

const Tags = ({ tags }) => (
    <div className="flex flex-wrap gap-2 mt-3">
        {tags && tags.map((tag, index) => (
            // <span
            //     key={index}
            //     className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800 border border-gray-200 dark:bg-gray-800 dark:text-gray-200 dark:border-gray-700"
            // >
            <span
                key={index}
                className="inline-flex items-center px-2.5 py-0.5 bg-gray-100 text-xs font-medium  dark:bg-blue-800 dark:text-blue-200 dark:border-blue-700 rounded-full"
            >
                <Tag className="h-3 w-3 mr-1" />
                {tag}
            </span>


        ))}
    </div>
)

const MarkdownContent = ({ content }) => (
    <div className="prose prose-sm dark:prose-invert max-w-none mt-4">
        <ReactMarkdown
            components={{
                a: ({ node, ...props }) => (
                    <a {...props} className="text-blue-600 hover:underline" target="_blank" rel="noreferrer" />
                ),
                p: ({ node, ...props }) => <p {...props} className="text-gray-600 dark:text-gray-400" />,
            }}
        >
            {content}
        </ReactMarkdown>
    </div>
)


const WorkCard = ({ work, onClick }) => (
    <div
        className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-5 transition-all duration-300 hover:shadow-md cursor-pointer hover:border-blue-200 dark:hover:border-blue-900"
        onClick={onClick}
    >
        <div className="flex justify-between items-start">
            <div>
                <h3 className="text-xl  font-medium text-gray-900 dark:text-white">{work.title}</h3>
                <p className="text-xs  mt-1 text-gray-500 dark:text-gray-400">{work.period}</p>
            </div>
            <div className="hidden sm:block w-16 h-16 rounded overflow-hidden border border-gray-200 dark:border-gray-700 focus-within:ring-2 focus-within:ring-blue-500 font-medium">
                <img
                    src={work.img || "/placeholder.svg"}
                    alt={work.title}
                    className="w-full h-full object-cover"
                />
            </div>
        </div>

        <div className="mt-4">
            {work.repo && <GithubLink repo={work.repo} />}
            <div className="text-sm text-gray-600 dark:text-gray-400 line-clamp-2">
                {work.short_desc}
            </div>
        </div>

        <div className="mt-4">
            <Tags tags={work.tags} />
        </div>
    </div>
)

const WorkModal = ({ work, open, onClose }) => {
    if (!open) return null

    return (
        <div 
            style={{
                position: 'fixed',
                inset: 0,
                backgroundColor: 'rgba(0, 0, 0, 0.5)',
                zIndex: 50,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                padding: '1rem'
            }}
            onClick={onClose}
        >
            <div 
                className="webtui-box"
                style={{
                    maxWidth: '48rem',
                    width: '100%',
                    maxHeight: '90vh',
                    overflowY: 'auto',
                    margin: '0'
                }}
                onClick={(e) => e.stopPropagation()}
            >
                <div className="webtui-box-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start' }}>
                    <div>
                        <div style={{ fontSize: '1.5rem', fontWeight: 'var(--font-weight-bold)', color: 'var(--accent0)' }}>
                            {work.title}
                        </div>
                        <div style={{ fontSize: '0.875rem', color: 'var(--foreground2)', marginTop: '0.25rem' }}>
                            {work.period}
                        </div>
                    </div>
                    <button
                        variant-="foreground1"
                        onClick={onClose}
                        style={{ padding: '0.5rem', minWidth: 'auto' }}
                    >
                        ✕
                    </button>
                </div>

                <div style={{ marginTop: '1rem' }}>
                    {work.img && (
                        <div style={{ marginBottom: '1rem', textAlign: 'center' }}>
                            <img
                                src={work.img}
                                alt={work.title}
                                style={{
                                    width: '20rem',
                                    height: '12rem',
                                    objectFit: 'cover',
                                    borderRadius: '0.5rem',
                                    border: '1px solid var(--foreground2)'
                                }}
                            />
                        </div>
                    )}

                    {work.repo && (
                        <div style={{ marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                            <FaGithub style={{ color: 'var(--accent0)', width: '1rem', height: '1rem' }} />
                            <a
                                href={`https://github.com/${work.repo}`}
                                target="_blank"
                                rel="noreferrer"
                                style={{ 
                                    color: 'var(--accent0)', 
                                    textDecoration: 'none',
                                    fontSize: '0.875rem'
                                }}
                            >
                                {work.repo}
                            </a>
                        </div>
                    )}

                    {work.relatedlinks && work.relatedlinks.length > 0 && (
                        <div style={{ marginBottom: '1rem' }}>
                            <div style={{ fontWeight: 'var(--font-weight-bold)', color: 'var(--foreground0)', marginBottom: '0.5rem' }}>
                                Related Links
                            </div>
                            {work.relatedlinks.map((link, index) => (
                                <div key={index} style={{ marginBottom: '0.25rem' }}>
                                    <a
                                        href={link}
                                        target="_blank"
                                        rel="noreferrer"
                                        style={{ 
                                            color: 'var(--accent0)', 
                                            textDecoration: 'none',
                                            fontSize: '0.875rem'
                                        }}
                                    >
                                        {link} →
                                    </a>
                                </div>
                            ))}
                        </div>
                    )}

                    <div style={{ marginBottom: '1rem', lineHeight: '1.6', color: 'var(--foreground1)' }}>
                        <ReactMarkdown
                            components={{
                                a: ({ node, ...props }) => (
                                    <a {...props} style={{ color: 'var(--accent0)', textDecoration: 'none' }} target="_blank" rel="noreferrer" />
                                ),
                                p: ({ node, ...props }) => <p {...props} style={{ marginBottom: '0.5rem' }} />,
                            }}
                        >
                            {work.desc}
                        </ReactMarkdown>
                    </div>

                    <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                        {work.tags?.map((tag, i) => (
                            <span
                                key={i}
                                style={{
                                    backgroundColor: 'var(--background2)',
                                    color: 'var(--foreground1)',
                                    padding: '0.25rem 0.5rem',
                                    borderRadius: '0.25rem',
                                    fontSize: '0.75rem',
                                    fontWeight: 'var(--font-weight-normal)'
                                }}
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
    const hasMoreWorks = workEntries.length > visibleCount

    const showMore = () => {
        setVisibleCount(workEntries.length)
    }

    const showLess = () => {
        setVisibleCount(defaultVisibleCount)
    }

    if (compact) {
        return (
            <div>
                {isLoading ? (
                    <div style={{ color: 'var(--foreground1)' }}>Loading projects...</div>
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
                                        style={{ cursor: 'pointer' }}
                                        onClick={() => handleWorkClick(work)}
                                    >
                                        <td style={{ fontWeight: 'var(--font-weight-bold)', color: 'var(--accent0)' }}>
                                            {work.title}
                                        </td>
                                        <td style={{ fontSize: '0.875rem' }}>
                                            {work.period}
                                        </td>
                                        <td>
                                            <div style={{ display: 'flex', gap: '0.25rem', flexWrap: 'wrap' }}>
                                                {work.tags?.slice(0, 2).map((tag, i) => (
                                                    <span 
                                                        key={i} 
                                                        is-="badge"
                                                        variant-="accent1"
                                                        style={{ fontSize: '0.625rem' }}
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
        <div style={{ padding: compact ? '0' : '2rem 1rem', maxWidth: compact ? 'none' : '72rem', margin: compact ? '0' : '0 auto' }}>
            {title && !compact && (
                <div style={{ marginBottom: '2rem' }}>
                    <h1 style={{ fontSize: '2rem', fontWeight: 'var(--font-weight-bold)', color: 'var(--accent0)', marginBottom: '0.5rem' }}>
                        {title}
                    </h1>
                    <p style={{ color: 'var(--foreground1)' }}>Click on any project to view details</p>
                </div>
            )}

            {isLoading ? (
                <div style={{ color: 'var(--foreground1)' }}>Loading projects...</div>
            ) : (
                <>
                    <div style={{ display: 'grid', gap: '1.5rem', gridTemplateColumns: compact ? '1fr' : 'repeat(auto-fill, minmax(300px, 1fr))' }}>
                        {workEntries.slice(0, visibleCount).map(([index, work]) => (
                            <div 
                                key={index} 
                                style={{ 
                                    border: '1px solid var(--foreground2)', 
                                    borderRadius: '0.5rem', 
                                    padding: '1.5rem', 
                                    cursor: 'pointer',
                                    backgroundColor: 'var(--background1)',
                                    transition: 'all 0.2s ease'
                                }}
                                onClick={() => handleWorkClick(work)}
                            >
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: '0.75rem' }}>
                                    <div>
                                        <h3 style={{ fontWeight: 'var(--font-weight-bold)', color: 'var(--accent0)', fontSize: '1.1rem', marginBottom: '0.25rem' }}>
                                            {work.title}
                                        </h3>
                                        <div style={{ fontSize: '0.875rem', color: 'var(--foreground2)' }}>
                                            {work.period}
                                        </div>
                                    </div>
                                    {work.img && !compact && (
                                        <img
                                            src={work.img}
                                            alt={work.title}
                                            style={{
                                                width: '3rem',
                                                height: '3rem',
                                                borderRadius: '0.25rem',
                                                border: '1px solid var(--foreground2)',
                                                objectFit: 'cover'
                                            }}
                                        />
                                    )}
                                </div>
                                
                                <div style={{ marginBottom: '0.75rem', fontSize: '0.875rem', color: 'var(--foreground1)', lineHeight: '1.4' }}>
                                    {work.short_desc}
                                </div>

                                {work.repo && (
                                    <div style={{ marginBottom: '0.75rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                        <FaGithub style={{ color: 'var(--accent0)', width: '1rem', height: '1rem' }} />
                                        <a
                                            href={`https://github.com/${work.repo}`}
                                            target="_blank"
                                            rel="noreferrer"
                                            style={{ 
                                                color: 'var(--accent0)', 
                                                textDecoration: 'none',
                                                fontSize: '0.875rem'
                                            }}
                                            onClick={(e) => e.stopPropagation()}
                                        >
                                            {work.repo}
                                        </a>
                                    </div>
                                )}

                                <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                                    {work.tags?.slice(0, 3).map((tag, i) => (
                                        <span 
                                            key={i}
                                            style={{
                                                backgroundColor: 'var(--background2)',
                                                color: 'var(--foreground1)',
                                                padding: '0.25rem 0.5rem',
                                                borderRadius: '0.25rem',
                                                fontSize: '0.75rem',
                                                fontWeight: 'var(--font-weight-normal)'
                                            }}
                                        >
                                            {tag}
                                        </span>
                                    ))}
                                </div>
                            </div>
                        ))}
                    </div>

                    {hasMoreWorks && (
                        <div style={{ textAlign: 'center', marginTop: '2rem' }}>
                            <button variant-="accent0" onClick={showMore}>
                                Show More Projects
                            </button>
                        </div>
                    )}

                    {visibleCount > defaultVisibleCount && workEntries.length > defaultVisibleCount && (
                        <div style={{ textAlign: 'center', marginTop: '1rem' }}>
                            <button variant-="foreground1" onClick={showLess}>
                                Show Less
                            </button>
                        </div>
                    )}

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
