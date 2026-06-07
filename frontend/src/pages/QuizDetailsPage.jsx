import { useEffect, useState } from "react"
import { Link, useParams } from "react-router-dom"
import api from "../services/api"

function QuizDetailsPage() {
  const { id } = useParams()

  const [quiz, setQuiz] = useState(null)
  const [answers, setAnswers] = useState({})
  const [attempt, setAttempt] = useState(null)
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState("")

  const fetchQuiz = async () => {
    try {
      const response = await api.get(`/quizzes/${id}`)
      setQuiz(response.data.quiz)
    } catch (err) {
      setError("Could not load quiz.")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchQuiz()
  }, [id])

  const handleAnswerChange = (questionId, optionKey) => {
    setAnswers({
      ...answers,
      [questionId]: optionKey,
    })
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setSubmitting(true)
    setError("")

    try {
      const response = await api.post(`/quizzes/${id}/submit`, {
        answers,
      })

      setAttempt(response.data.attempt)
      await fetchQuiz()
    } catch (err) {
      if (err.response?.data?.message) {
        setError(err.response.data.message)
      } else {
        setError("Could not submit quiz.")
      }
    } finally {
      setSubmitting(false)
    }
  }

  if (loading) {
    return (
      <div className="rounded-3xl border border-slate-800 bg-slate-900 p-8 text-center text-slate-400">
        Loading quiz...
      </div>
    )
  }

  if (error && !quiz) {
    return (
      <div className="rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-300">
        {error}
      </div>
    )
  }

  if (!quiz) {
    return (
      <div className="rounded-xl border border-yellow-500/30 bg-yellow-500/10 px-4 py-3 text-sm text-yellow-300">
        Quiz not found.
      </div>
    )
  }

  const latestAttempt = attempt || quiz.attempts?.[0]

  return (
    <div>
      <div className="mb-8 flex flex-wrap items-center justify-between gap-4">
        <div>
          <Link to="/quizzes" className="text-sm text-indigo-400 hover:text-indigo-300">
            ← Back to Quizzes
          </Link>

          <h1 className="mt-3 text-3xl font-bold">{quiz.title}</h1>
          <p className="mt-2 text-slate-400">
            Material: {quiz.material?.title || "No material"}
          </p>
        </div>

        {latestAttempt && (
          <div className="rounded-3xl border border-green-500/30 bg-green-500/10 px-6 py-4 text-green-300">
            <p className="text-sm">Latest Score</p>
            <p className="text-2xl font-bold">
              {latestAttempt.score}/{latestAttempt.total_questions} ({latestAttempt.percentage}%)
            </p>
          </div>
        )}
      </div>

      {error && (
        <div className="mb-6 rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-300">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        {quiz.questions.map((question, index) => (
          <QuestionCard
            key={question.id}
            question={question}
            index={index}
            selectedAnswer={answers[question.id]}
            onAnswerChange={handleAnswerChange}
            latestAttempt={latestAttempt}
          />
        ))}

        <button
          type="submit"
          disabled={submitting}
          className="rounded-2xl bg-indigo-500 px-7 py-4 font-semibold hover:bg-indigo-600 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {submitting ? "Submitting..." : "Submit Quiz"}
        </button>
      </form>
    </div>
  )
}

function QuestionCard({ question, index, selectedAnswer, onAnswerChange, latestAttempt }) {
  const answerResult = latestAttempt?.answers?.[question.id]
  const correctAnswer = answerResult?.correct_answer
  const studentAnswer = answerResult?.student_answer

  return (
    <div className="rounded-3xl border border-slate-800 bg-slate-900 p-6">
      <div className="mb-5">
        <span className="rounded-full bg-indigo-500/10 px-3 py-1 text-sm text-indigo-300">
          Question {index + 1}
        </span>

        <h2 className="mt-4 text-xl font-bold leading-8">{question.question}</h2>
      </div>

      <div className="space-y-3">
        {Object.entries(question.options).map(([key, value]) => {
          const isSelected = selectedAnswer === key
          const isCorrect = latestAttempt && key === correctAnswer
          const isWrongSelected = latestAttempt && key === studentAnswer && key !== correctAnswer

          return (
            <label
              key={key}
              className={`block cursor-pointer rounded-2xl border px-4 py-3 transition ${
                isCorrect
                  ? "border-green-500 bg-green-500/10 text-green-300"
                  : isWrongSelected
                    ? "border-red-500 bg-red-500/10 text-red-300"
                    : isSelected
                      ? "border-indigo-500 bg-indigo-500/10"
                      : "border-slate-800 bg-slate-950 hover:border-indigo-500"
              }`}
            >
              <input
                type="radio"
                name={`question-${question.id}`}
                value={key}
                checked={selectedAnswer === key}
                onChange={() => onAnswerChange(question.id, key)}
                className="mr-3"
              />

              <span className="font-semibold">{key}.</span>{" "}
              <span>{value}</span>
            </label>
          )
        })}
      </div>

      {latestAttempt && (
        <div className="mt-5 rounded-2xl border border-slate-800 bg-slate-950 p-4 text-sm text-slate-300">
          <p>
            Correct answer:{" "}
            <span className="font-bold text-green-300">{correctAnswer}</span>
          </p>
          {question.explanation && (
            <p className="mt-2 text-slate-400">{question.explanation}</p>
          )}
        </div>
      )}
    </div>
  )
}

export default QuizDetailsPage