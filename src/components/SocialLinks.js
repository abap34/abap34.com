import { FaGithub, FaLinkedin, FaSpeakerDeck, FaTwitter } from "react-icons/fa";
import { useFocusContext } from "../context/FocusContext";
import './SocialLinks.css';

const iconComponents = {
  FaGithub,
  FaLinkedin,
  FaSpeakerDeck,
  FaTwitter
};

export function SocialLinks({ links, className = "" }) {
  const { activeFocusId } = useFocusContext();

  return (
    <row className={`social-links ${className}`}>
      {links.map((link, index) => {
        const IconComponent = iconComponents[link.icon];
        const focusId = `top-item-intro-${index}`;
        const isFocused = activeFocusId === focusId;

        return (
          <a
            key={link.name}
            href={link.url}
            target="_blank"
            rel="noreferrer"
            aria-label={link.name}
            className={`social-link ${isFocused ? 'keyboard-focused' : ''}`}
            data-focus-id={focusId}
            data-focus-activate="self"
          >
            <IconComponent className="social-icon" />
          </a>
        );
      })}
    </row>
  );
}
