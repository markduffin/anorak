import React, { useState, useEffect, useMemo } from 'react';
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

  // Sorting state
  // Pitching default: Innings Pitched ('ip')
  const [pitcherSort, setPitcherSort] = useState({ key: 'ip', direction: 'desc' });
  
  // Hitting default: Games ('g'), secondary AB ('ab')
  const [hittingSort, setHittingSort] = useState({ key: 'g', direction: 'desc' });
  
  // Fielding default: Games ('games')
  const [fieldingSort, setFieldingSort] = useState({ key: 'games', direction: 'desc' });

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

  // Generic sorting helper function
  const sortData = (items, sortConfig, getVal) => {
    return [...items].sort((a, b) => {
      let aVal = getVal(a, sortConfig.key);
      let bVal = getVal(b, sortConfig.key);

      // Handle numeric fields or numeric strings safely
      const numA = parseFloat(String(aVal).replace(/[^0-9.-]+/g, ''));
      const numB = parseFloat(String(bVal).replace(/[^0-9.-]+/g, ''));

      if (!isNaN(numA) && !isNaN(numB)) {
        aVal = numA;
        bVal = numB;
      }

      if (aVal < bVal) return sortConfig.direction === 'asc' ? -1 : 1;
      if (aVal > bVal) return sortConfig.direction === 'asc' ? 1 : -1;
      
      // Secondary fallback for hitting default (Games -> At-Bats)
      if (sortConfig.key === 'g' && a.hitting && b.hitting) {
        if (a.hitting.ab < b.hitting.ab) return 1;
        if (a.hitting.ab > b.hitting.ab) return -1;
      }

      return 0;
    });
  };

  const handleSort = (category, key) => {
    if (category === 'pitchers') {
      setPitcherSort((prev) => ({
        key,
        direction: prev.key === key && prev.direction === 'desc' ? 'asc' : 'desc'
      }));
    } else if (category === 'hitting') {
      setHittingSort((prev) => ({
        key,
        direction: prev.key === key && prev.direction === 'desc' ? 'asc' : 'desc'
      }));
    } else if (category === 'fielding') {
      setFieldingSort((prev) => ({
        key,
        direction: prev.key === key && prev.direction === 'desc' ? 'asc' : 'desc'
      }));
    }
  };

  // Sorted Pitchers memo
  const sortedPitchers = useMemo(() => {
    if (!data || !data.pitchers) return [];
    return sortData(data.pitchers, pitcherSort, (item, key) => {
      if (key === 'name') return item.name;
      if (key === 'position') return item.position;
      return item[key];
    });
  }, [data, pitcherSort]);

  // Sorted Hitters memo
  const sortedHitters = useMemo(() => {
    if (!data || !data.positionPlayers) return [];
    return sortData(data.positionPlayers, hittingSort, (item, key) => {
      if (key === 'name') return item.name;
      if (key === 'position') return item.position;
      return item.hitting[key];
    });
  }, [data, hittingSort]);

  // Sorted Fielders memo
  const sortedFielders = useMemo(() => {
    if (!data || !data.positionPlayers) return [];
    return sortData(data.positionPlayers, fieldingSort, (item, key) => {
      if (key === 'name') return item.name;
      if (key === 'position') return item.position;
      return item.fielding[key];
    });
  }, [data, fieldingSort]);

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

  const { team, divisionTeams } = data;

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

              {/* Scrollable Roster Container */}
              <div className="roster-scroll-container">
                <div className="table-responsive">
                  <table className="stat-table">
                    <thead>
                      {positionPlayerMode === 'hitting' ? (
                        <tr>
                          <th className="th-player sortable" onClick={() => handleSort('hitting', 'name')}>Player</th>
                          <th className="th-pos sortable" onClick={() => handleSort('hitting', 'position')}>POS</th>
                          <th className="sortable" onClick={() => handleSort('hitting', 'g')}>G</th>
                          <th className="sortable" onClick={() => handleSort('hitting', 'ab')}>AB</th>
                          <th className="sortable" onClick={() => handleSort('hitting', 'r')}>R</th>
                          <th className="sortable" onClick={() => handleSort('hitting', 'h')}>H</th>
                          <th className="sortable" onClick={() => handleSort('hitting', 'doubles')}>2B</th>
                          <th className="sortable" onClick={() => handleSort('hitting', 'triples')}>3B</th>
                          <th className="sortable" onClick={() => handleSort('hitting', 'hr')}>HR</th>
                          <th className="sortable" onClick={() => handleSort('hitting', 'rbi')}>RBI</th>
                          <th className="sortable" onClick={() => handleSort('hitting', 'bb')}>BB</th>
                          <th className="sortable" onClick={() => handleSort('hitting', 'so')}>SO</th>
                          <th className="sortable" onClick={() => handleSort('hitting', 'sb')}>SB</th>
                          <th className="sortable" onClick={() => handleSort('hitting', 'avg')}>AVG</th>
                          <th className="sortable" onClick={() => handleSort('hitting', 'obp')}>OBP</th>
                          <th className="sortable" onClick={() => handleSort('hitting', 'slg')}>SLG</th>
                          <th className="sortable" onClick={() => handleSort('hitting', 'ops')}>OPS</th>
                        </tr>
                      ) : (
                        <tr>
                          <th className="th-player sortable" onClick={() => handleSort('fielding', 'name')}>Player</th>
                          <th className="th-pos sortable" onClick={() => handleSort('fielding', 'position')}>POS</th>
                          <th className="sortable" onClick={() => handleSort('fielding', 'games')}>G</th>
                          <th className="sortable" onClick={() => handleSort('fielding', 'putOuts')}>PO</th>
                          <th className="sortable" onClick={() => handleSort('fielding', 'assists')}>A</th>
                          <th className="sortable" onClick={() => handleSort('fielding', 'errors')}>E</th>
                          <th className="sortable" onClick={() => handleSort('fielding', 'fielding')}>FLD%</th>
                        </tr>
                      )}
                    </thead>
                    <tbody>
                      {positionPlayerMode === 'hitting' ? (
                        sortedHitters.map((player) => (
                          <tr key={`pos-${player.id}`}>
                            <td className="td-player">
                              <Link to={`/sports/baseball/players/${player.id}`} className="player-link">
                                {player.name}
                              </Link>
                            </td>
                            <td className="td-pos">{player.position}</td>
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
                          </tr>
                        ))
                      ) : (
                        sortedFielders.map((player) => (
                          <tr key={`pos-fld-${player.id}`}>
                            <td className="td-player">
                              <Link to={`/sports/baseball/players/${player.id}`} className="player-link">
                                {player.name}
                              </Link>
                            </td>
                            <td className="td-pos">{player.position}</td>
                            <td>{player.fielding.games}</td>
                            <td>{player.fielding.putOuts}</td>
                            <td>{player.fielding.assists}</td>
                            <td>{player.fielding.errors}</td>
                            <td><strong>{player.fielding.fielding}</strong></td>
                          </tr>
                        ))
                      )}
                      {((positionPlayerMode === 'hitting' && sortedHitters.length === 0) ||
                        (positionPlayerMode === 'fielding' && sortedFielders.length === 0)) && (
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

              {/* Scrollable Roster Container */}
              <div className="roster-scroll-container">
                <div className="table-responsive">
                  <table className="stat-table">
                    <thead>
                      <tr>
                        <th className="th-player sortable" onClick={() => handleSort('pitchers', 'name')}>Player</th>
                        <th className="th-pos sortable" onClick={() => handleSort('pitchers', 'position')}>POS</th>
                        <th className="sortable" onClick={() => handleSort('pitchers', 'w')}>W</th>
                        <th className="sortable" onClick={() => handleSort('pitchers', 'l')}>L</th>
                        <th className="sortable" onClick={() => handleSort('pitchers', 'era')}>ERA</th>
                        <th className="sortable" onClick={() => handleSort('pitchers', 'g')}>G</th>
                        <th className="sortable" onClick={() => handleSort('pitchers', 'gs')}>GS</th>
                        <th className="sortable" onClick={() => handleSort('pitchers', 'sv')}>SV</th>
                        <th className="sortable" onClick={() => handleSort('pitchers', 'ip')}>IP</th>
                        <th className="sortable" onClick={() => handleSort('pitchers', 'h')}>H</th>
                        <th className="sortable" onClick={() => handleSort('pitchers', 'r')}>R</th>
                        <th className="sortable" onClick={() => handleSort('pitchers', 'er')}>ER</th>
                        <th className="sortable" onClick={() => handleSort('pitchers', 'bb')}>BB</th>
                        <th className="sortable" onClick={() => handleSort('pitchers', 'so')}>SO</th>
                        <th className="sortable" onClick={() => handleSort('pitchers', 'whip')}>WHIP</th>
                      </tr>
                    </thead>
                    <tbody>
                      {sortedPitchers.map((pitcher) => (
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
                      {sortedPitchers.length === 0 && (
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