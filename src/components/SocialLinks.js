import { FaGithub, FaLinkedin, FaSpeakerDeck, FaTwitter } from "react-icons/fa";
import './SocialLinks.css';

const iconComponents = {
  FaGithub,
  FaLinkedin,
  FaSpeakerDeck,
  FaTwitter
};

export function SocialLinks({ links, className = "" }) {
  return (
    <row className={`social-links ${className}`}>
      {links.map((link) => {
        const IconComponent = iconComponents[link.icon];
        return (
          <a
            key={link.name}
            href={link.url}
            target="_blank"
            rel="noreferrer"
            aria-label={link.name}
            className="social-link"
          >
            <IconComponent className="social-icon" />
          </a>
        );
      })}
    </row>
  );
}