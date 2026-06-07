import { useEffect, useState } from "react"
import api from "../services/api"

function AdminStudentsPage() {
  const [students, setStudents] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")

  const fetchStudents = async () => {
    try {
      const response = await api.get("/admin/students")
      setStudents(response.data.students)
    } catch (err) {
      setError("Could not load students.")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchStudents()
  }, [])

  return (
    <AdminListPage
      title="Students"
      description="View all registered student accounts and their activity."
      loading={loading}
      error={error}
    >
      {students.length === 0 ? (
        <EmptyState text="No students found." />
      ) : (
        <div className="overflow-hidden rounded-3xl border border-slate-800 bg-slate-900">
          <table className="w-full min-w-[900px] text-left text-sm">
            <thead className="border-b border-slate-800 bg-slate-950 text-slate-400">
              <tr>
                <th className="px-5 py-4">Student</th>
                <th className="px-5 py-4">Email</th>
                <th className="px-5 py-4">Courses</th>
                <th className="px-5 py-4">Materials</th>
                <th className="px-5 py-4">Quizzes</th>
                <th className="px-5 py-4">Deadlines</th>
                <th className="px-5 py-4">Study Plans</th>
              </tr>
            </thead>
            <tbody>
              {students.map((student) => (
                <tr key={student.id} className="border-b border-slate-800 last:border-0">
                  <td className="px-5 py-4 font-semibold">{student.name}</td>
                  <td className="px-5 py-4 text-slate-400">{student.email}</td>
                  <td className="px-5 py-4">{student.courses_count}</td>
                  <td className="px-5 py-4">{student.materials_count}</td>
                  <td className="px-5 py-4">{student.quizzes_count}</td>
                  <td className="px-5 py-4">{student.deadlines_count}</td>
                  <td className="px-5 py-4">{student.study_plans_count}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </AdminListPage>
  )
}

function AdminListPage({ title, description, loading, error, children }) {
  if (loading) {
    return (
      <div className="rounded-3xl border border-slate-800 bg-slate-900 p-8 text-center text-slate-400">
        Loading...
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
        <h1 className="text-3xl font-bold">{title}</h1>
        <p className="mt-2 text-slate-400">{description}</p>
      </div>

      <div className="overflow-x-auto">{children}</div>
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

export default AdminStudentsPage