import React, { useContext, useEffect, useState } from 'react';
import yaml from 'yaml';
import LanguageContext from '../context/LanguageContext';
import About from './About';
import Introduction from './Introduction';
import Works from './Works';
import Background from './Background';
import Sidebar from './Sidebar';

export default function TopPage() {
    const { language } = useContext(LanguageContext);
    const [worksFilename, setWorksFilename] = useState("/works.yaml");

    useEffect(() => {
        setWorksFilename(language === "ja" ? "/works.yaml" : "/works_en.yaml");
    }, [language]);

    return (
        <main 
            variant-="background0"
            style={{
                display: 'flex',
                minHeight: '100vh',
                width: '100%',
                margin: '0',
                padding: '0'
            }}
        >
            <Sidebar />

            {/* Main Content */}
            <div style={{ flex: 1, padding: '1rem', width: 'calc(100% - 16rem)' }}>
                <div className="webtui-box">
                    <Introduction />
                </div>

                <div className="webtui-grid-2">
                    <div className="webtui-box">
                        <div className="webtui-box-header">Recent Activity</div>
                        <About />
                    </div>

                    <div className="webtui-box">
                        <div className="webtui-box-header">Background</div>
                        <Background compact={false} />
                    </div>
                </div>

                <div className="webtui-box">
                    <div className="webtui-box-header">Projects</div>
                    <Works 
                        title="" 
                        path={worksFilename} 
                        defaultVisibleCount={12}
                        compact={false}
                    />
                </div>
            </div>
        </main>
    );
}