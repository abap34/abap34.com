import React, { useEffect, useState } from "react";
import { FaGithub, FaLink, FaTag } from "react-icons/fa";
import { IoIosArrowDown, IoIosArrowUp } from "react-icons/io";
import ReactMarkdown from "react-markdown";
import yaml from "yaml";


const GithubLink = ({ repo }) => (
    <div className="flex items-center my-2">
        <FaGithub className="mr-2" />
        <a
            href={"https://github.com/" + repo}
            target="_blank"
            rel="noreferrer"
            className="hover:text-blue-600 transition duration-300 text-sm"
        >
            {repo}
        </a>
    </div>
);

const Tags = ({ tags }) => (
    <div className="flex items-center">
        <FaTag className="mr-2" />
        <p className="text-sm text-gray-600 dark:text-gray-400">
            {tags.map((tag, index) => (
                <span key={index} className="bg-gray-200 dark:bg-gray-800 rounded-full px-2 py-1 text-xs mr-2">
                    {tag}
                </span>
            ))}
        </p>
    </div>
);

const MarkdownContent = ({ content }) => (

    <p className="text-sm text-gray-600 whitespace-pre-wrap my-2 dark:text-gray-200">
        <ReactMarkdown components={{ a: ({ node, ...props }) => <a {...props} className="text-blue-600 hover:underline" /> }}>
            {content}
        </ReactMarkdown>
    </p>
);


// クリックしたら表示されるモーダル
const Modal = ({ work, onClose }) => {
    const [isVisible, setIsVisible] = useState(false);

    useEffect(() => {
        setIsVisible(true);
    }, []);

    // Note: 閉じるボタンだけで閉じるのは不親切なので、背景をクリックしても閉じられるようにする
    const handleBackgroundClick = (e) => {
        if (e.target === e.currentTarget) {
            onClose();
        }
    };

    return (
        <div
            className="fixed inset-0 bg-gray-800 bg-opacity-75 flex items-center justify-center z-50"
            onClick={handleBackgroundClick}
        >
            <div
                className={`bg-white p-4 m-4 rounded-lg shadow-lg ransform transition-transform duration-300 ${isVisible ? "scale-100" : "scale-0"} dark:bg-gray-900`}
                onClick={(e) => e.stopPropagation()}
            >
                <button onClick={onClose} className="absolute top-4 right-4 text-2xl">
                    &times;
                </button>

                <div className="flex items-center p-4 m-4">
                    <img src={work.img} alt={work.title} className="hidden md:block w-1/3 h-auto rounded-lg p-4" />
                    <div>
                        <h2 className="text-lg font-semibold">{work.title}</h2>
                        <p className="text-sm text-gray-600">{work.period}</p>
                        {
                            work.relatedlinks && work.relatedlinks.map((link, index) => (
                                <div key={index} className="flex items-center my-2">
                                    <FaLink className="mr-2" />
                                    <a href={link} target="_blank" rel="noreferrer" className="hover:text-blue-600 transition duration-300 text-sm break-all text-blue-600">
                                        {link}
                                    </a>
                                </div>
                            ))
                        }
                        {work.repo && <GithubLink repo={work.repo} />}
                        <MarkdownContent content={work.desc} />
                        <Tags tags={work.tags} />
                    </div>
                </div>
            </div>
        </div>
    );
};

export default function Works({ title, path, defaultVisibleCount }) {
    const [myworks, setWorks] = useState([]);
    const [selectedWork, setSelectedWork] = useState(null);
    const [visibleCount, setVisibleCount] = useState(defaultVisibleCount);
    const [showAll, setShowAll] = useState(false); 

    useEffect(() => {
        fetch(path)
            .then((response) => response.text())
            .then((text) => yaml.parse(text))
            .then(setWorks);
    }, 
    [path]);

    const handleWorkClick = (work) => {
        setSelectedWork(work);
    };

    const handleCloseModal = () => {
        setSelectedWork(null);
    };

    const loadMoreWorks = () => {
        setVisibleCount(myworks.length);
        setShowAll(true);
    };

    const closeMoreWorks = () => {
        setVisibleCount(defaultVisibleCount);
        setShowAll(false);
    };

    return (
        <main className="container mx-auto px-4 py-8 break-all">
            <h1 className="text-4xl font-bold text-blue-600 dark:text-blue-400 dark:text-opacity-80 dark:font-bold"> {title} </h1>
            <h2 className="text-2xl font-bold"> (クリックで詳細表示) </h2>
            {Object.entries(myworks).slice(0, visibleCount).map(([index, work]) => (
                <div
                    key={index}
                    className="m-4 border border-gray-200 rounded-lg p-4 cursor-pointer hover:bg-gray-100 transition duration-300 dark:border-gray-800 dark:hover:bg-gray-800 dark:border-4"
                    onClick={() => handleWorkClick(work)}
                >
                    <div className="flex items-center">
                        <img src={work.img} alt={work.title} className="hidden md:block w-1/5 h-auto rounded-lg p-4" />
                        <div>
                            <h3 className="text-lg font-semibold">{work.title}</h3>
                            <p className="text-sm text-gray-600">{work.period}</p>
                            {work.repo && <GithubLink repo={work.repo} />}
                            <MarkdownContent content={work.short_desc} />
                            <Tags tags={work.tags} />
                        </div>
                    </div>
                </div>
            ))}

            {!showAll ? (
                <button
                    onClick={loadMoreWorks}
                    className="w-full mt-4 px-4 py-2 bg-blue-400 text-white rounded hover:bg-blue-600 transition"
                >
                    もっと見る
                    <IoIosArrowDown className="text-xl inline" />
                </button>
            ) : (
                <button
                    onClick={closeMoreWorks}
                    className="w-full mt-4 px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600 transition"
                >
                    閉じる
                    <IoIosArrowUp className="text-xl inline" />
                </button>
            )}

            {selectedWork && <Modal work={selectedWork} onClose={handleCloseModal} />}
        </main>
    );
}
