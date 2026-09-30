import React from 'react';
import { Link } from 'react-router-dom';
import './MlbHome.css';

export default function MlbHome() {
  const currentSeason = 2026;

  const activeSeasons = [
    {
      year: 2026,
      segment: 'regular',
      title: '2026 Regular Season',
      tag: 'Completed Campaign',
      status: 'active',
      description:
        'Complete 162-game team records, full division splits, and final player rosters.',
      statsSummary: '30 Teams • Full Rosters & Stints • 6 Divisions'
    },
    {
      year: 2025,
      segment: 'regular',
      title: '2025 Regular Season',
      tag: 'Final Standings',
      status: 'final',
      description:
        'Official division finishes, win/loss records, and player hitting, pitching & fielding statistics.',
      statsSummary: '30 Teams • 162 Games • Complete Stats'
    },
    {
      year: 2025,
      segment: 'postseason',
      title: '2025 Post Season',
      tag: 'Playoff Bracket',
      status: 'postseason',
      description:
        'Postseason bracket progression from Wild Card through World Series, linking to participating teams.',
      statsSummary: 'Wild Card • Division Series • LCS • World Series'
    }
  ];

  return (
    <div className="mlb-hub-container">
      {/* Hero Header */}
      <header className="mlb-hero">
        <div className="mlb-hero-badge">Major League Baseball</div>
        <h1 className="mlb-hero-title">MLB Statistics Hub</h1>
        <p className="mlb-hero-subtitle">
          Stateless statistical exploration across active and historical MLB campaigns.
          Explore divisional standings, team splits, and complete player rosters.
        </p>
      </header>

      {/* Primary MVP Season Selector */}
      <section className="mlb-season-section">
        <div className="section-header">
          <h2>Select Season & Competition</h2>
          <span className="section-meta">MVP Coverage: 2025 – 2026</span>
        </div>

        <div className="season-cards-grid">
          {activeSeasons.map((item) => (
            <Link
              key={`${item.year}-${item.segment}`}
              to={`/sports/baseball/competitions/mlb/seasons/${item.year}?segment=${item.segment}`}
              className={`season-card ${item.status}`}
            >
              <div className="season-card-top">
                <span className="season-year">{item.year}</span>
                <span className={`status-pill ${item.segment}`}>
                  {item.tag}
                </span>
              </div>

              <h3 className="season-card-title">{item.title}</h3>
              <p className="season-card-desc">{item.description}</p>

              <div className="season-card-footer">
                <span className="footer-summary">{item.statsSummary}</span>
                <span className="arrow-btn">Explore →</span>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* Historical Archive Teaser (Architecture Scaffold) */}
      <section className="mlb-archive-section">
        <div className="archive-card">
          <div className="archive-info">
            <h3>Historical Archives (1995 – 2024)</h3>
            <p>
              Archival data extending back to the conclusion of the 1994–1995 MLB player strike.
            </p>
          </div>
          <Link
            to="/competitions/mlb-archive/maintenance"
            className="archive-btn"
          >
            Archive Staging (Maintenance)
          </Link>
        </div>
      </section>
    </div>
  );
}