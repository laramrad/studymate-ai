import { useEffect, useRef, useState } from "react"
import {
  AlarmClock,
  CalendarDays,
  CheckCircle2,
  Circle,
  Trash2,
  Plus,
  ClipboardList,
} from "lucide-react"
import api from "../services/api"

function DeadlinesPage() {
  const dueDateRef = useRef(null)

  const [courses, setCourses] = useState([])
  const [deadlines, setDeadlines] = useState([])
  const [showForm, setShowForm] = useState(false)

  const [form, setForm] = useState({
    title: "",
    course_id: "",
    type: "Assignment",
    priority: "Medium",
    due_date: "",
    description: "",
  })

  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState("")
  const [success, setSuccess] = useState("")

  const fetchData = async () => {
    try {
      const [coursesResponse, deadlinesResponse] = await Promise.all([
        api.get("/courses"),
        api.get("/deadlines"),
      ])

      setCourses(coursesResponse.data.courses || [])
      setDeadlines(deadlinesResponse.data.deadlines || [])
    } catch (err) {
      setError("Could not load deadlines.")
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
      type: "Assignment",
      priority: "Medium",
      due_date: "",
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

      await api.post("/deadlines", payload)

      setSuccess("Deadline added successfully.")
      resetForm()
      setShowForm(false)
      fetchData()
    } catch (err) {
      if (err.response?.data?.message) {
        setError(err.response.data.message)
      } else {
        setError("Could not add deadline.")
      }
    } finally {
      setSaving(false)
    }
  }

  const handleToggleComplete = async (deadline) => {
    setError("")
    setSuccess("")

    try {
      await api.put(`/deadlines/${deadline.id}`, {
        ...deadline,
        is_completed: !deadline.is_completed,
      })

      fetchData()
    } catch (err) {
      setError("Could not update deadline.")
    }
  }

  const handleDelete = async (id) => {
    const confirmDelete = window.confirm("Are you sure you want to delete this deadline?")

    if (!confirmDelete) {
      return
    }

    setError("")
    setSuccess("")

    try {
      await api.delete(`/deadlines/${id}`)
      setSuccess("Deadline deleted successfully.")
      fetchData()
    } catch (err) {
      setError("Could not delete deadline.")
    }
  }

  const openDatePicker = () => {
    if (dueDateRef.current?.showPicker) {
      dueDateRef.current.showPicker()
    } else {
      dueDateRef.current?.focus()
    }
  }

  const activeDeadlines = deadlines.filter((deadline) => !deadline.is_completed)
  const completedDeadlines = deadlines.filter((deadline) => deadline.is_completed)

  if (loading) {
    return (
      <div className="rounded-3xl border border-slate-800 bg-slate-900 p-8 text-center text-slate-400">
        Loading deadlines...
      </div>
    )
  }

  return (
    <div>
      <div className="mb-8 flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold">Deadlines</h1>
          <p className="mt-2 text-slate-400">
            Track assignments, exams, projects, and presentations.
          </p>
        </div>

        <button
          type="button"
          onClick={() => setShowForm(!showForm)}
          className="rounded-2xl bg-indigo-500 px-6 py-3 font-semibold text-white hover:bg-indigo-600"
        >
          {showForm ? "Close Form" : "Add Deadline"}
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
          <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-cyan-500/10 text-cyan-300">
                <Plus size={22} />
              </div>

              <div>
                <h2 className="text-xl font-bold">Add New Deadline</h2>
                <p className="text-sm text-slate-400">
                  Add an academic task and track its progress.
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={() => setShowForm(false)}
              className="rounded-xl border border-slate-700 px-4 py-2 text-sm hover:bg-slate-800"
            >
              Close
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="grid gap-5 lg:grid-cols-2">
              <div>
                <label className="mb-2 block text-sm text-slate-300">
                  Title *
                </label>
                <input
                  type="text"
                  name="title"
                  value={form.title}
                  onChange={handleChange}
                  className="w-full rounded-xl border border-slate-700 bg-slate-950 px-4 py-3 outline-none focus:border-cyan-500"
                  placeholder="Database Assignment"
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
                  Type *
                </label>
                <select
                  name="type"
                  value={form.type}
                  onChange={handleChange}
                  className="w-full rounded-xl border border-slate-700 bg-slate-950 px-4 py-3 outline-none focus:border-cyan-500"
                  required
                >
                  <option value="Assignment">Assignment</option>
                  <option value="Exam">Exam</option>
                  <option value="Project">Project</option>
                  <option value="Presentation">Presentation</option>
                  <option value="Quiz">Quiz</option>
                  <option value="Other">Other</option>
                </select>
              </div>

              <div>
                <label className="mb-2 block text-sm text-slate-300">
                  Priority *
                </label>
                <select
                  name="priority"
                  value={form.priority}
                  onChange={handleChange}
                  className="w-full rounded-xl border border-slate-700 bg-slate-950 px-4 py-3 outline-none focus:border-cyan-500"
                  required
                >
                  <option value="Low">Low</option>
                  <option value="Medium">Medium</option>
                  <option value="High">High</option>
                </select>
              </div>

              <div>
                <label className="mb-2 block text-sm text-slate-300">
                  Due Date *
                </label>

                <div className="relative">
                  <input
                    ref={dueDateRef}
                    type="date"
                    name="due_date"
                    value={form.due_date}
                    onChange={handleChange}
                    className="w-full rounded-xl border border-slate-700 bg-slate-950 px-4 py-3 pr-14 outline-none focus:border-cyan-500"
                    required
                  />

                  <button
                    type="button"
                    onClick={openDatePicker}
                    className="absolute right-3 top-1/2 flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-lg bg-cyan-500/10 text-cyan-300 hover:bg-cyan-500/20"
                    title="Choose due date"
                  >
                    <CalendarDays size={18} />
                  </button>
                </div>
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
                placeholder="Extra notes about this deadline..."
              ></textarea>
            </div>

            <button
              type="submit"
              disabled={saving}
              className="rounded-xl bg-gradient-to-r from-sky-500 via-cyan-500 to-emerald-400 px-6 py-3 font-semibold text-white hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {saving ? "Saving..." : "Save Deadline"}
            </button>
          </form>
        </div>
      )}

      <div className="mb-8 grid gap-6 md:grid-cols-3">
        <StatCard
          title="All Deadlines"
          value={deadlines.length}
          icon={ClipboardList}
        />
        <StatCard
          title="Active"
          value={activeDeadlines.length}
          icon={AlarmClock}
        />
        <StatCard
          title="Completed"
          value={completedDeadlines.length}
          icon={CheckCircle2}
        />
      </div>

      {deadlines.length === 0 ? (
        <div className="rounded-3xl border border-dashed border-slate-700 bg-slate-900/50 p-10 text-center">
          <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-cyan-500/10 text-cyan-300">
            <AlarmClock size={28} />
          </div>
          <h2 className="text-xl font-bold">No deadlines yet</h2>
          <p className="mt-2 text-slate-400">
            Add your first deadline to start tracking academic tasks.
          </p>
        </div>
      ) : (
        <div className="grid gap-6 xl:grid-cols-2">
          {deadlines.map((deadline) => (
            <div
              key={deadline.id}
              className={`rounded-3xl border p-6 ${
                deadline.is_completed
                  ? "border-emerald-500/30 bg-emerald-500/5"
                  : "border-slate-800 bg-slate-900"
              }`}
            >
              <div className="mb-5 flex items-start justify-between gap-4">
                <div>
                  <div className="mb-3 flex flex-wrap gap-2">
                    <span className="rounded-full bg-cyan-500/10 px-3 py-1 text-xs font-semibold text-cyan-300">
                      {deadline.type}
                    </span>

                    <span className={`rounded-full px-3 py-1 text-xs font-semibold ${getPriorityClasses(deadline.priority)}`}>
                      {deadline.priority}
                    </span>

                    {deadline.course && (
                      <span className="rounded-full bg-indigo-500/10 px-3 py-1 text-xs font-semibold text-indigo-300">
                        {deadline.course.name}
                      </span>
                    )}
                  </div>

                  <h2 className={`text-xl font-bold ${deadline.is_completed ? "line-through opacity-70" : ""}`}>
                    {deadline.title}
                  </h2>

                  <p className="mt-3 inline-flex items-center gap-2 text-sm text-slate-400">
                    <CalendarDays size={16} />
                    Due: {formatDate(deadline.due_date)}
                  </p>
                </div>

                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => handleToggleComplete(deadline)}
                    className={`rounded-xl p-3 ${
                      deadline.is_completed
                        ? "bg-emerald-500/10 text-emerald-300 hover:bg-emerald-500 hover:text-white"
                        : "bg-slate-800 text-slate-300 hover:bg-slate-700"
                    }`}
                    title={deadline.is_completed ? "Mark as active" : "Mark as completed"}
                  >
                    {deadline.is_completed ? (
                      <CheckCircle2 size={18} />
                    ) : (
                      <Circle size={18} />
                    )}
                  </button>

                  <button
                    type="button"
                    onClick={() => handleDelete(deadline.id)}
                    className="rounded-xl bg-red-500/10 p-3 text-red-300 hover:bg-red-500 hover:text-white"
                    title="Delete deadline"
                  >
                    <Trash2 size={18} />
                  </button>
                </div>
              </div>

              {deadline.description && (
                <p className="rounded-2xl border border-slate-800 bg-slate-950 p-4 text-sm leading-6 text-slate-300">
                  {deadline.description}
                </p>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

function StatCard({ title, value, icon: Icon }) {
  return (
    <div className="rounded-3xl border border-slate-800 bg-slate-900 p-6">
      <div className="mb-5 flex items-center justify-between">
        <p className="text-sm text-slate-400">{title}</p>

        <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-cyan-500/10 text-cyan-300">
          <Icon size={22} />
        </div>
      </div>

      <p className="text-4xl font-bold">{value}</p>
    </div>
  )
}

function formatDate(dateValue) {
  if (!dateValue) {
    return "-"
  }

  return new Date(dateValue).toLocaleDateString()
}

function getPriorityClasses(priority) {
  if (priority === "High") {
    return "bg-red-500/10 text-red-300"
  }

  if (priority === "Medium") {
    return "bg-yellow-500/10 text-yellow-300"
  }

  return "bg-emerald-500/10 text-emerald-300"
}

export default DeadlinesPage