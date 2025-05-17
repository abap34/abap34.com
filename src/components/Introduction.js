import { useContext } from "react";
import { FaGithub, FaSpeakerDeck, FaTwitter } from "react-icons/fa6";
import LanguageContext from "../context/LanguageContext";

export default function Introduction() {
    const { language } = useContext(LanguageContext);

    return (
        <div className="max-w-4xl mx-auto mb-8">

            <div className="flex flex-col md:flex-row items-center md:items-center gap-6 pb-6 border-b border-gray-200 dark:border-gray-700">
                <img
                    src="/icon.png"
                    alt="abap34"
                    className="w-32 h-32 rounded-full border-2 border-gray-300 dark:border-gray-700 shadow-md dark:shadow-gray-800 self-center"
                />
                <div>
                    <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
                        @abap34
                    </h1>

                    <div className="text-gray-700 dark:text-gray-300 mb-4">
                        <p className="mb-4">
                            {language === "ja"
                                ? "機械学習とプログラミング言語に興味があります。理論も実装もできる研究者・エンジニアが目標です。"
                                : "I am interested in machine learning and programming languages. My goal is to be a researcher and engineer who can do both theory and implementation."}
                        </p>

                        <div className="text-sm border-gray-200 dark:border-gray-700 pl-3 py-1">
                            <p className="font-medium mb-1">Research Interests:</p>
                            <p className="text-gray-600 dark:text-gray-400">
                                {language === "ja"
                                    ? "機械学習 (そのソフトウェア基盤, 高速化, 自動証明, LLM)"
                                    : "Machine Learning (Software Infrastructure, Automated Theorem Proving, Performance Optimization, LLM)"}
                                <br />
                                {language === "ja"
                                    ? "プログラミング言語 (その理論と実装, 最適化コンパイラ, 静的解析ツール, 定理証明支援系)"
                                    : "Programming Languages (Theory & Implementation, Optimizing Compilers, Static Analysis Tools, Theorem Provers)"}
                            </p>
                            <p className="font-medium mt-2 mb-1">Skills:</p>
                            <p className="text-gray-600 dark:text-gray-400">
                                {language === "ja"
                                    ? "プログラミング言語: Python, Julia, C++, TypeScript, Scheme, Rocq"
                                    : "Programming: Python, Julia, C++, TypeScript, Scheme, Rocq"}
                            </p>
                            <p className="font-medium mt-2 mb-1">Languages:</p>
                            <p className="text-gray-600 dark:text-gray-400">
                                {language === "ja"
                                    ? "日本語 (母国語), 英語 (日常会話レベル)"
                                    : "Japanese (Native), English (Conversational)"}
                            </p>
                        </div>
                    </div>


                    <div className="flex gap-5">
                        <a
                            href="https://github.com/abap34"
                            target="_blank"
                            rel="noreferrer"
                            aria-label="GitHub"
                            className="text-gray-600 hover:text-black dark:text-gray-400 dark:hover:text-white transition-colors"
                        >
                            <FaGithub className="w-5 h-5" />
                        </a>
                        <a
                            href="https://twitter.com/abap34"
                            target="_blank"
                            rel="noreferrer"
                            aria-label="Twitter"
                            className="text-gray-600 hover:text-blue-400 dark:text-gray-400 dark:hover:text-blue-300 transition-colors"
                        >
                            <FaTwitter className="w-5 h-5" />
                        </a>
                        <a
                            href="https://speakerdeck.com/abap34"
                            target="_blank"
                            rel="noreferrer"
                            aria-label="SpeakerDeck"
                            className="text-gray-600 hover:text-green-500 dark:text-gray-400 dark:hover:text-green-400 transition-colors"
                        >
                            <FaSpeakerDeck className="w-5 h-5" />
                        </a>
                    </div>
                </div>
            </div>
        </div>
    );
}