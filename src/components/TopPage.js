import { useContext, useEffect, useState } from 'react';
import LanguageContext from '../context/LanguageContext';
import RecentPosts from './RecentPosts';
import Background from './Background';
import Introduction from './Introduction';
import './TopPage.css';
import Works from './Works';
import { SECTION_INDEX, useFocusContext } from '../context/FocusContext';
import { useYamlData } from '../hooks/useYamlData';

export default function TopPage() {
    const { language } = useContext(LanguageContext);
    const [worksFilename, setWorksFilename] = useState("/data/works.yaml");
    const { activeFocusId, activateTopPage } = useFocusContext();
    const { data: uiText, isLoading: uiTextLoading } = useYamlData("/data/ui-text.yaml");

    useEffect(() => {
        setWorksFilename(language === "ja" ? "/data/works.yaml" : "/data/works_en.yaml");
    }, [language]);

    const sectionFocused = (index) => activeFocusId === `top-section-${index}`;

    if (uiTextLoading || !uiText) {
        return (
            <main className="top-page">
                <div style={{ color: 'var(--foreground2)', padding: '2rem' }}>Loading...</div>
            </main>
        );
    }

    return (
        <main className="top-page" onMouseDown={activateTopPage}>
            <column className="top-page-content">
                <column
                    box-="square"
                    shear-="top"
                    tabIndex={-1}
                    className={`top-page-section ${sectionFocused(SECTION_INDEX.INTRODUCTION) ? 'keyboard-focused' : ''}`}
                    style={{ marginBottom: '1lh', alignSelf: 'center', width: '100%', maxWidth: '1200px' }}
                    data-focus-id={`top-section-${SECTION_INDEX.INTRODUCTION}`}
                >
                    <span
                        is-="badge"
                        variant-="foreground0"
                        style={{ '--badge-color': 'var(--background2)', '--badge-text': 'var(--foreground0)' }}
                    >
                        {uiText.sections.introduction}
                    </span>
                    <column style={{ padding: '2lh 2ch' }}>
                        <Introduction />
                    </column>
                </column>

                <div className="top-page-grid">
                    <div className="top-page-grid-item">
                        <column
                            box-="square"
                            shear-="top"
                            tabIndex={-1}
                            className={`top-page-section ${sectionFocused(SECTION_INDEX.RECENT_POSTS) ? 'keyboard-focused' : ''}`}
                            style={{ marginBottom: '1lh' }}
                            data-focus-id={`top-section-${SECTION_INDEX.RECENT_POSTS}`}
                        >
                            <span
                                is-="badge"
                                variant-="foreground0"
                                style={{ '--badge-color': 'var(--background2)', '--badge-text': 'var(--foreground0)' }}
                            >
                                {uiText.sections.recentBlogPosts}
                            </span>
                            <column style={{ padding: '2lh 2ch' }}>
                                <RecentPosts />
                            </column>
                        </column>
                    </div>

                    <div className="top-page-grid-item">
                        <column
                            box-="square"
                            shear-="top"
                            tabIndex={-1}
                            className={`top-page-section ${sectionFocused(SECTION_INDEX.BACKGROUND) ? 'keyboard-focused' : ''}`}
                            style={{ marginBottom: '1lh' }}
                            data-focus-id={`top-section-${SECTION_INDEX.BACKGROUND}`}
                        >
                            <span
                                is-="badge"
                                variant-="foreground0"
                                style={{ '--badge-color': 'var(--background2)', '--badge-text': 'var(--foreground0)' }}
                            >
                                {uiText.sections.background}
                            </span>
                            <column style={{ padding: '2lh 2ch' }}>
                                <Background compact={false} />
                            </column>
                        </column>
                    </div>
                </div>

                <column
                    box-="square"
                    shear-="top"
                    tabIndex={-1}
                    className={`top-page-section ${sectionFocused(SECTION_INDEX.WORKS) ? 'keyboard-focused' : ''}`}
                    style={{ marginBottom: '1lh', alignSelf: 'flex-start', width: 'fit-content' }}
                    data-focus-id={`top-section-${SECTION_INDEX.WORKS}`}
                >
                    <span
                        is-="badge"
                        variant-="foreground0"
                        style={{ '--badge-color': 'var(--background2)', '--badge-text': 'var(--foreground0)' }}
                    >
                        {uiText.sections.works}
                    </span>
                    <column style={{ padding: '2lh 2ch' }}>
                        <Works
                            title=""
                            path={worksFilename}
                            defaultVisibleCount={6}
                            simple={true}
                            showViewAllLink={true}
                        />
                    </column>
                </column>
            </column>
        </main>
    );
}
