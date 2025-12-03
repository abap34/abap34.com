import { useContext, useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { aboutContent } from "../config/content";
import LanguageContext from "../context/LanguageContext";
import BlogPostItem from './BlogPostItem';
import { useFocusContext } from '../context/FocusContext';

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
    const { setRecentItemCount, activeFocusId } = useFocusContext();

    useEffect(() => {
        fetchPosts().then((posts) => {
            setPosts(posts.slice(0, 5));
        });
    }, [language]);

    useEffect(() => {
        const totalItems = posts.length > 0 ? posts.length + 1 : 0;
        setRecentItemCount(totalItems);
    }, [posts.length, setRecentItemCount]);

    const viewAllFocusId = `top-item-recent-${posts.length}`;

    return (
        <column className="search-posts-list">
            {posts.length > 0 ? (
                <>
                    {posts.map((post, index) => (
                        <BlogPostItem
                            key={index}
                            post={post}
                            maxTags={3}
                            focusId={`top-item-recent-${index}`}
                        />
                    ))}
                    <column style={{ marginTop: '2lh', textAlign: 'left' }}>
                        <Link
                            to="/blog"
                            className={`search-post-title-link ${activeFocusId === viewAllFocusId ? 'keyboard-focused' : ''}`}
                            data-focus-id={viewAllFocusId}
                            data-focus-activate="self"
                        >
                            {content.messages.viewAllPosts} →
                        </Link>
                    </column>
                </>
            ) : (
                <column style={{ color: 'var(--foreground2)' }}>
                    <span>{content.messages.loadingPosts}</span>
                </column>
            )}
        </column>
    );
}
