import { ArrowRight } from "lucide-react";
import { useContext, useEffect, useState } from "react";
import ReactMarkdown from "react-markdown";
import { Link } from "react-router-dom";
import yaml from "yaml";
import LanguageContext from "../context/LanguageContext";
import { Card, Section, Text, Link as DSLink } from "../design-system";
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
        <Card variant="elevated" className="max-w-4xl mx-auto py-8 px-6 space-y-8">
            <Section title={content.sections.recentPosts}>
                <div className="space-y-4">
                    {posts.length > 0 ? (
                        <>
                            {posts.map((post, index) => (
                                <div key={index} className="border-b border-gray-200 dark:border-gray-700 pb-4">
                                    <Text variant="small" className="mb-1">{post.post_date}</Text>
                                    <DSLink href={post.url} external className="text-lg font-medium">
                                        {post.title}
                                    </DSLink>
                                    <div className="mt-2 flex flex-wrap gap-1">
                                        {post.tags.slice(0, 3).map((tag, i) => (
                                            <span key={i} className="text-xs px-2 py-1 bg-gray-100 dark:bg-gray-800 rounded-full font-mono">
                                                {tag}
                                            </span>
                                        ))}
                                    </div>
                                </div>
                            ))}
                            <Link to="/blog" className="text-blue-600 hover:underline flex items-center mt-4 font-medium">
                                <span>{content.messages.viewAllPosts}</span>
                                <ArrowRight className="ml-1 h-4 w-4" />
                            </Link>
                        </>
                    ) : (
                        <Text>{content.messages.loadingPosts}</Text>
                    )}
                </div>
            </Section>

            <Section title={content.sections.contact}>
                <Text>
                    {content.messages.contactText}{' '}
                    <DSLink href="https://twitter.com/abap34" external>Twitter</DSLink>
                </Text>
            </Section>
        </Card>
    );
}

function MarkdownText({ text }) {
    return (
        <div className="ml-4 space-y-5 text-gray-700 dark:text-gray-300 leading-relaxed prose prose-sm dark:prose-invert max-w-none">
            <ReactMarkdown>{text}</ReactMarkdown>
        </div>
    );
}
