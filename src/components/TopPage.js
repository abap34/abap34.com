import { useContext, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import LanguageContext from '../context/LanguageContext';
import About from './About';
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
                <column style={{ marginBottom: '1lh' }}>
                    <Introduction />
                </column>

                <row className="top-page-grid">
                    <column>
                        <column box-="square" shear-="top" style={{ marginBottom: '1lh' }}>
                            <row>
                                <span is-="badge" variant-="foreground0" 
                                    style={{'--badge-color': 'var(--background2)', '--badge-text': 'var(--foreground0)'}}>
                                    Recent Blog Posts
                                </span>
                            </row>
                            <column pad-="2 1">
                                <About />
                            </column>
                        </column>
                    </column>

                    <column>
                        <column box-="square" shear-="top" style={{ marginBottom: '1lh' }}>
                            <row>
                                <span is-="badge" variant-="foreground0" 
                                    style={{'--badge-color': 'var(--background2)', '--badge-text': 'var(--foreground0)'}}>
                                    Background
                                </span>
                            </row>
                            <column pad-="2 1">
                                <Background compact={false} />
                            </column>
                        </column>
                    </column>
                </row>

                <column box-="square" shear-="top" style={{ marginBottom: '1lh' }}>
                    <row>
                        <span is-="badge" variant-="foreground0" 
                            style={{'--badge-color': 'var(--background2)', '--badge-text': 'var(--foreground0)'}}>
                            Works
                        </span>
                    </row>
                    <column pad-="2 1">
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
                    </column>
                </column>
            </column>
        </main>
    );
}