import { useContext } from "react";
import LanguageContext from "../context/LanguageContext";
import { Heading, Text } from "../design-system";
import { introductionContent, socialLinks } from "../config/content";
import { SocialLinks } from "./SocialLinks";

export default function Introduction() {
    const { language } = useContext(LanguageContext);
    const content = introductionContent[language];

    return (
        <div>
            <div 
                style={{
                    display: 'flex',
                    gap: '2rem',
                    alignItems: 'center'
                }}
            >
                <div style={{ flexShrink: 0, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                    <img
                        src="/icon.png"
                        alt="abap34"
                        style={{
                            width: '120px',
                            height: '120px',
                            borderRadius: '50%',
                            border: '2px solid var(--foreground2)',
                            marginBottom: '1rem'
                        }}
                    />
                    <SocialLinks links={socialLinks} />
                </div>

                <div style={{ flex: 1 }}>
                    <div style={{ fontSize: '1.75rem', fontWeight: 'var(--font-weight-bold)', color: 'var(--foreground0)', marginBottom: '0.75rem' }}>
                        {content.name}
                    </div>
                    <div style={{ marginBottom: '1rem', lineHeight: '1.6', fontSize: '1rem' }}>
                        {content.mainDescription}
                    </div>
                    <div style={{ lineHeight: '1.6', color: 'var(--foreground1)', fontSize: '0.95em' }}>
                        {content.detailedDescription.map((line, index) => (
                            line === "" ? <br key={index} /> : <div key={index}>{line}</div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
}