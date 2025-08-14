import { useContext, useEffect, useState } from "react";
import { Link } from "react-router-dom";
import yaml from "yaml";
import { aboutContent } from "../config/content";
import LanguageContext from "../context/LanguageContext";
import { Link as DSLink, Tag, Text } from "../design-system";
import './About.css';

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
    const { language } = useContext(LanguageContext);
    const content = aboutContent[language];

    useEffect(() => {
        let filename = language === "ja" ? "/aboutme.yaml" : "/aboutme_en.yaml";
        fetch(filename)
            .then((res) => res.text())
            .then((text) => setData(yaml.parse(text)));
    }, [language]);

    useEffect(() => {
        fetchPosts().then((posts) => {
            setPosts(posts.slice(0, 5));
        });
    }, [language]);

    if (!data) return <p>Loading...</p>;


    return (
        <div className="about-container">
            <div className="posts-list">
                {posts.length > 0 ? (
                    <>
                        {posts.map((post, index) => (
                            <div key={index} className="about-post-item">
                                <div className="about-post-date">
                                    {post.post_date}
                                </div>
                                <DSLink href={post.url} external>
                                    {post.title}
                                </DSLink>
                                <div className="about-post-tags">
                                    {post.tags.slice(0, 3).map((tag, i) => (
                                        <Tag key={i}>{tag}</Tag>
                                    ))}
                                </div>
                            </div>
                        ))}
                        <div className="about-view-all">
                            <Link
                                to="/blog"
                                className="about-view-all-link"
                            >
                                {content.messages.viewAllPosts} →
                            </Link>
                        </div>
                    </>
                ) : (
                    <div className="about-loading">
                        <Text>{content.messages.loadingPosts}</Text>
                    </div>
                )}
            </div>
        </div>
    );
}
