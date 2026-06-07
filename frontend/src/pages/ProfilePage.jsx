import { useEffect, useState } from "react"
import api from "../services/api"

function ProfilePage() {
  const storedUser = JSON.parse(localStorage.getItem("user"))

  const [user, setUser] = useState(storedUser)
  const [profileForm, setProfileForm] = useState({
    name: storedUser?.name || "",
    email: storedUser?.email || "",
  })

  const [passwordForm, setPasswordForm] = useState({
    current_password: "",
    new_password: "",
  })

  const [loading, setLoading] = useState(true)
  const [savingProfile, setSavingProfile] = useState(false)
  const [savingPassword, setSavingPassword] = useState(false)
  const [error, setError] = useState("")
  const [success, setSuccess] = useState("")

  const fetchUser = async () => {
    try {
      const response = await api.get("/me")

      setUser(response.data.user)
      setProfileForm({
        name: response.data.user.name,
        email: response.data.user.email,
      })

      localStorage.setItem("user", JSON.stringify(response.data.user))
    } catch (err) {
      setError("Could not load profile.")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchUser()
  }, [])

  const handleProfileChange = (e) => {
    setProfileForm({
      ...profileForm,
      [e.target.name]: e.target.value,
    })
  }

  const handlePasswordChange = (e) => {
    setPasswordForm({
      ...passwordForm,
      [e.target.name]: e.target.value,
    })
  }

  const handleProfileSubmit = async (e) => {
    e.preventDefault()
    setSavingProfile(true)
    setError("")
    setSuccess("")

    try {
      const response = await api.put("/profile", profileForm)

      setUser(response.data.user)
      localStorage.setItem("user", JSON.stringify(response.data.user))

      setSuccess("Profile updated successfully. Refresh the page if the sidebar name does not update immediately.")
    } catch (err) {
      if (err.response?.data?.message) {
        setError(err.response.data.message)
      } else {
        setError("Could not update profile.")
      }
    } finally {
      setSavingProfile(false)
    }
  }

  const handlePasswordSubmit = async (e) => {
    e.preventDefault()
    setSavingPassword(true)
    setError("")
    setSuccess("")

    try {
      await api.put("/change-password", passwordForm)

      setPasswordForm({
        current_password: "",
        new_password: "",
      })

      setSuccess("Password changed successfully.")
    } catch (err) {
      if (err.response?.data?.message) {
        setError(err.response.data.message)
      } else {
        setError("Could not change password.")
      }
    } finally {
      setSavingPassword(false)
    }
  }

  if (loading) {
    return (
      <div className="rounded-3xl border border-slate-800 bg-slate-900 p-8 text-center text-slate-400">
        Loading profile...
      </div>
    )
  }

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-bold">Profile Settings</h1>
        <p className="mt-2 text-slate-400">
          Manage your account information and password.
        </p>
      </div>

      {error && (
        <div className="mb-6 rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-300">
          {error}
        </div>
      )}

      {success && (
        <div className="mb-6 rounded-xl border border-green-500/30 bg-green-500/10 px-4 py-3 text-sm text-green-300">
          {success}
        </div>
      )}

      <div className="grid gap-6 xl:grid-cols-3">
        <div className="rounded-3xl border border-slate-800 bg-slate-900 p-6">
          <div className="flex flex-col items-center text-center">
            <div className="flex h-24 w-24 items-center justify-center rounded-3xl bg-indigo-500 text-4xl font-bold">
              {user?.name?.charAt(0)?.toUpperCase() || "U"}
            </div>

            <h2 className="mt-5 text-2xl font-bold">{user?.name}</h2>
            <p className="mt-1 text-slate-400">{user?.email}</p>

            <span className="mt-4 rounded-full bg-indigo-500/10 px-4 py-2 text-sm capitalize text-indigo-300">
              {user?.role}
            </span>
          </div>

          <div className="mt-8 space-y-3 rounded-2xl bg-slate-950 p-5 text-sm text-slate-400">
            <InfoRow label="User ID" value={user?.id} />
            <InfoRow label="Role" value={user?.role} />
            <InfoRow label="Email" value={user?.email} />
          </div>
        </div>

        <div className="rounded-3xl border border-slate-800 bg-slate-900 p-6 xl:col-span-2">
          <h2 className="text-xl font-bold">Update Profile</h2>
          <p className="mt-2 text-sm text-slate-400">
            Change your name or email address.
          </p>

          <form onSubmit={handleProfileSubmit} className="mt-6 space-y-5">
            <div>
              <label className="mb-2 block text-sm text-slate-300">Full Name</label>
              <input
                type="text"
                name="name"
                value={profileForm.name}
                onChange={handleProfileChange}
                className="w-full rounded-xl border border-slate-700 bg-slate-950 px-4 py-3 outline-none focus:border-indigo-500"
                required
              />
            </div>

            <div>
              <label className="mb-2 block text-sm text-slate-300">Email</label>
              <input
                type="email"
                name="email"
                value={profileForm.email}
                onChange={handleProfileChange}
                className="w-full rounded-xl border border-slate-700 bg-slate-950 px-4 py-3 outline-none focus:border-indigo-500"
                required
              />
            </div>

            <button
              type="submit"
              disabled={savingProfile}
              className="rounded-xl bg-indigo-500 px-6 py-3 font-semibold hover:bg-indigo-600 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {savingProfile ? "Saving..." : "Save Profile"}
            </button>
          </form>

          <div className="my-8 border-t border-slate-800"></div>

          <h2 className="text-xl font-bold">Change Password</h2>
          <p className="mt-2 text-sm text-slate-400">
            Enter your current password and choose a new one.
          </p>

          <form onSubmit={handlePasswordSubmit} className="mt-6 space-y-5">
            <div>
              <label className="mb-2 block text-sm text-slate-300">Current Password</label>
              <input
                type="password"
                name="current_password"
                value={passwordForm.current_password}
                onChange={handlePasswordChange}
                className="w-full rounded-xl border border-slate-700 bg-slate-950 px-4 py-3 outline-none focus:border-indigo-500"
                required
              />
            </div>

            <div>
              <label className="mb-2 block text-sm text-slate-300">New Password</label>
              <input
                type="password"
                name="new_password"
                value={passwordForm.new_password}
                onChange={handlePasswordChange}
                className="w-full rounded-xl border border-slate-700 bg-slate-950 px-4 py-3 outline-none focus:border-indigo-500"
                minLength="6"
                required
              />
            </div>

            <button
              type="submit"
              disabled={savingPassword}
              className="rounded-xl bg-purple-500 px-6 py-3 font-semibold hover:bg-purple-600 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {savingPassword ? "Changing..." : "Change Password"}
            </button>
          </form>
        </div>
      </div>
    </div>
  )
}

function InfoRow({ label, value }) {
  return (
    <div className="flex justify-between gap-4 border-b border-slate-800 pb-3 last:border-0 last:pb-0">
      <span>{label}</span>
      <span className="font-semibold text-slate-200">{value}</span>
    </div>
  )
}

export default ProfilePage