import React from 'react';
import { useYamlData } from '../hooks/useYamlData';
import './Home.css';

const socialLinks = [
  {
    name: 'github',
    url: 'https://github.com/abap34',
    text: '@abap34',
  },
  {
    name: 'twitter',
    url: 'https://twitter.com/abap34',
    text: '@abap34',
  },
  {
    name: 'speakerdeck',
    url: 'https://speakerdeck.com/abap34',
    text: '@abap34',
  },
  {
    name: 'linkedin',
    url: 'https://www.linkedin.com/in/yuchi-yamaguchi-981a83332',
    text: 'Yuchi Yamaguchi',
  },
  {
    name: 'resume',
    url: '/cv/cv-casual-ja.html',
    text: 'Resume (ja)',
  },
];

export default function Home({ abapNumber }) {
  const { data: intro, isLoading: introLoading } = useYamlData('/data/introduction.yaml');
  const { data: backgroundData, isLoading: bgLoading } = useYamlData('/data/background.yaml');

  if (introLoading || bgLoading) {
    return <div className="loading">Loading...</div>;
  }

  const education = backgroundData?.education || [];
  const careers = backgroundData?.careers || [];
  const others = backgroundData?.others || [];

  return (
    <div className="home">
      {/* Hero Section */}
      <section className="hero">
        <div className="hero-main">
          <img src={intro?.avatar} alt="avatar" className="avatar" />
          <div className="hero-text">
            <h1 className="name">@abap{abapNumber}</h1>
            <ul className="social-links" aria-label="social links">
              {socialLinks.map((link) => {
                const isExternalLink = /^https?:\/\//.test(link.url);

                return (
                  <li key={link.name} className="social-link-item">
                    <span className="social-link-name">{link.name}:</span>
                    <a
                      href={link.url}
                      target={isExternalLink ? '_blank' : undefined}
                      rel={isExternalLink ? 'noopener noreferrer' : undefined}
                      className="social-link"
                    >
                      {link.text}
                    </a>
                  </li>
                );
              })}
            </ul>
          </div>
        </div>
      </section>

      {/* Background */}
      <section className="section background-section">
        <h2>Background</h2>
        <div className="timeline-grid">
          <div className="timeline-section">
            <h3>Education</h3>
            {education.map((edu, i) => (
              <a key={i} href={edu.url} target="_blank" rel="noopener noreferrer" className="timeline-item timeline-item-link">
                <span className="timeline-period">{edu.period}</span>
                <span className="timeline-title">{edu.school}</span>
              </a>
            ))}
          </div>
          <div className="timeline-section">
            <h3>Work Experience</h3>
            {careers.map((career, i) => (
              <a key={i} href={career.url} target="_blank" rel="noopener noreferrer" className="timeline-item timeline-item-link">
                <span className="timeline-period">{career.period}</span>
                <span className="timeline-title">{career.company}</span>
                {career.worktype && <span className="timeline-worktype">{career.worktype}</span>}
              </a>
            ))}
          </div>
        </div>
        <div className="timeline-section timeline-section-full">
          <h3>Others</h3>
          {others.map((other, i) => (
            <a key={i} href={other.url} target="_blank" rel="noopener noreferrer" className="timeline-item timeline-item-link">
              <span className="timeline-period">{other.period}</span>
              <span className="timeline-title">{other.title}</span>
            </a>
          ))}
        </div>
      </section>

   </div>
  );
}
