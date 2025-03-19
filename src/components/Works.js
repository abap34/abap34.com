import { ChevronDown, ChevronUp, ExternalLink, Tag, X } from "lucide-react";
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
    const [activeTab, setActiveTab] = useState('details')

    if (!open) return null

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-3xl w-full max-h-[90vh] flex flex-col">
                {/* Header */}
                <div className="p-5 border-b border-gray-200 dark:border-gray-700 flex justify-between items-start">
                    <div>
                        <h2 className="text-2xl  text-gray-900 dark:text-white">{work.title}</h2>
                        <p className=" text-sm text-gray-500 dark:text-gray-400">{work.period}</p>
                    </div>
                    <button
                        onClick={onClose}
                        className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
                    >
                        <X className="h-5 w-5" />
                    </button>
                </div>

                {/* Tabs */}
                {/* <div className="border-b border-gray-200 dark:border-gray-700">
                    <div className="flex">
                        <button
                            className={`px-4 py-2 text-sm font-medium ${activeTab === 'details'
                                ? 'border-b-2 border-blue-600 text-blue-600 dark:text-blue-400 dark:border-blue-400'
                                : 'text-gray-500 dark:text-gray-400'
                                }`}
                            onClick={() => setActiveTab('details')}
                        >
                            Details
                        </button>
                        <button
                            className={`px-4 py-2 text-sm font-medium ${activeTab === 'preview'
                                ? 'border-b-2 border-blue-600 text-blue-600 dark:text-blue-400 dark:border-blue-400'
                                : 'text-gray-500 dark:text-gray-400'
                                }`}
                            onClick={() => setActiveTab('preview')}
                        >
                            Preview
                        </button>
                    </div>
                </div> */}

                {/* Content */}
                <div className="flex-1 overflow-auto">
                    {/* {activeTab === 'details' ? ( */}
                        <div className="p-5 space-y-4">
                            {work.repo && <GithubLink repo={work.repo} />}

                            {work.relatedlinks && work.relatedlinks.length > 0 && (
                                <div className="space-y-2">
                                    <h4 className="text-sm font-medium text-gray-900 dark:text-white">Related Links</h4>
                                    {work.relatedlinks && work.relatedlinks.map((link, index) => (
                                        <ExternalLinkComponent key={index} url={link} />
                                    ))}
                                </div>
                            )}

                            <MarkdownContent content={work.desc} />

                            <div className="pt-2">
                                <Tags tags={work.tags} />
                            </div>
                        </div>
                    {/* ) : (
                        <div className="flex justify-center items-center p-4 h-[50vh]">
                            <img
                                src={work.img || "/placeholder.svg"}
                                alt={work.title}
                                className="max-h-full max-w-full object-contain rounded-md border border-gray-200 dark:border-gray-700"
                            />
                        </div>
                    )} */}
                </div>

                {/* Footer */}
                <div className="p-4 border-t border-gray-200 dark:border-gray-700 flex justify-end">
                    <button
                        onClick={onClose}
                        className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-800 dark:bg-gray-700 dark:hover:bg-gray-600 dark:text-white rounded-md text-sm font-medium transition-colors"
                    >
                        Close
                    </button>
                </div>
            </div>
        </div>
    )
}

export default function Works({ title, path, defaultVisibleCount = 6 }) {
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
            })
            .catch((error) => {
                console.error("Error loading works:", error)
                setIsLoading(false)
            })
    }, [path])

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

    return (
        <div className="container mx-auto px-4 py-8">
            <div className="mb-8 border-b border-gray-200 dark:border-gray-700 pb-4">
                <h1 className="text-4xl  font-bold text-blue-700 dark:text-blue-400 mb-2">{title}</h1>
                <p className="text-gray-600 dark:text-gray-400">Click on any project to view details</p>
            </div>

            {isLoading ? (
                <div className="grid grid-cols-1 gap-6 animate-pulse">
                    {[...Array(3)].map((_, i) => (
                        <div key={i} className="h-48 bg-gray-200 dark:bg-gray-700 rounded-lg"></div>
                    ))}
                </div>
            ) : (
                <>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {workEntries.slice(0, visibleCount).map(([index, work]) => (
                            <WorkCard
                                key={index}
                                work={work}
                                onClick={() => handleWorkClick(work)}
                            />
                        ))}
                    </div>

                    {hasMoreWorks && (
                        <div className="flex justify-center mt-8">
                            <button
                                className="px-4 py-2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-md text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 flex items-center group transition-colors"
                                onClick={showMore}
                            >
                                Show More
                                <ChevronDown className="ml-2 h-4 w-4 group-hover:translate-y-0.5 transition-transform" />
                            </button>
                        </div>
                    )}

                    {visibleCount > defaultVisibleCount && workEntries.length > defaultVisibleCount && (
                        <div className="flex justify-center mt-4">
                            <button
                                className="px-4 py-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200 flex items-center group"
                                onClick={showLess}
                            >
                                Show Less
                                <ChevronUp className="ml-2 h-4 w-4 group-hover:-translate-y-0.5 transition-transform" />
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
