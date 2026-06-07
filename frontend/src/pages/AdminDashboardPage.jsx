import { useEffect, useState } from "react"
import { Link } from "react-router-dom"
import api from "../services/api"

function AdminDashboardPage() {
  const [dashboard, setDashboard] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")

  const fetchDashboard = async () => {
    try {
      const response = await api.get("/admin/dashboard")
      setDashboard(response.data)
    } catch (err) {
      if (err.response?.status === 403) {
        setError("You do not have admin access.")
      } else {
        setError("Could not load admin dashboard.")
      }
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchDashboard()
  }, [])

  if (loading) {
    return (
      <div className="rounded-3xl border border-slate-800 bg-slate-900 p-8 text-center text-slate-400">
        Loading admin dashboard...
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

  const stats = dashboard?.stats || {}

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-bold">Admin Dashboard</h1>
        <p className="mt-2 text-slate-400">
          Monitor students, materials, quizzes, deadlines, and study activity.
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-4">
        <AdminStatCard title="Students" value={stats.total_students || 0} icon="👥" />
        <AdminStatCard title="Courses" value={stats.total_courses || 0} icon="🏫" />
        <AdminStatCard title="Materials" value={stats.total_materials || 0} icon="🗂️" />
        <AdminStatCard title="Quizzes" value={stats.total_quizzes || 0} icon="📋" />
      </div>

      <div className="mt-6 grid gap-6 md:grid-cols-2 xl:grid-cols-4">
        <AdminStatCard title="Attempts" value={stats.total_attempts || 0} icon="🎯" />
        <AdminStatCard title="Average Score" value={`${stats.average_score || 0}%`} icon="📈" />
        <AdminStatCard title="Flashcards" value={stats.total_flashcards || 0} icon="🧠" />
        <AdminStatCard title="Study Plans" value={stats.total_study_plans || 0} icon="📅" />
      </div>

      <div className="mt-8 grid gap-6 xl:grid-cols-3">
        <AdminPanel
          title="Recent Students"
          link="/admin/students"
          linkText="View Students"
        >
          {dashboard.recent_students.length === 0 ? (
            <EmptyText text="No students yet." />
          ) : (
            dashboard.recent_students.map((student) => (
              <InfoItem
                key={student.id}
                title={student.name}
                subtitle={student.email}
              />
            ))
          )}
        </AdminPanel>

        <AdminPanel
          title="Recent Materials"
          link="/admin/materials"
          linkText="View Materials"
        >
          {dashboard.recent_materials.length === 0 ? (
            <EmptyText text="No materials yet." />
          ) : (
            dashboard.recent_materials.map((material) => (
              <InfoItem
                key={material.id}
                title={material.title}
                subtitle={`${material.user?.name || "Unknown"} · ${material.course?.name || "No course"}`}
              />
            ))
          )}
        </AdminPanel>

        <AdminPanel
          title="Recent Quizzes"
          link="/admin/quizzes"
          linkText="View Quizzes"
        >
          {dashboard.recent_quizzes.length === 0 ? (
            <EmptyText text="No quizzes yet." />
          ) : (
            dashboard.recent_quizzes.map((quiz) => (
              <InfoItem
                key={quiz.id}
                title={quiz.title}
                subtitle={`${quiz.user?.name || "Unknown"} · ${quiz.material?.title || "No material"}`}
              />
            ))
          )}
        </AdminPanel>
      </div>
    </div>
  )
}

function AdminStatCard({ title, value, icon }) {
  return (
    <div className="rounded-3xl border border-slate-800 bg-slate-900 p-6 hover:border-indigo-500/50">
      <div className="mb-4 flex items-center justify-between">
        <p className="text-sm text-slate-400">{title}</p>
        <span className="text-2xl">{icon}</span>
      </div>

      <p className="text-4xl font-bold">{value}</p>
    </div>
  )
}

function AdminPanel({ title, link, linkText, children }) {
  return (
    <div className="rounded-3xl border border-slate-800 bg-slate-900 p-6">
      <div className="mb-5 flex items-center justify-between gap-4">
        <h2 className="text-xl font-bold">{title}</h2>

        <Link
          to={link}
          className="rounded-xl border border-slate-700 px-3 py-2 text-sm hover:bg-slate-800"
        >
          {linkText}
        </Link>
      </div>

      <div className="space-y-3">{children}</div>
    </div>
  )
}

function InfoItem({ title, subtitle }) {
  return (
    <div className="rounded-2xl border border-slate-800 bg-slate-950 p-4">
      <p className="font-semibold">{title}</p>
      <p className="mt-1 text-sm text-slate-400">{subtitle}</p>
    </div>
  )
}

function EmptyText({ text }) {
  return (
    <div className="rounded-2xl border border-dashed border-slate-700 p-6 text-center text-slate-400">
      {text}
    </div>
  )
}

export default AdminDashboardPage