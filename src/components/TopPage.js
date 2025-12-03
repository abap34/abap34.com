import { useContext, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import LanguageContext from '../context/LanguageContext';
import RecentPosts from './RecentPosts';
import Background from './Background';
import Introduction from './Introduction';
import './TopPage.css';
import Works from './Works';

export default function TopPage() {
    const { language } = useContext(LanguageContext);
    const [worksFilename, setWorksFilename] = useState("/works.yaml");

    useEffect(() => {
        setWorksFilename(language === "ja" ? "/works.yaml" : "/works_en.yaml");
    }, [language]);

    return (
        <main className="top-page">
            <column className="top-page-content">
                <column box-="square" shear-="top" style={{ marginBottom: '1lh' }}>
                    <span is-="badge" variant-="foreground0"
                        style={{ '--badge-color': 'var(--background2)', '--badge-text': 'var(--foreground0)' }}>
                        Introduction
                    </span>
                    <column style={{ padding: '2lh 2ch' }}>
                        <Introduction />
                    </column>
                </column>

                <div className="top-page-grid">
                    <div className="top-page-grid-item">
                        <column box-="square" shear-="top" style={{ marginBottom: '1lh' }}>
                            <span is-="badge" variant-="foreground0"
                                style={{ '--badge-color': 'var(--background2)', '--badge-text': 'var(--foreground0)' }}>
                                Recent Blog Posts
                            </span>
                            <column style={{ padding: '2lh 2ch' }}>
                                <RecentPosts />
                            </column>
                        </column>
                    </div>

                    <div className="top-page-grid-item">
                        <column box-="square" shear-="top" style={{ marginBottom: '1lh' }}>
                            <span is-="badge" variant-="foreground0"
                                style={{ '--badge-color': 'var(--background2)', '--badge-text': 'var(--foreground0)' }}>
                                Background
                            </span>
                            <column style={{ padding: '2lh 2ch' }}>
                                <Background compact={false} />
                            </column>
                        </column>
                    </div>
                </div>

                <column box-="square" shear-="top" style={{ marginBottom: '1lh' }}>
                    <span is-="badge" variant-="foreground0"
                        style={{ '--badge-color': 'var(--background2)', '--badge-text': 'var(--foreground0)' }}>
                        Works
                    </span>
                    <column style={{ padding: '2lh 2ch' }}>
                        <Works
                            title=""
                            path={worksFilename}
                            defaultVisibleCount={6}
                            simple={true}
                        />
                        <column style={{ marginTop: '2lh', textAlign: 'left' }}>
                            <Link
                                to="/works"
                                className="search-post-title-link"
                            >
                                すべての作品をみる →
                            </Link>
                        </column>
                    </column>
                </column>
            </column>
        </main >
    );
}