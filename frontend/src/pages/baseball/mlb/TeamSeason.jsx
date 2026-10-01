import React, { useState, useEffect } from 'react';
import { useParams, useLocation, useNavigate, Link } from 'react-router-dom';
import './TeamSeason.css';

export default function TeamSeason() {
  const { year, teamId } = useParams();
  const location = useLocation();
  const navigate = useNavigate();

  const queryParams = new URLSearchParams(location.search);
  const segment = queryParams.get('segment') || 'regular';

  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Position player roster toggle ('hitting' vs 'fielding')
  const [positionPlayerMode, setPositionPlayerMode] = useState('hitting');

  useEffect(() => {
    let isMounted = true;
    setLoading(true);
    setError(null);

    fetch(`http://localhost:8000/api/mlb/seasons/${year}/teams/${teamId}?segment=${segment}`)
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
  }, [year, teamId, segment]);

  const handleSegmentToggle = (newSegment) => {
    navigate(`/sports/baseball/competitions/mlb/seasons/${year}/teams/${teamId}?segment=${newSegment}`);
  };

  if (loading) {
    return (
      <div className="team-season-container loading-state">
        <div className="spinner" />
        <p>Loading {year} team statistics and roster...</p>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="team-season-container error-state">
        <h2>Unable to Load Team Season</h2>
        <p>{error || 'An unexpected error occurred.'}</p>
        <Link to={`/sports/baseball/competitions/mlb/seasons/${year}`} className="back-btn">
          ← Return to {year} Standings
        </Link>
      </div>
    );
  }

  const { team, divisionTeams, pitchers, positionPlayers } = data;

  return (
    <div className="team-season-container">
      {/* Breadcrumb Navigation */}
      <nav className="team-breadcrumbs">
        <Link to="/sports/baseball/competitions/mlb">MLB Hub</Link>
        <span className="sep">/</span>
        <Link to={`/sports/baseball/competitions/mlb/seasons/${year}?segment=${segment}`}>
          {year} {segment === 'regular' ? 'Regular Season' : 'Post Season'}
        </Link>
        <span className="sep">/</span>
        <span className="current">{team.name}</span>
      </nav>

      {/* Header Banner */}
      <header className="team-header-banner">
        <div className="team-brand-row">
          <img
            src={team.logoUrl}
            alt={`${team.name} Logo`}
            className="team-logo"
            onError={(e) => { e.target.style.display = 'none'; }}
          />
          <div className="team-meta">
            <span className="team-division-tag">{team.division}</span>
            <h1 className="team-name-title">{team.name}</h1>
            <div className="team-record-strip">
              <span className="record-stat">
                <strong>{team.record.wins}-{team.record.losses}</strong> ({team.record.pct})
              </span>
              <span className="record-dot">•</span>
              <span className="record-gb">{team.record.gamesBack === '-' ? '1st Place' : `${team.record.gamesBack} GB`}</span>
            </div>
          </div>
        </div>

        {/* Season Segment Switcher */}
        <div className="segment-toggle-group">
          <button
            className={`toggle-btn ${segment === 'regular' ? 'active' : ''}`}
            onClick={() => handleSegmentToggle('regular')}
          >
            Regular Season
          </button>
          <button
            className={`toggle-btn ${segment === 'postseason' ? 'active' : ''}`}
            onClick={() => handleSegmentToggle('postseason')}
          >
            Post Season
          </button>
        </div>
      </header>

      {/* Conditional Post Season Notice */}
      {segment === 'postseason' ? (
        <div className="postseason-placeholder-card">
          <h3>Post Season Statistics</h3>
          <p>Post Season team split statistics and series outcomes are currently under construction.</p>
          <button className="primary-back-btn" onClick={() => handleSegmentToggle('regular')}>
            Switch to Regular Season Stats
          </button>
        </div>
      ) : (
        <div className="team-season-layout">
          {/* Main Roster Stats Area */}
          <div className="rosters-main">
            {/* Position Players Section */}
            <section className="stat-card">
              <div className="card-header">
                <div>
                  <h2 className="card-title">Position Players</h2>
                  <span className="card-subtitle">
                    Players with at least one appearance or at-bat with this team in {year}.
                  </span>
                </div>
                {/* Discipline Toggle */}
                <div className="discipline-toggle">
                  <button
                    className={`disc-btn ${positionPlayerMode === 'hitting' ? 'active' : ''}`}
                    onClick={() => setPositionPlayerMode('hitting')}
                  >
                    Hitting
                  </button>
                  <button
                    className={`disc-btn ${positionPlayerMode === 'fielding' ? 'active' : ''}`}
                    onClick={() => setPositionPlayerMode('fielding')}
                  >
                    Fielding
                  </button>
                </div>
              </div>

              {/* Scrollable Roster Container (Max ~12 rows) */}
              <div className="roster-scroll-container">
                <div className="table-responsive">
                  <table className="stat-table">
                    <thead>
                      {positionPlayerMode === 'hitting' ? (
                        <tr>
                          <th className="th-player">Player</th>
                          <th className="th-pos">POS</th>
                          <th>G</th>
                          <th>AB</th>
                          <th>R</th>
                          <th>H</th>
                          <th>2B</th>
                          <th>3B</th>
                          <th>HR</th>
                          <th>RBI</th>
                          <th>BB</th>
                          <th>SO</th>
                          <th>SB</th>
                          <th>AVG</th>
                          <th>OBP</th>
                          <th>SLG</th>
                          <th>OPS</th>
                        </tr>
                      ) : (
                        <tr>
                          <th className="th-player">Player</th>
                          <th className="th-pos">POS</th>
                          <th>G</th>
                          <th>PO</th>
                          <th>A</th>
                          <th>E</th>
                          <th>FLD%</th>
                        </tr>
                      )}
                    </thead>
                    <tbody>
                      {positionPlayers.map((player) => (
                        <tr key={`pos-${player.id}`}>
                          <td className="td-player">
                            <Link to={`/sports/baseball/players/${player.id}`} className="player-link">
                              {player.name}
                            </Link>
                          </td>
                          <td className="td-pos">{player.position}</td>
                          {positionPlayerMode === 'hitting' ? (
                            <>
                              <td>{player.hitting.g}</td>
                              <td>{player.hitting.ab}</td>
                              <td>{player.hitting.r}</td>
                              <td>{player.hitting.h}</td>
                              <td>{player.hitting.doubles}</td>
                              <td>{player.hitting.triples}</td>
                              <td>{player.hitting.hr}</td>
                              <td>{player.hitting.rbi}</td>
                              <td>{player.hitting.bb}</td>
                              <td>{player.hitting.so}</td>
                              <td>{player.hitting.sb}</td>
                              <td>{player.hitting.avg}</td>
                              <td>{player.hitting.obp}</td>
                              <td>{player.hitting.slg}</td>
                              <td><strong>{player.hitting.ops}</strong></td>
                            </>
                          ) : (
                            <>
                              <td>{player.fielding.games}</td>
                              <td>{player.fielding.putOuts}</td>
                              <td>{player.fielding.assists}</td>
                              <td>{player.fielding.errors}</td>
                              <td><strong>{player.fielding.fielding}</strong></td>
                            </>
                          )}
                        </tr>
                      ))}
                      {positionPlayers.length === 0 && (
                        <tr>
                          <td colSpan="17" className="td-empty">No position player stint records found.</td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </section>

            {/* Pitchers Section */}
            <section className="stat-card">
              <div className="card-header">
                <div>
                  <h2 className="card-title">Pitchers</h2>
                  <span className="card-subtitle">
                    Players who logged pitching innings for this team in {year}.
                  </span>
                </div>
              </div>

              {/* Scrollable Roster Container (Max ~12 rows) */}
              <div className="roster-scroll-container">
                <div className="table-responsive">
                  <table className="stat-table">
                    <thead>
                      <tr>
                        <th className="th-player">Player</th>
                        <th className="th-pos">POS</th>
                        <th>W</th>
                        <th>L</th>
                        <th>ERA</th>
                        <th>G</th>
                        <th>GS</th>
                        <th>SV</th>
                        <th>IP</th>
                        <th>H</th>
                        <th>R</th>
                        <th>ER</th>
                        <th>BB</th>
                        <th>SO</th>
                        <th>WHIP</th>
                      </tr>
                    </thead>
                    <tbody>
                      {pitchers.map((pitcher) => (
                        <tr key={`pit-${pitcher.id}`}>
                          <td className="td-player">
                            <Link to={`/sports/baseball/players/${pitcher.id}`} className="player-link">
                              {pitcher.name}
                            </Link>
                          </td>
                          <td className="td-pos">{pitcher.position}</td>
                          <td>{pitcher.w}</td>
                          <td>{pitcher.l}</td>
                          <td><strong>{pitcher.era}</strong></td>
                          <td>{pitcher.g}</td>
                          <td>{pitcher.gs}</td>
                          <td>{pitcher.sv}</td>
                          <td>{pitcher.ip}</td>
                          <td>{pitcher.h}</td>
                          <td>{pitcher.r}</td>
                          <td>{pitcher.er}</td>
                          <td>{pitcher.bb}</td>
                          <td>{pitcher.so}</td>
                          <td>{pitcher.whip}</td>
                        </tr>
                      ))}
                      {pitchers.length === 0 && (
                        <tr>
                          <td colSpan="15" className="td-empty">No pitching stint records found.</td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </section>
          </div>

          {/* Division Mini-Standings Sidebar */}
          <aside className="division-sidebar">
            <div className="sidebar-card">
              <h3 className="sidebar-title">{team.division}</h3>
              <div className="sidebar-table-wrap">
                <table className="sidebar-standings-table">
                  <thead>
                    <tr>
                      <th>#</th>
                      <th className="th-left">Team</th>
                      <th>W</th>
                      <th>L</th>
                      <th>GB</th>
                    </tr>
                  </thead>
                  <tbody>
                    {divisionTeams.map((divTeam) => {
                      const isActive = String(divTeam.id) === String(teamId);
                      return (
                        <tr key={divTeam.id} className={isActive ? 'row-active' : ''}>
                          <td className="td-rank">{divTeam.divisionRank}</td>
                          <td className="th-left">
                            <Link
                              to={`/sports/baseball/competitions/mlb/seasons/${year}/teams/${divTeam.id}?segment=${segment}`}
                              className="sidebar-team-link"
                            >
                              {divTeam.name}
                            </Link>
                          </td>
                          <td>{divTeam.wins}</td>
                          <td>{divTeam.losses}</td>
                          <td>{divTeam.gamesBack}</td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          </aside>
        </div>
      )}
    </div>
  );
}