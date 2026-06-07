import { useEffect, useMemo, useState } from "react"
import { Link } from "react-router-dom"
import {
  BookOpen,
  FileText,
  ClipboardList,
  Target,
  Brain,
  AlarmClock,
  CheckCircle2,
  CalendarDays,
  Activity,
  HeartPulse,
  UploadCloud,
  ArrowRight,
} from "lucide-react"
import api from "../services/api"

function DashboardPage() {
  const user = JSON.parse(localStorage.getItem("user"))

  const [dashboard, setDashboard] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")

  const fetchDashboard = async () => {
    try {
      const response = await api.get("/dashboard")
      setDashboard(response.data)
    } catch (err) {
      setError("Could not load dashboard statistics.")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchDashboard()
  }, [])

  const recentActivities = useMemo(() => {
    if (!dashboard) return []

    const activities = []

    dashboard.recent_materials?.forEach((material) => {
      activities.push({
        id: `material-${material.id}`,
        type: "Material",
        icon: FileText,
        title: `Uploaded material: ${material.title}`,
        description: `${material.course?.name || "No course"} · ${material.file_type?.toUpperCase() || "FILE"}`,
        date: material.created_at,
        link: `/materials/${material.id}`,
        linkText: "Open Material",
      })
    })

    dashboard.upcoming_deadlines?.forEach((deadline) => {
      activities.push({
        id: `deadline-${deadline.id}`,
        type: "Deadline",
        icon: AlarmClock,
        title: `Upcoming ${deadline.type}: ${deadline.title}`,
        description: `${deadline.priority} priority · Due ${formatDate(deadline.due_date)}`,
        date: deadline.due_date,
        link: "/deadlines",
        linkText: "View Deadlines",
      })
    })

    dashboard.study_plans?.forEach((plan) => {
      activities.push({
        id: `study-plan-${plan.id}`,
        type: "Study Plan",
        icon: CalendarDays,
        title: `Study plan: ${plan.title}`,
        description: `${plan.completed_tasks}/${plan.total_tasks} tasks completed · ${plan.progress}% progress`,
        date: plan.exam_date,
        link: "/study-planner",
        linkText: "View Plan",
      })
    })

    activities.push({
      id: "quiz-performance",
      type: "Performance",
      icon: Target,
      title: "Quiz performance overview",
      description: `Average score: ${dashboard.stats?.average_score || 0}% across your attempts.`,
      date: new Date().toISOString(),
      link: "/quizzes",
      linkText: "View Quizzes",
    })

    return activities
      .filter((activity) => activity.title)
      .sort((a, b) => new Date(b.date || 0) - new Date(a.date || 0))
      .slice(0, 6)
  }, [dashboard])

  if (loading) {
    return (
      <div className="rounded-3xl border border-slate-800 bg-slate-900 p-8 text-center text-slate-400">
        Loading dashboard...
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
      <div className="mb-8 flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold">Dashboard</h1>
          <p className="mt-2 text-slate-400">
            Here is your academic progress overview, {user?.name || "Student"}.
          </p>
        </div>

        <Link
          to="/materials"
          className="inline-flex items-center gap-2 rounded-2xl bg-indigo-500 px-5 py-3 font-semibold hover:bg-indigo-600"
        >
          <UploadCloud size={18} />
          Upload Material
        </Link>
      </div>

      <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-4">
        <DashboardCard title="Courses" value={stats.total_courses || 0} description="Active courses" icon={BookOpen} />
        <DashboardCard title="Materials" value={stats.total_materials || 0} description="Uploaded files" icon={FileText} />
        <DashboardCard title="Quizzes" value={stats.total_quizzes || 0} description="Generated quizzes" icon={ClipboardList} />
        <DashboardCard title="Average Score" value={`${stats.average_score || 0}%`} description="Quiz performance" icon={Target} />
      </div>

      <div className="mt-6 grid gap-6 md:grid-cols-3">
        <DashboardCard title="Flashcards" value={stats.total_flashcards || 0} description="Generated cards" icon={Brain} />
        <DashboardCard title="Active Deadlines" value={stats.active_deadlines || 0} description="Pending tasks" icon={AlarmClock} />
        <DashboardCard title="Completed Deadlines" value={stats.completed_deadlines || 0} description="Finished tasks" icon={CheckCircle2} />
      </div>

      <div className="mt-8 grid gap-6 xl:grid-cols-3">
        <div className="rounded-3xl border border-slate-800 bg-slate-900 p-6 xl:col-span-2">
          <div className="mb-6 flex items-center justify-between">
            <div>
              <h2 className="text-xl font-bold">Study Plan Progress</h2>
              <p className="text-sm text-slate-400">Your latest generated study plans</p>
            </div>

            <Link to="/study-planner" className="rounded-xl border border-slate-700 px-4 py-2 text-sm hover:bg-slate-800">
              View Plans
            </Link>
          </div>

          {dashboard.study_plans.length === 0 ? (
            <EmptyState
              title="No study plans yet"
              description="Generate a study plan to track your exam preparation."
              link="/study-planner"
              linkText="Generate Plan"
            />
          ) : (
            <div className="space-y-5">
              {dashboard.study_plans.map((plan) => (
                <ProgressItem
                  key={plan.id}
                  label={plan.title}
                  value={`${plan.progress}%`}
                  width={`${plan.progress}%`}
                  details={`${plan.completed_tasks}/${plan.total_tasks} tasks completed`}
                />
              ))}
            </div>
          )}
        </div>

        <div className="rounded-3xl border border-slate-800 bg-slate-900 p-6">
          <div className="mb-6 flex items-center justify-between">
            <div>
              <h2 className="text-xl font-bold">Upcoming Deadlines</h2>
              <p className="text-sm text-slate-400">Important academic tasks</p>
            </div>

            <Link to="/deadlines" className="rounded-xl border border-slate-700 px-4 py-2 text-sm hover:bg-slate-800">
              View
            </Link>
          </div>

          {dashboard.upcoming_deadlines.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-slate-700 p-6 text-center text-slate-400">
              No upcoming deadlines.
            </div>
          ) : (
            <div className="space-y-4">
              {dashboard.upcoming_deadlines.map((deadline) => (
                <DeadlineItem
                  key={deadline.id}
                  title={deadline.title}
                  date={deadline.due_date}
                  type={deadline.type}
                  priority={deadline.priority}
                />
              ))}
            </div>
          )}
        </div>
      </div>

      <div className="mt-8 grid gap-6 xl:grid-cols-3">
        <div className="rounded-3xl border border-slate-800 bg-slate-900 p-6 xl:col-span-2">
          <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
            <div>
              <h2 className="text-xl font-bold">Recent Activity</h2>
              <p className="text-sm text-slate-400">A quick timeline of your latest study activity.</p>
            </div>

            <span className="inline-flex items-center gap-2 rounded-full bg-indigo-500/10 px-3 py-1 text-sm text-indigo-300">
              <Activity size={15} />
              Auto-generated
            </span>
          </div>

          {recentActivities.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-slate-700 p-8 text-center text-slate-400">
              No recent activity yet.
            </div>
          ) : (
            <div className="space-y-4">
              {recentActivities.map((activity) => (
                <ActivityItem key={activity.id} activity={activity} />
              ))}
            </div>
          )}
        </div>

        <div className="rounded-3xl border border-slate-800 bg-gradient-to-br from-slate-900 to-slate-950 p-6">
          <div className="mb-3 flex items-center gap-3">
            <HeartPulse className="text-cyan-300" size={24} />
            <h2 className="text-xl font-bold">Study Health</h2>
          </div>
          <p className="text-sm text-slate-400">A simple overview based on your current progress.</p>

          <div className="mt-6 space-y-4">
            <HealthItem
              label="Material Coverage"
              value={
                stats.total_courses > 0
                  ? `${stats.total_materials} material(s) across ${stats.total_courses} course(s)`
                  : "No courses yet"
              }
              status={stats.total_materials > 0 ? "Good" : "Needs setup"}
            />

            <HealthItem
              label="Practice"
              value={`${stats.total_quizzes || 0} quiz(es), ${stats.total_flashcards || 0} flashcard(s)`}
              status={stats.total_quizzes > 0 ? "Active" : "Start practicing"}
            />

            <HealthItem
              label="Deadlines"
              value={`${stats.active_deadlines || 0} active, ${stats.completed_deadlines || 0} completed`}
              status={stats.active_deadlines > 0 ? "Tracked" : "No pending tasks"}
            />

            <HealthItem
              label="Performance"
              value={`${stats.average_score || 0}% average score`}
              status={stats.average_score >= 70 ? "Strong" : "Keep practicing"}
            />
          </div>
        </div>
      </div>

      <div className="mt-8 grid gap-6 xl:grid-cols-2">
        <div className="rounded-3xl border border-slate-800 bg-slate-900 p-6">
          <div className="mb-6 flex items-center justify-between">
            <div>
              <h2 className="text-xl font-bold">Recent Materials</h2>
              <p className="text-sm text-slate-400">Your latest uploaded files</p>
            </div>

            <Link to="/materials" className="rounded-xl border border-slate-700 px-4 py-2 text-sm hover:bg-slate-800">
              View Materials
            </Link>
          </div>

          {dashboard.recent_materials.length === 0 ? (
            <EmptyState
              title="No materials yet"
              description="Upload a PDF, TXT, or DOCX file to start using AI features."
              link="/materials"
              linkText="Upload Material"
            />
          ) : (
            <div className="space-y-4">
              {dashboard.recent_materials.map((material) => (
                <Link
                  key={material.id}
                  to={`/materials/${material.id}`}
                  className="block rounded-2xl border border-slate-800 bg-slate-950 p-4 hover:border-indigo-500"
                >
                  <div className="flex items-center justify-between gap-4">
                    <div>
                      <p className="font-semibold">{material.title}</p>
                      <p className="mt-1 text-sm text-slate-400">
                        {material.course?.name || "No course"} · {material.file_type?.toUpperCase()}
                      </p>
                    </div>

                    <ArrowRight className="text-indigo-300" size={18} />
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>

        <div className="rounded-3xl border border-slate-800 bg-gradient-to-r from-indigo-500/20 to-cyan-500/10 p-8">
          <h2 className="text-2xl font-bold">AI Study Tip</h2>
          <p className="mt-3 max-w-3xl leading-7 text-slate-300">
            Upload your course material and use StudyMate AI to summarize it,
            generate quizzes, create flashcards, and identify the topics you need
            to review before your exam.
          </p>

          <div className="mt-6 flex flex-wrap gap-3">
            <Link to="/materials" className="rounded-xl bg-indigo-500 px-5 py-3 font-semibold hover:bg-indigo-600">
              Upload Material
            </Link>

            <Link to="/quizzes" className="rounded-xl border border-slate-700 px-5 py-3 font-semibold hover:bg-slate-800">
              View Quizzes
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}

function DashboardCard({ title, value, description, icon: Icon }) {
  return (
    <div className="rounded-3xl border border-slate-800 bg-slate-900 p-6 hover:border-indigo-500/50">
      <div className="mb-4 flex items-center justify-between">
        <p className="text-sm text-slate-400">{title}</p>
        <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-indigo-500/10 text-indigo-300">
          <Icon size={22} />
        </div>
      </div>

      <p className="text-4xl font-bold">{value}</p>
      <p className="mt-2 text-sm text-slate-500">{description}</p>
    </div>
  )
}

function ProgressItem({ label, value, width, details }) {
  return (
    <div>
      <div className="mb-2 flex justify-between text-sm">
        <span className="text-slate-300">{label}</span>
        <span className="text-slate-400">{value}</span>
      </div>

      <div className="h-3 rounded-full bg-slate-800">
        <div className="h-3 rounded-full bg-gradient-to-r from-indigo-500 to-cyan-400" style={{ width }}></div>
      </div>

      <p className="mt-2 text-xs text-slate-500">{details}</p>
    </div>
  )
}

function DeadlineItem({ title, date, type, priority }) {
  return (
    <div className="rounded-2xl border border-slate-800 bg-slate-950 p-4">
      <div className="mb-2 flex flex-wrap gap-2">
        <span className="rounded-full bg-indigo-500/10 px-2 py-1 text-xs text-indigo-300">{type}</span>
        <span className={`rounded-full px-2 py-1 text-xs ${getPriorityClasses(priority)}`}>{priority}</span>
      </div>

      <p className="font-semibold">{title}</p>
      <p className="mt-1 text-sm text-slate-400">{formatDate(date)}</p>
    </div>
  )
}

function ActivityItem({ activity }) {
  const Icon = activity.icon

  return (
    <div className="rounded-2xl border border-slate-800 bg-slate-950 p-4 hover:border-indigo-500/50">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex gap-4">
          <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-indigo-500/10 text-indigo-300">
            <Icon size={22} />
          </div>

          <div>
            <div className="mb-1 flex flex-wrap items-center gap-2">
              <span className="rounded-full bg-slate-800 px-2 py-1 text-xs text-slate-300">{activity.type}</span>
              <span className="text-xs text-slate-500">{formatDate(activity.date)}</span>
            </div>

            <p className="font-semibold">{activity.title}</p>
            <p className="mt-1 text-sm text-slate-400">{activity.description}</p>
          </div>
        </div>

        <Link to={activity.link} className="rounded-xl border border-slate-700 px-4 py-2 text-sm hover:bg-slate-800">
          {activity.linkText}
        </Link>
      </div>
    </div>
  )
}

function HealthItem({ label, value, status }) {
  return (
    <div className="rounded-2xl border border-slate-800 bg-slate-950 p-4">
      <div className="mb-2 flex items-center justify-between gap-3">
        <p className="font-semibold">{label}</p>
        <span className="rounded-full bg-cyan-500/10 px-3 py-1 text-xs text-cyan-300">{status}</span>
      </div>
      <p className="text-sm text-slate-400">{value}</p>
    </div>
  )
}

function EmptyState({ title, description, link, linkText }) {
  return (
    <div className="rounded-2xl border border-dashed border-slate-700 p-8 text-center">
      <p className="font-bold">{title}</p>
      <p className="mt-2 text-sm text-slate-400">{description}</p>

      <Link to={link} className="mt-5 inline-block rounded-xl bg-indigo-500 px-4 py-2 text-sm font-semibold hover:bg-indigo-600">
        {linkText}
      </Link>
    </div>
  )
}

function formatDate(dateValue) {
  if (!dateValue) return "-"
  return new Date(dateValue).toLocaleDateString()
}

function getPriorityClasses(priority) {
  if (priority === "High") return "bg-red-500/10 text-red-300"
  if (priority === "Medium") return "bg-yellow-500/10 text-yellow-300"
  return "bg-green-500/10 text-green-300"
}

export default DashboardPage