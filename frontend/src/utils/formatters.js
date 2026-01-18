import { format, formatDistanceToNow } from 'date-fns'

// Space-themed multiplier colors
export function getMultiplierClass(multiplier) {
  if (multiplier === 1) return 'text-red-500'        // Launch failure
  if (multiplier < 1.5) return 'text-red-400'        // Low orbit crash
  if (multiplier < 2) return 'text-orange-400'       // Earth orbit
  if (multiplier < 3) return 'text-yellow-400'       // Moon approach
  if (multiplier < 5) return 'text-lime-400'         // Moon landing
  if (multiplier < 10) return 'text-green-400'       // Mars approach
  if (multiplier < 20) return 'text-cyan-400'        // Mars landing
  if (multiplier < 50) return 'text-teal-400'        // Jupiter approach
  if (multiplier < 100) return 'text-blue-400'       // Jupiter
  if (multiplier < 1000) return 'text-violet-400'    // Deep space
  return 'text-fuchsia-400 glow-text'                // Galaxy!
}

export function getMultiplierColor(multiplier) {
  if (multiplier === 1) return 'bg-red-900/50'
  if (multiplier < 1.5) return 'bg-red-800/40'
  if (multiplier < 2) return 'bg-orange-800/40'
  if (multiplier < 3) return 'bg-yellow-800/40'
  if (multiplier < 5) return 'bg-lime-800/40'
  if (multiplier < 10) return 'bg-green-800/40'
  if (multiplier < 20) return 'bg-cyan-800/40'
  if (multiplier < 50) return 'bg-teal-800/40'
  if (multiplier < 100) return 'bg-blue-800/40'
  if (multiplier < 1000) return 'bg-violet-800/40'
  return 'bg-fuchsia-800/40'
}

export function getZoneClass(color) {
  const classes = {
    green: 'text-green-400',
    gray: 'text-slate-400',
    orange: 'text-orange-400',
    amber: 'text-amber-400',
    purple: 'text-purple-400',
  }
  return classes[color] || 'text-slate-400'
}

export function formatTime(date) {
  if (!date) return ''
  const d = date instanceof Date ? date : new Date(date)
  return formatDistanceToNow(d, { addSuffix: true })
}

export function formatDateTime(date) {
  if (!date) return ''
  const d = date instanceof Date ? date : new Date(date)
  return format(d, 'MMM d, HH:mm:ss')
}

export function formatNumber(num, decimals = 0) {
  if (num === null || num === undefined) return '-'
  return num.toLocaleString(undefined, {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals
  })
}

export function formatPercent(num, decimals = 1) {
  if (num === null || num === undefined) return '-'
  return `${num.toFixed(decimals)}%`
}

// Format coordinates for display
export function formatCoordinate(value) {
  if (value === null || value === undefined) return '0.0'
  return parseFloat(value).toFixed(1)
}

// Get space mission status based on multiplier
export function getMissionStatus(multiplier) {
  if (multiplier === 1) return { status: 'Launch Failure', emoji: '💥' }
  if (multiplier < 2) return { status: 'Earth Orbit', emoji: '🌍' }
  if (multiplier < 5) return { status: 'Moon Reached', emoji: '🌙' }
  if (multiplier < 20) return { status: 'Mars Reached', emoji: '🔴' }
  if (multiplier < 100) return { status: 'Jupiter Reached', emoji: '🟠' }
  return { status: 'Galaxy Explorer', emoji: '🌌' }
}

// Calculate distance traveled (for display purposes)
export function calculateDistance(multiplier) {
  // Approximate distance in light seconds based on multiplier
  const baseDistance = 1.28 // Moon distance from Earth in light seconds
  return (multiplier * baseDistance).toFixed(2)
}
