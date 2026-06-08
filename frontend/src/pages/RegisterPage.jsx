import { useEffect, useState } from "react"
import { useNavigate } from "react-router-dom"
import { CheckCircle2, Sparkles, Zap, Eye, EyeOff } from "lucide-react"
import api from "../services/api"

function RegisterPage() {
  const navigate = useNavigate()

  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    password_confirmation: "",
    plan: "free",
    billing_name: "",
    billing_email: "",
    card_number: "",
    expiry_date: "",
    cvc: "",
  })

  const [showPassword, setShowPassword] = useState(false)
  const [showVerifyPassword, setShowVerifyPassword] = useState(false)

  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")

  useEffect(() => {
    const token = localStorage.getItem("token")

    if (token) {
      navigate("/dashboard", { replace: true })
    }
  }, [navigate])

  const handleChange = (e) => {
    setForm({
      ...form,
      [e.target.name]: e.target.value,
    })
  }

  const selectPlan = (plan) => {
    setForm({
      ...form,
      plan,
    })
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError("")

    if (form.password !== form.password_confirmation) {
      setError("Password and verify password do not match.")
      setLoading(false)
      return
    }

    try {
      const payload = {
        name: form.name,
        email: form.email,
        password: form.password,
        plan: form.plan,
      }

      if (form.plan === "paid") {
        payload.billing_name = form.billing_name
        payload.billing_email = form.billing_email
        payload.card_number = form.card_number
        payload.expiry_date = form.expiry_date
        payload.cvc = form.cvc
      }

      const response = await api.post("/register", payload)

      localStorage.setItem("token", response.data.token)
      localStorage.setItem("user", JSON.stringify(response.data.user))

      navigate("/dashboard", { replace: true })
    } catch (err) {
      if (err.response?.data?.message) {
        setError(err.response.data.message)
      } else {
        setError("Something went wrong. Please try again.")
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-slate-950 px-6 py-10 text-white">
      <div className="mx-auto max-w-6xl">
        <div className="mb-10 text-center">
          <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-sky-500 via-cyan-500 to-emerald-400 font-bold text-white shadow-lg shadow-cyan-500/25">
            AI
          </div>

          <h1 className="text-4xl font-black">Create Account</h1>
          <p className="mt-2 text-slate-400">
            Choose your plan and start your AI-powered study journey.
          </p>
        </div>

        <div className="grid gap-8 lg:grid-cols-2">
          <div className="rounded-3xl border border-slate-800 bg-slate-900/80 p-8 shadow-2xl">
            <h2 className="text-2xl font-bold">Account Details</h2>
            <p className="mt-2 text-sm text-slate-400">
              Enter your information to create your StudyMate AI account.
            </p>

            {error && (
              <div className="mt-6 rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-300">
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="mt-6 space-y-5">
              <div>
                <label className="mb-2 block text-sm text-slate-300">Full Name</label>
                <input
                  type="text"
                  name="name"
                  value={form.name}
                  onChange={handleChange}
                  className="w-full rounded-xl border border-slate-700 bg-slate-950 px-4 py-3 outline-none focus:border-cyan-500"
                  placeholder="Test Student"
                  required
                />
              </div>

              <div>
                <label className="mb-2 block text-sm text-slate-300">Email</label>
                <input
                  type="email"
                  name="email"
                  value={form.email}
                  onChange={handleChange}
                  className="w-full rounded-xl border border-slate-700 bg-slate-950 px-4 py-3 outline-none focus:border-cyan-500"
                  placeholder="student@example.com"
                  required
                />
              </div>

              <div>
                <label className="mb-2 block text-sm text-slate-300">Password</label>

                <div className="relative">
                  <input
                    type={showPassword ? "text" : "password"}
                    name="password"
                    value={form.password}
                    onChange={handleChange}
                    className="w-full rounded-xl border border-slate-700 bg-slate-950 px-4 py-3 pr-12 outline-none focus:border-cyan-500"
                    placeholder="******"
                    required
                  />

                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-lg text-slate-400 hover:bg-slate-800 hover:text-cyan-300"
                    title={showPassword ? "Hide password" : "Show password"}
                  >
                    {showPassword ? <EyeOff size={19} /> : <Eye size={19} />}
                  </button>
                </div>
              </div>

              <div>
                <label className="mb-2 block text-sm text-slate-300">
                  Verify Password
                </label>

                <div className="relative">
                  <input
                    type={showVerifyPassword ? "text" : "password"}
                    name="password_confirmation"
                    value={form.password_confirmation}
                    onChange={handleChange}
                    className="w-full rounded-xl border border-slate-700 bg-slate-950 px-4 py-3 pr-12 outline-none focus:border-cyan-500"
                    placeholder="******"
                    required
                  />

                  <button
                    type="button"
                    onClick={() => setShowVerifyPassword(!showVerifyPassword)}
                    className="absolute right-3 top-1/2 flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-lg text-slate-400 hover:bg-slate-800 hover:text-cyan-300"
                    title={showVerifyPassword ? "Hide password" : "Show password"}
                  >
                    {showVerifyPassword ? <EyeOff size={19} /> : <Eye size={19} />}
                  </button>
                </div>

                {form.password_confirmation &&
                  form.password !== form.password_confirmation && (
                    <p className="mt-2 text-sm text-red-300">
                      Passwords do not match.
                    </p>
                  )}

                {form.password_confirmation &&
                  form.password === form.password_confirmation && (
                    <p className="mt-2 text-sm text-emerald-300">
                      Passwords match.
                    </p>
                  )}
              </div>

              {form.plan === "paid" && (
                <div className="rounded-3xl border border-cyan-500/20 bg-cyan-500/10 p-5">
                  <div className="mb-5">
                    <h3 className="text-lg font-bold">Billing Information</h3>
                    <p className="mt-1 text-sm text-slate-400">
                      Testing only. No real payment will be processed.
                    </p>
                  </div>

                  <div className="space-y-5">
                    <div>
                      <label className="mb-2 block text-sm text-slate-300">
                        Cardholder Name *
                      </label>
                      <input
                        type="text"
                        name="billing_name"
                        value={form.billing_name}
                        onChange={handleChange}
                        className="w-full rounded-xl border border-slate-700 bg-slate-950 px-4 py-3 outline-none focus:border-cyan-500"
                        placeholder="Test Student"
                        required={form.plan === "paid"}
                      />
                    </div>

                    <div>
                      <label className="mb-2 block text-sm text-slate-300">
                        Billing Email *
                      </label>
                      <input
                        type="email"
                        name="billing_email"
                        value={form.billing_email}
                        onChange={handleChange}
                        className="w-full rounded-xl border border-slate-700 bg-slate-950 px-4 py-3 outline-none focus:border-cyan-500"
                        placeholder="billing@example.com"
                        required={form.plan === "paid"}
                      />
                    </div>

                    <div>
                      <label className="mb-2 block text-sm text-slate-300">
                        Card Number *
                      </label>
                      <input
                        type="text"
                        name="card_number"
                        value={form.card_number}
                        onChange={handleChange}
                        className="w-full rounded-xl border border-slate-700 bg-slate-950 px-4 py-3 outline-none focus:border-cyan-500"
                        placeholder="4242 4242 4242 4242"
                        required={form.plan === "paid"}
                      />
                    </div>

                    <div className="grid gap-5 md:grid-cols-2">
                      <div>
                        <label className="mb-2 block text-sm text-slate-300">
                          Expiry Date *
                        </label>
                        <input
                          type="text"
                          name="expiry_date"
                          value={form.expiry_date}
                          onChange={handleChange}
                          className="w-full rounded-xl border border-slate-700 bg-slate-950 px-4 py-3 outline-none focus:border-cyan-500"
                          placeholder="12/28"
                          required={form.plan === "paid"}
                        />
                      </div>

                      <div>
                        <label className="mb-2 block text-sm text-slate-300">
                          CVC *
                        </label>
                        <input
                          type="password"
                          name="cvc"
                          value={form.cvc}
                          onChange={handleChange}
                          className="w-full rounded-xl border border-slate-700 bg-slate-950 px-4 py-3 outline-none focus:border-cyan-500"
                          placeholder="123"
                          required={form.plan === "paid"}
                        />
                      </div>
                    </div>
                  </div>
                </div>
              )}

              <button
                type="submit"
                disabled={loading}
                className="w-full rounded-xl bg-gradient-to-r from-sky-500 via-cyan-500 to-emerald-400 py-3 font-semibold text-white shadow-lg shadow-cyan-500/20 hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {loading
                  ? "Creating account..."
                  : `Register with ${form.plan === "paid" ? "Paid" : "Free"} Plan`}
              </button>
            </form>

            <p className="mt-6 text-center text-sm text-slate-400">
              Already have an account?{" "}
              <a href="/login" className="font-semibold text-cyan-400 hover:text-cyan-300">
                Login
              </a>
            </p>

            <p className="mt-4 text-center">
              <a href="/" className="text-sm text-slate-500 hover:text-slate-300">
                Back to home
              </a>
            </p>
          </div>

          <div className="space-y-5">
            <PlanCard
              selected={form.plan === "free"}
              icon={Sparkles}
              title="Free Plan"
              price="$0"
              subtitle="Good for testing and basic studying"
              features={[
                "2 courses",
                "3 uploaded materials",
                "5 generated quizzes",
                "30 flashcards",
                "5 deadlines",
                "2 study plans",
              ]}
              buttonText="Choose Free"
              onClick={() => selectPlan("free")}
            />

            <PlanCard
              selected={form.plan === "paid"}
              icon={Zap}
              title="Paid Plan"
              price="$9.99"
              subtitle="Best for full academic use"
              features={[
                "Unlimited courses",
                "Unlimited materials",
                "Unlimited quizzes",
                "Unlimited flashcards",
                "Unlimited deadlines",
                "Unlimited study plans",
                "Priority AI study tools",
                "Billing information required",
              ]}
              buttonText="Choose Paid"
              highlight
              onClick={() => selectPlan("paid")}
            />
          </div>
        </div>
      </div>
    </div>
  )
}

function PlanCard({
  selected,
  icon: Icon,
  title,
  price,
  subtitle,
  features,
  buttonText,
  highlight = false,
  onClick,
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`w-full rounded-3xl border p-6 text-left transition ${
        selected
          ? "border-cyan-400 bg-cyan-500/10 shadow-xl shadow-cyan-500/10"
          : "border-slate-800 bg-slate-900/80 hover:border-cyan-500/50"
      }`}
    >
      <div className="mb-5 flex items-start justify-between gap-4">
        <div className="flex items-center gap-3">
          <div
            className={`flex h-12 w-12 items-center justify-center rounded-2xl ${
              highlight ? "bg-emerald-500/10 text-emerald-300" : "bg-cyan-500/10 text-cyan-300"
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

      <div
        className={`mt-6 rounded-xl px-4 py-3 text-center text-sm font-semibold ${
          selected
            ? "bg-gradient-to-r from-sky-500 via-cyan-500 to-emerald-400 text-white"
            : "border border-slate-700 text-slate-300"
        }`}
      >
        {buttonText}
      </div>
    </button>
  )
}

export default RegisterPage