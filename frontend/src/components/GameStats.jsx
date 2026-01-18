/**
 * Crash Game Specific Statistics Component
 *
 * Specialized visualizations for crash-type games:
 * - Quick crash alerts
 * - Moon tracker
 * - Cashout optimizer
 * - Crash analysis
 */

import React, { useState, useEffect, useMemo } from 'react'
import GAME_CONFIG from '../config/gameConfig'

// =============================================================================
// Utility Functions
// =============================================================================

const formatNumber = (num, decimals = 2) => {
  if (num === null || num === undefined) return '-'
  return Number(num).toFixed(decimals)
}

const formatPercent = (num) => {
  if (num === null || num === undefined) return '-'
  return `${Number(num).toFixed(2)}%`
}

const timeAgo = (date) => {
  if (!date) return 'Never'
  const seconds = Math.floor((Date.now() - new Date(date).getTime()) / 1000)
  if (seconds < 60) return `${seconds}s ago`
  if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`
  if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`
  return `${Math.floor(seconds / 86400)}d ago`
}

// =============================================================================
// Quick Crash Alert Component
// =============================================================================

export const QuickCrashAlert = ({ data, className = '' }) => {
  if (!data) return null

  const getAlertColor = (level) => {
    switch (level) {
      case 'critical': return 'from-red-600 to-red-800 border-red-500'
      case 'high': return 'from-orange-600 to-orange-800 border-orange-500'
      case 'medium': return 'from-yellow-600 to-yellow-800 border-yellow-500'
      default: return 'from-green-600 to-green-800 border-green-500'
    }
  }

  const getAlertIcon = (level) => {
    switch (level) {
      case 'critical': return '🚨'
      case 'high': return '⚠️'
      case 'medium': return '⚡'
      default: return '✅'
    }
  }

  return (
    <div className={`bg-slate-800 rounded-lg p-4 ${className}`}>
      <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
        <span>⚡</span>
        Quick Crash Monitor
      </h3>

      {/* Alert Banner */}
      <div className={`bg-gradient-to-r ${getAlertColor(data.alert_level)} p-4 rounded-lg border mb-4`}>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="text-2xl">{getAlertIcon(data.alert_level)}</span>
            <div>
              <p className="font-bold text-white uppercase">{data.alert_level} Alert</p>
              <p className="text-sm text-white/80">
                {data.consecutive_quick_crashes > 0
                  ? `${data.consecutive_quick_crashes} consecutive quick crashes`
                  : 'No consecutive quick crashes'}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-3 gap-4">
        <div className="text-center p-3 bg-slate-700/50 rounded">
          <p className="text-2xl font-bold text-red-400">{data.last_10_quick_crashes}/10</p>
          <p className="text-xs text-slate-400">Last 10 Rounds</p>
        </div>
        <div className="text-center p-3 bg-slate-700/50 rounded">
          <p className="text-2xl font-bold text-orange-400">{data.last_20_quick_crashes}/20</p>
          <p className="text-xs text-slate-400">Last 20 Rounds</p>
        </div>
        <div className="text-center p-3 bg-slate-700/50 rounded">
          <p className="text-2xl font-bold text-yellow-400">{data.last_50_quick_crashes}/50</p>
          <p className="text-xs text-slate-400">Last 50 Rounds</p>
        </div>
      </div>

      <p className="mt-4 text-xs text-slate-500">
        Quick crash = multiplier below 1.50x. This is for informational purposes only.
        Each round is independent.
      </p>
    </div>
  )
}

// =============================================================================
// Moon Tracker Component
// =============================================================================

