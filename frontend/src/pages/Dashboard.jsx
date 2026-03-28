import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import client from '../api/client'

export default function Dashboard() {
  const [items, setItems] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    let cancelled = false
    ;(async () => {
      try {
        const { data } = await client.get('/api/analyses')
        if (!cancelled) setItems(data.items || [])
      } catch {
        if (!cancelled) setError('Could not load analyses.')
      } finally {
        if (!cancelled) setLoading(false)
      }
    })()
    return () => {
      cancelled = true
    }
  }, [])

  return (
    <div>
      <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-slate-900 dark:text-white">
            Dashboard
          </h1>
          <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">
            Recent AI analyses for your account.
          </p>
        </div>
        <Link
          to="/analyze"
          className="inline-flex items-center justify-center rounded-lg bg-emerald-500 px-4 py-2 text-sm font-semibold text-slate-950 hover:bg-emerald-400"
        >
          New analysis
        </Link>
      </div>

      {loading && (
        <div className="rounded-xl border border-slate-200 bg-white/60 p-8 text-center text-slate-500 dark:border-slate-700/50 dark:bg-slate-900/40 dark:text-slate-400">
          Loading…
        </div>
      )}

      {error && !loading && (
        <div className="rounded-xl border border-amber-500/40 bg-amber-50 px-4 py-3 text-sm text-amber-900 dark:border-amber-500/30 dark:bg-amber-950/30 dark:text-amber-100">
          {error}
        </div>
      )}

      {!loading && !error && items.length === 0 && (
        <div className="rounded-xl border border-dashed border-slate-300 bg-white/40 p-10 text-center dark:border-slate-600 dark:bg-slate-900/30">
          <p className="text-slate-600 dark:text-slate-400">No analyses yet.</p>
          <Link
            to="/analyze"
            className="mt-4 inline-block text-sm font-medium text-emerald-600 hover:underline dark:text-emerald-400"
          >
            Run your first analysis →
          </Link>
        </div>
      )}

      {!loading && items.length > 0 && (
        <ul className="grid gap-4 sm:grid-cols-2">
          {items.map((a) => (
            <li key={a.id}>
              <Link
                to={`/analyze/${a.id}`}
                className="block rounded-xl border border-slate-200 bg-white/70 p-4 transition hover:border-emerald-500/50 hover:bg-white dark:border-slate-700/50 dark:bg-slate-900/50 dark:hover:border-emerald-500/40 dark:hover:bg-slate-900/80"
              >
                <div className="flex items-start justify-between gap-2">
                  <span className="font-medium text-slate-900 dark:text-white">
                    {a.companyName || 'General analysis'}
                  </span>
                  <span className="shrink-0 rounded-full bg-slate-200 px-2 py-0.5 text-[10px] uppercase text-slate-600 dark:bg-slate-800 dark:text-slate-400">
                    {a.result?.sentiment}
                  </span>
                </div>
                <p className="mt-2 line-clamp-2 text-sm text-slate-600 dark:text-slate-400">
                  {a.result?.summary}
                </p>
                <p className="mt-3 text-xs text-slate-500 dark:text-slate-500">
                  {new Date(a.createdAt).toLocaleString()}
                </p>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
