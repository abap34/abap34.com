import React from 'react';
import { FaGithub, FaLinkedin, FaSpeakerDeck, FaTwitter } from "react-icons/fa";

const iconComponents = {
  FaGithub,
  FaLinkedin, 
  FaSpeakerDeck,
  FaTwitter
};

export function SocialLinks({ links, className = "" }) {
  return (
    <div 
      className={className}
      style={{
        display: 'flex',
        gap: '1rem',
        marginTop: '1rem',
        justifyContent: 'center'
      }}
    >
      {links.map((link) => {
        const IconComponent = iconComponents[link.icon];
        return (
          <a
            key={link.name}
            href={link.url}
            target="_blank"
            rel="noreferrer"
            aria-label={link.name}
            variant-="foreground1"
            style={{
              transition: 'opacity 0.2s ease',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
            onMouseEnter={(e) => e.target.style.opacity = '0.8'}
            onMouseLeave={(e) => e.target.style.opacity = '1'}
          >
            <IconComponent style={{ width: '1.25rem', height: '1.25rem' }} />
          </a>
        );
      })}
    </div>
  );
}