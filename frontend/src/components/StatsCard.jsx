import clsx from 'clsx'

const colorClasses = {
  default: 'from-slate-600 to-slate-700',
  purple: 'from-violet-600 to-purple-700',
  cyan: 'from-cyan-600 to-teal-700',
  violet: 'from-violet-600 to-indigo-700',
  green: 'from-green-600 to-emerald-700',
  orange: 'from-orange-600 to-amber-700',
  red: 'from-red-600 to-rose-700',
  blue: 'from-blue-600 to-indigo-700',
}

export default function StatsCard({ title, value, icon, color = 'default', subtitle }) {
  return (
    <div className="card hover:border-purple-500/40 transition-colors">
      <div className="flex items-start justify-between mb-2">
        <span className="text-xs text-slate-400 uppercase tracking-wider">{title}</span>
        <span className={clsx(
          'w-8 h-8 rounded-lg flex items-center justify-center text-sm bg-gradient-to-br',
          colorClasses[color]
        )}>
          {icon}
        </span>
      </div>
      <div className="text-2xl font-bold text-white">{value}</div>
      {subtitle && (
        <div className="text-xs text-slate-500 mt-1">{subtitle}</div>
      )}
    </div>
  )
}
