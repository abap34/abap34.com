import { useContext } from "react";
import { introductionContent, socialLinks } from "../config/content";
import LanguageContext from "../context/LanguageContext";
import './Introduction.css';
import { SocialLinks } from "./SocialLinks";

export default function Introduction() {
    const { language } = useContext(LanguageContext);
    const content = introductionContent[language];

    return (
        <column className="intro-container">
            <row className="intro-layout">
                <column className="intro-profile">
                    <img
                        src="/commic34.png"
                        alt="abap34"
                        className="intro-avatar"
                        size={240}
                    />
                    <SocialLinks links={socialLinks} />
                </column>

                <column className="intro-content">
                    <div className="intro-name">
                        {content.name}
                    </div>
                    <div className="intro-main-description">
                        {content.mainDescription}
                    </div>
                    <column className="intro-detailed-description">
                        {content.detailedDescription.map((line, index) => (
                            line === "" ? <br key={index} /> : <div key={index}>{line}</div>
                        ))}
                    </column>
                </column>
            </row>
        </column>
    );
}
