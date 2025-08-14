import { useContext, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import LanguageContext from '../context/LanguageContext';
import About from './About';
import Background from './Background';
import Introduction from './Introduction';
import Works from './Works';

export default function TopPage() {
    const { language } = useContext(LanguageContext);
    const [worksFilename, setWorksFilename] = useState("/works.yaml");

    useEffect(() => {
        setWorksFilename(language === "ja" ? "/works.yaml" : "/works_en.yaml");
    }, [language]);

    return (
        <main className="min-h-screen w-full bg-background0">
            {/* Main Content */}
            <div className="p-4">
                <div className="webtui-box">
                    <Introduction />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                    <div className="text-center mt-4">
                        <Link
                            to="/works"
                            className="no-underline font-medium text-accent0"
                        >
                            すべての作品をみる →
                        </Link>
                    </div>
                </div>
            </div>
        </main>
    );
}