import React, { useState, useEffect } from 'react';
import { NavLink, useLocation, useNavigate } from 'react-router-dom';
import { NAV_ITEMS } from './navData';
import './LeftNav.css';

// Lightweight SVGs for self-contained execution without external asset dependencies
const SportIcon = ({ type }) => {
  switch (type) {
    case 'home':
      return (
        <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
          <polyline points="9 22 9 12 15 12 15 22" />
        </svg>
      );
    case 'baseball':
      return (
        <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2">
          <circle cx="12" cy="12" r="10" />
          <path d="M6 3.5a10 10 0 0 0 0 17" />
          <path d="M18 3.5a10 10 0 0 1 0 17" />
        </svg>
      );
    case 'football':
      return (
        <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2">
          <ellipse cx="12" cy="12" rx="10" ry="6" transform="rotate(-45 12 12)" />
          <line x1="8.5" y1="8.5" x2="15.5" y2="15.5" />
          <line x1="10" y1="14" x2="14" y2="10" />
        </svg>
      );
    case 'soccer':
      return (
        <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2">
          <circle cx="12" cy="12" r="10" />
          <polygon points="12 7 15 9.5 14 13.5 10 13.5 9 9.5" />
        </svg>
      );
    case 'basketball':
      return (
        <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2">
          <circle cx="12" cy="12" r="10" />
          <line x1="2" y1="12" x2="22" y2="12" />
          <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10" />
          <path d="M12 2a15.3 15.3 0 0 0-4 10 15.3 15.3 0 0 0 4 10" />
        </svg>
      );
    case 'hockey':
      return (
        <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2">
          <ellipse cx="12" cy="14" rx="8" ry="4" />
          <line x1="4" y1="14" x2="4" y2="10" />
          <line x1="20" y1="14" x2="20" y2="10" />
        </svg>
      );
    case 'racing':
      return (
        <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M4 15s1-1 4-1 5 2 8 2 4-1 4-1V3s-1 1-4 1-5-2-8-2-4 1-4 1z" />
          <line x1="4" y1="22" x2="4" y2="15" />
        </svg>
      );
    default:
      return (
        <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2">
          <circle cx="12" cy="12" r="9" />
        </svg>
      );
  }
};

export default function LeftNav({ isCollapsed, onToggleCollapse }) {
  const location = useLocation();
  const navigate = useNavigate();
  const [openAccordions, setOpenAccordions] = useState({});

  // Auto-expand the matching accordion section when browsing sport or competition sub-paths
  useEffect(() => {
    const currentSport = NAV_ITEMS.find((item) =>
      location.pathname.startsWith(`/sports/${item.slug}`) ||
      item.competitions.some((c) => location.pathname.startsWith(c.path))
    );
    if (currentSport) {
      setOpenAccordions((prev) => ({ ...prev, [currentSport.id]: true }));
    }
  }, [location.pathname]);

  const toggleAccordion = (sportId) => {
    if (isCollapsed) {
      onToggleCollapse(false);
      setOpenAccordions({ [sportId]: true });
    } else {
      setOpenAccordions((prev) => ({
        ...prev,
        [sportId]: !prev[sportId]
      }));
    }
  };

  return (
    <aside className={`left-rail ${isCollapsed ? 'collapsed' : 'expanded'}`}>
      <div className="rail-header">
        {!isCollapsed && <span className="rail-title">Taxonomy</span>}
        <button
          className="collapse-btn"
          onClick={() => onToggleCollapse(!isCollapsed)}
          aria-label={isCollapsed ? 'Expand Navigation' : 'Collapse Navigation'}
          title={isCollapsed ? 'Expand Rail' : 'Collapse Rail'}
        >
          {isCollapsed ? '»' : '«'}
        </button>
      </div>

      <nav className="rail-nav">
        {/* Anchored Top Item: Home */}
        <NavLink
          to="/"
          className={({ isActive }) => `rail-link ${isActive ? 'active' : ''}`}
          title="Home"
        >
          <span className="icon-wrapper">
            <SportIcon type="home" />
          </span>
          {!isCollapsed && <span className="label">Home</span>}
        </NavLink>

        <div className="rail-divider" />

        {/* Alphabetical Sport Taxonomy */}
        {NAV_ITEMS.map((sport) => {
          const isAccordionOpen = !!openAccordions[sport.id];
          const isSportActive = location.pathname.startsWith(`/sports/${sport.slug}`);

          return (
            <div key={sport.id} className="accordion-group">
              <button
                type="button"
                className={`accordion-trigger ${isSportActive ? 'active-parent' : ''}`}
                onClick={() => toggleAccordion(sport.id)}
                title={sport.name}
              >
                <span className="icon-wrapper">
                  <SportIcon type={sport.icon} />
                </span>
                {!isCollapsed && (
                  <>
                    <span className="label">{sport.name}</span>
                    <span className={`chevron ${isAccordionOpen ? 'open' : ''}`}>▾</span>
                  </>
                )}
              </button>

              {/* Competitions Child Leaf Nodes */}
              {!isCollapsed && isAccordionOpen && (
                <div className="accordion-content">
                  <button
                    className="leaf-overview-btn"
                    onClick={() => navigate(`/sports/${sport.slug}`)}
                  >
                    All {sport.name}
                  </button>
                  {sport.competitions.map((comp) => (
                    <NavLink
                      key={comp.name}
                      to={comp.path}
                      className={({ isActive }) => `leaf-link ${isActive ? 'active' : ''}`}
                    >
                      {comp.name}
                    </NavLink>
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </nav>
    </aside>
  );
}