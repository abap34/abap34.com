import { ArrowRight } from "lucide-react";
import { useContext, useEffect, useState } from "react";
import ReactMarkdown from "react-markdown";
import { Link } from "react-router-dom";
import yaml from "yaml";
import LanguageContext from "../context/LanguageContext";
import { Card, Section, Text, Link as DSLink, Tag } from "../design-system";
import { aboutContent } from "../config/content";

async function fetchPosts() {
    try {
        const response = await fetch('https://www.abap34.com/posts.json');
        if (!response.ok) {
            throw new Error('Failed to fetch posts');
        }
        const data = await response.json();
        return data;
    } catch (error) {
        console.error("Error fetching posts:", error);
        return [];
    }
}


export default function About() {
    const [data, setData] = useState(null);
    const [posts, setPosts] = useState([]);
    const [works, setWorks] = useState({});
    const { language, toggleLanguage } = useContext(LanguageContext);
    const content = aboutContent[language];

    useEffect(() => {
        let filename = language === "ja" ? "/aboutme.yaml" : "/aboutme_en.yaml";
        fetch(filename)
            .then((res) => res.text())
            .then((text) => setData(yaml.parse(text)));
    }, [language]);

    useEffect(() => {
        fetchPosts().then((posts) => {
            setPosts(posts.slice(0, 4));
        });

        // ワークスを取得
        const path = language === "ja" ? "/works.yaml" : "/works_en.yaml";
        fetch(path)
            .then((response) => response.text())
            .then((text) => yaml.parse(text))
            .then((data) => {
                setWorks(data);
            })
            .catch((error) => {
                console.error("Error loading works:", error);
            });
    }, [language]);

    if (!data) return <p>Loading...</p>;


    return (
        <div>
            <div className="flex flex-col gap-4">
                {posts.length > 0 ? (
                    <>
                        {posts.map((post, index) => (
                            <div key={index} className={`pb-4 mb-4 ${index < posts.length - 1 ? 'border-b border-foreground2' : ''}`}>
                                <div className="text-sm text-foreground2 mb-1">
                                    {post.post_date}
                                </div>
                                <DSLink href={post.url} external>
                                    {post.title}
                                </DSLink>
                                <div className="mt-2 flex flex-wrap gap-2">
                                    {post.tags.slice(0, 3).map((tag, i) => (
                                        <Tag key={i}>{tag}</Tag>
                                    ))}
                                </div>
                            </div>
                        ))}
                        <div className="text-center mt-4">
                            <Link 
                                to="/blog" 
                                className="no-underline font-medium text-accent0"
                            >
                                {content.messages.viewAllPosts} →
                            </Link>
                        </div>
                    </>
                ) : (
                    <div className="text-foreground1">
                        <Text>{content.messages.loadingPosts}</Text>
                    </div>
                )}
            </div>

            <hr className="webtui-separator" />

            <div className="py-4">
                <div className="mb-2 font-bold text-foreground0">
                    Contact
                </div>
                <div>
                    {content.messages.contactText}{' '}
                    <DSLink href="https://twitter.com/abap34" external>Twitter</DSLink>
                </div>
            </div>
        </div>
    );
}

function MarkdownText({ text }) {
    return (
        <div className="ml-4 space-y-5 text-gray-700 dark:text-gray-300 leading-relaxed prose prose-sm dark:prose-invert max-w-none">
            <ReactMarkdown>{text}</ReactMarkdown>
        </div>
    );
}
