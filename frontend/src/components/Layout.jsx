import { Link } from 'react-router-dom'
import { Footer } from '../../../../shared-core/components/footer/Footer'
import GAME_CONFIG from '../config/gameConfig'
import { SchemaMarkup } from '../../../../shared-core/components/SchemaMarkup'


// Game configuration for SEO
const GAME_SEO = {
  name: 'Space XY',
  provider: 'BGaming',
  rtp: 97,
  domain: 'spacexytracker.com',
  maxMultiplier: '10,000x',
  description: 'Real-time Space XY statistics tracker with live multiplier data, RTP analysis, and historical patterns.'
}

function Layout({ children, connected, connectionStatus, summary }) {
  return (
    <div className="min-h-screen">
      {/* Schema.org SEO Markup */}
      <SchemaMarkup game={GAME_SEO} />

      {/* Header */}
      <header className="border-b border-purple-500/20 bg-slate-900/80 backdrop-blur-md sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 py-3">
          <div className="flex items-center justify-between">
            {/* Logo */}
            <Link to="/" className="flex items-center gap-3 hover:opacity-90 transition-opacity">
              <div className="relative">
                <span className="text-3xl animate-rocket">🚀</span>
                <span className="absolute -top-1 -right-1 text-xs">✨</span>
              </div>
              <div>
                <span className="text-xl font-bold gradient-text block">Space XY Tracker</span>
                <span className="text-xs text-slate-400">Coordinate-based crash analytics</span>
              </div>
            </Link>

            {/* Navigation */}
            <nav className="hidden md:flex items-center gap-6 text-sm">
              <Link to="/what-is-space-xy/" className="text-slate-400 hover:text-violet-400 transition-colors">What is Space XY?</Link>
              <Link to="/space-xy-statistics/" className="text-slate-400 hover:text-violet-400 transition-colors">Statistics</Link>
              <Link to="/space-xy-strategies/" className="text-slate-400 hover:text-violet-400 transition-colors">Strategies</Link>
              <Link to="/space-xy-casinos/" className="text-slate-400 hover:text-violet-400 transition-colors">Casinos</Link>
            </nav>

            {/* Right Side */}
            <div className="flex items-center gap-3">
              {/* Demo Button */}
              <a
                href={GAME_CONFIG.demoUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="hidden sm:flex items-center gap-2 px-4 py-2 rounded-lg bg-gradient-to-r from-violet-600 to-cyan-600 hover:from-violet-500 hover:to-cyan-500 text-white font-semibold text-sm transition-all glow-purple"
              >
                <span>🎮</span>
                <span>Play Demo</span>
              </a>

              {/* Status */}
              <div className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-xs ${
                connected ? 'bg-cyan-500/20 text-cyan-400 border border-cyan-500/30' : 'bg-yellow-500/20 text-yellow-400 border border-yellow-500/30'
              }`}>
                <span className={`w-2 h-2 rounded-full ${connected ? 'bg-cyan-500 animate-pulse' : 'bg-yellow-500'}`}></span>
                <span className="hidden sm:inline">{connectionStatus}</span>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      {children}

      {/* Responsible Gambling Warning */}
      <div className="bg-gradient-to-r from-amber-900/30 to-orange-900/30 border-y border-amber-500/20">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-start gap-3">
            <span className="text-2xl">18+</span>
            <div className="text-sm">
              <p className="text-amber-300 font-semibold mb-1">Play Responsibly</p>
              <p className="text-amber-200/70">
                Gambling can be addictive. Play responsibly and only with money you can afford to lose.
                If you have a gambling problem, please seek help at{' '}
                <a href="https://www.begambleaware.org" target="_blank" rel="noopener noreferrer" className="text-cyan-400 hover:underline">BeGambleAware.org</a>,{' '}
                <a href="https://www.gamcare.org.uk" target="_blank" rel="noopener noreferrer" className="text-cyan-400 hover:underline">GamCare.org.uk</a>, or{' '}
                <a href="https://www.gamblingtherapy.org" target="_blank" rel="noopener noreferrer" className="text-cyan-400 hover:underline">GamblingTherapy.org</a>.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <Footer
        gameName="Space XY"
        gameEmoji="🛸"
        domain="spacexytracker.com"
        primaryColor="#6366f1"
        botUsername="SpaceXYTrackerBot"
        rtp={97}
        provider="BGaming"
      />
    </div>
  )
}

export default Layout
