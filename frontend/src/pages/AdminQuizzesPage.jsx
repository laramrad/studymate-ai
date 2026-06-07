import { useEffect, useState } from "react"
import api from "../services/api"

function AdminQuizzesPage() {
  const [quizzes, setQuizzes] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")

  const fetchQuizzes = async () => {
    try {
      const response = await api.get("/admin/quizzes")
      setQuizzes(response.data.quizzes)
    } catch (err) {
      setError("Could not load quizzes.")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchQuizzes()
  }, [])

  if (loading) {
    return (
      <div className="rounded-3xl border border-slate-800 bg-slate-900 p-8 text-center text-slate-400">
        Loading quizzes...
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
        <h1 className="text-3xl font-bold">All Quizzes</h1>
        <p className="mt-2 text-slate-400">
          View generated quizzes and attempts across the platform.
        </p>
      </div>

      {quizzes.length === 0 ? (
        <EmptyState text="No quizzes found." />
      ) : (
        <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
          {quizzes.map((quiz) => (
            <div key={quiz.id} className="rounded-3xl border border-slate-800 bg-slate-900 p-6">
              <span className="rounded-full bg-indigo-500/10 px-3 py-1 text-sm text-indigo-300">
                {quiz.questions_count} Questions
              </span>

              <h2 className="mt-4 text-xl font-bold">{quiz.title}</h2>

              <div className="mt-4 space-y-2 text-sm text-slate-400">
                <p>Student: {quiz.user?.name || "Unknown"}</p>
                <p>Email: {quiz.user?.email || "-"}</p>
                <p>Material: {quiz.material?.title || "No material"}</p>
                <p>Course: {quiz.material?.course?.name || "No course"}</p>
                <p>Attempts: {quiz.attempts_count}</p>
              </div>
            </div>
          ))}
        </div>
      )}
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

export default AdminQuizzesPage