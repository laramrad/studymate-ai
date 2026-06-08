import { useEffect, useRef, useState } from "react"
import {
  CalendarDays,
  ClipboardList,
  Trash2,
  BookOpen,
  Clock,
  Sparkles,
  CalendarCheck,
} from "lucide-react"
import api from "../services/api"

function StudyPlannerPage() {
  const examDateRef = useRef(null)

  const [courses, setCourses] = useState([])
  const [plans, setPlans] = useState([])
  const [showForm, setShowForm] = useState(false)

  const [form, setForm] = useState({
    title: "",
    course_id: "",
    exam_date: "",
    hours_per_day: 2,
    difficulty: "Medium",
    description: "",
  })

  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState("")
  const [success, setSuccess] = useState("")

  const fetchData = async () => {
    try {
      const [coursesResponse, plansResponse] = await Promise.all([
        api.get("/courses"),
        api.get("/study-plans"),
      ])

      setCourses(coursesResponse.data.courses || [])
      setPlans(plansResponse.data.study_plans || plansResponse.data.studyPlans || [])
    } catch (err) {
      setError("Could not load study plans.")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchData()
  }, [])

  const handleChange = (e) => {
    setForm({
      ...form,
      [e.target.name]: e.target.value,
    })
  }

  const resetForm = () => {
    setForm({
      title: "",
      course_id: "",
      exam_date: "",
      hours_per_day: 2,
      difficulty: "Medium",
      description: "",
    })
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setSaving(true)
    setError("")
    setSuccess("")

    try {
      const payload = {
        ...form,
        course_id: form.course_id || null,
      }

      await api.post("/study-plans", payload)

      setSuccess("Study plan generated successfully.")
      resetForm()
      setShowForm(false)
      fetchData()
    } catch (err) {
      if (err.response?.data?.message) {
        setError(err.response.data.message)
      } else {
        setError("Could not generate study plan.")
      }
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async (id) => {
    const confirmDelete = window.confirm("Are you sure you want to delete this study plan?")

    if (!confirmDelete) {
      return
    }

    setError("")
    setSuccess("")

    try {
      await api.delete(`/study-plans/${id}`)
      setSuccess("Study plan deleted successfully.")
      fetchData()
    } catch (err) {
      setError("Could not delete study plan.")
    }
  }

  const openDatePicker = () => {
    if (examDateRef.current?.showPicker) {
      examDateRef.current.showPicker()
    } else {
      examDateRef.current?.focus()
    }
  }

  if (loading) {
    return (
      <div className="rounded-3xl border border-slate-800 bg-slate-900 p-8 text-center text-slate-400">
        Loading study planner...
      </div>
    )
  }

  return (
    <div>
      <div className="mb-8 flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold">Study Planner</h1>
          <p className="mt-2 text-slate-400">
            Generate a smart study plan based on your exam date and available study time.
          </p>
        </div>

        <button
          type="button"
          onClick={() => setShowForm(!showForm)}
          className="rounded-2xl bg-indigo-500 px-6 py-3 font-semibold text-white hover:bg-indigo-600"
        >
          {showForm ? "Close Form" : "Generate Plan"}
        </button>
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

      {showForm && (
        <div className="mb-8 rounded-3xl border border-slate-800 bg-slate-900 p-6">
          <div className="mb-6 flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-cyan-500/10 text-cyan-300">
              <Sparkles size={22} />
            </div>

            <div>
              <h2 className="text-xl font-bold">Generate New Plan</h2>
              <p className="text-sm text-slate-400">
                Fill in your exam details to create a study schedule.
              </p>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="grid gap-5 lg:grid-cols-2">
              <div>
                <label className="mb-2 block text-sm text-slate-300">
                  Plan Title *
                </label>
                <input
                  type="text"
                  name="title"
                  value={form.title}
                  onChange={handleChange}
                  className="w-full rounded-xl border border-slate-700 bg-slate-950 px-4 py-3 outline-none focus:border-cyan-500"
                  placeholder="Database Final Exam Plan"
                  required
                />
              </div>

              <div>
                <label className="mb-2 block text-sm text-slate-300">
                  Course
                </label>
                <select
                  name="course_id"
                  value={form.course_id}
                  onChange={handleChange}
                  className="w-full rounded-xl border border-slate-700 bg-slate-950 px-4 py-3 outline-none focus:border-cyan-500"
                >
                  <option value="">No course</option>
                  {courses.map((course) => (
                    <option key={course.id} value={course.id}>
                      {course.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="mb-2 block text-sm text-slate-300">
                  Exam Date *
                </label>

                <div className="relative">
                  <input
                    ref={examDateRef}
                    type="date"
                    name="exam_date"
                    value={form.exam_date}
                    onChange={handleChange}
                    className="w-full rounded-xl border border-slate-700 bg-slate-950 px-4 py-3 pr-14 outline-none focus:border-cyan-500"
                    required
                  />

                  <button
                    type="button"
                    onClick={openDatePicker}
                    className="absolute right-3 top-1/2 flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-lg bg-cyan-500/10 text-cyan-300 hover:bg-cyan-500/20"
                    title="Choose exam date"
                  >
                    <CalendarDays size={18} />
                  </button>
                </div>
              </div>

              <div>
                <label className="mb-2 block text-sm text-slate-300">
                  Hours Per Day *
                </label>
                <input
                  type="number"
                  name="hours_per_day"
                  min="1"
                  max="12"
                  value={form.hours_per_day}
                  onChange={handleChange}
                  className="w-full rounded-xl border border-slate-700 bg-slate-950 px-4 py-3 outline-none focus:border-cyan-500"
                  required
                />
              </div>

              <div>
                <label className="mb-2 block text-sm text-slate-300">
                  Difficulty *
                </label>
                <select
                  name="difficulty"
                  value={form.difficulty}
                  onChange={handleChange}
                  className="w-full rounded-xl border border-slate-700 bg-slate-950 px-4 py-3 outline-none focus:border-cyan-500"
                  required
                >
                  <option value="Easy">Easy</option>
                  <option value="Medium">Medium</option>
                  <option value="Hard">Hard</option>
                </select>
              </div>
            </div>

            <div>
              <label className="mb-2 block text-sm text-slate-300">
                Description
              </label>
              <textarea
                name="description"
                value={form.description}
                onChange={handleChange}
                rows="5"
                className="w-full rounded-xl border border-slate-700 bg-slate-950 px-4 py-3 outline-none focus:border-cyan-500"
                placeholder="Extra notes about what you need to study..."
              ></textarea>
            </div>

            <button
              type="submit"
              disabled={saving}
              className="rounded-xl bg-gradient-to-r from-sky-500 via-cyan-500 to-emerald-400 px-6 py-3 font-semibold text-white hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {saving ? "Generating..." : "Generate Study Plan"}
            </button>
          </form>
        </div>
      )}

      {plans.length === 0 ? (
        <div className="rounded-3xl border border-dashed border-slate-700 bg-slate-900/50 p-10 text-center">
          <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-cyan-500/10 text-cyan-300">
            <ClipboardList size={28} />
          </div>
          <h2 className="text-xl font-bold">No study plans yet</h2>
          <p className="mt-2 text-slate-400">
            Generate your first plan to organize your exam preparation.
          </p>
        </div>
      ) : (
        <div className="grid gap-6 xl:grid-cols-2">
          {plans.map((plan) => (
            <div
              key={plan.id}
              className="rounded-3xl border border-slate-800 bg-slate-900 p-6"
            >
              <div className="mb-5 flex items-start justify-between gap-4">
                <div>
                  <div className="mb-3 flex flex-wrap gap-2">
                    <span className="rounded-full bg-cyan-500/10 px-3 py-1 text-xs font-semibold text-cyan-300">
                      {plan.difficulty || "Medium"}
                    </span>

                    {plan.course && (
                      <span className="rounded-full bg-indigo-500/10 px-3 py-1 text-xs font-semibold text-indigo-300">
                        {plan.course.name}
                      </span>
                    )}
                  </div>

                  <h2 className="text-xl font-bold">{plan.title}</h2>

                  <div className="mt-3 flex flex-wrap gap-4 text-sm text-slate-400">
                    <span className="inline-flex items-center gap-2">
                      <CalendarCheck size={16} />
                      Exam: {formatDate(plan.exam_date)}
                    </span>

                    <span className="inline-flex items-center gap-2">
                      <Clock size={16} />
                      {plan.hours_per_day} hours/day
                    </span>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => handleDelete(plan.id)}
                  className="rounded-xl bg-red-500/10 p-3 text-red-300 hover:bg-red-500 hover:text-white"
                  title="Delete study plan"
                >
                  <Trash2 size={18} />
                </button>
              </div>

              {plan.description && (
                <p className="mb-5 rounded-2xl border border-slate-800 bg-slate-950 p-4 text-sm leading-6 text-slate-300">
                  {plan.description}
                </p>
              )}

              {plan.generated_plan && (
                <div className="rounded-2xl border border-slate-800 bg-slate-950 p-4">
                  <h3 className="mb-3 flex items-center gap-2 font-bold">
                    <BookOpen className="text-cyan-300" size={18} />
                    Generated Plan
                  </h3>

                  <pre className="whitespace-pre-wrap text-sm leading-7 text-slate-300">
                    {plan.generated_plan}
                  </pre>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

function formatDate(dateValue) {
  if (!dateValue) {
    return "-"
  }

  return new Date(dateValue).toLocaleDateString()
}

export default StudyPlannerPage