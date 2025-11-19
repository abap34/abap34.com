import { useContext, useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { aboutContent } from "../config/content";
import LanguageContext from "../context/LanguageContext";
import BlogPostItem from './BlogPostItem';

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

export default function RecentPosts() {
    const [posts, setPosts] = useState([]);
    const { language } = useContext(LanguageContext);
    const content = aboutContent[language];

    useEffect(() => {
        fetchPosts().then((posts) => {
            setPosts(posts.slice(0, 4));
        });
    }, [language]);


    return (
        <div className="search-posts-list">
            {posts.length > 0 ? (
                <>
                    {posts.map((post, index) => (
                        <BlogPostItem key={index} post={post} maxTags={3} />
                    ))}
                    <div style={{ marginTop: '2lh', textAlign: 'left' }}>
                        <Link
                            to="/blog"
                            className="search-post-title-link"
                        >
                            {content.messages.viewAllPosts} →
                        </Link>
                    </div>
                </>
            ) : (
                <div style={{ color: 'var(--foreground2)' }}>
                    <span>{content.messages.loadingPosts}</span>
                </div>
            )}
        </div>
    );
}
