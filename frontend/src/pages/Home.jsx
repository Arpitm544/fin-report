import { Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

/** Served from `public/landing-hero.mp4` */
const LANDING_VIDEO_SRC = '/landing-hero.mp4'

export default function Home() {
  const { isAuthenticated } = useAuth()

  return (
    <section
      className="home-hero relative ml-[calc(50%-50vw)] mr-[calc(50%-50vw)] flex min-h-dvh w-screen max-w-[100vw] flex-col items-center justify-center overflow-hidden px-4 pb-[env(safe-area-inset-bottom)] pt-0 text-center sm:px-6"
    >
      {/* Full-bleed background video */}
      <div
        className="pointer-events-none absolute inset-0 z-0 overflow-hidden"
        aria-hidden="true"
      >
        <div className="hero-bg-video absolute inset-0">
          <video
            className="h-full w-full object-cover"
            src={LANDING_VIDEO_SRC}
            autoPlay
            muted
            loop
            playsInline
            preload="auto"
          />
        </div>
      </div>

      {/* Dark scrim for text contrast */}
      <div className="home-hero-overlay absolute inset-0 z-1" aria-hidden="true" />

      {/* Content */}
      <div className="relative z-10 flex w-full max-w-3xl flex-col items-center">
        <p className="home-hero-line mb-3 inline-flex items-center rounded-full border border-emerald-400/35 bg-emerald-500/10 px-3 py-1.5 text-[0.7rem] font-semibold uppercase tracking-[0.22em] text-emerald-300 shadow-sm backdrop-blur-md sm:text-xs sm:tracking-[0.2em]">
          Indian equities · AI research
        </p>
        <h1 className="home-hero-line home-hero-title max-w-[22ch] text-balance text-3xl font-semibold leading-[1.15] tracking-tight text-white sm:max-w-none sm:text-4xl sm:leading-[1.12] md:text-5xl md:leading-[1.08]">
          Financial reports, decoded in structured insight.
        </h1>
        <p className="home-hero-line home-hero-sub mt-5 max-w-xl text-pretty text-base leading-relaxed text-slate-200/95 sm:mt-6 sm:text-lg">
          Paste earnings calls, annual report excerpts, or news. FinSight uses Gemini
          2.5 Flash to produce summaries, metrics, risks, sentiment, and a 3D insight
          map — built for serious research workflows.
        </p>

        <div className="home-hero-line mt-10 flex w-full max-w-md flex-wrap items-center justify-center gap-3 sm:mt-12">
          {isAuthenticated ? (
            <Link
              to="/analyze"
              className="inline-flex min-h-11 min-w-40 items-center justify-center rounded-xl bg-emerald-500 px-6 py-2.5 text-sm font-semibold text-slate-950 shadow-lg shadow-emerald-950/30 transition duration-200 hover:bg-emerald-400 hover:shadow-xl hover:shadow-emerald-900/35 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white/60 active:translate-y-px sm:min-h-0"
            >
              Start analyzing
            </Link>
          ) : (
            <>
              <Link
                to="/register"
                className="inline-flex min-h-11 min-w-40 items-center justify-center rounded-xl bg-emerald-500 px-6 py-2.5 text-sm font-semibold text-slate-950 shadow-lg shadow-emerald-950/30 transition duration-200 hover:bg-emerald-400 hover:shadow-xl hover:shadow-emerald-900/35 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white/60 active:translate-y-px sm:min-h-0"
              >
                Get started
              </Link>
              <Link
                to="/login"
                className="inline-flex min-h-11 min-w-40 items-center justify-center rounded-xl border border-white/35 bg-white/5 px-6 py-2.5 text-sm font-medium text-white shadow-sm backdrop-blur-sm transition duration-200 hover:border-white/50 hover:bg-white/12 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white/50 active:translate-y-px sm:min-h-0"
              >
                Log in
              </Link>
            </>
          )}
        </div>
      </div>
    </section>
  )
}
