import React, { useState } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import LeftNav from './components/navigation/LeftNav';
import MlbHome from './pages/baseball/mlb/MlbHome';
import CompetitionSeason from './pages/baseball/mlb/CompetitionSeason';
import TeamSeason from './pages/baseball/mlb/TeamSeason';

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
        <LeftNav
          isCollapsed={isRailCollapsed}
          onToggleCollapse={setIsRailCollapsed}
        />

        <main style={{ flex: 1, minWidth: 0, overflowY: 'auto' }}>
          <Routes>
            <Route path="/" element={<PlaceholderPage title="The Anorak Hub" note="Select Baseball -> MLB to begin." />} />
            
            {/* MLB Hub */}
            <Route path="/sports/baseball/competitions/mlb" element={<MlbHome />} />
            
            {/* Competition Season View */}
            <Route path="/sports/baseball/competitions/mlb/seasons/:year" element={<CompetitionSeason />} />
            
            {/* Team Season View */}
            <Route 
              path="/sports/baseball/competitions/mlb/seasons/:year/teams/:teamId" 
              element={<TeamSeason />} 
            />

            {/* Player Digital Baseball Card (Future leaf node) */}
            <Route 
              path="/sports/baseball/players/:playerId" 
              element={<PlaceholderPage title="Baseball Card Profile" note="Player career logs and bio vitals." />} 
            />

            <Route path="/sports/:sportSlug" element={<PlaceholderPage title="Sport Hub" note="Directory of competitions." />} />
            <Route path="/competitions/:slug/maintenance" element={<PlaceholderPage title="Under Construction" note="Content to be created, come back again later." />} />
          </Routes>
        </main>
      </div>
    </BrowserRouter>
  );
}