import React from 'react';
import { Link } from 'react-router-dom';
import { useYamlData, useStaticYamlData } from '../hooks/useYamlData';
import { FaGithub, FaTwitter, FaSpeakerDeck, FaLinkedin } from 'react-icons/fa';
import Works from './Works';
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

  return (
    <div className="home">
      {/* Hero Section */}
      <section className="hero">
        <img src={intro?.avatar} alt="avatar" className="avatar" />
        <h1 className="name">{intro?.name}</h1>
        <div className="tagline">
          {intro?.mainDescription.split('．').filter(s => s).map((sentence, i) => (
            <p key={i}>{sentence}．</p>
          ))}
        </div>

        {/* Social Links */}
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
                <Icon size={20} />
              </a>
            );
          })}
        </div>

        <div className="description">
          {intro?.detailedDescription?.map((line, i) => (
            line === '' ? <br key={i} /> : <p key={i}>{line}</p>
          ))}
        </div>
      </section>

      {/* Recent Works */}
      <section className="section">
        <div className="section-header">
          <h2>Recent Works</h2>
          <Link to="/works" className="view-all">View all →</Link>
        </div>
        <Works limit={3} showSearch={false} showTitle={false} />
      </section>

      {/* Background */}
      <section className="section">
        <h2>Background</h2>
        <div className="timeline-grid">
          <div className="timeline-section">
            <h3>Education</h3>
            {education.map((edu, i) => (
              <div key={i} className="timeline-item">
                <div className="timeline-title">{edu.school}</div>
                <div className="timeline-period">{edu.period}</div>
              </div>
            ))}
          </div>
          <div className="timeline-section">
            <h3>Work Experience</h3>
            {careers.map((career, i) => (
              <div key={i} className="timeline-item">
                <div className="timeline-title">{career.company}</div>
                <div className="timeline-period">{career.period}</div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
