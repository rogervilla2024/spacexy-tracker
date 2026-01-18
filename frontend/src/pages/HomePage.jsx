import { useState } from 'react'
import { Link } from 'react-router-dom'
import GAME_CONFIG, { getZone, getCoordinates } from '../config/gameConfig'
import LiveFeed from '../components/LiveFeed'
import StatsCard from '../components/StatsCard'

const TABS = [
  { id: 'dashboard', label: 'Mission Control', icon: '🛸' },
  { id: 'analytics', label: 'Deep Scan', icon: '📡' },
  { id: 'compare', label: 'Compare', icon: '⚖️' },
]

// Zone badges component
function ZoneBadge({ multiplier }) {
  const zone = getZone(multiplier)
  const coords = getCoordinates(multiplier)

  return (
    <div className="flex items-center gap-2">
      <span className={`px-2 py-1 rounded text-xs border ${
        zone.color === 'green' ? 'zone-earth' :
        zone.color === 'gray' ? 'zone-moon' :
        zone.color === 'orange' ? 'zone-mars' :
        zone.color === 'amber' ? 'zone-jupiter' :
        'zone-galaxy'
      }`}>
        {zone.icon} {zone.name}
      </span>
      <span className="text-xs text-slate-500 font-mono">
        X:{coords.x} Y:{coords.y}
      </span>
    </div>
  )
}

