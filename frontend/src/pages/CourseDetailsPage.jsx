import { useEffect, useState } from "react"
import { Link, useParams } from "react-router-dom"
import {
  ArrowLeft,
  UploadCloud,
  AlarmClock,
  FileText,
  CalendarDays,
  BookOpen,
  ClipboardList,
  ArrowRight,
} from "lucide-react"
import api from "../services/api"

function CourseDetailsPage() {
  const { id } = useParams()

  const [course, setCourse] = useState(null)
  const [materials, setMaterials] = useState([])
  const [deadlines, setDeadlines] = useState([])
  const [studyPlans, setStudyPlans] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")

  const fetchCourseData = async () => {
    try {
      const [courseResponse, materialsResponse, deadlinesResponse, studyPlansResponse] =
        await Promise.all([
          api.get(`/courses/${id}`),
          api.get("/materials"),
          api.get("/deadlines"),
          api.get("/study-plans"),
        ])

      setCourse(courseResponse.data.course)

      setMaterials(
        materialsResponse.data.materials.filter(
          (material) => Number(material.course_id) === Number(id)
        )
      )

      setDeadlines(
        deadlinesResponse.data.deadlines.filter(
          (deadline) => Number(deadline.course_id) === Number(id)
        )
      )

      setStudyPlans(
        studyPlansResponse.data.study_plans.filter(
          (plan) => Number(plan.course_id) === Number(id)
        )
      )
    } catch (err) {
      setError("Could not load course details.")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchCourseData()
  }, [id])

  if (loading) {
    return (
      <div className="rounded-3xl border border-slate-800 bg-slate-900 p-8 text-center text-slate-400">
        Loading course details...
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

  if (!course) {
    return (
      <div className="rounded-xl border border-yellow-500/30 bg-yellow-500/10 px-4 py-3 text-sm text-yellow-300">
        Course not found.
      </div>
    )
  }

  return (
    <div>
      <div className="mb-8 flex flex-wrap items-center justify-between gap-4">
        <div>
          <Link
            to="/courses"
            className="inline-flex items-center gap-2 text-sm text-indigo-400 hover:text-indigo-300"
          >
            <ArrowLeft size={16} />
            Back to Courses
          </Link>

          <div className="mt-4 flex flex-wrap items-center gap-3">
            <span className="rounded-full bg-indigo-500/10 px-3 py-1 text-sm text-indigo-300">
              {course.code || "Course"}
            </span>

            {course.semester && (
              <span className="rounded-full bg-cyan-500/10 px-3 py-1 text-sm text-cyan-300">
                {course.semester}
              </span>
            )}
          </div>

          <div className="mt-4 flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-indigo-500/10 text-indigo-300">
              <BookOpen size={24} />
            </div>
            <h1 className="text-3xl font-bold">{course.name}</h1>
          </div>

          {course.instructor && (
            <p className="mt-2 text-slate-400">Instructor: {course.instructor}</p>
          )}
        </div>

        <div className="flex flex-wrap gap-3">
          <Link
            to="/materials"
            className="inline-flex items-center gap-2 rounded-2xl bg-indigo-500 px-5 py-3 font-semibold hover:bg-indigo-600"
          >
            <UploadCloud size={18} />
            Upload Material
          </Link>

          <Link
            to="/deadlines"
            className="inline-flex items-center gap-2 rounded-2xl border border-slate-700 px-5 py-3 font-semibold hover:bg-slate-800"
          >
            <AlarmClock size={18} />
            Add Deadline
          </Link>
        </div>
      </div>

      {course.description && (
        <div className="mb-8 rounded-3xl border border-slate-800 bg-slate-900 p-6">
          <h2 className="text-xl font-bold">Course Description</h2>
          <p className="mt-3 leading-7 text-slate-300">{course.description}</p>
        </div>
      )}

      <div className="mb-8 grid gap-6 md:grid-cols-3">
        <StatCard title="Materials" value={materials.length} icon={FileText} />
        <StatCard title="Deadlines" value={deadlines.length} icon={AlarmClock} />
        <StatCard title="Study Plans" value={studyPlans.length} icon={CalendarDays} />
      </div>

      <div className="grid gap-6 xl:grid-cols-3">
        <div className="rounded-3xl border border-slate-800 bg-slate-900 p-6 xl:col-span-2">
          <div className="mb-6 flex items-center justify-between gap-4">
            <div>
              <h2 className="text-xl font-bold">Course Materials</h2>
              <p className="text-sm text-slate-400">
                Uploaded files linked to this course.
              </p>
            </div>

            <Link
              to="/materials"
              className="rounded-xl border border-slate-700 px-4 py-2 text-sm hover:bg-slate-800"
            >
              Manage
            </Link>
          </div>

          {materials.length === 0 ? (
            <EmptyBox text="No materials uploaded for this course yet." />
          ) : (
            <div className="space-y-4">
              {materials.map((material) => (
                <Link
                  key={material.id}
                  to={`/materials/${material.id}`}
                  className="block rounded-2xl border border-slate-800 bg-slate-950 p-4 hover:border-indigo-500"
                >
                  <div className="flex flex-wrap items-center justify-between gap-4">
                    <div className="flex items-start gap-3">
                      <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-cyan-500/10 text-cyan-300">
                        <FileText size={20} />
                      </div>

                      <div>
                        <p className="font-semibold">{material.title}</p>
                        <p className="mt-1 text-sm text-slate-400">
                          {material.original_filename} · {material.file_type?.toUpperCase()}
                        </p>
                      </div>
                    </div>

                    <span className="inline-flex items-center gap-2 text-sm text-indigo-300">
                      Open
                      <ArrowRight size={16} />
                    </span>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>

        <div className="space-y-6">
          <div className="rounded-3xl border border-slate-800 bg-slate-900 p-6">
            <div className="mb-5 flex items-center justify-between gap-4">
              <h2 className="text-xl font-bold">Deadlines</h2>

              <Link
                to="/deadlines"
                className="rounded-xl border border-slate-700 px-4 py-2 text-sm hover:bg-slate-800"
              >
                View
              </Link>
            </div>

            {deadlines.length === 0 ? (
              <EmptyBox text="No deadlines for this course." />
            ) : (
              <div className="space-y-3">
                {deadlines.slice(0, 5).map((deadline) => (
                  <div
                    key={deadline.id}
                    className="rounded-2xl border border-slate-800 bg-slate-950 p-4"
                  >
                    <div className="mb-2 flex flex-wrap gap-2">
                      <span className="rounded-full bg-indigo-500/10 px-2 py-1 text-xs text-indigo-300">
                        {deadline.type}
                      </span>
                      <span
                        className={`rounded-full px-2 py-1 text-xs ${getPriorityClasses(deadline.priority)}`}
                      >
                        {deadline.priority}
                      </span>
                    </div>

                    <div className="flex items-start gap-3">
                      <AlarmClock className="mt-1 text-yellow-300" size={18} />
                      <div>
                        <p className="font-semibold">{deadline.title}</p>
                        <p className="mt-1 text-sm text-slate-400">
                          Due: {formatDate(deadline.due_date)}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="rounded-3xl border border-slate-800 bg-slate-900 p-6">
            <div className="mb-5 flex items-center justify-between gap-4">
              <h2 className="text-xl font-bold">Study Plans</h2>

              <Link
                to="/study-planner"
                className="rounded-xl border border-slate-700 px-4 py-2 text-sm hover:bg-slate-800"
              >
                View
              </Link>
            </div>

            {studyPlans.length === 0 ? (
              <EmptyBox text="No study plans for this course." />
            ) : (
              <div className="space-y-3">
                {studyPlans.slice(0, 5).map((plan) => (
                  <div
                    key={plan.id}
                    className="rounded-2xl border border-slate-800 bg-slate-950 p-4"
                  >
                    <div className="flex items-start gap-3">
                      <ClipboardList className="mt-1 text-purple-300" size={18} />
                      <div>
                        <p className="font-semibold">{plan.title}</p>
                        <p className="mt-1 text-sm text-slate-400">
                          Exam: {formatDate(plan.exam_date)}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

function StatCard({ title, value, icon: Icon }) {
  return (
    <div className="rounded-3xl border border-slate-800 bg-slate-900 p-6">
      <div className="mb-4 flex items-center justify-between">
        <p className="text-sm text-slate-400">{title}</p>
        <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-indigo-500/10 text-indigo-300">
          <Icon size={22} />
        </div>
      </div>
      <p className="text-4xl font-bold">{value}</p>
    </div>
  )
}

function EmptyBox({ text }) {
  return (
    <div className="rounded-2xl border border-dashed border-slate-700 p-6 text-center text-sm text-slate-400">
      {text}
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

export default CourseDetailsPage