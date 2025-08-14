import { useContext } from "react";
import LanguageContext from "../context/LanguageContext";
import { Heading, Text } from "../design-system";
import { introductionContent, socialLinks } from "../config/content";
import { SocialLinks } from "./SocialLinks";

export default function Introduction() {
    const { language } = useContext(LanguageContext);
    const content = introductionContent[language];

    return (
        <div className="max-w-4xl mx-auto mb-8">
            <div className="flex flex-col md:flex-row items-center md:items-center gap-6 pb-6 border-b border-gray-200 dark:border-gray-700">
                <div>
                    <img
                        src="/icon.png"
                        alt="abap34"
                        className="max-w-[128px] max-h-[128px] w-auto h-auto rounded-full border-2 border-gray-300 dark:border-gray-700 shadow-md dark:shadow-gray-800 self-center"
                    />
                    <SocialLinks links={socialLinks} />
                </div>

                <div>
                    <Heading level={1} className="mb-2">
                        {content.name}
                    </Heading>

                    <div className="mb-4">
                        <Text className="mb-4">
                            {content.mainDescription}
                        </Text>

                        <div className="text-sm border-gray-200 dark:border-gray-700 pl-3 py-1">
                            <Text variant="caption">
                                {content.detailedDescription.map((line, index) => (
                                    line === "" ? <br key={index} /> : <span key={index}>{line}<br /></span>
                                ))}
                            </Text>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}