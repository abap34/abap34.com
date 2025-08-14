import React, { useContext, useEffect, useState } from 'react';
import yaml from 'yaml';
import LanguageContext from '../context/LanguageContext';
import SidebarContext from '../context/SidebarContext';
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
        <main className="flex min-h-screen w-full m-0 p-0 bg-background0">
            {/* Main Content */}
            <div className="flex-1 p-4">
                <div className="webtui-box">
                    <Introduction />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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