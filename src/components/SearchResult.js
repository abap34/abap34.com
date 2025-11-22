import { X } from 'lucide-react';
import { useEffect, useState } from 'react';
import { FaTag } from 'react-icons/fa';
import BlogPostItem from './BlogPostItem';
import SeachBar from './SearchBar';
import './SearchResult.css';
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
                        <BlogPostItem key={post.url} post={post} maxTags={4} />
                    ))}
                </div>
            </div>

            <TagList allTags={allTags} header='Tags' className="search-sidebar" />
        </main>
    );
}

