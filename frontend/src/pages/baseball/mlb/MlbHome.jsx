import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import './MlbHome.css';

export default function MlbHome() {
  const navigate = useNavigate();
  const currentYear = 2026;
  const [customYear, setCustomYear] = useState('');

  // Generate the last 10 years dynamically (2026 down to 2017)
  const lastTenYears = Array.from({ length: 10 }, (_, i) => currentYear - i);

  const handleCustomYearSubmit = (e) => {
    e.preventDefault();
    const yr = parseInt(customYear, 10);
    if (yr >= 1995 && yr <= currentYear) {
      navigate(`/sports/baseball/competitions/mlb/seasons/${yr}?segment=regular`);
    } else {
      alert(`Please enter a valid historical year between 1995 and ${currentYear}.`);
    }
  };

  return (
    <div className="mlb-hub-container">
      {/* Hero Header */}
      <header className="mlb-hero">
        <div className="mlb-hero-badge">Major League Baseball</div>
        <h1 className="mlb-hero-title">MLB Statistics Hub</h1>
        <p className="mlb-hero-subtitle">
          Stateless statistical exploration across historical campaigns from 1995 onward.
          Explore divisional standings, team splits, and complete player rosters.
        </p>
      </header>

      {/* Last 10 Years Quick Grid */}
      <section className="mlb-season-section">
        <div className="section-header">
          <h2>Recent Seasons (Last 10 Years)</h2>
          <span className="section-meta">2017 – 2026 Campaigns</span>
        </div>

        <div className="season-cards-grid">
          {lastTenYears.map((yr) => (
            <Link
              key={yr}
              to={`/sports/baseball/competitions/mlb/seasons/${yr}?segment=regular`}
              className="season-card active"
            >
              <div className="season-card-top">
                <span className="season-year">{yr}</span>
                <span className="status-pill regular">
                  {yr === 2026 ? 'In-Flight / Final' : 'Regular Season'}
                </span>
              </div>
              <h3 className="season-card-title">{yr} Campaign</h3>
              <p className="season-card-desc">
                Division standings, team win-loss results, and full player stint statistics for {yr}.
              </p>
              <div className="season-card-footer">
                <span className="footer-summary">30 Teams • 6 Divisions</span>
                <span className="arrow-btn">View Standings →</span>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* Historical Season Jump Back Input (1995–2016) */}
      <section className="mlb-archive-section">
        <div className="archive-card">
          <div className="archive-info">
            <h3>Historical Archive (1995 – 2016)</h3>
            <p>
              Access any specific season back to the post-strike era in 1995.
            </p>
          </div>
          <form onSubmit={handleCustomYearSubmit} className="archive-form">
            <input
              type="number"
              min="1995"
              max="2016"
              placeholder="Enter year (1995-2016)"
              value={customYear}
              onChange={(e) => setCustomYear(e.target.value)}
              className="archive-input"
            />
            <button type="submit" className="archive-btn">
              Go to Season →
            </button>
          </form>
        </div>
      </section>
    </div>
  );
}