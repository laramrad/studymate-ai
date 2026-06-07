import { useEffect, useState } from "react"
import { Link, useParams } from "react-router-dom"
import api from "../services/api"

function AiAssistantPage() {
  const { materialId } = useParams()

  const [material, setMaterial] = useState(null)
  const [chats, setChats] = useState([])
  const [question, setQuestion] = useState("")
  const [loading, setLoading] = useState(Boolean(materialId))
  const [sending, setSending] = useState(false)
  const [error, setError] = useState("")

  useEffect(() => {
    const fetchChatHistory = async () => {
      if (!materialId) {
        setLoading(false)
        return
      }

      try {
        const response = await api.get(`/materials/${materialId}/ai-chats`)
        setMaterial(response.data.material)
        setChats(response.data.chats)
      } catch (err) {
        setError("Could not load AI chat for this material.")
      } finally {
        setLoading(false)
      }
    }

    fetchChatHistory()
  }, [materialId])

  const handleAsk = async (e) => {
    e.preventDefault()

    if (!materialId) {
      setError("Please open AI Assistant from a material first.")
      return
    }

    if (!question.trim()) {
      setError("Please write a question.")
      return
    }

    setSending(true)
    setError("")

    const currentQuestion = question
    setQuestion("")

    try {
      const response = await api.post(`/materials/${materialId}/ask-ai`, {
        question: currentQuestion,
      })

      setChats([...chats, response.data.chat])
    } catch (err) {
      if (err.response?.data?.message) {
        setError(err.response.data.message)
      } else {
        setError("Could not get AI answer.")
      }

      setQuestion(currentQuestion)
    } finally {
      setSending(false)
    }
  }

  if (loading) {
    return (
      <div className="rounded-3xl border border-slate-800 bg-slate-900 p-8 text-center text-slate-400">
        Loading AI assistant...
      </div>
    )
  }

  return (
    <div>
      <div className="mb-8 flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold">AI Assistant</h1>

          {material ? (
            <p className="mt-2 text-slate-400">
              Asking questions about:{" "}
              <span className="font-semibold text-slate-200">{material.title}</span>
            </p>
          ) : (
            <p className="mt-2 text-slate-400">
              Select a material first to ask AI questions.
            </p>
          )}
        </div>

        <Link
          to="/materials"
          className="rounded-2xl border border-slate-700 px-5 py-3 font-semibold hover:bg-slate-800"
        >
          Back to Materials
        </Link>
      </div>

      {error && (
        <div className="mb-6 rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-300">
          {error}
        </div>
      )}

      {!materialId && (
        <div className="rounded-3xl border border-yellow-500/30 bg-yellow-500/10 p-8 text-yellow-200">
          Open the Materials page and click <strong>Ask AI</strong> on a specific material.
        </div>
      )}

      {materialId && (
        <div className="grid gap-6 xl:grid-cols-3">
          <div className="rounded-3xl border border-slate-800 bg-slate-900 p-6 xl:col-span-2">
            <div className="mb-6 flex items-center justify-between border-b border-slate-800 pb-5">
              <div>
                <h2 className="text-xl font-bold">Chat with StudyMate AI</h2>
                <p className="text-sm text-slate-400">
                  Answers are based on the uploaded material.
                </p>
              </div>

              <span className="rounded-full bg-green-500/10 px-3 py-1 text-sm text-green-300">
                Online
              </span>
            </div>

            <div className="max-h-[520px] min-h-[360px] space-y-5 overflow-auto rounded-2xl bg-slate-950 p-5">
              {chats.length === 0 ? (
                <div className="flex h-72 items-center justify-center text-center text-slate-500">
                  <div>
                    <p className="text-lg font-semibold text-slate-300">
                      No questions yet
                    </p>
                    <p className="mt-2 text-sm">
                      Ask something like: “Summarize this material” or “Explain the main idea.”
                    </p>
                  </div>
                </div>
              ) : (
                chats.map((chat) => (
                  <div key={chat.id} className="space-y-4">
                    <ChatBubble type="student" text={chat.question} />
                    <ChatBubble type="ai" text={chat.answer} />
                  </div>
                ))
              )}

              {sending && (
                <ChatBubble type="ai" text="StudyMate AI is thinking..." />
              )}
            </div>

            <form onSubmit={handleAsk} className="mt-6 flex gap-3">
              <input
                value={question}
                onChange={(e) => setQuestion(e.target.value)}
                className="flex-1 rounded-2xl border border-slate-700 bg-slate-950 px-4 py-3 outline-none focus:border-indigo-500"
                placeholder="Ask StudyMate AI..."
                disabled={sending}
              />

              <button
                type="submit"
                disabled={sending}
                className="rounded-2xl bg-indigo-500 px-6 py-3 font-semibold hover:bg-indigo-600 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {sending ? "Sending..." : "Send"}
              </button>
            </form>
          </div>

          <div className="space-y-6">
            <div className="rounded-3xl border border-slate-800 bg-slate-900 p-6">
              <h2 className="text-xl font-bold">Material</h2>

              {material && (
                <div className="mt-5 space-y-3 text-sm text-slate-400">
                  <InfoRow label="Title" value={material.title} />
                  <InfoRow label="Course" value={material.course?.name || "No course"} />
                  <InfoRow label="File" value={material.original_filename} />
                </div>
              )}
            </div>

            <div className="rounded-3xl border border-slate-800 bg-slate-900 p-6">
              <h2 className="text-xl font-bold">Quick Prompts</h2>

              <div className="mt-5 space-y-3">
                <PromptButton text="Summarize this material" setQuestion={setQuestion} />
                <PromptButton text="Explain the most important concepts" setQuestion={setQuestion} />
                <PromptButton text="Create 5 exam questions from this material" setQuestion={setQuestion} />
                <PromptButton text="List the key definitions" setQuestion={setQuestion} />
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

function ChatBubble({ type, text }) {
  const isAi = type === "ai"

  return (
    <div className={`flex ${isAi ? "justify-start" : "justify-end"}`}>
      <div
        className={`max-w-2xl whitespace-pre-wrap rounded-2xl px-5 py-4 text-sm leading-7 ${
          isAi
            ? "bg-slate-900 text-slate-300"
            : "bg-indigo-500 text-white"
        }`}
      >
        {text}
      </div>
    </div>
  )
}

function InfoRow({ label, value }) {
  return (
    <div className="rounded-2xl bg-slate-950 p-4">
      <p className="text-xs text-slate-500">{label}</p>
      <p className="mt-1 break-words font-semibold text-slate-300">{value || "-"}</p>
    </div>
  )
}

function PromptButton({ text, setQuestion }) {
  return (
    <button
      type="button"
      onClick={() => setQuestion(text)}
      className="w-full rounded-2xl border border-slate-800 bg-slate-950 px-4 py-3 text-left text-sm hover:border-indigo-500 hover:text-white"
    >
      {text}
    </button>
  )
}

export default AiAssistantPage