import { useEffect, useState } from "react"
import api from "../services/api"

function DeadlinesPage() {
  const [deadlines, setDeadlines] = useState([])
  const [courses, setCourses] = useState([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState("")
  const [success, setSuccess] = useState("")
  const [showForm, setShowForm] = useState(false)
  const [editingDeadline, setEditingDeadline] = useState(null)

  const [form, setForm] = useState({
    course_id: "",
    title: "",
    type: "Assignment",
    due_date: "",
    priority: "Medium",
    description: "",
  })

  const fetchData = async () => {
    try {
      const [deadlinesResponse, coursesResponse] = await Promise.all([
        api.get("/deadlines"),
        api.get("/courses"),
      ])

      setDeadlines(deadlinesResponse.data.deadlines)
      setCourses(coursesResponse.data.courses)
    } catch (err) {
      setError("Could not load deadlines.")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchData()
  }, [])

  const resetForm = () => {
    setForm({
      course_id: "",
      title: "",
      type: "Assignment",
      due_date: "",
      priority: "Medium",
      description: "",
    })

    setEditingDeadline(null)
  }

  const handleOpenCreate = () => {
    resetForm()
    setShowForm(true)
  }

  const handleEdit = (deadline) => {
    setEditingDeadline(deadline)

    setForm({
      course_id: deadline.course_id || "",
      title: deadline.title,
      type: deadline.type,
      due_date: deadline.due_date?.slice(0, 10) || "",
      priority: deadline.priority,
      description: deadline.description || "",
    })

    setShowForm(true)
    window.scrollTo({ top: 0, behavior: "smooth" })
  }

  const handleChange = (e) => {
    setForm({
      ...form,
      [e.target.name]: e.target.value,
    })
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setSaving(true)
    setError("")
    setSuccess("")

    try {
      if (editingDeadline) {
        const response = await api.put(`/deadlines/${editingDeadline.id}`, {
          ...form,
          course_id: form.course_id || null,
          is_completed: editingDeadline.is_completed,
        })

        setDeadlines(
          deadlines.map((deadline) =>
            deadline.id === editingDeadline.id ? response.data.deadline : deadline
          )
        )

        setSuccess("Deadline updated successfully.")
      } else {
        const response = await api.post("/deadlines", {
          ...form,
          course_id: form.course_id || null,
        })

        setDeadlines([...deadlines, response.data.deadline])
        setSuccess("Deadline created successfully.")
      }

      resetForm()
      setShowForm(false)
    } catch (err) {
      if (err.response?.data?.message) {
        setError(err.response.data.message)
      } else {
        setError("Could not save deadline.")
      }
    } finally {
      setSaving(false)
    }
  }

  const handleToggle = async (deadlineId) => {
    try {
      const response = await api.patch(`/deadlines/${deadlineId}/toggle`)

      setDeadlines(
        deadlines.map((deadline) =>
          deadline.id === deadlineId ? response.data.deadline : deadline
        )
      )
    } catch (err) {
      setError("Could not update deadline status.")
    }
  }

  const handleDelete = async (deadlineId) => {
    const confirmed = window.confirm("Are you sure you want to delete this deadline?")

    if (!confirmed) return

    try {
      await api.delete(`/deadlines/${deadlineId}`)
      setDeadlines(deadlines.filter((deadline) => deadline.id !== deadlineId))
      setSuccess("Deadline deleted successfully.")
    } catch (err) {
      setError("Could not delete deadline.")
    }
  }

  const activeDeadlines = deadlines.filter((deadline) => !deadline.is_completed)
  const completedDeadlines = deadlines.filter((deadline) => deadline.is_completed)

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
          onClick={handleOpenCreate}
          className="rounded-2xl bg-indigo-500 px-5 py-3 font-semibold hover:bg-indigo-600"
        >
          Add Deadline
        </button>
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

      {showForm && (
        <form
          onSubmit={handleSubmit}
          className="mb-8 rounded-3xl border border-slate-800 bg-slate-900 p-6"
        >
          <div className="mb-5 flex items-center justify-between gap-4">
            <h2 className="text-xl font-bold">
              {editingDeadline ? "Edit Deadline" : "Add New Deadline"}
            </h2>

            <button
              type="button"
              onClick={() => {
                resetForm()
                setShowForm(false)
              }}
              className="rounded-xl border border-slate-700 px-4 py-2 text-sm hover:bg-slate-800"
            >
              Close
            </button>
          </div>

          <div className="grid gap-5 md:grid-cols-2">
            <div>
              <label className="mb-2 block text-sm text-slate-300">Title *</label>
              <input
                type="text"
                name="title"
                value={form.title}
                onChange={handleChange}
                className="w-full rounded-xl border border-slate-700 bg-slate-950 px-4 py-3 outline-none focus:border-indigo-500"
                placeholder="Database Assignment"
                required
              />
            </div>

            <div>
              <label className="mb-2 block text-sm text-slate-300">Course</label>
              <select
                name="course_id"
                value={form.course_id}
                onChange={handleChange}
                className="w-full rounded-xl border border-slate-700 bg-slate-950 px-4 py-3 outline-none focus:border-indigo-500"
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
              <label className="mb-2 block text-sm text-slate-300">Type *</label>
              <select
                name="type"
                value={form.type}
                onChange={handleChange}
                className="w-full rounded-xl border border-slate-700 bg-slate-950 px-4 py-3 outline-none focus:border-indigo-500"
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
              <label className="mb-2 block text-sm text-slate-300">Priority *</label>
              <select
                name="priority"
                value={form.priority}
                onChange={handleChange}
                className="w-full rounded-xl border border-slate-700 bg-slate-950 px-4 py-3 outline-none focus:border-indigo-500"
                required
              >
                <option value="Low">Low</option>
                <option value="Medium">Medium</option>
                <option value="High">High</option>
              </select>
            </div>

            <div>
              <label className="mb-2 block text-sm text-slate-300">Due Date *</label>
              <input
                type="date"
                name="due_date"
                value={form.due_date}
                onChange={handleChange}
                className="w-full rounded-xl border border-slate-700 bg-slate-950 px-4 py-3 outline-none focus:border-indigo-500"
                required
              />
            </div>
          </div>

          <div className="mt-5">
            <label className="mb-2 block text-sm text-slate-300">Description</label>
            <textarea
              name="description"
              value={form.description}
              onChange={handleChange}
              rows="4"
              className="w-full rounded-xl border border-slate-700 bg-slate-950 px-4 py-3 outline-none focus:border-indigo-500"
              placeholder="Extra notes about this deadline..."
            ></textarea>
          </div>

          <button
            type="submit"
            disabled={saving}
            className="mt-5 rounded-xl bg-indigo-500 px-6 py-3 font-semibold hover:bg-indigo-600 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {saving ? "Saving..." : editingDeadline ? "Update Deadline" : "Save Deadline"}
          </button>
        </form>
      )}

      <div className="mb-8 grid gap-6 md:grid-cols-3">
        <StatCard title="Active Deadlines" value={activeDeadlines.length} />
        <StatCard title="Completed" value={completedDeadlines.length} />
        <StatCard title="Total" value={deadlines.length} />
      </div>

      {loading ? (
        <div className="rounded-3xl border border-slate-800 bg-slate-900 p-8 text-center text-slate-400">
          Loading deadlines...
        </div>
      ) : deadlines.length === 0 ? (
        <div className="rounded-3xl border border-dashed border-slate-700 bg-slate-900/60 p-12 text-center">
          <p className="text-xl font-bold">No deadlines yet</p>
          <p className="mt-2 text-slate-400">
            Add your first assignment, exam, project, or presentation deadline.
          </p>
        </div>
      ) : (
        <div className="space-y-8">
          <DeadlineSection
            title="Active Deadlines"
            deadlines={activeDeadlines}
            onToggle={handleToggle}
            onEdit={handleEdit}
            onDelete={handleDelete}
          />

          {completedDeadlines.length > 0 && (
            <DeadlineSection
              title="Completed Deadlines"
              deadlines={completedDeadlines}
              onToggle={handleToggle}
              onEdit={handleEdit}
              onDelete={handleDelete}
            />
          )}
        </div>
      )}
    </div>
  )
}

function StatCard({ title, value }) {
  return (
    <div className="rounded-3xl border border-slate-800 bg-slate-900 p-6">
      <p className="text-sm text-slate-400">{title}</p>
      <p className="mt-3 text-4xl font-bold">{value}</p>
    </div>
  )
}

function DeadlineSection({ title, deadlines, onToggle, onEdit, onDelete }) {
  return (
    <div>
      <h2 className="mb-4 text-2xl font-bold">{title}</h2>

      {deadlines.length === 0 ? (
        <div className="rounded-3xl border border-dashed border-slate-700 bg-slate-900/60 p-8 text-center text-slate-400">
          No deadlines in this section.
        </div>
      ) : (
        <div className="space-y-4">
          {deadlines.map((deadline) => (
            <DeadlineCard
              key={deadline.id}
              deadline={deadline}
              onToggle={onToggle}
              onEdit={onEdit}
              onDelete={onDelete}
            />
          ))}
        </div>
      )}
    </div>
  )
}

function DeadlineCard({ deadline, onToggle, onEdit, onDelete }) {
  const daysLeft = getDaysLeft(deadline.due_date)
  const priorityClasses = getPriorityClasses(deadline.priority)

  return (
    <div
      className={`rounded-3xl border p-6 ${
        deadline.is_completed
          ? "border-slate-800 bg-slate-900/50 opacity-70"
          : "border-slate-800 bg-slate-900"
      }`}
    >
      <div className="flex flex-wrap items-start justify-between gap-5">
        <div className="flex gap-4">
          <button
            type="button"
            onClick={() => onToggle(deadline.id)}
            className={`mt-1 flex h-6 w-6 items-center justify-center rounded-lg border ${
              deadline.is_completed
                ? "border-green-500 bg-green-500 text-white"
                : "border-slate-600 hover:border-indigo-500"
            }`}
          >
            {deadline.is_completed ? "✓" : ""}
          </button>

          <div>
            <div className="mb-3 flex flex-wrap gap-2">
              <span className="rounded-full bg-indigo-500/10 px-3 py-1 text-sm text-indigo-300">
                {deadline.type}
              </span>

              <span className={`rounded-full px-3 py-1 text-sm ${priorityClasses}`}>
                {deadline.priority}
              </span>

              {deadline.course && (
                <span className="rounded-full bg-cyan-500/10 px-3 py-1 text-sm text-cyan-300">
                  {deadline.course.name}
                </span>
              )}
            </div>

            <h3
              className={`text-xl font-bold ${
                deadline.is_completed ? "line-through text-slate-500" : ""
              }`}
            >
              {deadline.title}
            </h3>

            {deadline.description && (
              <p className="mt-2 max-w-3xl leading-7 text-slate-400">
                {deadline.description}
              </p>
            )}
          </div>
        </div>

        <div className="flex flex-col items-end gap-3">
          <div className="rounded-2xl bg-slate-950 px-4 py-3 text-right">
            <p className="text-sm text-slate-500">Due Date</p>
            <p className="font-semibold">{formatDate(deadline.due_date)}</p>
            <p className={`mt-1 text-sm ${daysLeft < 0 ? "text-red-300" : "text-slate-400"}`}>
              {getDaysText(daysLeft)}
            </p>
          </div>

          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => onEdit(deadline)}
              className="rounded-xl border border-slate-700 px-4 py-2 text-sm hover:bg-slate-800"
            >
              Edit
            </button>

            <button
              type="button"
              onClick={() => onDelete(deadline.id)}
              className="rounded-xl bg-red-500/10 px-4 py-2 text-sm text-red-300 hover:bg-red-500 hover:text-white"
            >
              Delete
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

function getDaysLeft(dateValue) {
  const today = new Date()
  const dueDate = new Date(dateValue)

  today.setHours(0, 0, 0, 0)
  dueDate.setHours(0, 0, 0, 0)

  const difference = dueDate - today

  return Math.ceil(difference / (1000 * 60 * 60 * 24))
}

function getDaysText(daysLeft) {
  if (daysLeft < 0) {
    return `${Math.abs(daysLeft)} day(s) overdue`
  }

  if (daysLeft === 0) {
    return "Due today"
  }

  if (daysLeft === 1) {
    return "Due tomorrow"
  }

  return `${daysLeft} days left`
}

function formatDate(dateValue) {
  return new Date(dateValue).toLocaleDateString()
}

function getPriorityClasses(priority) {
  if (priority === "High") {
    return "bg-red-500/10 text-red-300"
  }

  if (priority === "Medium") {
    return "bg-yellow-500/10 text-yellow-300"
  }

  return "bg-green-500/10 text-green-300"
}

export default DeadlinesPage