function HomePage({ rounds, summary, distribution, recentRounds, loading, refetch }) {
  const [activeTab, setActiveTab] = useState('dashboard')

  // Get latest round for coordinate display
  const latestRound = rounds[0]
  const latestCoords = latestRound ? getCoordinates(latestRound.crash_multiplier) : { x: '0.0', y: '0.0' }
  const latestZone = latestRound ? getZone(latestRound.crash_multiplier) : GAME_CONFIG.zones.earthOrbit

  return (
    <>
      {/* Tabs */}
      <div className="border-b border-purple-500/20 bg-slate-900/50">
        <div className="max-w-7xl mx-auto px-4">
          <nav className="flex items-center gap-1 py-2 overflow-x-auto scrollbar-hide">
            {TABS.map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all whitespace-nowrap ${
                  activeTab === tab.id
                    ? 'bg-gradient-to-r from-violet-600/20 to-cyan-600/20 text-violet-400 border border-violet-500/30'
                    : 'text-slate-400 hover:text-white hover:bg-slate-700/30'
                }`}
              >
                <span>{tab.icon}</span>
                {tab.label}
              </button>
            ))}

            <div className="w-px h-6 bg-purple-500/30 mx-2"></div>

            <Link
              to="/space-xy-vs-aviator/"
              className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm text-slate-400 hover:text-cyan-400 hover:bg-cyan-500/10 transition-all whitespace-nowrap"
            >
              <span>✈️</span>
              <span className="hidden md:inline">vs Aviator</span>
            </Link>
          </nav>
        </div>
      </div>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 py-6">
        <h1 className="sr-only">Space XY Statistics - Real-time Coordinate Crash Game Analytics</h1>

        {activeTab === 'dashboard' && (
          <>
            {/* Current Coordinates Display */}
            <section className="mb-6">
              <div className="card-glow p-6 text-center animate-nebula">
                <div className="text-xs text-slate-400 uppercase tracking-wider mb-2">Current Coordinates</div>
                <div className="flex items-center justify-center gap-8">
                  <div>
                    <span className="text-slate-500 text-sm">X:</span>
                    <span className="text-4xl font-bold gradient-text ml-2 coordinate-display">{latestCoords.x}</span>
                  </div>
                  <div className="text-3xl text-purple-500">|</div>
                  <div>
                    <span className="text-slate-500 text-sm">Y:</span>
                    <span className="text-4xl font-bold gradient-text ml-2 coordinate-display">{latestCoords.y}</span>
                  </div>
                </div>
                <div className="mt-4 flex items-center justify-center gap-2">
                  <span className="text-2xl">{latestZone.icon}</span>
                  <span className="text-lg text-slate-300">{latestZone.name} Zone</span>
                  {latestRound && (
                    <span className="ml-2 px-3 py-1 bg-violet-500/20 text-violet-400 rounded-full text-sm font-mono">
                      {latestRound.crash_multiplier?.toFixed(2)}x
                    </span>
                  )}
                </div>
              </div>
            </section>

            {/* Stats */}
            <section className="mb-6">
              <div className="flex items-center justify-between mb-3">
                <h2 className="text-sm font-medium text-slate-400 flex items-center gap-2">
                  <span>📊</span> Mission Statistics
                </h2>
                <button onClick={refetch} disabled={loading} className="text-xs text-slate-400 hover:text-white">
                  Refresh Data
                </button>
              </div>
              <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
                <StatsCard title="Total Missions" value={summary?.total_rounds?.toLocaleString() || '-'} icon="🚀" />
                <StatsCard title="Avg Distance" value={summary?.avg_multiplier ? `${summary.avg_multiplier.toFixed(2)}x` : '-'} icon="📏" color="purple" />
                <StatsCard title="Median" value={summary?.median_multiplier ? `${summary.median_multiplier.toFixed(2)}x` : '-'} icon="⚖️" color="cyan" />
                <StatsCard title="Max Distance" value={summary?.max_multiplier ? `${summary.max_multiplier.toFixed(2)}x` : '-'} icon="🌌" color="violet" />
                <StatsCard title="Crash Landings" value={summary?.under_2x_count?.toLocaleString() || '-'} icon="💥" color="orange" subtitle="Under 2x" />
                <StatsCard title="Galaxy Reaches" value={summary?.over_10x_count?.toLocaleString() || '-'} icon="✨" color="green" subtitle="Over 10x" />
              </div>
            </section>

            {/* Space Zones Overview */}
            <section className="mb-6">
              <h2 className="text-sm font-medium text-slate-400 flex items-center gap-2 mb-3">
                <span>🗺️</span> Exploration Zones
              </h2>
              <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
                {Object.entries(GAME_CONFIG.zones).map(([key, zone]) => (
                  <div key={key} className={`card p-3 text-center border ${
                    key === 'earthOrbit' ? 'border-green-500/30' :
                    key === 'moon' ? 'border-slate-400/30' :
                    key === 'mars' ? 'border-orange-500/30' :
                    key === 'jupiter' ? 'border-amber-500/30' :
                    'border-purple-500/30'
                  }`}>
                    <div className="text-2xl mb-1">{zone.icon}</div>
                    <div className="text-sm font-semibold text-white">{zone.name}</div>
                    <div className="text-xs text-slate-400">{zone.min}x - {zone.max}x</div>
                  </div>
                ))}
              </div>
            </section>

            {/* Game + Live Feed */}
            <section className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
              <div className="lg:col-span-2">
                <div className="card overflow-hidden">
                  <div className="flex items-center justify-between mb-3">
                    <h2 className="text-lg font-semibold flex items-center gap-2">
                      <span>🚀</span> Play Space XY
                    </h2>
                    <span className="px-2 py-1 text-xs bg-cyan-500/20 text-cyan-400 rounded border border-cyan-500/30">Free Demo</span>
                  </div>

                  <div className="relative w-full rounded-lg overflow-hidden" style={{ paddingBottom: '56.25%' }}>
                    <div className="absolute inset-0 bg-gradient-to-br from-violet-900 via-purple-900 to-slate-900 nebula-bg">
                      <div className="absolute inset-0 flex flex-col items-center justify-center text-center p-6">
                        <div className="text-8xl mb-4 animate-rocket">🚀</div>
                        <h3 className="text-2xl md:text-3xl font-bold text-white mb-2">Space XY by BGaming</h3>
                        <p className="text-purple-200 mb-6 max-w-md">
                          Navigate through space coordinates! Cash out before your ship loses signal. Up to 10,000x multiplier!
                        </p>

                        <a
                          href={GAME_CONFIG.demoUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="group inline-flex items-center gap-3 px-8 py-4 bg-gradient-to-r from-violet-600 to-cyan-600 hover:from-violet-500 hover:to-cyan-500 text-white font-bold text-lg rounded-xl shadow-2xl transition-all hover:scale-105 glow-purple"
                        >
                          <span className="text-2xl">🎮</span>
                          <span>Launch Demo Mission</span>
                        </a>

                        <div className="flex flex-wrap justify-center gap-3 mt-6">
                          <span className="px-3 py-1 bg-white/10 backdrop-blur rounded-full text-sm text-purple-200 border border-purple-500/30">
                            {GAME_CONFIG.rtp}% RTP
                          </span>
                          <span className="px-3 py-1 bg-white/10 backdrop-blur rounded-full text-sm text-purple-200 border border-purple-500/30">
                            Up to {GAME_CONFIG.maxMultiplier.toLocaleString()}x
                          </span>
                          <span className="px-3 py-1 bg-white/10 backdrop-blur rounded-full text-sm text-purple-200 border border-purple-500/30">
                            X,Y Coordinates
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>

                  <p className="mt-3 text-xs text-slate-500 text-center">
                    Opens official BGaming demo in new tab. House edge: {GAME_CONFIG.houseEdge}%
                  </p>
                </div>
              </div>

              <div className="space-y-4">
                <LiveFeed rounds={rounds} />
              </div>
            </section>

            {/* Recent Missions Table */}
            <section className="card">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold flex items-center gap-2">
                  <span>📜</span> Recent Missions
                </h2>
                <span className="text-xs text-slate-400">{rounds.length} loaded</span>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-purple-500/20 text-slate-400">
                      <th className="text-left py-2 px-3">Mission ID</th>
                      <th className="text-left py-2 px-3">Coordinates</th>
                      <th className="text-left py-2 px-3">Zone</th>
                      <th className="text-right py-2 px-3">Distance</th>
                    </tr>
                  </thead>
                  <tbody>
                    {rounds.slice(0, 10).map((round, idx) => {
                      const coords = getCoordinates(round.crash_multiplier)
                      const zone = getZone(round.crash_multiplier)
                      return (
                        <tr key={round.round_id || idx} className="border-b border-purple-500/10 hover:bg-purple-500/5">
                          <td className="py-2 px-3 font-mono text-slate-400">
                            #{round.round_id?.slice(-8) || idx}
                          </td>
                          <td className="py-2 px-3 font-mono text-cyan-400">
                            X:{coords.x} Y:{coords.y}
                          </td>
                          <td className="py-2 px-3">
                            <span className="flex items-center gap-1">
                              <span>{zone.icon}</span>
                              <span className="text-slate-300">{zone.name}</span>
                            </span>
                          </td>
                          <td className="py-2 px-3 text-right font-bold font-mono text-violet-400">
                            {round.crash_multiplier?.toFixed(2)}x
                          </td>
                        </tr>
                      )
                    })}
                  </tbody>
                </table>
              </div>
            </section>
          </>
        )}

        {activeTab === 'analytics' && (
          <div className="space-y-6">
            <div className="card">
              <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
                <span>📡</span> Deep Space Scan
              </h2>
              <p className="text-slate-400">Advanced analytics module coming soon...</p>
              <div className="mt-4 grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="p-4 bg-slate-800/50 rounded-lg text-center">
                  <div className="text-2xl mb-2">🌍</div>
                  <div className="text-sm text-slate-400">Earth Orbit Crashes</div>
                  <div className="text-xl font-bold text-green-400">
                    {summary?.under_2x_count?.toLocaleString() || '-'}
                  </div>
                </div>
                <div className="p-4 bg-slate-800/50 rounded-lg text-center">
                  <div className="text-2xl mb-2">🌙</div>
                  <div className="text-sm text-slate-400">Moon Landings</div>
                  <div className="text-xl font-bold text-slate-300">-</div>
                </div>
                <div className="p-4 bg-slate-800/50 rounded-lg text-center">
                  <div className="text-2xl mb-2">🔴</div>
                  <div className="text-sm text-slate-400">Mars Reaches</div>
                  <div className="text-xl font-bold text-orange-400">-</div>
                </div>
                <div className="p-4 bg-slate-800/50 rounded-lg text-center">
                  <div className="text-2xl mb-2">🌌</div>
                  <div className="text-sm text-slate-400">Galaxy Exploration</div>
                  <div className="text-xl font-bold text-purple-400">
                    {summary?.over_10x_count?.toLocaleString() || '-'}
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'compare' && (
          <div className="card">
            <h2 className="text-xl font-bold mb-4">Space XY vs Other Crash Games</h2>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-purple-500/20">
                    <th className="text-left py-3 px-4">Game</th>
                    <th className="text-left py-3 px-4">Provider</th>
                    <th className="text-left py-3 px-4">RTP</th>
                    <th className="text-left py-3 px-4">Max Multi</th>
                    <th className="text-left py-3 px-4">Features</th>
                  </tr>
                </thead>
                <tbody className="text-slate-300">
                  <tr className="border-b border-purple-500/10 bg-violet-500/10">
                    <td className="py-3 px-4 font-semibold">🚀 Space XY</td>
                    <td className="py-3 px-4">BGaming</td>
                    <td className="py-3 px-4 text-green-400">97.0%</td>
                    <td className="py-3 px-4">10,000x</td>
                    <td className="py-3 px-4">X,Y Coordinates, 2 Bets</td>
                  </tr>
                  <tr className="border-b border-purple-500/10">
                    <td className="py-3 px-4">✈️ Aviator</td>
                    <td className="py-3 px-4">Spribe</td>
                    <td className="py-3 px-4 text-green-400">97.0%</td>
                    <td className="py-3 px-4">10,000x</td>
                    <td className="py-3 px-4">Chat, Rain, 2 Bets</td>
                  </tr>
                  <tr className="border-b border-purple-500/10">
                    <td className="py-3 px-4">🧑‍🚀 Spaceman</td>
                    <td className="py-3 px-4">Pragmatic Play</td>
                    <td className="py-3 px-4">96.5%</td>
                    <td className="py-3 px-4">5,000x</td>
                    <td className="py-3 px-4">Half Cashout</td>
                  </tr>
                  <tr className="border-b border-purple-500/10">
                    <td className="py-3 px-4">🛩️ JetX</td>
                    <td className="py-3 px-4">SmartSoft</td>
                    <td className="py-3 px-4 text-green-400">97.0%</td>
                    <td className="py-3 px-4">25,000x</td>
                    <td className="py-3 px-4">3 Bet Slots</td>
                  </tr>
                  <tr className="border-b border-purple-500/10">
                    <td className="py-3 px-4">🚁 Cash or Crash</td>
                    <td className="py-3 px-4">Evolution</td>
                    <td className="py-3 px-4 text-green-400">99.5%</td>
                    <td className="py-3 px-4">50,000x</td>
                    <td className="py-3 px-4">Live Dealer, Shields</td>
                  </tr>
                </tbody>
              </table>
            </div>

            <div className="mt-6 p-4 bg-violet-500/10 rounded-lg border border-violet-500/20">
              <h3 className="font-semibold text-violet-300 mb-2">Why Space XY?</h3>
              <ul className="text-sm text-slate-400 space-y-1">
                <li>- Unique X,Y coordinate visualization system</li>
                <li>- Space exploration theme with zone progression</li>
                <li>- Competitive 97% RTP matching Aviator</li>
                <li>- High 10,000x maximum multiplier</li>
                <li>- BGaming provably fair technology</li>
              </ul>
            </div>
          </div>
        )}
      </main>
    </>
  )
}

export default HomePage
