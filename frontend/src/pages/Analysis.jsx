import { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import client from '../api/client'
import AnalysisResult from '../components/AnalysisResult'

const inputClass =
  'w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-slate-900 outline-none focus:border-emerald-500/80 focus:ring-2 focus:ring-emerald-500/25 dark:border-slate-600 dark:bg-slate-900/80 dark:text-white dark:focus:border-emerald-500/60'

const labelClass = 'mb-1 block text-xs font-medium text-slate-600 dark:text-slate-400'

export default function Analysis() {
  const { id } = useParams()
  const isView = Boolean(id)

  const [companyName, setCompanyName] = useState('')
  const [inputText, setInputText] = useState('')
  const [result, setResult] = useState(null)
  const [savedCompany, setSavedCompany] = useState('')
  const [loading, setLoading] = useState(false)
  const [loadExisting, setLoadExisting] = useState(isView)
  const [error, setError] = useState('')

  useEffect(() => {
    if (!isView) return
    let cancelled = false
    ;(async () => {
      setLoadExisting(true)
      setError('')
      try {
        const { data } = await client.get(`/api/analyses/${id}`)
        if (cancelled) return
        setSavedCompany(data.companyName || '')
        setCompanyName(data.companyName || '')
        setInputText(data.inputText || '')
        setResult(data.result)
      } catch {
        if (!cancelled) setError('Analysis not found or access denied.')
      } finally {
        if (!cancelled) setLoadExisting(false)
      }
    })()
    return () => {
      cancelled = true
    }
  }, [id, isView])

  async function onAnalyze(e) {
    e.preventDefault()
    setError('')
    setResult(null)

    const trimmed = inputText.trim()
    if (trimmed.length < 20) {
      setError('Please enter at least 20 characters of report text or news.')
      return
    }

    setLoading(true)
    try {
      const { data } = await client.post('/api/analyses', {
        companyName: companyName.trim(),
        inputText: trimmed,
      })
      setSavedCompany(data.companyName || '')
      setResult(data.result)
    } catch (err) {
      const msg =
        err.response?.data?.error ||
        err.message ||
        'Analysis failed. Please try again.'
      setError(msg)
    } finally {
      setLoading(false)
    }
  }

  if (isView && loadExisting) {
    return (
      <div className="rounded-xl border border-slate-200 bg-white/60 p-8 text-center text-slate-500 dark:border-slate-700/50 dark:bg-slate-900/40 dark:text-slate-400">
        Loading analysis…
      </div>
    )
  }

  if (isView && error && !result) {
    return (
      <div className="rounded-xl border border-red-500/40 bg-red-50 px-4 py-3 text-sm text-red-900 dark:border-red-500/30 dark:bg-red-950/30 dark:text-red-100">
        {error}
      </div>
    )
  }

  return (
    <div>
      <h1 className="text-2xl font-semibold text-slate-900 dark:text-white">
        {isView ? 'Saved analysis' : 'Analyze report'}
      </h1>
      <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">
        Enter a company name (e.g. TCS, Infosys) and paste earnings text, annual
        report excerpts, or news. Gemini 2.5 Flash returns structured JSON
        insights.
      </p>

      <form onSubmit={onAnalyze} className="mt-8 space-y-4">
        <div>
          <label className={labelClass}>Company name (optional)</label>
          <input
            type="text"
            placeholder="e.g. Tata Consultancy Services"
            value={companyName}
            onChange={(e) => setCompanyName(e.target.value)}
            disabled={loading || (isView && result)}
            className={`${inputClass} disabled:opacity-50`}
          />
        </div>

        <div>
          <label className={labelClass}>Financial report / news text</label>
          <textarea
            rows={10}
            required={!isView}
            placeholder="Paste quarterly results, annual report section, or financial news…"
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            disabled={loading || (isView && result)}
            className={`${inputClass} resize-y font-mono text-sm dark:text-slate-200 disabled:opacity-50`}
          />
        </div>

        {error && (
          <div className="rounded-lg border border-red-500/40 bg-red-50 px-3 py-2 text-sm text-red-800 dark:bg-red-950/40 dark:text-red-200">
            {error}
          </div>
        )}

        {(!isView || !result) && (
          <button
            type="submit"
            disabled={loading}
            className="rounded-lg bg-emerald-500 px-5 py-2.5 text-sm font-semibold text-slate-950 hover:bg-emerald-400 disabled:opacity-60"
          >
            {loading ? 'Analyzing…' : 'Analyze'}
          </button>
        )}
      </form>

      {result && (
        <div className="mt-10">
          <AnalysisResult result={result} companyName={savedCompany || companyName} />
        </div>
      )}
    </div>
  )
}
