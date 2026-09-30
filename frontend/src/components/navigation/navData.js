export const NAV_ITEMS = [
  {
    id: 'american-football',
    name: 'American Football',
    slug: 'american-football',
    icon: 'football',
    competitions: [
      { name: 'NFL', path: '/competitions/nfl/maintenance' }
    ]
  },
  {
    id: 'association-football',
    name: 'Association Football',
    slug: 'association-football',
    icon: 'soccer',
    competitions: [
      { name: 'Premier League', path: '/competitions/premier-league/maintenance' },
      { name: 'UEFA Champions League', path: '/competitions/ucl/maintenance' },
      { name: 'FIFA World Cup', path: '/competitions/world-cup/maintenance' }
    ]
  },
  {
    id: 'baseball',
    name: 'Baseball',
    slug: 'baseball',
    icon: 'baseball',
    competitions: [
      { name: 'MLB', path: '/sports/baseball/competitions/mlb' },
      { name: 'MiLB', path: '/competitions/milb/maintenance' }
    ]
  },
  {
    id: 'basketball',
    name: 'Basketball',
    slug: 'basketball',
    icon: 'basketball',
    competitions: [
      { name: 'NBA', path: '/competitions/nba/maintenance' }
    ]
  },
  {
    id: 'ice-hockey',
    name: 'Ice Hockey',
    slug: 'ice-hockey',
    icon: 'hockey',
    competitions: [
      { name: 'NHL', path: '/competitions/nhl/maintenance' }
    ]
  },
  {
    id: 'motorsport',
    name: 'Motorsport',
    slug: 'motorsport',
    icon: 'racing',
    competitions: [
      { name: 'Formula 1', path: '/competitions/formula-1/maintenance' }
    ]
  }
];