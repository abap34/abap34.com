import { useContext } from "react";
import { introductionContent, socialLinks } from "../config/content";
import LanguageContext from "../context/LanguageContext";
import './Introduction.css';
import { SocialLinks } from "./SocialLinks";

export default function Introduction() {
    const { language } = useContext(LanguageContext);
    const content = introductionContent[language];

    return (
        <div className="intro-container">
            <div className="intro-layout">
                <div className="intro-profile">
                    <img
                        src="/icon.png"
                        alt="abap34"
                        className="intro-avatar"
                    />
                    <SocialLinks links={socialLinks} />
                </div>

                <div className="intro-content">
                    <div className="intro-name">
                        {content.name}
                    </div>
                    <div className="intro-main-description">
                        {content.mainDescription}
                    </div>
                    <div className="intro-detailed-description">
                        {content.detailedDescription.map((line, index) => (
                            line === "" ? <br key={index} /> : <div key={index}>{line}</div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
}