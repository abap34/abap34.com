import { useContext, useEffect, useState } from "react";
import LanguageContext from "../context/LanguageContext";
import yaml from "yaml";

function EachEducation(props) {
    return (
        <div className="border-l-2 border-gray-200 p-4">
            <h3 className="text-lg font-semibold">{props.school}</h3>
            <p className="text-sm text-gray-600 dark:text-gray-400">{props.period}</p>
        </div>
    );
}

function EachWork(props) {
    return (
        <div className="border-l-2 border-gray-200 p-4">
            <h3 className="text-lg font-semibold">
                <a href={props.url} target="_blank" rel="noreferrer" className="hover:text-blue-600 transition duration-300">
                    {props.company}
                </a>
            </h3>
            <p className="text-sm text-gray-600 dark:text-gray-400">{props.period} | {props.worktype}</p>
            <p className="text-sm text-gray-600 dark:text-gray-400">{props.project}</p>
        </div>
    );
}

export default function Background() {
    const [data, setData] = useState(null);
    const { language } = useContext(LanguageContext);

    useEffect(() => {
        let filename = language === "ja" ? "/background.yaml" : "/background_en.yaml";
        fetch(filename)
            .then((res) => res.text())
            .then((text) => setData(yaml.parse(text)));
    }, [language]);

    if (!data) return <p>Loading...</p>;

    return (
        <main className="container mx-auto px-4">
            <h2 className="text-2xl font-bold my-4">Education</h2>
            {data.education.map((education, index) => (
                <EachEducation key={index} school={education.school} period={education.period} />
            ))}

            <h2 className="text-2xl font-bold my-4">Work Experience</h2>
            {data.careers.map((career, index) => (
                <EachWork key={index} company={career.company} url={career.url} period={career.period} worktype={career.worktype} project={career.project} />
            ))}

            <h2 className="text-2xl font-bold my-4">Others</h2>
            {data.others.map((other, index) => (
                <div key={index} className="border-l-2 border-gray-200 p-4">
                    <h3 className="text-lg font-semibold">
                        <a href={other.url} target="_blank" rel="noreferrer" className="hover:text-blue-600 transition duration-300">
                            {other.title}
                        </a>
                    </h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400">{other.period}</p>
                    <p className="text-sm text-gray-600 dark:text-gray-400">{other.description}</p>
                </div>
            ))}
        </main>
    );
}