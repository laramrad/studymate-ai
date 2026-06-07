import { useEffect, useMemo, useState } from "react"
import { Link, useNavigate } from "react-router-dom"
import api from "../services/api"

function MaterialsPage() {
  const navigate = useNavigate()

  const [materials, setMaterials] = useState([])
  const [courses, setCourses] = useState([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [generatingQuizId, setGeneratingQuizId] = useState(null)
  const [generatingFlashcardsId, setGeneratingFlashcardsId] = useState(null)
  const [error, setError] = useState("")
  const [success, setSuccess] = useState("")
  const [showForm, setShowForm] = useState(false)

  const [searchTerm, setSearchTerm] = useState("")
  const [courseFilter, setCourseFilter] = useState("all")
  const [fileTypeFilter, setFileTypeFilter] = useState("all")

  const [form, setForm] = useState({
    course_id: "",
    title: "",
    file: null,
  })

  const fetchData = async () => {
    try {
      const [materialsResponse, coursesResponse] = await Promise.all([
        api.get("/materials"),
        api.get("/courses"),
      ])

      setMaterials(materialsResponse.data.materials)
      setCourses(coursesResponse.data.courses)
    } catch (err) {
      setError("Could not load materials. Please login again.")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchData()
  }, [])

  const fileTypes = useMemo(() => {
    const types = materials
      .map((material) => material.file_type)
      .filter((type) => type && type.trim() !== "")

    return Array.from(new Set(types))
  }, [materials])

  const filteredMaterials = useMemo(() => {
    return materials.filter((material) => {
      const search = searchTerm.toLowerCase()

      const matchesSearch =
        material.title?.toLowerCase().includes(search) ||
        material.original_filename?.toLowerCase().includes(search) ||
        material.file_type?.toLowerCase().includes(search) ||
        material.course?.name?.toLowerCase().includes(search)

      const matchesCourse =
        courseFilter === "all" || Number(material.course_id) === Number(courseFilter)

      const matchesFileType =
        fileTypeFilter === "all" || material.file_type === fileTypeFilter

      return matchesSearch && matchesCourse && matchesFileType
    })
  }, [materials, searchTerm, courseFilter, fileTypeFilter])

  const clearFilters = () => {
    setSearchTerm("")
    setCourseFilter("all")
    setFileTypeFilter("all")
  }

  const handleInputChange = (e) => {
    setForm({
      ...form,
      [e.target.name]: e.target.value,
    })
  }

  const handleFileChange = (e) => {
    setForm({
      ...form,
      file: e.target.files[0],
    })
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setSaving(true)
    setError("")
    setSuccess("")

    if (!form.course_id) {
      setError("Please select a course.")
      setSaving(false)
      return
    }

    if (!form.title) {
      setError("Please enter a material title.")
      setSaving(false)
      return
    }

    if (!form.file) {
      setError("Please choose a file.")
      setSaving(false)
      return
    }

    try {
      const formData = new FormData()
      formData.append("course_id", form.course_id)
      formData.append("title", form.title)
      formData.append("file", form.file)

      const response = await api.post("/materials", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      })

      setMaterials([response.data.material, ...materials])
      setSuccess("Material uploaded successfully.")

      setForm({
        course_id: "",
        title: "",
        file: null,
      })

      e.target.reset()
      setShowForm(false)
    } catch (err) {
      if (err.response?.data?.message) {
        setError(err.response.data.message)
      } else {
        setError("Could not upload material.")
      }
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async (materialId) => {
    const confirmed = window.confirm("Are you sure you want to delete this material?")

    if (!confirmed) return

    try {
      await api.delete(`/materials/${materialId}`)
      setMaterials(materials.filter((material) => material.id !== materialId))
      setSuccess("Material deleted successfully.")
    } catch (err) {
      setError("Could not delete material.")
    }
  }

  const handleGenerateQuiz = async (material, questionCount) => {
    setGeneratingQuizId(material.id)
    setError("")
    setSuccess("")

    try {
      const response = await api.post(`/materials/${material.id}/generate-quiz`, {
        title: `Quiz - ${material.title}`,
        question_count: Number(questionCount),
      })

      setSuccess("Quiz generated successfully.")
      navigate(`/quizzes/${response.data.quiz.id}`)
    } catch (err) {
      if (err.response?.data?.message) {
        setError(err.response.data.message)
      } else {
        setError("Could not generate quiz.")
      }
    } finally {
      setGeneratingQuizId(null)
    }
  }

  const handleGenerateFlashcards = async (material, cardCount) => {
    setGeneratingFlashcardsId(material.id)
    setError("")
    setSuccess("")

    try {
      await api.post(`/materials/${material.id}/generate-flashcards`, {
        card_count: Number(cardCount),
      })

      setSuccess("Flashcards generated successfully.")
      navigate("/flashcards")
    } catch (err) {
      if (err.response?.data?.message) {
        setError(err.response.data.message)
      } else {
        setError("Could not generate flashcards.")
      }
    } finally {
      setGeneratingFlashcardsId(null)
    }
  }

  return (
    <div>
      <div className="mb-8 flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold">Materials</h1>
          <p className="mt-2 text-slate-400">
            Upload, search, filter, and study your course documents.
          </p>
        </div>

        <button
          type="button"
          onClick={() => setShowForm((previous) => !previous)}
          className="rounded-2xl bg-indigo-500 px-5 py-3 font-semibold hover:bg-indigo-600"
        >
          {showForm ? "Close Form" : "Upload Material"}
        </button>
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

      {showForm && (
        <form
          onSubmit={handleSubmit}
          className="mb-8 rounded-3xl border border-slate-800 bg-slate-900 p-6"
        >
          <h2 className="mb-5 text-xl font-bold">Upload New Material</h2>

          {courses.length === 0 && (
            <div className="mb-5 rounded-xl border border-yellow-500/30 bg-yellow-500/10 px-4 py-3 text-sm text-yellow-200">
              You need to create a course before uploading materials.
            </div>
          )}

          <div className="grid gap-5 md:grid-cols-2">
            <div>
              <label className="mb-2 block text-sm text-slate-300">Course *</label>
              <select
                name="course_id"
                value={form.course_id}
                onChange={handleInputChange}
                className="w-full rounded-xl border border-slate-700 bg-slate-950 px-4 py-3 outline-none focus:border-indigo-500"
                required
              >
                <option value="">Select course</option>
                {courses.map((course) => (
                  <option key={course.id} value={course.id}>
                    {course.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="mb-2 block text-sm text-slate-300">Material Title *</label>
              <input
                type="text"
                name="title"
                value={form.title}
                onChange={handleInputChange}
                className="w-full rounded-xl border border-slate-700 bg-slate-950 px-4 py-3 outline-none focus:border-indigo-500"
                placeholder="Chapter 1 - Introduction"
                required
              />
            </div>
          </div>

          <div className="mt-5">
            <label className="mb-2 block text-sm text-slate-300">File *</label>
            <input
              type="file"
              onChange={handleFileChange}
              accept=".pdf,.txt,.doc,.docx"
              className="w-full rounded-xl border border-slate-700 bg-slate-950 px-4 py-3 text-slate-300 outline-none file:mr-4 file:rounded-xl file:border-0 file:bg-indigo-500 file:px-4 file:py-2 file:font-semibold file:text-white hover:file:bg-indigo-600"
              required
            />

            {form.file && (
              <p className="mt-2 text-sm text-green-300">
                Selected file: {form.file.name}
              </p>
            )}

            <p className="mt-2 text-sm text-slate-500">
              Allowed: PDF, TXT, DOC, DOCX. Max size: 10MB.
            </p>
          </div>

          <button
            type="submit"
            disabled={saving || courses.length === 0}
            className="mt-5 rounded-xl bg-indigo-500 px-6 py-3 font-semibold hover:bg-indigo-600 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {saving ? "Uploading..." : "Upload Material"}
          </button>
        </form>
      )}

      <div className="mb-8 rounded-3xl border border-slate-800 bg-slate-900 p-6">
        <div className="mb-5 flex flex-wrap items-center justify-between gap-4">
          <div>
            <h2 className="text-xl font-bold">Search & Filter</h2>
            <p className="mt-1 text-sm text-slate-400">
              Showing {filteredMaterials.length} of {materials.length} materials.
            </p>
          </div>

          <button
            type="button"
            onClick={clearFilters}
            className="rounded-xl border border-slate-700 px-4 py-2 text-sm hover:bg-slate-800"
          >
            Clear Filters
          </button>
        </div>

        <div className="grid gap-4 md:grid-cols-3">
          <div>
            <label className="mb-2 block text-sm text-slate-300">Search</label>
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full rounded-xl border border-slate-700 bg-slate-950 px-4 py-3 outline-none focus:border-indigo-500"
              placeholder="Search title, file, course..."
            />
          </div>

          <div>
            <label className="mb-2 block text-sm text-slate-300">Course</label>
            <select
              value={courseFilter}
              onChange={(e) => setCourseFilter(e.target.value)}
              className="w-full rounded-xl border border-slate-700 bg-slate-950 px-4 py-3 outline-none focus:border-indigo-500"
            >
              <option value="all">All courses</option>
              {courses.map((course) => (
                <option key={course.id} value={course.id}>
                  {course.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="mb-2 block text-sm text-slate-300">File Type</label>
            <select
              value={fileTypeFilter}
              onChange={(e) => setFileTypeFilter(e.target.value)}
              className="w-full rounded-xl border border-slate-700 bg-slate-950 px-4 py-3 outline-none focus:border-indigo-500"
            >
              <option value="all">All file types</option>
              {fileTypes.map((type) => (
                <option key={type} value={type}>
                  {type.toUpperCase()}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {loading ? (
        <div className="rounded-3xl border border-slate-800 bg-slate-900 p-8 text-center text-slate-400">
          Loading materials...
        </div>
      ) : materials.length === 0 ? (
        <div className="rounded-3xl border border-dashed border-slate-700 bg-slate-900/60 p-12 text-center">
          <p className="text-xl font-bold">No materials uploaded yet</p>
          <p className="mt-2 text-slate-400">
            Upload your first PDF or note to start using AI features.
          </p>
        </div>
      ) : filteredMaterials.length === 0 ? (
        <div className="rounded-3xl border border-dashed border-slate-700 bg-slate-900/60 p-12 text-center">
          <p className="text-xl font-bold">No matching materials</p>
          <p className="mt-2 text-slate-400">
            Try changing your search or filters.
          </p>
        </div>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
          {filteredMaterials.map((material) => (
            <MaterialCard
              key={material.id}
              material={material}
              onDelete={handleDelete}
              onGenerateQuiz={handleGenerateQuiz}
              onGenerateFlashcards={handleGenerateFlashcards}
              generatingQuizId={generatingQuizId}
              generatingFlashcardsId={generatingFlashcardsId}
            />
          ))}
        </div>
      )}
    </div>
  )
}

function MaterialCard({
  material,
  onDelete,
  onGenerateQuiz,
  onGenerateFlashcards,
  generatingQuizId,
  generatingFlashcardsId,
}) {
  const [questionCount, setQuestionCount] = useState(5)
  const [cardCount, setCardCount] = useState(6)

  const fileSizeMb = material.file_size
    ? (material.file_size / 1024 / 1024).toFixed(2)
    : "0.00"

  const isGeneratingQuiz = generatingQuizId === material.id
  const isGeneratingFlashcards = generatingFlashcardsId === material.id

  return (
    <div className="rounded-3xl border border-slate-800 bg-slate-900 p-6 hover:border-indigo-500/50">
      <div className="mb-5 flex items-start justify-between gap-4">
        <div>
          <span className="rounded-full bg-cyan-500/10 px-3 py-1 text-sm uppercase text-cyan-300">
            {material.file_type || "file"}
          </span>

          <h2 className="mt-4 text-xl font-bold">{material.title}</h2>
        </div>

        <button
          type="button"
          onClick={() => onDelete(material.id)}
          className="rounded-xl bg-red-500/10 px-3 py-2 text-sm text-red-300 hover:bg-red-500 hover:text-white"
        >
          Delete
        </button>
      </div>

      <div className="space-y-2 text-sm text-slate-400">
        <p>Course: {material.course?.name || "No course"}</p>
        <p>File: {material.original_filename}</p>
        <p>Size: {fileSizeMb} MB</p>
      </div>

      <div className="mt-6 grid grid-cols-2 gap-3">
        <Link
          to={`/materials/${material.id}`}
          className="rounded-xl border border-slate-700 px-4 py-3 text-center text-sm font-semibold hover:bg-slate-800"
        >
          View
        </Link>

        <Link
          to={`/ai-assistant/${material.id}`}
          className="rounded-xl bg-indigo-500 px-4 py-3 text-center text-sm font-semibold hover:bg-indigo-600"
        >
          Ask AI
        </Link>
      </div>

      <div className="mt-5 rounded-2xl border border-slate-800 bg-slate-950 p-4">
        <label className="mb-2 block text-sm text-slate-300">Quiz Questions</label>
        <select
          value={questionCount}
          onChange={(e) => setQuestionCount(e.target.value)}
          className="w-full rounded-xl border border-slate-700 bg-slate-900 px-3 py-2 text-sm outline-none focus:border-cyan-500"
        >
          <option value={5}>5 questions</option>
          <option value={10}>10 questions</option>
          <option value={15}>15 questions</option>
        </select>

        <button
          type="button"
          onClick={() => onGenerateQuiz(material, questionCount)}
          disabled={isGeneratingQuiz}
          className="mt-3 w-full rounded-xl bg-cyan-500 px-4 py-3 text-sm font-semibold text-slate-950 hover:bg-cyan-400 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {isGeneratingQuiz ? "Generating Quiz..." : "Generate Quiz"}
        </button>
      </div>

      <div className="mt-4 rounded-2xl border border-slate-800 bg-slate-950 p-4">
        <label className="mb-2 block text-sm text-slate-300">Flashcards</label>
        <select
          value={cardCount}
          onChange={(e) => setCardCount(e.target.value)}
          className="w-full rounded-xl border border-slate-700 bg-slate-900 px-3 py-2 text-sm outline-none focus:border-purple-500"
        >
          <option value={6}>6 flashcards</option>
          <option value={10}>10 flashcards</option>
          <option value={15}>15 flashcards</option>
        </select>

        <button
          type="button"
          onClick={() => onGenerateFlashcards(material, cardCount)}
          disabled={isGeneratingFlashcards}
          className="mt-3 w-full rounded-xl bg-purple-500 px-4 py-3 text-sm font-semibold text-white hover:bg-purple-600 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {isGeneratingFlashcards ? "Generating Flashcards..." : "Generate Flashcards"}
        </button>
      </div>
    </div>
  )
}

export default MaterialsPage