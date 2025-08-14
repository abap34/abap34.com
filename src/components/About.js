import { ArrowRight } from "lucide-react";
import { useContext, useEffect, useState } from "react";
import ReactMarkdown from "react-markdown";
import { Link } from "react-router-dom";
import yaml from "yaml";
import LanguageContext from "../context/LanguageContext";
import { Card, Section, Text, Link as DSLink, Badge } from "../design-system";
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
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                {posts.length > 0 ? (
                    <>
                        {posts.map((post, index) => (
                            <div key={index} style={{ borderBottom: index < posts.length - 1 ? '1px solid var(--foreground2)' : 'none', paddingBottom: '1rem', marginBottom: '1rem' }}>
                                <div style={{ fontSize: '0.875rem', color: 'var(--foreground2)', marginBottom: '0.25rem' }}>
                                    {post.post_date}
                                </div>
                                <DSLink href={post.url} external style={{ fontSize: '1rem', fontWeight: '500', color: 'var(--foreground0)' }}>
                                    {post.title}
                                </DSLink>
                                <div style={{ marginTop: '0.5rem', display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
                                    {post.tags.slice(0, 3).map((tag, i) => (
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
                        <div style={{ textAlign: 'center', marginTop: '1rem' }}>
                            <Link 
                                to="/blog" 
                                variant-="accent0"
                                style={{ 
                                    textDecoration: 'none',
                                    fontWeight: '500',
                                    color: 'var(--accent0)'
                                }}
                            >
                                {content.messages.viewAllPosts} →
                            </Link>
                        </div>
                    </>
                ) : (
                    <div style={{ color: 'var(--foreground1)' }}>
                        <Text>{content.messages.loadingPosts}</Text>
                    </div>
                )}
            </div>

            <hr className="webtui-separator" />

            <div style={{ padding: '1rem 0' }}>
                <div style={{ marginBottom: '0.5rem', fontWeight: 'var(--font-weight-bold)', color: 'var(--foreground0)' }}>
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
