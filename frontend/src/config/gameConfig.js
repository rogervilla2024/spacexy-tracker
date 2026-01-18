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

export default GAME_CONFIG
