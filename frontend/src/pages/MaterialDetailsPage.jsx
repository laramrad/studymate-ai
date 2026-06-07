import { useEffect, useState } from "react"
import { Link, useParams } from "react-router-dom"
import {
  ArrowLeft,
  Bot,
  FileText,
  Clock,
  KeyRound,
  Sparkles,
  ExternalLink,
  ClipboardList,
  Brain,
} from "lucide-react"
import api from "../services/api"

function MaterialDetailsPage() {
  const { id } = useParams()

  const [material, setMaterial] = useState(null)
  const [fileUrl, setFileUrl] = useState("")
  const [studySummary, setStudySummary] = useState(null)
  const [loading, setLoading] = useState(true)
  const [summaryLoading, setSummaryLoading] = useState(true)
  const [error, setError] = useState("")
  const [summaryError, setSummaryError] = useState("")

  useEffect(() => {
    const fetchMaterial = async () => {
      try {
        const response = await api.get(`/materials/${id}`)
        setMaterial(response.data.material)
        setFileUrl(response.data.file_url)
      } catch (err) {
        setError("Could not load material.")
      } finally {
        setLoading(false)
      }
    }

    const fetchSummary = async () => {
      try {
        const response = await api.get(`/materials/${id}/summary`)
        setStudySummary(response.data)
      } catch (err) {
        setSummaryError("Could not generate study summary.")
      } finally {
        setSummaryLoading(false)
      }
    }

    fetchMaterial()
    fetchSummary()
  }, [id])

  if (loading) {
    return (
      <div className="rounded-3xl border border-slate-800 bg-slate-900 p-8 text-center text-slate-400">
        Loading material...
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

  if (!material) {
    return (
      <div className="rounded-xl border border-yellow-500/30 bg-yellow-500/10 px-4 py-3 text-sm text-yellow-300">
        Material not found.
      </div>
    )
  }

  return (
    <div>
      <div className="mb-8 flex flex-wrap items-center justify-between gap-4">
        <div>
          <Link
            to="/materials"
            className="inline-flex items-center gap-2 text-sm text-indigo-400 hover:text-indigo-300"
          >
            <ArrowLeft size={16} />
            Back to Materials
          </Link>

          <div className="mt-4 flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-cyan-500/10 text-cyan-300">
              <FileText size={24} />
            </div>

            <div>
              <h1 className="text-3xl font-bold">{material.title}</h1>
              <p className="mt-1 text-slate-400">
                Course: {material.course?.name || "No course"}
              </p>
            </div>
          </div>
        </div>

        <Link
          to={`/ai-assistant/${material.id}`}
          className="inline-flex items-center gap-2 rounded-2xl bg-indigo-500 px-5 py-3 font-semibold hover:bg-indigo-600"
        >
          <Bot size={18} />
          Ask AI About This Material
        </Link>
      </div>

      <div className="mb-6 grid gap-6 md:grid-cols-3">
        <SmartStatCard title="Words" value={studySummary?.word_count ?? "-"} icon={FileText} />
        <SmartStatCard
          title="Reading Time"
          value={studySummary ? `${studySummary.reading_time_minutes} min` : "-"}
          icon={Clock}
        />
        <SmartStatCard title="Key Terms" value={studySummary?.key_terms?.length ?? "-"} icon={KeyRound} />
      </div>

      <div className="mb-6 rounded-3xl border border-indigo-500/20 bg-gradient-to-r from-indigo-500/10 to-cyan-500/10 p-6">
        <div className="mb-5 flex flex-wrap items-center justify-between gap-4">
          <div>
            <div className="mb-2 flex items-center gap-2">
              <Sparkles className="text-indigo-300" size={22} />
              <h2 className="text-xl font-bold">Smart Study Summary</h2>
            </div>
            <p className="text-sm text-slate-400">
              Auto-generated summary and study hints from the extracted material text.
            </p>
          </div>

          <span className="inline-flex items-center gap-2 rounded-full bg-indigo-500/10 px-3 py-1 text-sm text-indigo-300">
            <Sparkles size={15} />
            Local AI-style analysis
          </span>
        </div>

        {summaryLoading ? (
          <div className="rounded-2xl border border-slate-800 bg-slate-950 p-5 text-slate-400">
            Generating summary...
          </div>
        ) : summaryError ? (
          <div className="rounded-2xl border border-red-500/30 bg-red-500/10 p-5 text-sm text-red-300">
            {summaryError}
          </div>
        ) : (
          <div className="grid gap-6 xl:grid-cols-3">
            <div className="rounded-2xl border border-slate-800 bg-slate-950 p-5 xl:col-span-2">
              <h3 className="mb-3 font-bold">Summary</h3>
              <p className="leading-7 text-slate-300">{studySummary.summary}</p>
            </div>

            <div className="rounded-2xl border border-slate-800 bg-slate-950 p-5">
              <h3 className="mb-3 font-bold">Key Terms</h3>

              {studySummary.key_terms.length === 0 ? (
                <p className="text-sm text-slate-500">No key terms detected.</p>
              ) : (
                <div className="flex flex-wrap gap-2">
                  {studySummary.key_terms.map((term) => (
                    <span
                      key={term}
                      className="rounded-full bg-cyan-500/10 px-3 py-1 text-sm text-cyan-300"
                    >
                      {term}
                    </span>
                  ))}
                </div>
              )}
            </div>

            <div className="rounded-2xl border border-slate-800 bg-slate-950 p-5 xl:col-span-3">
              <h3 className="mb-3 font-bold">Study Tips</h3>

              <div className="grid gap-3 md:grid-cols-2">
                {studySummary.study_tips.map((tip, index) => (
                  <div
                    key={index}
                    className="rounded-2xl border border-slate-800 bg-slate-900 p-4 text-sm leading-6 text-slate-300"
                  >
                    {tip}
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>

      <div className="grid gap-6 xl:grid-cols-3">
        <div className="rounded-3xl border border-slate-800 bg-slate-900 p-6 xl:col-span-2">
          <h2 className="text-xl font-bold">Extracted Text Preview</h2>
          <p className="mt-2 text-sm text-slate-400">
            This is the text that will be used by the AI assistant.
          </p>

          <div className="mt-6 max-h-[500px] overflow-auto rounded-2xl border border-slate-800 bg-slate-950 p-5">
            <pre className="whitespace-pre-wrap text-sm leading-7 text-slate-300">
              {material.extracted_text || "No extracted text available."}
            </pre>
          </div>
        </div>

        <div className="space-y-6">
          <div className="rounded-3xl border border-slate-800 bg-slate-900 p-6">
            <h2 className="text-xl font-bold">Material Info</h2>

            <div className="mt-5 space-y-3 text-sm text-slate-400">
              <InfoRow label="Original file" value={material.original_filename} />
              <InfoRow label="File type" value={material.file_type?.toUpperCase()} />
              <InfoRow
                label="File size"
                value={`${((material.file_size || 0) / 1024 / 1024).toFixed(2)} MB`}
              />
              <InfoRow label="Course" value={material.course?.name || "No course"} />
            </div>
          </div>

          <div className="rounded-3xl border border-slate-800 bg-slate-900 p-6">
            <h2 className="text-xl font-bold">Actions</h2>

            <div className="mt-5 space-y-3">
              <a
                href={fileUrl}
                target="_blank"
                rel="noreferrer"
                className="flex items-center justify-center gap-2 rounded-2xl border border-slate-700 px-4 py-3 text-center font-semibold hover:bg-slate-800"
              >
                <ExternalLink size={18} />
                Open Uploaded File
              </a>

              <Link
                to={`/ai-assistant/${material.id}`}
                className="flex items-center justify-center gap-2 rounded-2xl bg-indigo-500 px-4 py-3 text-center font-semibold hover:bg-indigo-600"
              >
                <Bot size={18} />
                Ask AI
              </Link>

              <Link
                to="/quizzes"
                className="flex items-center justify-center gap-2 rounded-2xl border border-slate-700 px-4 py-3 text-center font-semibold hover:bg-slate-800"
              >
                <ClipboardList size={18} />
                View Quizzes
              </Link>

              <Link
                to="/flashcards"
                className="flex items-center justify-center gap-2 rounded-2xl border border-slate-700 px-4 py-3 text-center font-semibold hover:bg-slate-800"
              >
                <Brain size={18} />
                View Flashcards
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

function SmartStatCard({ title, value, icon: Icon }) {
  return (
    <div className="rounded-3xl border border-slate-800 bg-slate-900 p-6">
      <div className="mb-4 flex items-center justify-between">
        <p className="text-sm text-slate-400">{title}</p>
        <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-cyan-500/10 text-cyan-300">
          <Icon size={22} />
        </div>
      </div>

      <p className="text-3xl font-bold">{value}</p>
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

export default MaterialDetailsPage