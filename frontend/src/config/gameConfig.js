/**
 * Space XY Tracker - Game Configuration
 * Provider: BGaming
 */

export const GAME_CONFIG = {
  id: 'spacexy',
  name: 'Space XY',
  slug: 'space-xy',
  provider: 'BGaming',
  providerWebsite: 'https://bgaming.com',

  rtp: 97.0,
  houseEdge: 3.0,
  maxMultiplier: 10000,
  minBet: 0.10,
  maxBet: 100,

  domain: 'spacexytracker.com',
  trademark: 'Space XY™ is a trademark of BGaming.',
  description: 'Space rocket crash game with X and Y axis mechanics.',

  theme: {
    primary: '#6366f1',
    secondary: '#818cf8',
    accent: '#22d3ee',
    gradient: 'from-indigo-600 to-purple-500',
    darkBg: '#0f0f23',
    cardBg: '#1a1a3e',
  },

  demoUrl: 'https://bgaming.com/games/space-xy',
  apiUrl: import.meta.env.VITE_API_URL || 'http://localhost:8000',
  apiBaseUrl: import.meta.env.VITE_API_URL || 'http://localhost:8000',
  gameId: 'spacexy',

  features: ['dualAxis', 'provablyFair', 'autoCashout'],

  emails: {
    contact: 'contact@spacexytracker.com',
    legal: 'legal@spacexytracker.com',
  },

  seo: {
    title: 'Space XY Tracker - Dual Axis Crash Statistics',
    description: 'Real-time Space XY game statistics. Unique X-Y coordinate crash game by BGaming.',
    keywords: ['space xy', 'space xy game', 'bgaming space xy', 'dual axis crash'],
  },
}

export const CHART_COLORS = [
  '#6366f1', '#818cf8', '#a5b4fc', '#c7d2fe',
  '#22d3ee', '#67e8f9', '#a5f3fc', '#cffafe'
]

// Zone definitions based on multiplier
export const ZONES = [
  { min: 0, max: 1.5, name: 'Earth', icon: '🌍', color: 'blue' },
  { min: 1.5, max: 3, name: 'Moon', icon: '🌙', color: 'gray' },
  { min: 3, max: 10, name: 'Mars', icon: '🔴', color: 'red' },
  { min: 10, max: 50, name: 'Jupiter', icon: '🟠', color: 'orange' },
  { min: 50, max: Infinity, name: 'Galaxy', icon: '🌌', color: 'purple' },
]

export function getZone(multiplier) {
  const zone = ZONES.find(z => multiplier >= z.min && multiplier < z.max)
  return zone || ZONES[0]
}

export function getCoordinates(multiplier) {
  const x = Math.floor(multiplier * 10) % 100
  const y = Math.floor(multiplier * 7) % 100
  return { x: x.toString().padStart(2, '0'), y: y.toString().padStart(2, '0') }
}

export default GAME_CONFIG
