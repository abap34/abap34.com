import { useContext, useEffect, useState } from "react";
import yaml from "yaml";
import LanguageContext from "../context/LanguageContext";
import { useFocusContext } from "../context/FocusContext";
import './Background.css';

function FocusableEntry({ children, focusId, isFocused }) {
    return (
        <column
            className={`background-focusable ${isFocused ? 'keyboard-focused' : ''}`}
            style={{ marginBottom: '0.5rem', paddingBottom: '0.5rem', borderBottom: '1px solid var(--foreground2)', gap: '0.25rem' }}
            data-focus-id={focusId}
            data-focus-activate="self"
        >
            {children}
        </column>
    );
}

export default function Background({ compact = false }) {
    const [data, setData] = useState(null);
    const { language } = useContext(LanguageContext);
    const { setBackgroundItemCount, activeFocusId } = useFocusContext();

    useEffect(() => {
        let filename = language === "ja" ? "/background.yaml" : "/background_en.yaml";
        fetch(filename)
            .then((res) => res.text())
            .then((text) => setData(yaml.parse(text)));
    }, [language]);

    useEffect(() => {
        if (!data || compact) return;
        const educationCount = data.education?.length || 0;
        const careerCount = data.careers?.length || 0;
        const othersCount = data.others?.length || 0;
        setBackgroundItemCount(educationCount + careerCount + othersCount);
    }, [compact, data, setBackgroundItemCount]);

    if (!data) return <div style={{ color: 'var(--foreground1)' }}>Loading...</div>;

    if (compact) {
        return (
            <column style={{ gap: '1rem' }}>
                <column style={{ gap: '0.5rem' }}>
                    <div style={{ color: 'var(--foreground0)', fontWeight: 'var(--font-weight-bold)' }}>Education</div>
                    {data.education.slice(0, 2).map((education, index) => (
                        <row key={index} style={{ fontSize: '0.875rem', gap: '0.5rem' }}>
                            <span style={{ color: 'var(--foreground0)' }}>{education.school}</span>
                            <span style={{ color: 'var(--foreground2)' }}>
                                {education.period}
                            </span>
                        </row>
                    ))}
                </column>

                <column style={{ gap: '0.5rem' }}>
                    <div style={{ color: 'var(--foreground0)', fontWeight: 'var(--font-weight-bold)' }}>Work Experience</div>
                    {data.careers.slice(0, 2).map((career, index) => (
                        <row key={index} style={{ fontSize: '0.875rem', gap: '0.5rem' }}>
                            <span style={{ color: 'var(--foreground0)' }}>{career.company}</span>
                            <span style={{ color: 'var(--foreground2)' }}>
                                {career.period}
                            </span>
                        </row>
                    ))}
                </column>

                <column style={{ gap: '0.5rem' }}>
                    <div style={{ color: 'var(--foreground0)', fontWeight: 'var(--font-weight-bold)' }}>Activities</div>
                    {data.others.slice(0, 2).map((other, index) => (
                        <row key={index} style={{ fontSize: '0.875rem', gap: '0.5rem' }}>
                            <span style={{ color: 'var(--foreground0)' }}>{other.title}</span>
                            <span style={{ color: 'var(--foreground2)' }}>
                                {other.period}
                            </span>
                        </row>
                    ))}
                </column>
            </column>
        );
    }

    const educationCount = data.education?.length || 0;
    const careerCount = data.careers?.length || 0;

    const entry = (child, focusId) => (
        <FocusableEntry key={focusId} focusId={focusId} isFocused={activeFocusId === focusId}>
            {child}
        </FocusableEntry>
    );

    return (
        <column style={{ gap: '2rem' }}>
            <column style={{ gap: '1rem' }}>
                <h2 style={{ fontSize: '1.5rem', fontWeight: 'var(--font-weight-bold)', color: 'var(--foreground0)' }}>
                    Education
                </h2>
                {data.education.map((education, index) =>
                    entry(
                        <>
                            <div style={{ color: 'var(--foreground0)', fontWeight: 'var(--font-weight-bold)' }}>
                                {education.school}
                            </div>
                            <div style={{ fontSize: '0.875rem', color: 'var(--foreground2)' }}>
                                {education.period}
                            </div>
                        </>,
                        `top-item-background-${index}`
                    )
                )}
            </column>

            <column style={{ gap: '1rem' }}>
                <h2 style={{ fontSize: '1.5rem', fontWeight: 'var(--font-weight-bold)', color: 'var(--foreground0)' }}>
                    Work Experience
                </h2>
                {data.careers.map((career, index) =>
                    entry(
                        <>
                            <div style={{ color: 'var(--foreground0)', fontWeight: 'var(--font-weight-bold)' }}>
                                <a
                                    href={career.url}
                                    target="_blank"
                                    rel="noreferrer"
                                    style={{ color: 'inherit', textDecoration: 'none' }}
                                >
                                    {career.company}
                                </a>
                            </div>
                            <div style={{ fontSize: '0.875rem', color: 'var(--foreground2)' }}>
                                {career.period} | {career.worktype}
                            </div>
                        </>,
                        `top-item-background-${educationCount + index}`
                    )
                )}
            </column>

            <column style={{ gap: '1rem' }}>
                <h2 style={{ fontSize: '1.5rem', fontWeight: 'var(--font-weight-bold)', color: 'var(--foreground0)' }}>
                    Others
                </h2>
                {data.others.map((other, index) =>
                    entry(
                        <>
                            <div style={{ color: 'var(--foreground0)', fontWeight: 'var(--font-weight-bold)' }}>
                                <a
                                    href={other.url}
                                    target="_blank"
                                    rel="noreferrer"
                                    style={{ color: 'inherit', textDecoration: 'none' }}
                                >
                                    {other.title}
                                </a>
                            </div>
                            <div style={{ fontSize: '0.875rem', color: 'var(--foreground2)' }}>
                                {other.period}
                            </div>
                        </>,
                        `top-item-background-${educationCount + careerCount + index}`
                    )
                )}
            </column>
        </column>
    );
}
