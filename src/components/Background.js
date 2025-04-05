import { useContext } from "react";
import LanguageContext from "../context/LanguageContext";


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
    const { language, toggleLanguage } = useContext(LanguageContext);

    let educations = language === "ja" ? [
        { school: "東京工業大学 情報理工学院", period: "2022/04 ~" },
        { school: "東京工業大学 情報理工学院 情報工学系", period: "2023/04 ~" },
        { school: "東京工業大学 情報理工学院 情報工学系 Programming Systems Group (渡部研究室)", period: "2025/04 ~" }
    ] : [
        { school: "Tokyo Institute of Technology, Department of Computer Science, School of Computing ", period: "2022/04 ~" },
        { school: "Tokyo Institute of Technology, Department of Computer Science, School of Computing ", period: "2023/04 ~" },
        { school: "Tokyo Institute of Technology, Department of Computer Science, School of Computing,  Programming Systems Group", period: "2025/04 ~" }
    ];

    let works = language === "ja" ? [
        { company: "DENSO IT Laboratory", url: "https://www.d-itlab.co.jp/", period: "2022", worktype: "Reserch Internship", project: "深層学習を使った研究の実装・評価をしていました。" },
        { company: "株式会社サイカ", url: "https://xica.net/", period: "2023", worktype: "SWE Internship", project: "Python 製の既存の分析基盤を Julia で書き直して高速化するプロジェクトをしていました。" },
        { company: "日本経済新聞社", url: "https://hack.nikkei.com/", period: "2024", worktype: "SWE Internship", project: "" },
    ] : [
        { company: "DENSO IT Laboratory", url: "https://www.d-itlab.co.jp/", period: "2022", worktype: "Reserch Internship", project: "Implemented and evaluated research using deep learning." },
        { company: "Xica Inc.", url: "https://xica.net/", period: "2023", worktype: "SWE Internship", project: "Rewriting the existing analysis infrastructure written in Python in Julia to get faster and more efficient." },
        { company: "Nikkei Inc.", url: "https://hack.nikkei.com/", period: "2024", worktype: "SWE Internship", project: "" },
    ]


    return (
        <main className="container mx-auto px-4">
            <h2 className="text-2xl font-bold my-4"> Education </h2>
            {educations.map((education, index) => (
                <EachEducation key={index} school={education.school} period={education.period} />
            ))}

            <h2 className="text-2xl font-bold my-4">Work Experience</h2>
            {works.map((work, index) => (
                <EachWork key={index} company={work.company} url={work.url} period={work.period} worktype={work.worktype} project={work.project} />
            ))}

        </main>
    );
}