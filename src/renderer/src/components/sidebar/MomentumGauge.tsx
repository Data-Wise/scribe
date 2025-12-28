import { TrendingUp } from 'lucide-react'

interface MomentumGaugeProps {
  percentage: number
  label?: string
}

export function MomentumGauge({ percentage, label = 'Current Momentum' }: MomentumGaugeProps) {
  const circumference = 2 * Math.PI * 58 // radius = 58
  const offset = circumference * (1 - percentage / 100)

  return (
    <div className="momentum-gauge-widget bg-nexus-bg-tertiary/40 rounded-2xl p-5 border border-nexus-bg-tertiary/60 mb-6">
      <div className="flex items-center justify-between mb-4">
        <span className="text-[10px] font-bold uppercase tracking-widest text-nexus-text-muted">
          {label}
        </span>
        <TrendingUp className="w-4 h-4 text-emerald-400" />
      </div>

      <div className="flex flex-col items-center justify-center space-y-2 py-2">
        <div className="relative w-32 h-32 flex items-center justify-center">
          {/* SVG Ring - Progress Visualization */}
          <svg className="w-full h-full transform -rotate-90">
            <circle
              cx="64"
              cy="64"
              r="58"
              stroke="currentColor"
              strokeWidth="8"
              fill="transparent"
              className="text-nexus-bg-secondary"
            />
            <circle
              cx="64"
              cy="64"
              r="58"
              stroke="currentColor"
              strokeWidth="8"
              fill="transparent"
              strokeDasharray={circumference}
              strokeDashoffset={offset}
              strokeLinecap="round"
              className="text-nexus-accent transition-all duration-500"
              style={{ filter: 'drop-shadow(0 0 8px var(--nexus-accent))' }}
            />
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span className="text-2xl font-bold text-nexus-text-primary">{percentage}%</span>
            <span className="text-[10px] text-nexus-text-muted uppercase">Complete</span>
          </div>
        </div>
        <p className="text-center text-xs text-nexus-text-muted mt-2">
          {percentage >= 90 ? (
            <>Almost there! <strong>Keep going.</strong></>
          ) : percentage >= 50 ? (
            <>Halfway there! <strong>{100 - percentage}% to go.</strong></>
          ) : (
            <>Getting started. <strong>{100 - percentage}% remaining.</strong></>
          )}
        </p>
      </div>
    </div>
  )
}
