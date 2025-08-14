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
            {/* Main Content */}
            <div className="top-page-content">
                <div className="webtui-box">
                    <Introduction />
                </div>

                <div className="top-page-grid">
                    <div className="webtui-box">
                        <div className="webtui-box-header">Recent Blog Posts</div>
                        <About />
                    </div>

                    <div className="webtui-box">
                        <div className="webtui-box-header">Background</div>
                        <Background compact={false} />
                    </div>
                </div>

                <div className="webtui-box">
                    <div className="webtui-box-header">Works</div>
                    <Works
                        title=""
                        path={worksFilename}
                        defaultVisibleCount={8}
                        compact={false}
                    />
                    <div className="view-all-link">
                        <Link
                            to="/works"
                            className="view-all-link"
                        >
                            すべての作品をみる →
                        </Link>
                    </div>
                </div>
            </div>
        </main>
    );
}