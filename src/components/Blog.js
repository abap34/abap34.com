import { ArrowRight, TrendingUp } from 'lucide-react';
import { useEffect, useState } from 'react';
import { FaRss } from 'react-icons/fa';
import swal from 'sweetalert2';
import './Blog.css';
import SearchBar from './SearchBar';
import Tag from './Tag';
import TagList from './TagList';

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

function copyRSS() {
    navigator.clipboard.writeText('https://www.abap34.com/rss.xml');
    swal.fire({
        title: 'Copied RSS URL',
        text: 'The RSS URL has been copied to the clipboard.',
        icon: 'success',
        timer: 2000,
        confirmButtonText: 'OK'
    });
}

// 文字列の最初の 100文字を取得し、必要に応じて省略記号を追加
function truncateContent(content) {
    const maxLength = 100;
    if (content.length <= maxLength) {
        return content;
    }
    return content.substring(0, maxLength) + '...';
}

function BlogTimeline({ posts }) {
    return (
        <div className="blog-timeline-container">
            <div className="blog-timeline">
                <div
                    className="blog-timeline-line"
                    aria-hidden="true"
                >
                </div>

                {posts.map((post, index) => (
                    <div key={index} className="blog-timeline-item">
                        <p className="blog-timeline-date">
                            {post.post_date}
                        </p>

                        <div className="blog-timeline-card">
                            <a href={post.url} target="_blank" rel="noreferrer">
                                <h3 className="blog-timeline-card-title">{post.title}</h3>
                            </a>

                            <img src={post.thumbnail_url} alt={post.title} className="blog-timeline-card-image" />
                            <p className="blog-timeline-card-content"> {truncateContent(post.content) }</p>

                            <div className="blog-timeline-card-tags">
                                {post.tags.map((tag, index) => (
                                    <Tag key={index}>{tag}</Tag>
                                ))}
                            </div>

                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}



export default function Blog() {
    const [posts, setPosts] = useState([]);
    const [allTags, setAllTags] = useState([]);

    useEffect(() => {
        fetchPosts().then((posts) => {
            setPosts(posts);
        });
    }, []);

    useEffect(() => {
        const tags = posts.reduce((acc, post) => {
            post.tags.forEach((tag) => {
                if (acc[tag]) {
                    acc[tag] += 1;
                } else {
                    acc[tag] = 1;
                }
            });
            return acc;
        }, {});
        const sortedTags = Object.entries(tags).sort((a, b) => b[1] - a[1]);
        setAllTags(sortedTags);
    }, [posts]);

    return (
        <main className="blog-container">
            <div className="blog-header">
                <div className="blog-header-content">
                    <h1 className="blog-title">
                        <span className="blog-title-accent">abap34</span>'s Blog
                    </h1>
                    <div className="blog-actions">
                        <a is-="button" variant-="blue" href="https://www.abap34.com/search" target="_blank" rel="noreferrer">
                            <ArrowRight />
                            View All Posts
                        </a>

                        <button is-="button" variant-="orange" onClick={copyRSS} style={{ display: window.innerWidth >= 1024 ? 'inline-flex' : 'none' }}>
                            <FaRss />
                            Copy RSS URL
                        </button>
                    </div>

                    <div className="blog-search-section">
                        <SearchBar />
                    </div>
                </div>
                <div className="blog-header-image">
                    <img src="/icon.png" alt="Blog Icon" className="blog-header-icon" />
                </div>
            </div>

            <div className="blog-content">
                <div className="blog-posts-section">
                    <div className="blog-posts-header">
                        <TrendingUp className="blog-posts-icon" />
                        <h2 className="blog-posts-title"> Recent Posts </h2>
                    </div>

                    <BlogTimeline posts={posts.slice(0, 10)} />
                </div>

                <TagList allTags={allTags} />
            </div>
        </main>
    );
}
