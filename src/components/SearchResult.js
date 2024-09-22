import { SearchCheck, X } from 'lucide-react';
import React, { useEffect, useState } from 'react';
import { FaTag } from 'react-icons/fa';
import SeachBar from './SearchBar';
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


export function Post({ index, post, queries }) {

    for (const query of queries) {
        const highlighted = findHighlightedText(post.content, query);
        if (highlighted.isMatch) {
            return (
                <a key={index} href={post.url} target="_blank" rel="noreferrer" className="border border-gray-200 rounded-lg p-4 hover:border-blue-600 transition duration-300">
                    <img src={post.thumbnail_url} alt={post.title} className="w-full h-48 object-cover rounded-lg" />
                    <h3 className="text-lg font-semibold mt-2">{post.title}</h3>
                    <p className="text-sm text-gray-600">{post.post_date}</p>
                    <p className="text-sm text-gray-600 mb-2 truncate dark:text-gray-400">
                        {highlighted.before}
                        <span className="bg-blue-100 dark:bg-blue-600 text-blue-600 dark:text-gray-100">{highlighted.match}</span>
                        {highlighted.after}
                        <span className="text-gray-100 dark:text-gray-600 ml-1">...</span>
                    </p>

                </a>
            );
        }
    }

    // 空の場合　これが返る.
    return (
        <a key={index}
            href={post.url}
            target="_blank"
            rel="noreferrer"
            className="border border-gray-200 rounded-lg p-4 hover:border-blue-600 transition duration-300"
        >
            <img src={post.thumbnail_url} alt={post.title} className="w-full h-48 object-cover rounded-lg" />
            <h3 className="text-lg font-semibold mt-2">{post.title}</h3>
            <p className="text-sm text-gray-600">{post.post_date}</p>
            <p className="text-sm text-gray-600 mb-2 truncate dark:text-gray-400">{post.content}</p>
        </a>
    );

}


// 削除可能なタグ.
// 押すと、クエリパラメータの `tag=` にタグの配列があるので、そこから `name` のタグを削除して、ページをリロードする.
function DeleatableTag({ name, label }) {
    const handleClick = () => {
        deleteSearchTag(name);
    }

    return (
        <span className="bg-gray-200 dark:bg-gray-700 text-gray-600 dark:text-gray-400 px-2 py-1 rounded-lg space-x-1 word-break-all">
            <FaTag className="inline-block mr-1" />
            <span>{label}</span>
            <X onClick={handleClick} className="inline-block ml-1 w-4 h-4 text-gray-500 dark:text-gray-400 cursor-pointer" />
        </span>
    );
}

function DeleatableQuery({ query }) {
    const handleClick = () => {
        deleteSearchQuery(query);
    }

    return (
        <span className="bg-blue-100 dark:bg-blue-600 text-blue-600 dark:text-gray-100 px-2 py-1 rounded-lg space-x-1 word-break-all">
            <span>{query}</span>
            <X onClick={handleClick} className="inline-block ml-1 w-4 h-4 text-gray-500 dark:text-gray-400 cursor-pointer" />
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
        setAllTags(Object.entries(tags));
    }, [posts]);


    const tags = getSearchTags();
    const queries = getSearchQueries();

    const searchedPosts = searchPostsByQueries(searchPostsByTags(posts, tags), queries);
    return (
        <main className="grid grid-cols-1 lg:grid-cols-[4fr,1fr] gap-4 container mx-auto px-4 py-8 space-y-8">
            <div className="space-y-8 py-4">
                <div className="flex items-center space-x-2">
                    <SearchCheck className="w-8 h-8 text-purple-500" />
                    <h1 className="text-4xl font-bold">Search Results</h1>
                </div>
                <SeachBar placeholder="Search Again" />
                <div className="text-gray-600 flex items-center space-x-2">
                    <span>Search for:</span>
                    {queries.map((query, index) => (
                        <DeleatableQuery key={index} query={query} />
                    ))}

                    {tags.map((tag, index) => (
                        <DeleatableTag key={index} name={tag} label={tag} />
                    ))}
                </div>
                <div className="text-gray-600">Found <span className="font-bold">{searchedPosts.length}</span> posts</div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-8">

                    {searchedPosts.map((post) => (
                        <Post key={post.url} post={post} queries={queries} index={post.url} />
                    ))}
                </div></div>

            <TagList allTags={allTags} header='Found Tags' />
        </main >

    );
}

