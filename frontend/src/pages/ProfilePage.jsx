import { useEffect, useState } from "react"
import {
  User,
  Mail,
  Lock,
  ShieldCheck,
  CreditCard,
  CheckCircle2,
  Sparkles,
  Zap,
  Crown,
  CalendarDays,
} from "lucide-react"
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

  const [loadingProfile, setLoadingProfile] = useState(false)
  const [loadingPassword, setLoadingPassword] = useState(false)
  const [loadingPlan, setLoadingPlan] = useState(false)

  const [success, setSuccess] = useState("")
  const [error, setError] = useState("")

  const currentPlan = user?.plan || "free"
  const billingStatus = user?.billing_status || "inactive"

  useEffect(() => {
    fetchUser()
  }, [])

  const fetchUser = async () => {
    try {
      const response = await api.get("/me")
      setUser(response.data.user)
      localStorage.setItem("user", JSON.stringify(response.data.user))

      setProfileForm({
        name: response.data.user.name || "",
        email: response.data.user.email || "",
      })
    } catch (err) {
      setError("Could not refresh profile information.")
    }
  }

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
    setLoadingProfile(true)
    setSuccess("")
    setError("")

    try {
      const response = await api.put("/profile", profileForm)

      setUser(response.data.user)
      localStorage.setItem("user", JSON.stringify(response.data.user))

      setSuccess("Profile updated successfully.")
    } catch (err) {
      if (err.response?.data?.message) {
        setError(err.response.data.message)
      } else {
        setError("Could not update profile.")
      }
    } finally {
      setLoadingProfile(false)
    }
  }

  const handlePasswordSubmit = async (e) => {
    e.preventDefault()
    setLoadingPassword(true)
    setSuccess("")
    setError("")

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
      setLoadingPassword(false)
    }
  }

  const handlePlanChange = async (plan) => {
    setLoadingPlan(true)
    setSuccess("")
    setError("")

    try {
      const response = await api.put("/subscription/plan", { plan })

      setUser(response.data.user)
      localStorage.setItem("user", JSON.stringify(response.data.user))

      setSuccess(response.data.message)
    } catch (err) {
      if (err.response?.data?.message) {
        setError(err.response.data.message)
      } else {
        setError("Could not update subscription plan.")
      }
    } finally {
      setLoadingPlan(false)
    }
  }

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-bold">Profile Settings</h1>
        <p className="mt-2 text-slate-400">
          Manage your account information, password, subscription, and billing.
        </p>
      </div>

      {success && (
        <div className="mb-6 rounded-xl border border-emerald-500/30 bg-emerald-500/10 px-4 py-3 text-sm text-emerald-300">
          {success}
        </div>
      )}

      {error && (
        <div className="mb-6 rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-300">
          {error}
        </div>
      )}

      <div className="grid gap-6 xl:grid-cols-3">
        <div className="rounded-3xl border border-slate-800 bg-slate-900 p-6 xl:col-span-1">
          <div className="flex flex-col items-center text-center">
            <div className="flex h-24 w-24 items-center justify-center rounded-3xl bg-gradient-to-br from-sky-500 via-cyan-500 to-emerald-400 text-4xl font-black text-white shadow-lg shadow-cyan-500/20">
              {user?.name?.charAt(0)?.toUpperCase() || "S"}
            </div>

            <h2 className="mt-5 text-2xl font-bold">{user?.name || "User"}</h2>
            <p className="mt-1 text-sm text-slate-400">{user?.email}</p>

            <div className="mt-4 flex flex-wrap justify-center gap-2">
              <span className="rounded-full bg-cyan-500/10 px-3 py-1 text-xs font-semibold capitalize text-cyan-300">
                {user?.role || "student"}
              </span>

              <span
                className={`rounded-full px-3 py-1 text-xs font-semibold capitalize ${
                  currentPlan === "paid"
                    ? "bg-emerald-500/10 text-emerald-300"
                    : "bg-slate-700/60 text-slate-300"
                }`}
              >
                {currentPlan} plan
              </span>
            </div>
          </div>

          <div className="mt-8 space-y-3 rounded-2xl bg-slate-950 p-4">
            <InfoRow label="User ID" value={user?.id} />
            <InfoRow label="Role" value={user?.role || "student"} />
            <InfoRow label="Email" value={user?.email} />
            <InfoRow label="Current Plan" value={currentPlan} />
            <InfoRow label="Billing Status" value={billingStatus} />
          </div>
        </div>

        <div className="space-y-6 xl:col-span-2">
          <div className="rounded-3xl border border-slate-800 bg-slate-900 p-6">
            <div className="mb-6 flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-cyan-500/10 text-cyan-300">
                <User size={22} />
              </div>

              <div>
                <h2 className="text-xl font-bold">Update Profile</h2>
                <p className="text-sm text-slate-400">
                  Change your name or email address.
                </p>
              </div>
            </div>

            <form onSubmit={handleProfileSubmit} className="space-y-5">
              <Input
                label="Full Name"
                name="name"
                value={profileForm.name}
                onChange={handleProfileChange}
                icon={User}
                required
              />

              <Input
                label="Email"
                name="email"
                type="email"
                value={profileForm.email}
                onChange={handleProfileChange}
                icon={Mail}
                required
              />

              <button
                type="submit"
                disabled={loadingProfile}
                className="rounded-xl bg-cyan-500 px-6 py-3 font-semibold text-white hover:bg-cyan-600 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {loadingProfile ? "Saving..." : "Save Profile"}
              </button>
            </form>
          </div>

          <div className="rounded-3xl border border-slate-800 bg-slate-900 p-6">
            <div className="mb-6 flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-purple-500/10 text-purple-300">
                <Lock size={22} />
              </div>

              <div>
                <h2 className="text-xl font-bold">Change Password</h2>
                <p className="text-sm text-slate-400">
                  Enter your current password and choose a new one.
                </p>
              </div>
            </div>

            <form onSubmit={handlePasswordSubmit} className="space-y-5">
              <Input
                label="Current Password"
                name="current_password"
                type="password"
                value={passwordForm.current_password}
                onChange={handlePasswordChange}
                icon={Lock}
                required
              />

              <Input
                label="New Password"
                name="new_password"
                type="password"
                value={passwordForm.new_password}
                onChange={handlePasswordChange}
                icon={ShieldCheck}
                required
              />

              <button
                type="submit"
                disabled={loadingPassword}
                className="rounded-xl bg-purple-500 px-6 py-3 font-semibold text-white hover:bg-purple-600 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {loadingPassword ? "Changing..." : "Change Password"}
              </button>
            </form>
          </div>
        </div>
      </div>

      <div className="mt-8 rounded-3xl border border-slate-800 bg-slate-900 p-6">
        <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
          <div>
            <div className="mb-2 flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-emerald-500/10 text-emerald-300">
                <CreditCard size={22} />
              </div>

              <div>
                <h2 className="text-xl font-bold">Subscription & Billing</h2>
                <p className="text-sm text-slate-400">
                  This is a testing billing system only. No real payment is processed.
                </p>
              </div>
            </div>
          </div>

          <span
            className={`rounded-full px-4 py-2 text-sm font-semibold capitalize ${
              currentPlan === "paid"
                ? "bg-emerald-500/10 text-emerald-300"
                : "bg-slate-800 text-slate-300"
            }`}
          >
            Current: {currentPlan} plan
          </span>
        </div>

        <div className="grid gap-6 lg:grid-cols-2">
          <SubscriptionCard
            selected={currentPlan === "free"}
            icon={Sparkles}
            title="Free Plan"
            price="$0"
            subtitle="For basic study testing"
            features={[
              "2 courses",
              "3 uploaded materials",
              "5 generated quizzes",
              "30 flashcards",
              "5 deadlines",
              "2 study plans",
            ]}
            buttonText={currentPlan === "free" ? "Current Plan" : "Downgrade to Free"}
            disabled={currentPlan === "free" || loadingPlan}
            onClick={() => handlePlanChange("free")}
          />

          <SubscriptionCard
            selected={currentPlan === "paid"}
            icon={Crown}
            title="Paid Plan"
            price="$9.99"
            subtitle="Testing upgrade with premium access"
            features={[
              "Unlimited courses",
              "Unlimited materials",
              "Unlimited quizzes",
              "Unlimited flashcards",
              "Unlimited deadlines",
              "Unlimited study plans",
              "Priority AI study tools",
            ]}
            buttonText={currentPlan === "paid" ? "Current Plan" : "Upgrade to Paid"}
            disabled={currentPlan === "paid" || loadingPlan}
            highlight
            onClick={() => handlePlanChange("paid")}
          />
        </div>

        <div className="mt-6 rounded-2xl border border-cyan-500/20 bg-cyan-500/10 p-5">
          <div className="mb-3 flex items-center gap-2">
            <Zap className="text-cyan-300" size={20} />
            <h3 className="font-bold">Fake Billing Preview</h3>
          </div>

          <div className="grid gap-4 md:grid-cols-3">
            <BillingInfo
              icon={CreditCard}
              label="Payment Method"
              value={currentPlan === "paid" ? "Test Visa **** 4242" : "No card required"}
            />

            <BillingInfo
              icon={CalendarDays}
              label="Billing Cycle"
              value={currentPlan === "paid" ? "Monthly testing plan" : "Free forever"}
            />

            <BillingInfo
              icon={CheckCircle2}
              label="Status"
              value={currentPlan === "paid" ? "Active test subscription" : "Inactive billing"}
            />
          </div>
        </div>
      </div>
    </div>
  )
}

