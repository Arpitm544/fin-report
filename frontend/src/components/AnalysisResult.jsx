import { lazy, Suspense } from 'react'

const ThreeFinancialGraph = lazy(() => import('./ThreeFinancialGraph'))

function Card({ title, children, className = '' }) {
  return (
    <div
      className={`rounded-xl border border-slate-200 bg-white/80 p-4 shadow-lg backdrop-blur-sm dark:border-slate-700/60 dark:bg-slate-900/50 ${className}`}
    >
      <h3 className="mb-2 text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">
        {title}
      </h3>
      <div className="text-sm leading-relaxed text-slate-800 dark:text-slate-200">
        {children}
      </div>
    </div>
  )
}

function sentimentBadge(sentiment) {
  const s = (sentiment || '').toLowerCase()
  if (s === 'bullish')
    return 'bg-emerald-500/15 text-emerald-800 ring-1 ring-emerald-500/35 dark:bg-emerald-500/20 dark:text-emerald-300 dark:ring-emerald-500/40'
  if (s === 'bearish')
    return 'bg-red-500/15 text-red-800 ring-1 ring-red-500/35 dark:bg-red-500/20 dark:text-red-300 dark:ring-red-500/40'
  return 'bg-slate-500/15 text-slate-700 ring-1 ring-slate-400/40 dark:bg-slate-500/20 dark:text-slate-300 dark:ring-slate-500/40'
}

export default function AnalysisResult({ result, companyName }) {
  if (!result) return null

  return (
    <div className="space-y-6">
      <div className="rounded-2xl border border-slate-200 bg-gradient-to-br from-white to-slate-50 p-6 dark:border-slate-700/50 dark:from-slate-900/80 dark:to-slate-950/90">
        <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
          <h2 className="text-lg font-semibold text-slate-900 dark:text-white">
            {companyName ? `${companyName} — Analysis` : 'Analysis result'}
          </h2>
          <div className="flex items-center gap-3">
            <span
              className={`rounded-full px-3 py-1 text-xs font-medium ${sentimentBadge(result.sentiment)}`}
            >
              {result.sentiment}
            </span>
            <span className="text-xs text-slate-500 dark:text-slate-500">
              Confidence{' '}
              <strong className="text-slate-800 dark:text-slate-300">
                {result.confidence_score}/10
              </strong>
            </span>
          </div>
        </div>

        <Suspense
          fallback={
            <div className="flex h-[280px] items-center justify-center rounded-xl border border-slate-200 bg-slate-50 text-sm text-slate-500 md:h-[320px] dark:border-slate-700/50 dark:bg-slate-950/80 dark:text-slate-500">
              Loading 3D view…
            </div>
          }
        >
          <ThreeFinancialGraph sentiment={result.sentiment} />
        </Suspense>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <Card title="Executive summary" className="md:col-span-2">
          <p>{result.summary}</p>
        </Card>

        <Card title="Key metrics">
          <ul className="list-inside list-disc space-y-1 text-slate-700 dark:text-slate-300">
            {(result.key_metrics || []).map((m, i) => (
              <li key={i}>{m}</li>
            ))}
          </ul>
        </Card>

        <Card title="Risks">
          <ul className="list-inside list-disc space-y-1 text-red-700 dark:text-red-200/90">
            {(result.risks || []).map((r, i) => (
              <li key={i}>{r}</li>
            ))}
          </ul>
        </Card>

        <Card title="Investor takeaway" className="md:col-span-2">
          <p className="text-emerald-900 dark:text-emerald-100/90">
            {result.investor_takeaway}
          </p>
        </Card>
      </div>
    </div>
  )
}
