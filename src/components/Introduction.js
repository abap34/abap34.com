import { useEffect } from "react";
import { useYamlData, useStaticYamlData } from "../hooks/useYamlData";
import { useFocusContext } from "../context/FocusContext";
import './Introduction.css';
import { SocialLinks } from "./SocialLinks";

export default function Introduction() {
    const { data: content, isLoading: contentLoading } = useYamlData("/data/introduction.yaml");
    const { data: socialLinksData, isLoading: linksLoading } = useStaticYamlData("/data/social-links.yaml");
    const { setIntroductionItemCount } = useFocusContext();

    useEffect(() => {
        if (socialLinksData?.links) {
            setIntroductionItemCount(socialLinksData.links.length);
        }
    }, [socialLinksData, setIntroductionItemCount]);

    if (contentLoading || linksLoading) {
        return (
            <column className="intro-container">
                <div style={{ color: 'var(--foreground2)' }}>Loading...</div>
            </column>
        );
    }

    if (!content || !socialLinksData) {
        return (
            <column className="intro-container">
                <div style={{ color: 'var(--foreground2)' }}>Failed to load introduction</div>
            </column>
        );
    }

    return (
        <column className="intro-container">
            <row className="intro-layout">
                <column className="intro-profile">
                    <img
                        src={content.avatar}
                        alt="abap34"
                        className="intro-avatar"
                        size={240}
                    />
                    <SocialLinks links={socialLinksData.links} />
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
