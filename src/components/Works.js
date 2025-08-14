import { ExternalLink } from "lucide-react";
import { useEffect, useState } from "react";
import { FaGithub } from "react-icons/fa6";
import ReactMarkdown from "react-markdown";
import yaml from "yaml";

const GithubLink = ({ repo }) => (
    <div className="flex items-center gap-2 my-2">
        <FaGithub className="h-4 w-4 text-accent0" />
        <a
            href={`https://github.com/${repo}`}
            target="_blank"
            rel="noreferrer"
            className="text-sm text-accent0 no-underline hover:underline break-all"
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
            <span
                key={index}
                className="bg-background2 text-foreground1 px-2 py-1 rounded text-xs font-normal"
            >
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
            className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4"
            onClick={onClose}
        >
            <div
                className="webtui-box max-w-4xl w-full max-h-[90vh] overflow-y-auto m-0"
                onClick={(e) => e.stopPropagation()}
            >
                <div className="webtui-box-header flex justify-between items-start">
                    <div>
                        <div className="text-2xl font-bold text-accent0">{work.title}</div>
                        <div className="text-sm text-foreground2 mt-1">{work.period}</div>
                    </div>
                    <button
                        variant-="foreground1"
                        onClick={onClose}
                        className="p-2 min-w-auto"
                    >
                        ✕
                    </button>
                </div>

                <div className="mt-4">
                    {work.img && (
                        <div className="mb-4 text-center">
                            <img
                                src={work.img}
                                alt={work.title}
                                className="w-80 h-48 object-cover rounded-lg border border-foreground2 inline-block"
                            />
                        </div>
                    )}

                    {work.repo && (
                        <div className="mb-4 flex items-center gap-2">
                            <FaGithub className="text-accent0 w-4 h-4" />
                            <a
                                href={`https://github.com/${work.repo}`}
                                target="_blank"
                                rel="noreferrer"
                                className="text-accent0 no-underline text-sm"
                            >
                                {work.repo}
                            </a>
                        </div>
                    )}

                    {work.relatedlinks && work.relatedlinks.length > 0 && (
                        <div className="mb-4">
                            <div className="font-bold text-foreground0 mb-2">Related Links</div>
                            {work.relatedlinks.map((link, index) => (
                                <div key={index} className="mb-1">
                                    <a
                                        href={link}
                                        target="_blank"
                                        rel="noreferrer"
                                        className="text-accent0 no-underline text-sm"
                                    >
                                        {link} →
                                    </a>
                                </div>
                            ))}
                        </div>
                    )}

                    <div className="mb-4 leading-relaxed text-foreground1">
                        <ReactMarkdown
                            components={{
                                a: ({ node, ...props }) => (
                                    <a {...props} className="text-accent0 no-underline" target="_blank" rel="noreferrer" />
                                ),
                                p: ({ node, ...props }) => <p {...props} className="mb-2" />,
                            }}
                        >
                            {work.desc}
                        </ReactMarkdown>
                    </div>

                    <div className="flex gap-2 flex-wrap">
                        {work.tags?.map((tag, i) => (
                            <span
                                key={i}
                                className="bg-background2 text-foreground1 px-2 py-1 rounded text-xs font-normal"
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
                    <div className="text-foreground1">Loading projects...</div>
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
                                        className="cursor-pointer"
                                        onClick={() => handleWorkClick(work)}
                                    >
                                        <td className="font-bold text-accent0">{work.title}</td>
                                        <td className="text-sm">{work.period}</td>
                                        <td>
                                            <div className="flex gap-1 flex-wrap">
                                                {work.tags?.slice(0, 2).map((tag, i) => (
                                                    <span
                                                        key={i}
                                                        className="bg-background2 text-foreground1 px-2 py-1 rounded text-xs font-normal"
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
        <div className="py-8 px-0">
            {title && !compact && (
                <div className="mb-8">
                    <h1 className="text-3xl font-bold text-accent0 mb-2">{title}</h1>
                    <p className="text-foreground1">Click on any project to view details</p>
                </div>
            )}

            {isLoading ? (
                <div className="text-foreground1">Loading projects...</div>
            ) : (
                <>
                    <div className={`grid gap-6 ${compact ? 'grid-cols-1' : 'grid-cols-1 md:grid-cols-2 lg:grid-cols-4'}`}>
                        {workEntries.slice(0, visibleCount).map(([index, work]) => (
                            <div
                                key={index}
                                className="border border-foreground2 rounded-lg p-6 cursor-pointer bg-background1 transition-all duration-200 ease-in-out hover:shadow-lg"
                                onClick={() => handleWorkClick(work)}
                            >
                                <div className="flex justify-between items-start mb-3">
                                    <div>
                                        <h3 className="font-bold text-accent0 text-lg mb-1">{work.title}</h3>
                                        <div className="text-sm text-foreground2">{work.period}</div>
                                    </div>
                                    {work.img && !compact && (
                                        <img
                                            src={work.img}
                                            alt={work.title}
                                            className="w-12 h-12 rounded border border-foreground2 object-cover"
                                        />
                                    )}
                                </div>

                                <div className="mb-3 text-sm text-foreground1 leading-snug">
                                    {work.short_desc}
                                </div>

                                {work.repo && (
                                    <div className="mb-3 flex items-center gap-2">
                                        <FaGithub className="text-accent0 w-4 h-4" />
                                        <a
                                            href={`https://github.com/${work.repo}`}
                                            target="_blank"
                                            rel="noreferrer"
                                            className="text-accent0 no-underline text-sm hover:underline"
                                            onClick={(e) => e.stopPropagation()}
                                        >
                                            {work.repo}
                                        </a>
                                    </div>
                                )}

                                <div className="flex gap-2 flex-wrap">
                                    {work.tags?.slice(0, 3).map((tag, i) => (
                                        <span
                                            key={i}
                                            className="bg-background2 text-foreground1 px-2 py-1 rounded text-xs font-normal"
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
