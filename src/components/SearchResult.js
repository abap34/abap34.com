import { ExternalLink, X } from 'lucide-react';
import { useEffect, useState } from 'react';
import { FaTag } from 'react-icons/fa';
import SeachBar from './SearchBar';
import './SearchResult.css';
import Tag from './Tag';
import TagList from './TagList';

async function fetchPosts() {
    try {
        const response = await fetch('/posts.json');
        if (!response.ok) {
            throw new Error('Failed to fetch posts');
        }
        const data = await response.json();
        return data;
    } catch (error) {
        console.error("Error fetching posts:", error);
        return [];
    }
};

function deleteSearchQuery(query) {
    const params = new URLSearchParams(window.location.search);
    const queries = params.getAll('q');
    const newQueries = queries.filter((q) => q !== query);

    params.delete('q');

    newQueries.forEach((q) => {
        params.append('q', q);
    });

    window.location.href = `/search?${params.toString()}`;
}

function deleteSearchTag(tag) {
    const params = new URLSearchParams(window.location.search);
    const tags = params.getAll('tag');

    const newTags = tags.filter((t) => t !== tag);

    params.delete('tag');

    newTags.forEach((t) => {
        params.append('tag', t);
    });

    window.location.href = `/search?${params.toString()}`;
}

function getSearchQueries() {
    const params = new URLSearchParams(window.location.search);
    return params.getAll('q');
}

function getSearchTags() {
    const params = new URLSearchParams(window.location.search);
    return params.getAll('tag');
}

function searchPostsbyQuery(posts, query) {
    if (!query) {
        return posts;
    }
    return posts.filter((post) => {
        return post.content.toLowerCase().includes(query.toLowerCase());
    });
}

function searchPostsByQueries(posts, queries) {
    if (queries.length === 0) {
        return posts;
    }

    return queries.reduce((acc, query) => {
        return searchPostsbyQuery(acc, query);
    }, posts);
}

function searchPostsByTag(posts, tag) {
    if (!tag) {
        return posts;
    }
    return posts.filter((post) => {
        return post.tags.includes(tag);
    });
}

function searchPostsByTags(posts, tags) {
    if (tags.length === 0) {
        return posts;
    }

    return tags.reduce((acc, tag) => {
        return searchPostsByTag(acc, tag);
    }, posts);
}

function findHighlightedText(content, query) {
    const isMatch = content.toLowerCase().includes(query.toLowerCase());

    const index = content.toLowerCase().indexOf(query.toLowerCase());
    const start = Math.max(0, index - 10);
    const end = Math.min(content.length, index + query.length + 100);
    const before = content.slice(start, index);

    const match = content.slice(index, index + query.length);
    const after = content.slice(index + query.length, end);

    return { isMatch, before, match, after };
}

// ドメイン名を抽出する関数
function extractDomain(url) {
    try {
        const domain = new URL(url).hostname;
        return domain.replace(/^www\./, ''); // www. がある場合は削除
    } catch (e) {
        return '';
    }
}


// 削除可能なタグ.
// 押すと、クエリパラメータの `tag=` にタグの配列があるので、そこから `name` のタグを削除して、ページをリロードする.
function DeleatableTag({ name, label }) {
    const handleClick = () => {
        deleteSearchTag(name);
    }

    return (
        <span is-="badge" variant-="background2" className="search-tag">
            <FaTag className="search-tag-icon" />
            <span>{label}</span>
            <X onClick={handleClick} className="search-tag-close" />
        </span>
    );
}

function DeleatableQuery({ query }) {
    const handleClick = () => {
        deleteSearchQuery(query);
    }

    return (
        <span is-="badge" variant-="blue" className="search-query">
            <span>{query}</span>
            <X onClick={handleClick} className="search-query-close" />
        </span>
    );
}

export default function SearchResult() {
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
        setAllTags(Object.entries(tags).sort((a, b) => b[1] - a[1]));
    }, [posts]);

    const tags = getSearchTags();
    const queries = getSearchQueries();

    const searchedPosts = searchPostsByQueries(searchPostsByTags(posts, tags), queries);
    return (
        <main className="search-container">
            <div className="search-main">
                {/* <div className="search-header">
                    <h1 className="search-header-title">Search</h1>
                </div> */}
                <SeachBar placeholder="To add a search query, type and press Enter" />
                <div className="search-filters">
                    <span>Search for:</span>
                    {queries.map((query, index) => (
                        <DeleatableQuery key={index} query={query} />
                    ))}

                    {tags.map((tag, index) => (
                        <DeleatableTag key={index} name={tag} label={tag} />
                    ))}
                </div>
                <div className="search-count">Found <span className="search-count-number">{searchedPosts.length}</span> posts</div>
                
                <div className="search-posts-list">
                    {searchedPosts.map((post) => (
                        <div key={post.url} className="search-post-item">
                            <div className="search-post-date">
                                {new Date(post.post_date).toLocaleDateString('ja-JP', {
                                    year: 'numeric',
                                    month: '2-digit',
                                    day: '2-digit'
                                }).replace(/\//g, '-')}
                                {post.external && (
                                    <span className="search-post-source">
                                        <ExternalLink size={12} style={{marginLeft: '0.5ch', marginRight: '0.25ch'}} />
                                        {extractDomain(post.url)}
                                    </span>
                                )}
                            </div>
                            <a href={post.url} target="_blank" rel="noreferrer" className="search-post-title-link">
                                {post.title}
                            </a>
                            <div className="search-post-tags">
                                {post.tags?.slice(0, 4).map((tag, i) => (
                                    <Tag key={i}>{tag}</Tag>
                                ))}
                                {post.tags?.length > 4 && (
                                    <span style={{color: 'var(--foreground2)', fontSize: '0.8rem'}}>
                                        +{post.tags.length - 4}
                                    </span>
                                )}
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            <TagList allTags={allTags} header='Tags' className="search-sidebar" />
        </main>
    );
}

