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
            <div className="top-page-content" style={{ display: 'flex', flexDirection: 'column' }}>
                <div box-="square" shear-="top" style={{ marginBottom: '1lh' }}>
                    <span is-="badge" variant-="foreground0"
                        style={{ '--badge-color': 'var(--background2)', '--badge-text': 'var(--foreground0)' }}>
                        Introduction
                    </span>
                    <div style={{ padding: '2lh 2ch' }}>
                        <Introduction />
                    </div>
                </div>

                <div className="top-page-grid">
                    <div className="top-page-grid-item">
                        <div box-="square" shear-="top" style={{ marginBottom: '1lh' }}>
                            <span is-="badge" variant-="foreground0"
                                style={{ '--badge-color': 'var(--background2)', '--badge-text': 'var(--foreground0)' }}>
                                Recent Blog Posts
                            </span>
                            <div style={{ padding: '2lh 2ch' }}>
                                <RecentPosts />
                            </div>
                        </div>
                    </div>

                    <div className="top-page-grid-item">
                        <div box-="square" shear-="top" style={{ marginBottom: '1lh' }}>
                            <span is-="badge" variant-="foreground0"
                                style={{ '--badge-color': 'var(--background2)', '--badge-text': 'var(--foreground0)' }}>
                                Background
                            </span>
                            <div style={{ padding: '2lh 2ch' }}>
                                <Background compact={false} />
                            </div>
                        </div>
                    </div>
                </div>

                <div box-="square" shear-="top" style={{ marginBottom: '1lh' }}>
                    <span is-="badge" variant-="foreground0"
                        style={{ '--badge-color': 'var(--background2)', '--badge-text': 'var(--foreground0)' }}>
                        Works
                    </span>
                    <div style={{ padding: '2lh 2ch' }}>
                        <Works
                            title=""
                            path={worksFilename}
                            defaultVisibleCount={8}
                            compact={false}
                        />
                        <div className="view-all-link" style={{ marginTop: '1lh' }}>
                            <Link
                                to="/works"
                                className="view-all-link"
                            >
                                すべての作品をみる →
                            </Link>
                        </div>
                    </div>
                </div>
            </div>
        </main >
    );
}