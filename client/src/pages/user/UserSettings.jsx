import { useEffect, useState } from 'react'
import toast from 'react-hot-toast'
import DashboardLayout from '../../layouts/DashboardLayout'
import { authApi } from '../../services/api'
import { useAuth } from '../../context/AuthContext'
import { useDashboardTheme } from '../../context/DashboardThemeContext'

function AppearanceSettings() {
  const { theme, toggleTheme } = useDashboardTheme()

  return (
    <div className="luxury-card p-6">
      <h2 className="text-lg font-semibold text-ink">Appearance</h2>
      <p className="mt-1 text-sm text-muted">Switch between dark and light mode for the dashboard.</p>
      <button
        type="button"
        onClick={toggleTheme}
        className="btn-secondary mt-6 rounded-xl px-5 py-2.5 text-sm font-semibold"
      >
        Switch to {theme === 'dark' ? 'light' : 'dark'} mode
      </button>
    </div>
  )
}

export default function UserSettings() {
  const { user, setUser } = useAuth()
  const [name, setName] = useState(user?.name || '')
  const [phone, setPhone] = useState(user?.phone || '')
  const [avatar, setAvatar] = useState(user?.avatar || '')
  const [saving, setSaving] = useState(false)
  const [currentPassword, setCurrentPassword] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [changingPassword, setChangingPassword] = useState(false)

  useEffect(() => {
    setName(user?.name || '')
    setPhone(user?.phone || '')
    setAvatar(user?.avatar || '')
  }, [user])

  const handleProfileSave = async (e) => {
    e.preventDefault()
    setSaving(true)
    try {
      const res = await authApi.updateProfile({ name, phone, avatar })
      setUser(res.user)
      toast.success('Profile updated')
    } catch (err) {
      toast.error(err.message || 'Failed to update profile')
    } finally {
      setSaving(false)
    }
  }

  const handlePasswordChange = async (e) => {
    e.preventDefault()
    setChangingPassword(true)
    try {
      await authApi.changePassword({ currentPassword, newPassword })
      setCurrentPassword('')
      setNewPassword('')
      toast.success('Password updated')
    } catch (err) {
      toast.error(err.message || 'Failed to change password')
    } finally {
      setChangingPassword(false)
    }
  }

  return (
    <DashboardLayout>
      <div className="mx-auto max-w-2xl px-6 py-6">
        <div className="mb-8">
          <h1 className="text-2xl font-semibold text-ink">Settings</h1>
          <p className="mt-1 text-sm text-muted">Manage your profile, security, and preferences.</p>
        </div>

        <form onSubmit={handleProfileSave} className="luxury-card mb-6 p-6">
          <h2 className="text-lg font-semibold text-ink">Profile</h2>
          <p className="mt-1 text-sm text-muted">Update your personal information.</p>

          <div className="mt-6 space-y-4">
            <div>
              <label className="mb-1.5 block text-xs font-medium text-muted">Name</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full rounded-xl border border-border bg-surface px-4 py-2.5 text-sm text-ink focus:border-charcoal focus:outline-none focus:ring-2 focus:ring-charcoal/10"
              />
            </div>
            <div>
              <label className="mb-1.5 block text-xs font-medium text-muted">Email</label>
              <input
                type="email"
                value={user?.email || ''}
                disabled
                className="w-full rounded-xl border border-border bg-surface px-4 py-2.5 text-sm text-muted"
              />
            </div>
            <div>
              <label className="mb-1.5 block text-xs font-medium text-muted">Phone</label>
              <input
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="+91..."
                className="w-full rounded-xl border border-border bg-surface px-4 py-2.5 text-sm text-ink focus:border-charcoal focus:outline-none focus:ring-2 focus:ring-charcoal/10"
              />
            </div>
            <div>
              <label className="mb-1.5 block text-xs font-medium text-muted">Avatar URL</label>
              <input
                type="url"
                value={avatar}
                onChange={(e) => setAvatar(e.target.value)}
                placeholder="https://..."
                className="w-full rounded-xl border border-border bg-surface px-4 py-2.5 text-sm text-ink focus:border-charcoal focus:outline-none focus:ring-2 focus:ring-charcoal/10"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={saving}
            className="btn-primary mt-6 rounded-xl px-5 py-2.5 text-sm font-semibold disabled:opacity-50"
          >
            {saving ? 'Saving...' : 'Save profile'}
          </button>
        </form>

        <form onSubmit={handlePasswordChange} className="luxury-card mb-6 p-6">
          <h2 className="text-lg font-semibold text-ink">Password</h2>
          <p className="mt-1 text-sm text-muted">Change your account password.</p>

          <div className="mt-6 space-y-4">
            <div>
              <label className="mb-1.5 block text-xs font-medium text-muted">Current password</label>
              <input
                type="password"
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                className="w-full rounded-xl border border-border bg-surface px-4 py-2.5 text-sm text-ink focus:border-charcoal focus:outline-none focus:ring-2 focus:ring-charcoal/10"
              />
            </div>
            <div>
              <label className="mb-1.5 block text-xs font-medium text-muted">New password</label>
              <input
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                minLength={6}
                className="w-full rounded-xl border border-border bg-surface px-4 py-2.5 text-sm text-ink focus:border-charcoal focus:outline-none focus:ring-2 focus:ring-charcoal/10"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={changingPassword || !currentPassword || !newPassword}
            className="btn-primary mt-6 rounded-xl px-5 py-2.5 text-sm font-semibold disabled:opacity-50"
          >
            {changingPassword ? 'Updating...' : 'Update password'}
          </button>
        </form>

        <AppearanceSettings />
      </div>
    </DashboardLayout>
  )
}
