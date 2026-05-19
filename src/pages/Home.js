import React from 'react';
import { useYamlData, useStaticYamlData } from '../hooks/useYamlData';
import { FaGithub, FaTwitter, FaSpeakerDeck, FaLinkedin } from 'react-icons/fa';
import './Home.css';

const iconComponents = {
  FaGithub,
  FaTwitter,
  FaSpeakerDeck,
  FaLinkedin
};

export default function Home() {
  const { data: intro, isLoading: introLoading } = useYamlData('/data/introduction.yaml');
  const { data: socialData, isLoading: socialLoading } = useStaticYamlData('/data/social-links.yaml');
  const { data: backgroundData, isLoading: bgLoading } = useYamlData('/data/background.yaml');

  if (introLoading || socialLoading || bgLoading) {
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
            <h1 className="name">{intro?.name}</h1>
            <p className="tagline">
              {intro?.mainDescription}{' '}
              <a href="/cv/cv-casual-ja.html">Resume (ja)</a>
            </p>
            <div className="social-links">
              {socialData?.links?.map((link) => {
                const Icon = iconComponents[link.icon];
                return (
                  <a
                    key={link.name}
                    href={link.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="social-link"
                    title={link.name}
                  >
                    <Icon size={16} />
                  </a>
                );
              })}
            </div>
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

      <section className="section">
        <div className="description">
          {intro?.detailedDescription?.map((line, i) => (
            line === '' ? <br key={i} /> : <p key={i}>{line}</p>
          ))}
        </div>
      </section>
    </div>
  );
}
