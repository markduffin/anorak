import React, { useState } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import LeftNav from './components/navigation/LeftNav';
import MlbHome from './pages/baseball/mlb/MlbHome';

function PlaceholderPage({ title, note }) {
  return (
    <div style={{ padding: '2.5rem', color: '#f8fafc' }}>
      <h2>{title}</h2>
      <p style={{ color: '#94a3b8' }}>{note}</p>
    </div>
  );
}

export default function App() {
  const [isRailCollapsed, setIsRailCollapsed] = useState(false);

  return (
    <BrowserRouter>
      <div style={{ display: 'flex', minHeight: '100vh', backgroundColor: '#0b1120', color: '#f8fafc' }}>
        {/* Left Sticky Rail */}
        <LeftNav
          isCollapsed={isRailCollapsed}
          onToggleCollapse={setIsRailCollapsed}
        />

        {/* Content Area */}
        <main style={{ flex: 1, minWidth: 0, overflowY: 'auto' }}>
          <Routes>
            <Route path="/" element={<PlaceholderPage title="The Anorak Hub" note="Select Baseball -> MLB in the left navigation to begin." />} />
            
            {/* Primary MLB Hub */}
            <Route path="/sports/baseball/competitions/mlb" element={<MlbHome />} />
            
            {/* Upcoming CompetitionSeason & TeamSeason Targets */}
            <Route 
              path="/sports/baseball/competitions/mlb/seasons/:year" 
              element={<PlaceholderPage title="Competition Season Page" note="Next step: 6 Division tables (regular) or postseason bracket." />} 
            />
            <Route 
              path="/sports/baseball/competitions/mlb/seasons/:year/teams/:teamId" 
              element={<PlaceholderPage title="Team Season Page" note="Roster splits (Pitchers vs. Position Players) and seasonal stats." />} 
            />

            {/* Fallback routes */}
            <Route path="/sports/:sportSlug" element={<PlaceholderPage title="Sport Hub" note="Directory of competitions." />} />
            <Route path="/competitions/:slug/maintenance" element={<PlaceholderPage title="Under Construction" note="Content to be created, come back again later." />} />
          </Routes>
        </main>
      </div>
    </BrowserRouter>
  );
}