export const MoonTracker = ({ data, className = '' }) => {
  if (!data) return null

  const isDrought = data.current_drought
  const droughtPercentage = data.average_drops_between
    ? Math.min((data.drops_since_jackpot / data.average_drops_between) * 100, 200)
    : 0

  return (
    <div className={`bg-slate-800 rounded-lg p-4 ${className}`}>
      <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
        <span>🌙</span>
        Moon Tracker (1000x+)
      </h3>

      {/* Main Stats */}
      <div className="grid grid-cols-2 gap-4 mb-4">
        <div className="text-center p-4 bg-gradient-to-br from-purple-900/50 to-slate-800 rounded-lg border border-purple-500/30">
          <p className="text-3xl font-bold text-purple-400">{data.total_moons}</p>
          <p className="text-sm text-slate-400">Total Moons</p>
        </div>
        <div className="text-center p-4 bg-gradient-to-br from-yellow-900/50 to-slate-800 rounded-lg border border-yellow-500/30">
          <p className="text-3xl font-bold text-yellow-400">{data.drops_since_jackpot}</p>
          <p className="text-sm text-slate-400">Rounds Since</p>
        </div>
      </div>

      {/* Last Moon Info */}
      {data.last_moon_value && (
        <div className="p-3 bg-slate-700/50 rounded mb-4">
          <div className="flex justify-between items-center">
            <span className="text-sm text-slate-400">Last Moon</span>
            <span className="font-mono font-bold text-purple-400">
              {formatNumber(data.last_moon_value)}x
            </span>
          </div>
          <div className="flex justify-between items-center mt-1">
            <span className="text-xs text-slate-500">When</span>
            <span className="text-xs text-slate-400">{timeAgo(data.last_moon_time)}</span>
          </div>
        </div>
      )}

      {/* Drought Indicator */}
      <div className="mb-4">
        <div className="flex justify-between text-sm mb-1">
          <span className="text-slate-400">Drought Level</span>
          <span className={isDrought ? 'text-red-400' : 'text-green-400'}>
            {isDrought ? 'Overdue' : 'Normal'}
          </span>
        </div>
        <div className="h-3 bg-slate-700 rounded overflow-hidden">
          <div
            className={`h-full transition-all ${isDrought ? 'bg-red-500' : 'bg-purple-500'}`}
            style={{ width: `${Math.min(droughtPercentage, 100)}%` }}
          />
        </div>
        {data.average_drops_between && (
          <p className="text-xs text-slate-500 mt-1">
            Average: ~{Math.round(data.average_drops_between)} rounds between moons
          </p>
        )}
      </div>

      <div className="text-center p-2 bg-slate-700/30 rounded">
        <p className="text-sm text-slate-400">
          Moon Probability: <span className="font-mono text-purple-400">{formatPercent(data.moon_probability)}</span>
        </p>
      </div>

      <p className="mt-4 text-xs text-slate-500">
        Moon = 1000x+ multiplier. Past droughts don't increase future moon probability.
        Each round is independent.
      </p>
    </div>
  )
}

// =============================================================================
// Cashout Optimizer Component
// =============================================================================

