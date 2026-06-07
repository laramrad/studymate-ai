import { useEffect, useState } from "react"
import api from "../services/api"

function AdminCoursesPage() {
  const [courses, setCourses] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")

  const fetchCourses = async () => {
    try {
      const response = await api.get("/admin/courses")
      setCourses(response.data.courses)
    } catch (err) {
      setError("Could not load courses.")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchCourses()
  }, [])

  if (loading) {
    return (
      <div className="rounded-3xl border border-slate-800 bg-slate-900 p-8 text-center text-slate-400">
        Loading courses...
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
        <h1 className="text-3xl font-bold">All Courses</h1>
        <p className="mt-2 text-slate-400">
          View all courses created by students.
        </p>
      </div>

      {courses.length === 0 ? (
        <EmptyState text="No courses found." />
      ) : (
        <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
          {courses.map((course) => (
            <div key={course.id} className="rounded-3xl border border-slate-800 bg-slate-900 p-6">
              <span className="rounded-full bg-indigo-500/10 px-3 py-1 text-sm text-indigo-300">
                {course.code || "Course"}
              </span>

              <h2 className="mt-4 text-xl font-bold">{course.name}</h2>

              <div className="mt-4 space-y-2 text-sm text-slate-400">
                <p>Student: {course.user?.name || "Unknown"}</p>
                <p>Email: {course.user?.email || "-"}</p>
                <p>Instructor: {course.instructor || "-"}</p>
                <p>Semester: {course.semester || "-"}</p>
              </div>

              <div className="mt-5 grid grid-cols-3 gap-3">
                <SmallStat label="Materials" value={course.materials_count} />
                <SmallStat label="Deadlines" value={course.deadlines_count} />
                <SmallStat label="Plans" value={course.study_plans_count} />
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

function SmallStat({ label, value }) {
  return (
    <div className="rounded-2xl bg-slate-950 p-3 text-center">
      <p className="text-lg font-bold">{value}</p>
      <p className="text-xs text-slate-500">{label}</p>
    </div>
  )
}

function EmptyState({ text }) {
  return (
    <div className="rounded-3xl border border-dashed border-slate-700 bg-slate-900/60 p-12 text-center text-slate-400">
      {text}
    </div>
  )
}

export default AdminCoursesPage