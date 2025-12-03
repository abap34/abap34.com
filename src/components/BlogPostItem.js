import { ExternalLink } from 'lucide-react';
import Tag from './Tag';
import './SearchResult.css';

// ドメイン名を抽出する関数
function extractDomain(url) {
    try {
        const domain = new URL(url).hostname;
        return domain.replace(/^www\./, ''); // www. がある場合は削除
    } catch (e) {
        return '';
    }
}

export default function BlogPostItem({ post, maxTags = 3 }) {
    return (
        <column className="search-post-item">
            <row className="search-post-date">
                {post.post_date}
                {post.external && (
                    <span className="search-post-source">
                        <ExternalLink size={12} style={{marginLeft: '0.5ch', marginRight: '0.25ch'}} />
                        {extractDomain(post.url)}
                    </span>
                )}
            </row>
            <a href={post.url} target="_blank" rel="noopener noreferrer" className="search-post-title-link">
                {post.title}
            </a>
            <row className="works-card-tags">
                {post.tags?.slice(0, maxTags).map((tag, i) => (
                    <Tag key={i} name={tag} targetPage="/search">{tag}</Tag>
                ))}
                {post.tags?.length > maxTags && (
                    <span style={{color: 'var(--foreground2)', fontSize: '0.8rem'}}>
                        +{post.tags.length - maxTags}
                    </span>
                )}
            </row>
        </column>
    );
}
