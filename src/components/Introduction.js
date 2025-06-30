import { useContext } from "react";
import { FaGithub, FaLinkedin, FaSpeakerDeck, FaTwitter } from "react-icons/fa";
import LanguageContext from "../context/LanguageContext";

export default function Introduction() {
    const { language } = useContext(LanguageContext);

    return (
        <div className="max-w-4xl mx-auto mb-8">

            <div className="flex flex-col md:flex-row items-center md:items-center gap-6 pb-6 border-b border-gray-200 dark:border-gray-700">

                <div>
                    <img
                        src="/icon.png"
                        alt="abap34"
                        className="max-w-[128px] max-h-[128px] w-auto h-auto rounded-full border-2 border-gray-300 dark:border-gray-700 shadow-md dark:shadow-gray-800 self-center"
                    />


                    <div className="flex space-x-4 mt-4 justify-center">
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

                        <a
                            href="https://www.linkedin.com/in/yuchi-yamaguchi-981a83332"
                            target="_blank"
                            rel="noreferrer"
                            aria-label="LinkedIn"
                            className="text-gray-600 hover:text-blue-700 dark:text-gray-400 dark:hover:text-blue-500 transition-colors"
                        >
                            <FaLinkedin className="w-5 h-5" />
                        </a>
                    </div>

                </div>

                <div>
                    <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
                        @abap34
                    </h1>

                    <div className="text-gray-700 dark:text-gray-300 mb-4">
                        <p className="mb-4">
                            {language === "ja"
                                ? "機械学習とプログラミング言語が好きです. 理論も実装もできる研究者・エンジニアが目標です. "
                                : "Machine Learning & Programming Languages enthusiast. I aim to be a researcher/engineer who can do both theory and implementation."}
                        </p>

                        <div className="text-sm border-gray-200 dark:border-gray-700 pl-3 py-1">
                            <p className="font-medium mb-1">Research Interests:</p>
                            <p className="text-gray-600 dark:text-gray-400">
                                {language === "ja"
                                    ? "最近はプログラミング言語の知識を機械学習に生かすこと， もしくは機械学習の知識をプログラミング言語に生かすことを考えています."
                                    : "Recently, I have been thinking about how to leverage programming language knowledge in machine learning, or vice versa."}
                                <br />
                                <br />
                                {language === "ja"
                                    ? "具体的には:"
                                    : "Specifically:"}
                                <br />
                                {language === "ja"
                                    ? "- 機械学習 (ソフトウェア基盤, 高速化, 自動証明)"
                                    : "- Machine Learning (Software Infrastructure, Automated Theorem Proving, Performance Optimization)"}
                                <br />
                                {language === "ja"
                                    ? "- プログラミング言語 (その理論と実装, コンパイラ最適化, 形式手法)"
                                    : "- Programming Languages (Both of Theory & Implementation, Optimizing Compilers, Formal Methods)"}
                                <br />
                                
                                {language === "ja"
                                    ? "などに興味を持っています."
                                    : "and related areas."}
                                <br />
                                <br />
                                {language === "ja"
                                    ? "そのほか 数理最適化 (とくに連続最適化), 数理統計に関連する領域に関心があります."
                                    : "Other interests include mathematical optimization (especially continuous optimization) and mathematical statistics, as well as related fields."}
                                <br />
                                {language === "ja"
                                    ? "必要に応じて Web 開発 (React, FastAPI を使うことが多いです) もします。"
                                    : "I also do web development (often using React and FastAPI) when necessary."}
                                <br />
                                {language === "ja"
                                    ? "よく使うプログラミング言語は Python, Julia, TypeScript, C++, Scheme などです。"
                                    : "I often use programming languages such as Python, Julia, TypeScript, C++, and Scheme."}
                                <br />
                                <br />
                                {language === "ja"
                                    ? "普段はプログラムを書くか音楽を聴くか野球を観て暮らしています。"
                                    : "I usually spend my time writing programs, listening to music, or watching baseball."}
                            </p>
                        </div>
                    </div>



                </div>
            </div>
        </div>
    );
}