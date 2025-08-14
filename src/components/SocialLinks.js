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
    <div className={`flex space-x-4 mt-4 justify-center ${className}`}>
      {links.map((link) => {
        const IconComponent = iconComponents[link.icon];
        return (
          <a
            key={link.name}
            href={link.url}
            target="_blank"
            rel="noreferrer"
            aria-label={link.name}
            className={`text-gray-600 dark:text-gray-400 transition-colors ${link.hoverColor}`}
          >
            <IconComponent className="w-5 h-5" />
          </a>
        );
      })}
    </div>
  );
}