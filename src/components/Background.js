import { useContext, useEffect, useState } from "react";
import yaml from "yaml";
import LanguageContext from "../context/LanguageContext";

function EachEducation(props) {
    return (
        <div style={{ marginBottom: '0.5rem', paddingBottom: '0.5rem', borderBottom: '1px solid var(--foreground2)' }}>
            <div style={{ color: 'var(--foreground0)', fontWeight: 'var(--font-weight-bold)' }}>
                {props.school}
            </div>
            <div style={{ fontSize: '0.875rem', color: 'var(--foreground2)' }}>
                {props.period}
            </div>
        </div>
    );
}

function EachWork(props) {
    return (
        <div style={{ marginBottom: '0.5rem', paddingBottom: '0.5rem', borderBottom: '1px solid var(--foreground2)' }}>
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
        </div>
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
            <div>
                <div style={{ marginBottom: '1rem' }}>
                    <div style={{ color: 'var(--foreground0)', fontWeight: 'var(--font-weight-bold)', marginBottom: '0.5rem' }}>Education</div>
                    {data.education.slice(0, 2).map((education, index) => (
                        <div key={index} style={{ fontSize: '0.875rem', marginBottom: '0.25rem' }}>
                            <span style={{ color: 'var(--foreground0)' }}>{education.school}</span>
                            <span style={{ color: 'var(--foreground2)', marginLeft: '0.5rem' }}>
                                {education.period}
                            </span>
                        </div>
                    ))}
                </div>

                <div style={{ marginBottom: '1rem' }}>
                    <div style={{ color: 'var(--foreground0)', fontWeight: 'var(--font-weight-bold)', marginBottom: '0.5rem' }}>Work Experience</div>
                    {data.careers.slice(0, 2).map((career, index) => (
                        <div key={index} style={{ fontSize: '0.875rem', marginBottom: '0.25rem' }}>
                            <span style={{ color: 'var(--foreground0)' }}>{career.company}</span>
                            <span style={{ color: 'var(--foreground2)', marginLeft: '0.5rem' }}>
                                {career.period}
                            </span>
                        </div>
                    ))}
                </div>

                <div>
                    <div style={{ color: 'var(--foreground0)', fontWeight: 'var(--font-weight-bold)', marginBottom: '0.5rem' }}>Activities</div>
                    {data.others.slice(0, 2).map((other, index) => (
                        <div key={index} style={{ fontSize: '0.875rem', marginBottom: '0.25rem' }}>
                            <span style={{ color: 'var(--foreground0)' }}>{other.title}</span>
                            <span style={{ color: 'var(--foreground2)', marginLeft: '0.5rem' }}>
                                {other.period}
                            </span>
                        </div>
                    ))}
                </div>
            </div>
        );
    }

    return (
        <div>
            <div style={{ marginBottom: '2rem' }}>
                <h2 style={{ fontSize: '1.5rem', fontWeight: 'var(--font-weight-bold)', color: 'var(--foreground0)', marginBottom: '1rem' }}>
                    Education
                </h2>
                {data.education.map((education, index) => (
                    <EachEducation key={index} school={education.school} period={education.period} />
                ))}
            </div>

            <div style={{ marginBottom: '2rem' }}>
                <h2 style={{ fontSize: '1.5rem', fontWeight: 'var(--font-weight-bold)', color: 'var(--foreground0)', marginBottom: '1rem' }}>
                    Work Experience
                </h2>
                {data.careers.map((career, index) => (
                    <EachWork key={index} company={career.company} url={career.url} period={career.period} worktype={career.worktype} project={career.project} />
                ))}
            </div>

            <div>
                <h2 style={{ fontSize: '1.5rem', fontWeight: 'var(--font-weight-bold)', color: 'var(--foreground0)', marginBottom: '1rem' }}>
                    Others
                </h2>
                {data.others.map((other, index) => (
                    <div key={index} style={{ marginBottom: '0.5rem', paddingBottom: '0.5rem', borderBottom: '1px solid var(--foreground2)' }}>
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
                    </div>
                ))}
            </div>
        </div>
    );
}