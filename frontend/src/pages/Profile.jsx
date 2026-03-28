import { useEffect, useState } from 'react'
import { useAuth } from '../context/AuthContext'

export default function Profile() {
  const { user, updateProfile } = useAuth()

  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [currentPassword, setCurrentPassword] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    if (user) {
      setName(user.name || '')
      setEmail(user.email || '')
    }
  }, [user])

  async function onSubmit(e) {
    e.preventDefault()
    setError('')
    setMessage('')

    if (newPassword || confirmPassword) {
      if (newPassword !== confirmPassword) {
        setError('New passwords do not match.')
        return
      }
      if (newPassword && newPassword.length < 8) {
        setError('New password must be at least 8 characters.')
        return
      }
      if (newPassword && !currentPassword) {
        setError('Enter your current password to change it.')
        return
      }
    }

    setSaving(true)
    try {
      const payload = { name: name.trim(), email: email.trim() }
      if (newPassword) {
        payload.currentPassword = currentPassword
        payload.newPassword = newPassword
      }
      await updateProfile(payload)
      setMessage('Profile updated successfully.')
      setCurrentPassword('')
      setNewPassword('')
      setConfirmPassword('')
    } catch (err) {
      const msg =
        err.response?.data?.error ||
        err.response?.data?.errors?.[0]?.msg ||
        'Could not update profile.'
      setError(msg)
    } finally {
      setSaving(false)
    }
  }

  const inputClass =
    'w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-slate-900 outline-none focus:border-emerald-500/80 focus:ring-2 focus:ring-emerald-500/25 dark:border-slate-600 dark:bg-slate-900/80 dark:text-white dark:focus:border-emerald-500/60'

  const labelClass =
    'mb-1 block text-xs font-medium text-slate-600 dark:text-slate-400'

  return (
    <div className="mx-auto w-full max-w-lg">
      <h1 className="mb-2 text-2xl font-semibold text-slate-900 dark:text-white">
        Profile
      </h1>
      <p className="mb-8 text-sm text-slate-600 dark:text-slate-400">
        Update your name, email, or password.
      </p>

      <form onSubmit={onSubmit} className="space-y-5">
        {message && (
          <div className="rounded-lg border border-emerald-500/40 bg-emerald-50 px-3 py-2 text-sm text-emerald-900 dark:bg-emerald-950/40 dark:text-emerald-100">
            {message}
          </div>
        )}
        {error && (
          <div className="rounded-lg border border-red-500/40 bg-red-50 px-3 py-2 text-sm text-red-800 dark:bg-red-950/40 dark:text-red-200">
            {error}
          </div>
        )}

        <div>
          <label className={labelClass}>Display name</label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className={inputClass}
            autoComplete="name"
          />
        </div>

        <div>
          <label className={labelClass}>Email</label>
          <input
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className={inputClass}
            autoComplete="email"
          />
        </div>

        <div className="border-t border-slate-200 pt-5 dark:border-slate-700">
          <p className="mb-3 text-xs font-medium uppercase tracking-wide text-slate-500 dark:text-slate-500">
            Change password (optional)
          </p>
          <div className="space-y-4">
            <div>
              <label className={labelClass}>Current password</label>
              <input
                type="password"
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                className={inputClass}
                autoComplete="current-password"
                placeholder="Required only if setting a new password"
              />
            </div>
            <div>
              <label className={labelClass}>New password</label>
              <input
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                className={inputClass}
                autoComplete="new-password"
                placeholder="Min 8 characters"
              />
            </div>
            <div>
              <label className={labelClass}>Confirm new password</label>
              <input
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className={inputClass}
                autoComplete="new-password"
              />
            </div>
          </div>
        </div>

        <button
          type="submit"
          disabled={saving}
          className="w-full rounded-lg bg-emerald-500 py-2.5 text-sm font-semibold text-slate-950 hover:bg-emerald-400 disabled:opacity-60"
        >
          {saving ? 'Saving…' : 'Save changes'}
        </button>
      </form>
    </div>
  )
}
