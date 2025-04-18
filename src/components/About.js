import { Code, Cpu, GraduationCap, Lightbulb, Mail } from "lucide-react";
import { useContext, useEffect, useState } from "react";
import ReactMarkdown from "react-markdown";
import yaml from "yaml";
import LanguageContext from "../context/LanguageContext";

export default function About() {
    const [data, setData] = useState(null);
    const { language, toggleLanguage } = useContext(LanguageContext);


    useEffect(() => {
        let filename = language === "ja" ? "/works/aboutme.yaml" : "/works/aboutme_en.yaml";
        fetch(filename)
            .then((res) => res.text())
            .then((text) => setData(yaml.parse(text)));
    }, [language]);

    if (!data) return <p>Loading...</p>;


    return (
        <div className="max-w-4xl mx-auto py-12 px-6 space-y-12 bg-white dark:bg-gray-900 rounded-lg shadow-sm dark:shadow-gray-800">
            <h1 className="text-4xl font-bold text-gray-800 dark:text-gray-100 border-b pb-4 border-gray-200 dark:border-gray-700">
                About Me
            </h1>

            <Section icon={<GraduationCap className="w-7 h-7 text-indigo-600 dark:text-indigo-400" />} title="Affiliation">
                <p className="text-gray-700 dark:text-gray-300 ml-4 leading-relaxed">{data.belong}</p>
            </Section>

            <Section icon={<Lightbulb className="w-7 h-7 text-amber-500 dark:text-amber-400" />} title="About Me">
                <MarkdownText text={data.aboutme} />
            </Section>

            <Section icon={<Code className="w-7 h-7 text-emerald-600 dark:text-emerald-400" />} title="Skills">

                <div className="space-y-2 ">
                    <MarkdownText text={data.stack} />
                    <img
                        src="https://github-readme-stats-git-self-host-abap34s-projects.vercel.app/api/top-langs?username=abap34&hide=jupyter%20notebook,HTML,Rich%20Text%20Format,CSS,SCSS&stats_format=bytes&langs_count=10&count_private=true&layout=compact&disable_animations=true&card_width=300&cache_seconds=60"
                        alt="Most Used Languages"
                        className="mx-auto"
                    />

                    <p className="text-center text-sm text-gray-600 dark:text-gray-400">

                        {/* (※ GitHub の自身のレポジトリの言語割合.) */}
                        {language === "ja" ? "(※ GitHub の自身のレポジトリの言語割合.)" : "(※ The language ratio of my GitHub repositories.)"}
                    </p>
                </div>
            </Section>

            <Section icon={<Cpu className="w-7 h-7 text-rose-600 dark:text-rose-400" />} title="Particular Interest">
                <p>
                    {/* 最近は、 (最終更新: 2024年1月31日) */}
                    {language === "ja" ? "最近は、" : "Recently, "}
                </p>

                {/* コードブロックの中のリストにする */}
                <ul className="ml-8 list-disc list-inside space-y-3 bg-gray-50 dark:bg-gray-800 p-3 rounded">
                    {data.detailed && data.detailed.map((item, index) => (
                        <li key={index}>{item}</li>
                    ))}

                </ul>

                <p>
                    {/* に特に興味を持って勉強しています。 */}

                    {language === "ja" ? "に特に興味を持って勉強しています。" : "... are what I am particularly interested and studying."}

                </p>
            </Section>

            <section className="space-y-5 transition-all duration-300">
                
                <div className="ml-4 space-y-5 text-gray-700 dark:text-gray-300 leading-relaxed">
                    {language === "ja" ? "Works にあるもの以外にも、さまざまなソフトウェア・実装を GitHub で公開しているので、ぜひ見てみてください。" : "In addition to what is in Works, I have published various software and implementations on GitHub, so please check it out!"}
                </div>
            </section>

            <Section icon={<Mail className="w-7 h-7 text-blue-600 dark:text-blue-400" />} title="Contact">
                <p className="font-mono bg-gray-50 dark:bg-gray-800 px-3 py-2 rounded inline-block">abap0002 [at] gmail.com</p>
            </Section>
        </div>
    );
}

function Section({ icon, title, children }) {
    return (
        <section className="space-y-5 transition-all duration-300">
            <div className="flex items-center gap-3 text-2xl font-medium">
                {icon}
                <h2 className="border-b pb-1">{title}</h2>
            </div>
            <div className="ml-4 space-y-5 text-gray-700 dark:text-gray-300 leading-relaxed">{children}</div>
        </section>
    );
}

function MarkdownText({ text }) {
    return (
        <div className="ml-4 space-y-5 text-gray-700 dark:text-gray-300 leading-relaxed">
            <ReactMarkdown>{text}</ReactMarkdown>
        </div>
    );
}