function Input({ label, icon: Icon, type = "text", ...props }) {
  return (
    <div>
      <label className="mb-2 block text-sm text-slate-300">{label}</label>

      <div className="relative">
        {Icon && (
          <Icon className="absolute left-4 top-3.5 text-slate-500" size={18} />
        )}

        <input
          type={type}
          {...props}
          className={`w-full rounded-xl border border-slate-700 bg-slate-950 px-4 py-3 outline-none focus:border-cyan-500 ${
            Icon ? "pl-11" : ""
          }`}
        />
      </div>
    </div>
  )
}

function InfoRow({ label, value }) {
  return (
    <div className="flex items-center justify-between border-b border-slate-800 py-3 last:border-b-0">
      <span className="text-sm text-slate-400">{label}</span>
      <span className="text-sm font-semibold capitalize">{value || "-"}</span>
    </div>
  )
}

function SubscriptionCard({
  selected,
  icon: Icon,
  title,
  price,
  subtitle,
  features,
  buttonText,
  disabled,
  highlight = false,
  onClick,
}) {
  return (
    <div
      className={`rounded-3xl border p-6 ${
        selected
          ? "border-cyan-400 bg-cyan-500/10"
          : "border-slate-800 bg-slate-950"
      }`}
    >
      <div className="mb-5 flex items-start justify-between gap-4">
        <div className="flex items-center gap-3">
          <div
            className={`flex h-12 w-12 items-center justify-center rounded-2xl ${
              highlight
                ? "bg-emerald-500/10 text-emerald-300"
                : "bg-cyan-500/10 text-cyan-300"
            }`}
          >
            <Icon size={24} />
          </div>

          <div>
            <h3 className="text-xl font-bold">{title}</h3>
            <p className="text-sm text-slate-400">{subtitle}</p>
          </div>
        </div>

        {selected && <CheckCircle2 className="text-cyan-300" size={24} />}
      </div>

      <div className="mb-5">
        <span className="text-4xl font-black">{price}</span>
        {title === "Paid Plan" && <span className="text-slate-400"> / month</span>}
      </div>

      <div className="space-y-3">
        {features.map((feature) => (
          <div key={feature} className="flex items-center gap-2 text-sm text-slate-300">
            <CheckCircle2 size={17} className="text-emerald-300" />
            {feature}
          </div>
        ))}
      </div>

      <button
        type="button"
        onClick={onClick}
        disabled={disabled}
        className={`mt-6 w-full rounded-xl px-4 py-3 text-center text-sm font-semibold disabled:cursor-not-allowed disabled:opacity-60 ${
          selected
            ? "bg-slate-800 text-slate-400"
            : "bg-gradient-to-r from-sky-500 via-cyan-500 to-emerald-400 text-white hover:opacity-90"
        }`}
      >
        {buttonText}
      </button>
    </div>
  )
}

function BillingInfo({ icon: Icon, label, value }) {
  return (
    <div className="rounded-2xl border border-slate-800 bg-slate-950 p-4">
      <div className="mb-2 flex items-center gap-2">
        <Icon className="text-cyan-300" size={18} />
        <p className="text-sm font-semibold">{label}</p>
      </div>

      <p className="text-sm text-slate-400">{value}</p>
    </div>
  )
}

export default ProfilePage