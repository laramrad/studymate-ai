import { useEffect, useState } from "react"
import { Link } from "react-router-dom"
import api from "../services/api"

function QuizzesPage() {
  const [quizzes, setQuizzes] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const [success, setSuccess] = useState("")

  const fetchQuizzes = async () => {
    try {
      const response = await api.get("/quizzes")
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

  const handleDelete = async (quizId) => {
    const confirmed = window.confirm("Are you sure you want to delete this quiz?")

    if (!confirmed) return

    try {
      await api.delete(`/quizzes/${quizId}`)
      setQuizzes(quizzes.filter((quiz) => quiz.id !== quizId))
      setSuccess("Quiz deleted successfully.")
    } catch (err) {
      setError("Could not delete quiz.")
    }
  }

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-bold">Quizzes</h1>
        <p className="mt-2 text-slate-400">
          Generate quizzes from uploaded materials and track your scores.
        </p>
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

      {loading ? (
        <div className="rounded-3xl border border-slate-800 bg-slate-900 p-8 text-center text-slate-400">
          Loading quizzes...
        </div>
      ) : quizzes.length === 0 ? (
        <div className="rounded-3xl border border-dashed border-slate-700 bg-slate-900/60 p-12 text-center">
          <p className="text-xl font-bold">No quizzes yet</p>
          <p className="mt-2 text-slate-400">
            Go to Materials and click Generate Quiz on any uploaded material.
          </p>
          <Link
            to="/materials"
            className="mt-6 inline-block rounded-xl bg-indigo-500 px-5 py-3 font-semibold hover:bg-indigo-600"
          >
            Go to Materials
          </Link>
        </div>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
          {quizzes.map((quiz) => (
            <QuizCard key={quiz.id} quiz={quiz} onDelete={handleDelete} />
          ))}
        </div>
      )}
    </div>
  )
}

function QuizCard({ quiz, onDelete }) {
  const latestAttempt = quiz.attempts?.[0]
  const questionCount = quiz.questions?.length || 0

  return (
    <div className="rounded-3xl border border-slate-800 bg-slate-900 p-6 hover:border-indigo-500/50">
      <div className="mb-5 flex items-start justify-between gap-4">
        <span className="rounded-full bg-indigo-500/10 px-3 py-1 text-sm text-indigo-300">
          {questionCount} Questions
        </span>

        <button
          onClick={() => onDelete(quiz.id)}
          className="rounded-xl bg-red-500/10 px-3 py-2 text-sm text-red-300 hover:bg-red-500 hover:text-white"
        >
          Delete
        </button>
      </div>

      <h2 className="text-xl font-bold">{quiz.title}</h2>

      <div className="mt-4 space-y-2 text-sm text-slate-400">
        <p>Material: {quiz.material?.title || "No material"}</p>
        <p>Course: {quiz.material?.course?.name || "No course"}</p>
      </div>

      {latestAttempt ? (
        <div className="mt-5 rounded-2xl bg-green-500/10 p-4 text-sm text-green-300">
          Latest score: {latestAttempt.score}/{latestAttempt.total_questions} ({latestAttempt.percentage}%)
        </div>
      ) : (
        <div className="mt-5 rounded-2xl bg-yellow-500/10 p-4 text-sm text-yellow-300">
          Not attempted yet
        </div>
      )}

      <Link
        to={`/quizzes/${quiz.id}`}
        className="mt-6 block w-full rounded-xl bg-indigo-500 px-4 py-3 text-center font-semibold hover:bg-indigo-600"
      >
        Open Quiz
      </Link>
    </div>
  )
}

export default QuizzesPage