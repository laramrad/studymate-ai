import { useEffect, useState } from "react"
import {
  ShieldCheck,
  Users,
  BookOpen,
  FileText,
  ClipboardList,
  AlarmClock,
  Brain,
  Activity,
  TrendingUp,
  UserCheck,
  Database,
  GraduationCap,
} from "lucide-react"
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
      setError("Could not load admin dashboard.")
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
  const recentUsers = dashboard?.recent_users || []
  const recentMaterials = dashboard?.recent_materials || []
  const recentQuizzes = dashboard?.recent_quizzes || []

  return (
    <div>
      <div className="mb-8">
        <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-purple-500/10 text-purple-300">
          <ShieldCheck size={28} />
        </div>

        <h1 className="text-3xl font-bold">Admin Dashboard</h1>
        <p className="mt-2 text-slate-400">
          Monitor students, courses, materials, quizzes, deadlines, and platform activity.
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-4">
        <AdminStatCard
          title="Students"
          value={stats.total_students || 0}
          description="Registered student accounts"
          icon={Users}
          color="indigo"
        />

        <AdminStatCard
          title="Courses"
          value={stats.total_courses || 0}
          description="Created course records"
          icon={BookOpen}
          color="cyan"
        />

        <AdminStatCard
          title="Materials"
          value={stats.total_materials || 0}
          description="Uploaded study files"
          icon={FileText}
          color="purple"
        />

        <AdminStatCard
          title="Quizzes"
          value={stats.total_quizzes || 0}
          description="Generated quizzes"
          icon={ClipboardList}
          color="green"
        />
      </div>

      <div className="mt-6 grid gap-6 md:grid-cols-3">
        <AdminStatCard
          title="Flashcards"
          value={stats.total_flashcards || 0}
          description="Generated flashcards"
          icon={Brain}
          color="pink"
        />

        <AdminStatCard
          title="Deadlines"
          value={stats.total_deadlines || 0}
          description="Tracked academic deadlines"
          icon={AlarmClock}
          color="yellow"
        />

        <AdminStatCard
          title="Active Users"
          value={stats.active_students || stats.total_students || 0}
          description="Students using the platform"
          icon={UserCheck}
          color="blue"
        />
      </div>

      <div className="mt-8 grid gap-6 xl:grid-cols-3">
        <div className="rounded-3xl border border-slate-800 bg-slate-900 p-6 xl:col-span-2">
          <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
            <div>
              <div className="mb-2 flex items-center gap-2">
                <Activity className="text-indigo-300" size={22} />
                <h2 className="text-xl font-bold">Recent Platform Activity</h2>
              </div>
              <p className="text-sm text-slate-400">
                Latest student activity across the system.
              </p>
            </div>

            <span className="rounded-full bg-indigo-500/10 px-3 py-1 text-sm text-indigo-300">
              Live overview
            </span>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <ActivityBox
              icon={Users}
              title="Recent Students"
              emptyText="No recent students found."
              items={recentUsers}
              renderItem={(user) => (
                <>
                  <p className="font-semibold">{user.name}</p>
                  <p className="mt-1 text-sm text-slate-400">{user.email}</p>
                </>
              )}
            />

            <ActivityBox
              icon={FileText}
              title="Recent Materials"
              emptyText="No recent materials found."
              items={recentMaterials}
              renderItem={(material) => (
                <>
                  <p className="font-semibold">{material.title}</p>
                  <p className="mt-1 text-sm text-slate-400">
                    {material.course?.name || "No course"} ·{" "}
                    {material.file_type?.toUpperCase() || "FILE"}
                  </p>
                </>
              )}
            />
          </div>
        </div>

        <div className="rounded-3xl border border-slate-800 bg-slate-900 p-6">
          <div className="mb-6 rounded-2xl border border-cyan-500/20 bg-gradient-to-r from-cyan-500/10 to-indigo-500/10 p-5">
            <div className="flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-cyan-500/10 text-cyan-300">
                <TrendingUp size={24} />
              </div>

              <div>
                <h2 className="text-xl font-bold">System Summary</h2>
                <p className="text-sm text-slate-400">Platform usage overview</p>
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <SummaryItem
              icon={GraduationCap}
              label="Learning Activity"
              value={`${stats.total_courses || 0} courses and ${stats.total_materials || 0} materials`}
            />

            <SummaryItem
              icon={ClipboardList}
              label="Practice Activity"
              value={`${stats.total_quizzes || 0} quizzes and ${stats.total_flashcards || 0} flashcards`}
            />

            <SummaryItem
              icon={AlarmClock}
              label="Deadline Tracking"
              value={`${stats.total_deadlines || 0} deadlines created`}
            />

            <SummaryItem
              icon={Database}
              label="Database Records"
              value="Connected through Laravel API"
            />
          </div>
        </div>
      </div>

      <div className="mt-8 rounded-3xl border border-slate-800 bg-slate-900 p-6">
        <div className="mb-6 flex items-center gap-2">
          <ClipboardList className="text-purple-300" size={22} />
          <h2 className="text-xl font-bold">Recent Quizzes</h2>
        </div>

        {recentQuizzes.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-slate-700 p-8 text-center text-slate-400">
            No recent quizzes found.
          </div>
        ) : (
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {recentQuizzes.map((quiz) => (
              <div
                key={quiz.id}
                className="rounded-2xl border border-slate-800 bg-slate-950 p-5"
              >
                <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-xl bg-purple-500/10 text-purple-300">
                  <ClipboardList size={20} />
                </div>

                <p className="font-semibold">{quiz.title}</p>
                <p className="mt-2 text-sm text-slate-400">
                  {quiz.material?.title || "No material"}
                </p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

function AdminStatCard({ title, value, description, icon: Icon, color }) {
  const colorClasses = {
    indigo: "bg-indigo-500/10 text-indigo-300",
    cyan: "bg-cyan-500/10 text-cyan-300",
    purple: "bg-purple-500/10 text-purple-300",
    green: "bg-green-500/10 text-green-300",
    pink: "bg-pink-500/10 text-pink-300",
    yellow: "bg-yellow-500/10 text-yellow-300",
    blue: "bg-blue-500/10 text-blue-300",
  }

  return (
    <div className="rounded-3xl border border-slate-800 bg-slate-900 p-6 hover:border-indigo-500/50">
      <div className="mb-5 flex items-center justify-between">
        <p className="text-sm text-slate-400">{title}</p>

        <div className={`flex h-12 w-12 items-center justify-center rounded-2xl ${colorClasses[color]}`}>
          <Icon size={23} />
        </div>
      </div>

      <p className="text-4xl font-bold">{value}</p>
      <p className="mt-2 text-sm text-slate-500">{description}</p>
    </div>
  )
}

function ActivityBox({ icon: Icon, title, emptyText, items, renderItem }) {
  return (
    <div className="rounded-3xl border border-slate-800 bg-slate-950 p-5">
      <div className="mb-5 flex items-center gap-2">
        <Icon className="text-indigo-300" size={20} />
        <h3 className="font-bold">{title}</h3>
      </div>

      {items.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-slate-700 p-6 text-center text-sm text-slate-400">
          {emptyText}
        </div>
      ) : (
        <div className="space-y-3">
          {items.slice(0, 5).map((item) => (
            <div
              key={item.id}
              className="rounded-2xl border border-slate-800 bg-slate-900 p-4"
            >
              {renderItem(item)}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

function SummaryItem({ icon: Icon, label, value }) {
  return (
    <div className="rounded-2xl border border-slate-800 bg-slate-950 p-4">
      <div className="mb-2 flex items-center gap-2">
        <Icon className="text-cyan-300" size={18} />
        <p className="font-semibold">{label}</p>
      </div>

      <p className="text-sm text-slate-400">{value}</p>
    </div>
  )
}

export default AdminDashboardPage