export const CashoutOptimizer = ({ data, className = '' }) => {
  if (!data || !data.length) return null

  const getEVColor = (ev) => {
    if (ev >= 1.0) return 'text-green-400'
    if (ev >= 0.9) return 'text-yellow-400'
    return 'text-red-400'
  }

  return (
    <div className={`bg-slate-800 rounded-lg p-4 ${className}`}>
      <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
        <span>🎯</span>
        Cashout Optimizer
      </h3>

      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-slate-700">
              <th className="text-left py-2 px-2">Target</th>
              <th className="text-right py-2 px-2">Win Rate</th>
              <th className="text-right py-2 px-2">EV</th>
              <th className="text-center py-2 px-2">Status</th>
            </tr>
          </thead>
          <tbody>
            {data.map((target) => (
              <tr
                key={target.target_multiplier}
                className={`border-b border-slate-700/50 ${target.recommended ? 'bg-green-500/10' : ''}`}
              >
                <td className="py-2 px-2 font-mono font-bold">
                  {target.target_multiplier}x
                </td>
                <td className="py-2 px-2 text-right font-mono">
                  {formatPercent(target.win_rate)}
                </td>
                <td className={`py-2 px-2 text-right font-mono ${getEVColor(target.expected_value)}`}>
                  {formatNumber(target.expected_value, 4)}
                </td>
                <td className="py-2 px-2 text-center">
                  {target.recommended ? (
                    <span className="px-2 py-0.5 bg-green-500/20 text-green-400 text-xs rounded">
                      Recommended
                    </span>
                  ) : (
                    <span className="text-slate-500 text-xs">-</span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="mt-4 p-3 bg-slate-700/30 rounded">
        <p className="text-xs text-slate-400">
          <strong>EV (Expected Value)</strong> = (Win Rate × Target) - (1 - Win Rate).
          EV &gt; 0.9 is generally favorable, but remember the house always has an edge.
        </p>
      </div>

      <p className="mt-3 text-xs text-slate-500">
        Based on historical data. Not financial advice. Gamble responsibly.
      </p>
    </div>
  )
}

// =============================================================================
// Crash Analysis Component
// =============================================================================

export const CrashAnalysis = ({ data, className = '' }) => {
  if (!data) return null

  const getRateColor = (rate, isGood) => {
    if (isGood) {
      if (rate >= 10) return 'text-green-400'
      if (rate >= 5) return 'text-blue-400'
      return 'text-slate-400'
    } else {
      if (rate >= 50) return 'text-red-400'
      if (rate >= 30) return 'text-orange-400'
      return 'text-slate-400'
    }
  }

  return (
    <div className={`bg-slate-800 rounded-lg p-4 ${className}`}>
      <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
        <span>📊</span>
        Crash Point Analysis
      </h3>

      {/* Core Stats */}
      <div className="grid grid-cols-3 gap-4 mb-4">
        <div className="text-center p-3 bg-slate-700/50 rounded">
          <p className="text-xl font-bold text-blue-400">{formatNumber(data.average_crash)}x</p>
          <p className="text-xs text-slate-400">Average</p>
        </div>
        <div className="text-center p-3 bg-slate-700/50 rounded">
          <p className="text-xl font-bold text-green-400">{formatNumber(data.median_crash)}x</p>
          <p className="text-xs text-slate-400">Median</p>
        </div>
        <div className="text-center p-3 bg-slate-700/50 rounded">
          <p className="text-xl font-bold text-purple-400">{formatNumber(data.highest_crash)}x</p>
          <p className="text-xs text-slate-400">Highest</p>
        </div>
      </div>

      {/* Crash Rates */}
      <div className="space-y-2 mb-4">
        <h4 className="text-sm font-medium text-slate-400">Quick Crash Rates</h4>
        <div className="grid grid-cols-3 gap-2">
          <div className="p-2 bg-red-500/10 rounded text-center">
            <p className={`font-mono font-bold ${getRateColor(data.instant_crash_rate, false)}`}>
              {formatPercent(data.instant_crash_rate)}
            </p>
            <p className="text-xs text-slate-500">&lt;1.10x</p>
          </div>
          <div className="p-2 bg-orange-500/10 rounded text-center">
            <p className={`font-mono font-bold ${getRateColor(data.quick_crash_rate, false)}`}>
              {formatPercent(data.quick_crash_rate)}
            </p>
            <p className="text-xs text-slate-500">&lt;1.50x</p>
          </div>
          <div className="p-2 bg-yellow-500/10 rounded text-center">
            <p className={`font-mono font-bold ${getRateColor(data.early_crash_rate, false)}`}>
              {formatPercent(data.early_crash_rate)}
            </p>
            <p className="text-xs text-slate-500">&lt;2.00x</p>
          </div>
        </div>
      </div>

      {/* Win Rates */}
      <div className="space-y-2">
        <h4 className="text-sm font-medium text-slate-400">Big Win Rates</h4>
        <div className="grid grid-cols-4 gap-2">
          <div className="p-2 bg-green-500/10 rounded text-center">
            <p className={`font-mono font-bold ${getRateColor(data.big_win_rate, true)}`}>
              {formatPercent(data.big_win_rate)}
            </p>
            <p className="text-xs text-slate-500">10x+</p>
          </div>
          <div className="p-2 bg-blue-500/10 rounded text-center">
            <p className={`font-mono font-bold ${getRateColor(data.huge_win_rate, true)}`}>
              {formatPercent(data.huge_win_rate)}
            </p>
            <p className="text-xs text-slate-500">50x+</p>
          </div>
          <div className="p-2 bg-purple-500/10 rounded text-center">
            <p className={`font-mono font-bold ${getRateColor(data.mega_win_rate, true)}`}>
              {formatPercent(data.mega_win_rate)}
            </p>
            <p className="text-xs text-slate-500">100x+</p>
          </div>
          <div className="p-2 bg-yellow-500/10 rounded text-center">
            <p className={`font-mono font-bold ${getRateColor(data.moon_rate, true)}`}>
              {formatPercent(data.moon_rate)}
            </p>
            <p className="text-xs text-slate-500">1000x+</p>
          </div>
        </div>
      </div>

      <p className="mt-4 text-xs text-slate-500">
        Based on {data.total_rounds?.toLocaleString()} rounds.
        Rates are historical and may vary.
      </p>
    </div>
  )
}

// =============================================================================
// Best/Worst Hours Component
// =============================================================================

export const HourlyAnalysis = ({ bestHours, worstHours, className = '' }) => {
  if (!bestHours?.length && !worstHours?.length) return null

  const formatHour = (hour) => {
    return `${hour.toString().padStart(2, '0')}:00`
  }

  return (
    <div className={`bg-slate-800 rounded-lg p-4 ${className}`}>
      <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
        <span>⏰</span>
        Hourly Patterns
      </h3>

      <div className="grid grid-cols-2 gap-4">
        {/* Best Hours */}
        <div>
          <h4 className="text-sm font-medium text-green-400 mb-2">Best Hours</h4>
          <div className="space-y-2">
            {bestHours?.map((h, i) => (
              <div key={h.hour} className="flex items-center justify-between p-2 bg-green-500/10 rounded">
                <div className="flex items-center gap-2">
                  <span className="text-green-400 font-bold">#{i + 1}</span>
                  <span className="font-mono">{formatHour(h.hour)}</span>
                </div>
                <span className="font-mono text-green-400">{formatNumber(h.average)}x</span>
              </div>
            ))}
          </div>
        </div>

        {/* Worst Hours */}
        <div>
          <h4 className="text-sm font-medium text-red-400 mb-2">Worst Hours</h4>
          <div className="space-y-2">
            {worstHours?.map((h, i) => (
              <div key={h.hour} className="flex items-center justify-between p-2 bg-red-500/10 rounded">
                <div className="flex items-center gap-2">
                  <span className="text-red-400 font-bold">#{i + 1}</span>
                  <span className="font-mono">{formatHour(h.hour)}</span>
                </div>
                <span className="font-mono text-red-400">{formatNumber(h.average)}x</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      <p className="mt-4 text-xs text-slate-500">
        Times shown in UTC. Hourly patterns can change and should not be used for betting decisions.
      </p>
    </div>
  )
}

// =============================================================================
// Main Crash Game Stats Page Component
// =============================================================================

export const CrashGameStatsPage = ({ className = '' }) => {
  const [stats, setStats] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [period, setPeriod] = useState('24h')

  useEffect(() => {
    const fetchStats = async () => {
      setLoading(true)
      setError(null)

      try {
        const apiUrl = GAME_CONFIG?.apiBaseUrl || GAME_CONFIG?.apiUrl || 'http://localhost:8000'
        const gameId = GAME_CONFIG?.gameId || GAME_CONFIG?.id || 'aviator'

        const response = await fetch(`${apiUrl}/api/v2/crash/${gameId}?period=${period}`)
        if (!response.ok) throw new Error(`HTTP ${response.status}`)

        const data = await response.json()
        setStats(data)
      } catch (e) {
        console.error('Failed to fetch crash stats:', e)
        setError(e.message)
      } finally {
        setLoading(false)
      }
    }

    fetchStats()
    const interval = setInterval(fetchStats, 60 * 1000) // Refresh every minute
    return () => clearInterval(interval)
  }, [period])

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="p-4 bg-red-500/10 border border-red-500/30 rounded-lg text-red-400">
        Failed to load statistics: {error}
      </div>
    )
  }

  return (
    <div className={className}>
      {/* Period Selector */}
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-bold">Crash Game Analytics</h2>
        <div className="flex gap-1">
          {['1h', '6h', '24h', '7d', '30d'].map((p) => (
            <button
              key={p}
              onClick={() => setPeriod(p)}
              className={`px-3 py-1.5 rounded text-sm font-medium transition-colors ${
                period === p
                  ? 'bg-red-500 text-white'
                  : 'bg-slate-700 text-slate-400 hover:text-white'
              }`}
            >
              {p.toUpperCase()}
            </button>
          ))}
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <QuickCrashAlert data={stats?.quick_crash_alert} />
        <MoonTracker data={stats?.moon_tracker} />
        <CrashAnalysis data={stats?.crash_analysis} />
        <CashoutOptimizer data={stats?.cashout_targets} />
        <HourlyAnalysis
          bestHours={stats?.best_hours}
          worstHours={stats?.worst_hours}
          className="lg:col-span-2"
        />
      </div>

      {/* Disclaimer */}
      <div className="mt-6 p-4 bg-slate-800/50 rounded-lg border border-slate-700/50">
        <p className="text-xs text-slate-400">
          <strong className="text-yellow-400">Disclaimer:</strong> These statistics are for
          educational purposes only. Past performance does not predict future results. Each round
          is independent. The house always has an edge. Gamble responsibly.
        </p>
      </div>
    </div>
  )
}

export default CrashGameStatsPage
