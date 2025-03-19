import { motion } from "framer-motion";
import { FaGithub, FaLink, FaTwitter } from "react-icons/fa";
import { FaSpeakerDeck } from "react-icons/fa6";
import { TypeAnimation } from 'react-type-animation';
import LanguageContext from "../context/LanguageContext";
import { useContext } from "react";


export default function Component() {
    const { language, toggleLanguage } = useContext(LanguageContext);
    
    return (
        <div className="flex items-center justify-center p-4 transition-colors duration-300">
            <motion.div
                className="bg-white dark:bg-gray-800 rounded-lg shadow-xl overflow-hidden w-full md:w-3/4"
                initial={{ opacity: 0, y: 50 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
            >

                <div className="bg-gray-200 dark:bg-gray-700 px-4 py-2 flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                        <div className="w-3 h-3 rounded-full bg-red-500"></div>
                        <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
                        <div className="w-3 h-3 rounded-full bg-green-500"></div>
                    </div>

                    <p className="text-gray-700 dark:text-gray-300 font-mono">
                        ~/Desktop/abap34.com
                    </p>

                    <div className="px-4">

                    </div>
                </div>

                <div className="p-6 flex flex-col md:flex-row gap-8">
                    <motion.div
                        className="space-y-6 md:w-1/2"
                        initial={{ opacity: 0, x: -50 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.5, delay: 0.2 }}
                    >
                        <motion.div
                            className="bg-gray-100 dark:bg-gray-700 rounded-lg p-4 shadow-inner"
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ duration: 0.5, delay: 0.4 }}
                        >
                            <motion.div
                                className="font-mono text-lg"
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                transition={{ delay: 0.6, duration: 0.5 }}
                            >
                                <motion.span
                                    className="text-blue-600 dark:text-blue-400 text-2xl font-bold"
                                    initial={{ opacity: 0, y: -20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: 1.5, duration: 0.5 }}
                                >
                                    <TypeAnimation
                                        sequence={[
                                            '',
                                            2000,
                                            '@abap34', // Types 'Three' without deleting 'Two'
                                            () => {

                                            },
                                        ]}
                                        wrapper="span"
                                        cursor={true}
                                        repeat={0}
                                        speed={20}
                                        style={{ fontSize: '1em', display: 'inline-block' }}
                                    />
                                </motion.span>
                            </motion.div>
                        </motion.div>

                        <motion.p
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ delay: 1, duration: 0.5 }}
                            className="text-gray-700 dark:text-gray-300"
                        >
                            {/* 犬と野球と音楽と計算機が好きです。 */}

                            {language === "ja" ? "犬と野球と音楽と計算機が好きです。" : "I like dogs, baseball, music, and computers."}
                        </motion.p>

                        <motion.p
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ delay: 1.2, duration: 0.5 }}
                            className="text-gray-700 dark:text-gray-300"
                        >
                            👇
                        </motion.p>

                        <motion.div
                            className="space-y-4"
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 1.4, duration: 0.5 }}
                        >
                            <a href="https://github.com/abap34" target="_blank" rel="noreferrer" className="text-white px-4 py-2 rounded bg-gray-700 hover:bg-gray-800 flex items-center transition duration-300 shadow-sm dark:hover:bg-gray-600">
                                <FaGithub className="mr-2" />
                                @abap34
                            </a>

                            <a href="https://twitter.com/abap34" target="_blank" rel="noreferrer" className="text-white px-4 py-2 rounded bg-sky-400 hover:bg-sky-500 flex items-center transition duration-300 shadow-sm dark:hover:bg-sky-300">
                                <FaTwitter className="mr-2" />
                                @abap34
                            </a>

                            <a href="https://speakerdeck.com/abap34" target="_blank" rel="noreferrer" className="text-white px-4 py-2 rounded bg-green-500 hover:bg-green-600 flex items-center transition duration-300 shadow-sm dark:hover:bg-green-400">
                                <FaSpeakerDeck className="mr-2" />
                                abap34's slides
                            </a>

                            <a href="https://abap34.com/blog" target="_blank" rel="noreferrer" className="text-white px-4 py-2 rounded bg-orange-500 hover:bg-orange-600 flex items-center transition duration-300 shadow-sm dark:hover:bg-orange-400">
                                <FaLink className="mr-2" />
                                abap34's blog
                            </a>

                        </motion.div>
                    </motion.div>

                    <motion.div
                        className="flex justify-center items-center md:w-1/2"
                        initial={{ opacity: 0, x: 50 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.5, delay: 0.2 }}
                    >
                        <motion.div
                            className="w-64 h-64 bg-gray-200 dark:bg-gray-600 rounded-full flex items-center justify-center"
                            initial={{ rotate: -10 }}
                            animate={{ rotate: 0 }}
                            transition={{ duration: 0.5 }}
                        >
                            <img src="/icon.png" alt="icon" className="w-48 h-48 rounded-full" />
                        </motion.div>
                    </motion.div>
                </div>
            </motion.div>
        </div>
    )
}