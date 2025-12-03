import { useContext, useEffect, useState } from "react";
import yaml from "yaml";
import LanguageContext from "../context/LanguageContext";

function EachEducation(props) {
    return (
        <column style={{ marginBottom: '0.5rem', paddingBottom: '0.5rem', borderBottom: '1px solid var(--foreground2)', gap: '0.25rem' }}>
            <div style={{ color: 'var(--foreground0)', fontWeight: 'var(--font-weight-bold)' }}>
                {props.school}
            </div>
            <div style={{ fontSize: '0.875rem', color: 'var(--foreground2)' }}>
                {props.period}
            </div>
        </column>
    );
}

function EachWork(props) {
    return (
        <column style={{ marginBottom: '0.5rem', paddingBottom: '0.5rem', borderBottom: '1px solid var(--foreground2)', gap: '0.25rem' }}>
            <div style={{ color: 'var(--foreground0)', fontWeight: 'var(--font-weight-bold)' }}>
                <a
                    href={props.url}
                    target="_blank"
                    rel="noreferrer"
                    style={{ color: 'inherit', textDecoration: 'none' }}
                >
                    {props.company}
                </a>
            </div>
            <div style={{ fontSize: '0.875rem', color: 'var(--foreground2)' }}>
                {props.period} | {props.worktype}
            </div>
            {/* <div style={{ fontSize: '0.875rem', color: 'var(--foreground1)' }}>
                {props.project}
            </div> */}
        </column>
    );
}

export default function Background({ compact = false }) {
    const [data, setData] = useState(null);
    const { language } = useContext(LanguageContext);

    useEffect(() => {
        let filename = language === "ja" ? "/background.yaml" : "/background_en.yaml";
        fetch(filename)
            .then((res) => res.text())
            .then((text) => setData(yaml.parse(text)));
    }, [language]);

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

    return (
        <column style={{ gap: '2rem' }}>
            <column style={{ gap: '1rem' }}>
                <h2 style={{ fontSize: '1.5rem', fontWeight: 'var(--font-weight-bold)', color: 'var(--foreground0)' }}>
                    Education
                </h2>
                {data.education.map((education, index) => (
                    <EachEducation key={index} school={education.school} period={education.period} />
                ))}
            </column>

            <column style={{ gap: '1rem' }}>
                <h2 style={{ fontSize: '1.5rem', fontWeight: 'var(--font-weight-bold)', color: 'var(--foreground0)' }}>
                    Work Experience
                </h2>
                {data.careers.map((career, index) => (
                    <EachWork key={index} company={career.company} url={career.url} period={career.period} worktype={career.worktype} project={career.project} />
                ))}
            </column>

            <column style={{ gap: '1rem' }}>
                <h2 style={{ fontSize: '1.5rem', fontWeight: 'var(--font-weight-bold)', color: 'var(--foreground0)' }}>
                    Others
                </h2>
                {data.others.map((other, index) => (
                    <column key={index} style={{ marginBottom: '0.5rem', paddingBottom: '0.5rem', borderBottom: '1px solid var(--foreground2)', gap: '0.25rem' }}>
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
                        {/* <div style={{ fontSize: '0.875rem', color: 'var(--foreground1)' }}>
                            {other.description}
                        </div> */}
                    </column>
                ))}
            </column>
        </column>
    );
}