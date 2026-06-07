import { useEffect, useMemo, useState } from "react"
import { Link } from "react-router-dom"
import { BookOpen, Plus, Trash2, Search, Filter, ArrowRight } from "lucide-react"
import api from "../services/api"

function CoursesPage() {
  const [courses, setCourses] = useState([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState("")
  const [showForm, setShowForm] = useState(false)

  const [searchTerm, setSearchTerm] = useState("")
  const [semesterFilter, setSemesterFilter] = useState("all")

  const [form, setForm] = useState({
    name: "",
    code: "",
    instructor: "",
    semester: "",
    description: "",
  })

  const fetchCourses = async () => {
    try {
      const response = await api.get("/courses")
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

  const semesters = useMemo(() => {
    const values = courses
      .map((course) => course.semester)
      .filter((semester) => semester && semester.trim() !== "")

    return Array.from(new Set(values))
  }, [courses])

  const filteredCourses = useMemo(() => {
    return courses.filter((course) => {
      const search = searchTerm.toLowerCase()

      const matchesSearch =
        course.name?.toLowerCase().includes(search) ||
        course.code?.toLowerCase().includes(search) ||
        course.instructor?.toLowerCase().includes(search) ||
        course.semester?.toLowerCase().includes(search)

      const matchesSemester =
        semesterFilter === "all" || course.semester === semesterFilter

      return matchesSearch && matchesSemester
    })
  }, [courses, searchTerm, semesterFilter])

  const clearFilters = () => {
    setSearchTerm("")
    setSemesterFilter("all")
  }

  const handleChange = (e) => {
    setForm({
      ...form,
      [e.target.name]: e.target.value,
    })
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setSaving(true)
    setError("")

    try {
      const response = await api.post("/courses", form)

      setCourses([response.data.course, ...courses])

      setForm({
        name: "",
        code: "",
        instructor: "",
        semester: "",
        description: "",
      })

      setShowForm(false)
    } catch (err) {
      if (err.response?.data?.message) {
        setError(err.response.data.message)
      } else {
        setError("Could not create course.")
      }
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async (courseId) => {
    const confirmed = window.confirm("Are you sure you want to delete this course?")

    if (!confirmed) return

    try {
      await api.delete(`/courses/${courseId}`)
      setCourses(courses.filter((course) => course.id !== courseId))
    } catch (err) {
      setError("Could not delete course.")
    }
  }

  return (
    <div>
      <div className="mb-8 flex flex-wrap items-center justify-between gap-4">
        <div>
          <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-2xl bg-indigo-500/10 text-indigo-300">
            <BookOpen size={24} />
          </div>
          <h1 className="text-3xl font-bold">Courses</h1>
          <p className="mt-2 text-slate-400">
            Create, search, and manage your university courses.
          </p>
        </div>

        <button
          type="button"
          onClick={() => setShowForm(!showForm)}
          className="inline-flex items-center gap-2 rounded-2xl bg-indigo-500 px-5 py-3 font-semibold hover:bg-indigo-600"
        >
          <Plus size={18} />
          {showForm ? "Close Form" : "Create Course"}
        </button>
      </div>

      {error && (
        <div className="mb-6 rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-300">
          {error}
        </div>
      )}

      {showForm && (
        <form onSubmit={handleSubmit} className="mb-8 rounded-3xl border border-slate-800 bg-slate-900 p-6">
          <h2 className="mb-5 text-xl font-bold">New Course</h2>

          <div className="grid gap-5 md:grid-cols-2">
            <Input label="Course Name *" name="name" value={form.name} onChange={handleChange} placeholder="Database Systems" required />
            <Input label="Course Code" name="code" value={form.code} onChange={handleChange} placeholder="CSCI330" />
            <Input label="Instructor" name="instructor" value={form.instructor} onChange={handleChange} placeholder="Dr. Ahmad" />
            <Input label="Semester" name="semester" value={form.semester} onChange={handleChange} placeholder="Spring 2026" />
          </div>

          <div className="mt-5">
            <label className="mb-2 block text-sm text-slate-300">Description</label>
            <textarea
              name="description"
              value={form.description}
              onChange={handleChange}
              rows="4"
              className="w-full rounded-xl border border-slate-700 bg-slate-950 px-4 py-3 outline-none focus:border-indigo-500"
              placeholder="Short description about the course..."
            ></textarea>
          </div>

          <button
            type="submit"
            disabled={saving}
            className="mt-5 rounded-xl bg-indigo-500 px-6 py-3 font-semibold hover:bg-indigo-600 disabled:opacity-60"
          >
            {saving ? "Saving..." : "Save Course"}
          </button>
        </form>
      )}

      <div className="mb-8 rounded-3xl border border-slate-800 bg-slate-900 p-6">
        <div className="mb-5 flex flex-wrap items-center justify-between gap-4">
          <div>
            <div className="mb-2 flex items-center gap-2">
              <Filter className="text-indigo-300" size={20} />
              <h2 className="text-xl font-bold">Search & Filter</h2>
            </div>
            <p className="text-sm text-slate-400">
              Showing {filteredCourses.length} of {courses.length} courses.
            </p>
          </div>

          <button type="button" onClick={clearFilters} className="rounded-xl border border-slate-700 px-4 py-2 text-sm hover:bg-slate-800">
            Clear Filters
          </button>
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          <div>
            <label className="mb-2 block text-sm text-slate-300">Search</label>
            <div className="relative">
              <Search className="absolute left-4 top-3.5 text-slate-500" size={18} />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full rounded-xl border border-slate-700 bg-slate-950 py-3 pl-11 pr-4 outline-none focus:border-indigo-500"
                placeholder="Search by name, code, instructor..."
              />
            </div>
          </div>

          <div>
            <label className="mb-2 block text-sm text-slate-300">Semester</label>
            <select
              value={semesterFilter}
              onChange={(e) => setSemesterFilter(e.target.value)}
              className="w-full rounded-xl border border-slate-700 bg-slate-950 px-4 py-3 outline-none focus:border-indigo-500"
            >
              <option value="all">All semesters</option>
              {semesters.map((semester) => (
                <option key={semester} value={semester}>
                  {semester}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {loading ? (
        <div className="rounded-3xl border border-slate-800 bg-slate-900 p-8 text-center text-slate-400">
          Loading courses...
        </div>
      ) : courses.length === 0 ? (
        <EmptyState title="No courses yet" description="Create your first course to start uploading materials." />
      ) : filteredCourses.length === 0 ? (
        <EmptyState title="No matching courses" description="Try changing your search or filters." />
      ) : (
        <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
          {filteredCourses.map((course) => (
            <CourseCard key={course.id} course={course} onDelete={handleDelete} />
          ))}
        </div>
      )}
    </div>
  )
}

function Input({ label, ...props }) {
  return (
    <div>
      <label className="mb-2 block text-sm text-slate-300">{label}</label>
      <input
        {...props}
        type="text"
        className="w-full rounded-xl border border-slate-700 bg-slate-950 px-4 py-3 outline-none focus:border-indigo-500"
      />
    </div>
  )
}

function CourseCard({ course, onDelete }) {
  return (
    <div className="rounded-3xl border border-slate-800 bg-slate-900 p-6 hover:border-indigo-500/50">
      <div className="mb-5 flex items-start justify-between gap-4">
        <div>
          <span className="rounded-full bg-indigo-500/10 px-3 py-1 text-sm text-indigo-300">
            {course.code || "Course"}
          </span>

          <h2 className="mt-4 text-xl font-bold">{course.name}</h2>
        </div>

        <button
          type="button"
          onClick={() => onDelete(course.id)}
          className="rounded-xl bg-red-500/10 p-2 text-red-300 hover:bg-red-500 hover:text-white"
          title="Delete course"
        >
          <Trash2 size={18} />
        </button>
      </div>

      <div className="space-y-2 text-sm text-slate-400">
        {course.instructor && <p>Instructor: {course.instructor}</p>}
        {course.semester && <p>Semester: {course.semester}</p>}
      </div>

      {course.description && (
        <p className="mt-5 line-clamp-3 text-sm leading-6 text-slate-300">
          {course.description}
        </p>
      )}

      <Link
        to={`/courses/${course.id}`}
        className="mt-6 flex w-full items-center justify-center gap-2 rounded-xl border border-slate-700 px-4 py-3 text-center font-semibold hover:bg-slate-800"
      >
        Open Course
        <ArrowRight size={17} />
      </Link>
    </div>
  )
}

function EmptyState({ title, description }) {
  return (
    <div className="rounded-3xl border border-dashed border-slate-700 bg-slate-900/60 p-12 text-center">
      <p className="text-xl font-bold">{title}</p>
      <p className="mt-2 text-slate-400">{description}</p>
    </div>
  )
}

export default CoursesPage