import { getMultiplierClass, getZoneClass } from '../utils/formatters'
import { getZone, getCoordinates } from '../config/gameConfig'

export default function LiveFeed({ rounds = [] }) {
  const displayRounds = rounds.slice(0, 20)

  return (
    <div className="card">
      <div className="flex items-center justify-between mb-3">
        <h2 className="text-lg font-semibold flex items-center gap-2">
          <span>📡</span> Mission Feed
        </h2>
        <span className="text-xs text-slate-400">{rounds.length} missions</span>
      </div>

      <div className="space-y-2 max-h-80 overflow-y-auto scrollbar-hide">
        {displayRounds.length === 0 ? (
          <div className="text-center py-8">
            <div className="text-4xl mb-2 animate-pulse">🛸</div>
            <p className="text-sm text-slate-500">Scanning for missions...</p>
          </div>
        ) : (
          displayRounds.map((round, idx) => {
            const zone = getZone(round.crash_multiplier)
            const coords = getCoordinates(round.crash_multiplier)

            return (
              <div
                key={round.round_id || idx}
                className={`flex items-center justify-between p-2 rounded-lg transition-all ${
                  round.isNew ? 'bg-violet-500/20 animate-pulse border border-violet-500/30' : 'bg-slate-800/50'
                }`}
              >
                <div className="flex items-center gap-2">
                  <span className="text-lg">{zone.icon}</span>
                  <div>
                    <span className="text-xs text-slate-500 font-mono block">
                      #{round.round_id?.slice(-6) || idx}
                    </span>
                    <span className="text-xs text-cyan-400/70 font-mono">
                      X:{coords.x} Y:{coords.y}
                    </span>
                  </div>
                </div>
                <div className="text-right">
                  <span className={`font-bold font-mono ${getMultiplierClass(round.crash_multiplier)}`}>
                    {round.crash_multiplier?.toFixed(2)}x
                  </span>
                  <span className={`block text-xs ${getZoneClass(zone.color)}`}>
                    {zone.name}
                  </span>
                </div>
              </div>
            )
          })
        )}
      </div>

      {/* Legend */}
      <div className="mt-3 pt-3 border-t border-purple-500/20">
        <div className="flex flex-wrap gap-2 text-xs">
          <span className="flex items-center gap-1"><span>🌍</span> Earth</span>
          <span className="flex items-center gap-1"><span>🌙</span> Moon</span>
          <span className="flex items-center gap-1"><span>🔴</span> Mars</span>
          <span className="flex items-center gap-1"><span>🟠</span> Jupiter</span>
          <span className="flex items-center gap-1"><span>🌌</span> Galaxy</span>
        </div>
      </div>
    </div>
  )
}
