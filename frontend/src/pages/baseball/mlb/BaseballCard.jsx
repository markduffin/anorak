import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import './BaseballCard.css';

export default function BaseballCard() {
  const { playerId } = useParams();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let isMounted = true;
    setLoading(true);
    setError(null);

    fetch(`http://localhost:8000/api/mlb/players/${playerId}`)
      .then((res) => {
        if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
        return res.json();
      })
      .then((json) => {
        if (isMounted) {
          setData(json);
          setLoading(false);
        }
      })
      .catch((err) => {
        if (isMounted) {
          setError(err.message);
          setLoading(false);
        }
      });

    return () => {
      isMounted = false;
    };
  }, [playerId]);

  if (loading) {
    return (
      <div className="card-container loading-state">
        <div className="spinner" />
        <p>Loading player digital baseball card...</p>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="card-container error-state">
        <h2>Player Profile Unavailable</h2>
        <p>{error || 'Could not load baseball card data.'}</p>
        <Link to="/sports/baseball/competitions/mlb" className="back-link">
          ← Back to MLB Hub
        </Link>
      </div>
    );
  }

  const { player, seasons } = data;

  return (
    <div className="card-container">
      {/* Breadcrumb Navigation */}
      <nav className="card-breadcrumbs">
        <Link to="/sports/baseball/competitions/mlb">MLB Hub</Link>
        <span className="crumb-sep">/</span>
        <span className="crumb-active">Player Card: {player.fullName}</span>
      </nav>

      {/* Digital Baseball Card Hero */}
      <div className="baseball-card-badge">
        <div className="card-header-row">
          <div className="player-vitals">
            <span className="player-pos-badge">{player.primaryPosition}</span>
            <h1 className="player-fullname">{player.fullName}</h1>
            <div className="vitals-meta">
              <span><strong>Born:</strong> {player.birthDate}</span>
              <span>•</span>
              <span><strong>Bats/Throws:</strong> {player.batSide} / {player.pitchHand}</span>
            </div>
          </div>
          <div className="card-logo-watermark">The Anorak</div>
        </div>
      </div>

      {/* Season History Section */}
      <section className="season-history-section">
        <h2>MLB Career Seasons (Most Recent to Earliest)</h2>
        <p className="section-desc">
          Complete year-by-year breakdown of all MLB seasons recorded for {player.fullName}.
        </p>

        <div className="table-responsive">
          <table className="card-season-table">
            <thead>
              <tr>
                <th className="th-year">Year</th>
                <th className="th-team">Team</th>
                <th>G</th>
                <th>AB</th>
                <th>H</th>
                <th>HR</th>
                <th>RBI</th>
                <th>AVG</th>
                <th>OPS</th>
                <th>W-L</th>
                <th>ERA</th>
                <th>IP</th>
                <th>SO</th>
              </tr>
            </thead>
            <tbody>
              {seasons.map((s) => (
                <tr key={s.year}>
                  <td className="td-year">
                    <Link to={`/sports/baseball/competitions/mlb/seasons/${s.year}?segment=regular`} className="year-link">
                      {s.year}
                    </Link>
                  </td>
                  <td className="td-team">{s.team}</td>
                  <td>{s.hitting?.g || s.pitching?.g || '-'}</td>
                  <td>{s.hitting?.ab ?? '-'}</td>
                  <td>{s.hitting?.h ?? '-'}</td>
                  <td>{s.hitting?.hr ?? '-'}</td>
                  <td>{s.hitting?.rbi ?? '-'}</td>
                  <td>{s.hitting?.avg ?? '-'}</td>
                  <td><strong>{s.hitting?.ops ?? '-'}</strong></td>
                  <td>{s.pitching ? `${s.pitching.w}-${s.pitching.l}` : '-'}</td>
                  <td><strong>{s.pitching?.era ?? '-'}</strong></td>
                  <td>{s.pitching?.ip ?? '-'}</td>
                  <td>{s.pitching?.so ?? '-'}</td>
                </tr>
              ))}
              {seasons.length === 0 && (
                <tr>
                  <td colSpan="13" className="td-empty">No season records found for this player.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}