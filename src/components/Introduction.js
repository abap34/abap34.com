import { useContext } from "react";
import LanguageContext from "../context/LanguageContext";
import { Heading, Text } from "../design-system";
import { introductionContent, socialLinks } from "../config/content";
import { SocialLinks } from "./SocialLinks";

export default function Introduction() {
    const { language } = useContext(LanguageContext);
    const content = introductionContent[language];

    return (
        <div className="flex justify-center">
            <div className="flex flex-col md:flex-row gap-8 items-center max-w-4xl w-full">
                <div className="flex-shrink-0 flex flex-col items-center">
                    <img
                        src="/icon.png"
                        alt="abap34"
                        className="w-32 h-32 rounded-full border-2 border-foreground2 mb-4"
                    />
                    <SocialLinks links={socialLinks} />
                </div>

                <div className="flex-1">
                    <div className="text-3xl font-bold text-foreground0 mb-3">
                        {content.name}
                    </div>
                    <div className="mb-4 leading-relaxed text-base">
                        {content.mainDescription}
                    </div>
                    <div className="leading-relaxed text-foreground1 text-sm">
                        {content.detailedDescription.map((line, index) => (
                            line === "" ? <br key={index} /> : <div key={index}>{line}</div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
}