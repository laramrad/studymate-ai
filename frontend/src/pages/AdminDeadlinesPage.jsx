import { useEffect, useState } from "react"
import api from "../services/api"

function AdminDeadlinesPage() {
  const [deadlines, setDeadlines] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")

  const fetchDeadlines = async () => {
    try {
      const response = await api.get("/admin/deadlines")
      setDeadlines(response.data.deadlines)
    } catch (err) {
      setError("Could not load deadlines.")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchDeadlines()
  }, [])

  if (loading) {
    return (
      <div className="rounded-3xl border border-slate-800 bg-slate-900 p-8 text-center text-slate-400">
        Loading deadlines...
      </div>
    )
  }

  if (error) {
    return (
      <div className="rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-300">
        {error}
      </div>
    )
  }

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-bold">All Deadlines</h1>
        <p className="mt-2 text-slate-400">
          View all student deadlines and completion status.
        </p>
      </div>

      {deadlines.length === 0 ? (
        <EmptyState text="No deadlines found." />
      ) : (
        <div className="space-y-4">
          {deadlines.map((deadline) => (
            <div key={deadline.id} className="rounded-3xl border border-slate-800 bg-slate-900 p-6">
              <div className="flex flex-wrap items-start justify-between gap-4">
                <div>
                  <div className="mb-3 flex flex-wrap gap-2">
                    <span className="rounded-full bg-indigo-500/10 px-3 py-1 text-sm text-indigo-300">
                      {deadline.type}
                    </span>

                    <span className={`rounded-full px-3 py-1 text-sm ${getPriorityClasses(deadline.priority)}`}>
                      {deadline.priority}
                    </span>

                    <span
                      className={`rounded-full px-3 py-1 text-sm ${
                        deadline.is_completed
                          ? "bg-green-500/10 text-green-300"
                          : "bg-yellow-500/10 text-yellow-300"
                      }`}
                    >
                      {deadline.is_completed ? "Completed" : "Active"}
                    </span>
                  </div>

                  <h2 className="text-xl font-bold">{deadline.title}</h2>

                  <div className="mt-3 space-y-1 text-sm text-slate-400">
                    <p>Student: {deadline.user?.name || "Unknown"}</p>
                    <p>Email: {deadline.user?.email || "-"}</p>
                    <p>Course: {deadline.course?.name || "No course"}</p>
                  </div>
                </div>

                <div className="rounded-2xl bg-slate-950 px-4 py-3 text-right">
                  <p className="text-sm text-slate-500">Due Date</p>
                  <p className="font-semibold">{formatDate(deadline.due_date)}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
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

function EmptyState({ text }) {
  return (
    <div className="rounded-3xl border border-dashed border-slate-700 bg-slate-900/60 p-12 text-center text-slate-400">
      {text}
    </div>
  )
}

export default AdminDeadlinesPage