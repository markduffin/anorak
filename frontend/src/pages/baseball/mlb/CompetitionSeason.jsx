import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import './CompetitionSeason.css';

export default function CompetitionSeason() {
  const { year } = useParams();
  const selectedYear = parseInt(year, 10);
  const [standingsData, setStandingsData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let isMounted = true;
    setLoading(true);
    setError(null);

    fetch(`http://localhost:8000/api/mlb/seasons/${selectedYear}/standings`)
      .then((res) => {
        if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
        return res.json();
      })
      .then((data) => {
        if (isMounted) {
          setStandingsData(data);
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
  }, [selectedYear]);

  if (loading) {
    return (
      <div className="comp-season-container loading-state">
        <div className="spinner" />
        <p>Loading {selectedYear} MLB Regular Season standings...</p>
      </div>
    );
  }

  if (error || !standingsData) {
    return (
      <div className="comp-season-container error-state">
        <h2>Unable to Load Standings</h2>
        <p>{error || 'An unexpected error occurred.'}</p>
        <Link to="/sports/baseball/competitions/mlb" className="back-link">
          ← Return to MLB Hub
        </Link>
      </div>
    );
  }

  return (
    <div className="comp-season-container">
      <nav className="season-breadcrumbs">
        <Link to="/sports/baseball/competitions/mlb">MLB Hub</Link>
        <span className="crumb-sep">/</span>
        <span className="crumb-active">{selectedYear} Regular Season</span>
      </nav>

      <header className="season-header">
        <div className="header-meta">
          <span className="badge-season">{selectedYear}</span>
          <span className="badge-segment">Regular Season</span>
        </div>
        <h1 className="season-title">{selectedYear} MLB Division Standings</h1>
      </header>

      <div className="divisions-grid">
        {standingsData.divisions.map((div) => (
          <section key={div.id || div.name} className="division-card">
            <h2 className="division-title">{div.name}</h2>
            <div className="table-responsive">
              <table className="standings-table">
                <thead>
                  <tr>
                    <th className="th-pos">#</th>
                    <th className="th-team">Team</th>
                    <th>W</th>
                    <th>L</th>
                    <th>PCT</th>
                    <th>GB</th>
                    <th>DIFF</th>
                  </tr>
                </thead>
                <tbody>
                  {div.teams.map((team) => (
                    <tr key={team.id}>
                      <td className="td-pos">{team.divisionRank}</td>
                      <td className="td-team">
                        <Link
                          to={`/sports/baseball/competitions/mlb/seasons/${selectedYear}/teams/${team.id}?segment=regular`}
                          className="team-link"
                        >
                          {team.name}
                        </Link>
                      </td>
                      <td>{team.wins}</td>
                      <td>{team.losses}</td>
                      <td>{team.pct}</td>
                      <td>{team.gamesBack}</td>
                      <td className={team.runDiff > 0 ? 'diff-pos' : team.runDiff < 0 ? 'diff-neg' : ''}>
                        {team.runDiff > 0 ? `+${team.runDiff}` : team.runDiff}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>
        ))}
      </div>
    </div>
  );
}