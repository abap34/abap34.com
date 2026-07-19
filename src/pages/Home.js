import React from 'react';
import { ExternalLink, FileText, Mail, MapPin } from 'lucide-react';
import { FaGithub, FaLinkedin } from 'react-icons/fa';
import { FaXTwitter } from 'react-icons/fa6';
import { SiSpeakerdeck } from 'react-icons/si';
import { useYamlData } from '../hooks/useYamlData';
import './Home.css';

const socialLinks = [
  {
    name: 'GitHub',
    url: 'https://github.com/abap34',
    text: '@abap34',
    icon: FaGithub,
  },
  {
    name: 'X',
    url: 'https://twitter.com/abap34',
    text: '@abap34',
    icon: FaXTwitter,
  },
  {
    name: 'SpeakerDeck',
    url: 'https://speakerdeck.com/abap34',
    text: '@abap34',
    icon: SiSpeakerdeck,
  },
  {
    name: 'LinkedIn',
    url: 'https://www.linkedin.com/in/yuchi-yamaguchi-981a83332',
    text: 'Yuchi Yamaguchi',
    icon: FaLinkedin,
  },
];

function Panel({ id, title, children }) {
  return (
    <section className="ledger-panel ledger-section" id={id} aria-labelledby={`${id}-title`}>
      <h2 className="ledger-title" id={`${id}-title`}>
        <span>{title}</span>
      </h2>
      {children}
    </section>
  );
}

function TimelineGroup({ title, items, getTitle, getMeta }) {
  if (!items.length) return null;

  return (
    <div className="timeline-group">
      <div className="ledger-records">
        {items.map((item, i) => (
          <a
            key={`${title}-${i}`}
            href={item.url}
            target="_blank"
            rel="noopener noreferrer"
            className="ledger-record ledger-record-link"
          >
            <span className="ledger-record-period">{item.period}</span>
            <span className="ledger-record-main">
              <span className="ledger-record-title">{getTitle(item)}</span>
              {getMeta?.(item) && <span className="ledger-record-meta">{getMeta(item)}</span>}
            </span>
          </a>
        ))}
      </div>
    </div>
  );
}

export default function Home({ abapNumber }) {
  const { data: intro, isLoading: introLoading } = useYamlData('/data/introduction.yaml');
  const { data: backgroundData, isLoading: bgLoading } = useYamlData('/data/background.yaml');

  if (introLoading || bgLoading) {
    return <div className="loading">Loading...</div>;
  }

  const education = backgroundData?.education || [];
  const careers = backgroundData?.careers || [];
  const others = backgroundData?.others || [];

  if (abapNumber === 256) {
    return (
      <div className="home home-quiet">
        <section className="ledger-panel hero">
          <div className="hero-main">
            <img src={intro?.avatar} alt="avatar" className="avatar" />
            <div className="hero-text">
              <h1 className="name">@abap{abapNumber}</h1>
            </div>
          </div>
        </section>
      </div>
    );
  }


  return (
    <div className="home">
      <section className="ledger-panel hero" aria-label="基本情報">
        <div className="hero-layout">
          <img src={intro?.avatar} alt="avatar" className="avatar" />
          <div className="hero-copy">
            <h1 className="wordmark">@abap{abapNumber}</h1>
            <ul className="identity-list" aria-label="基本情報">
              <li>
                <MapPin size={14} aria-hidden="true" />
                <a href="https://maps.app.goo.gl/C4J51xh2Pt4yXpM27" target="_blank" rel="noopener noreferrer">
                  Ookayama
                </a>
              </li>
              <li>
                <Mail size={14} aria-hidden="true" />
                <a href="mailto:yuchi@abap34.com">yuchi@abap34.com</a>
              </li>
              <li>
                <FileText size={14} aria-hidden="true" />
                <a href="/cv/cv-ja.html">cv-ja.html</a>
              </li>
            </ul>
          </div>
        </div>
      </section>

      <Panel id="contact" title="Contact">
        <ul className="dispatch-list">
          {socialLinks.map((link) => {
            const Icon = link.icon;
            const isExternalLink = /^https?:\/\//.test(link.url);

            return (
              <li key={link.name}>
                <span className="dispatch-label">
                  <Icon aria-hidden="true" />
                  {link.name}
                </span>
                <a
                  href={link.url}
                  target={isExternalLink ? '_blank' : undefined}
                  rel={isExternalLink ? 'noopener noreferrer' : undefined}
                >
                  {link.text}
                  {isExternalLink && <ExternalLink size={12} aria-hidden="true" />}
                </a>
              </li>
            );
          })}
        </ul>
      </Panel>

      <Panel id="background" title="Background">
        <div className="timeline-ledger">
          <TimelineGroup title="学歴" items={education} getTitle={(edu) => edu.school} />
          <TimelineGroup
            title="職歴"
            items={careers}
            getTitle={(career) => career.company}
            getMeta={(career) => career.worktype}
          />
          <TimelineGroup title="その他" items={others} getTitle={(other) => other.title} />
        </div>
      </Panel>
    </div>
  );
}
