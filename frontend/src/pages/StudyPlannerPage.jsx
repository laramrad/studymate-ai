import { useEffect, useState } from "react"
import api from "../services/api"

function StudyPlannerPage() {
  const [studyPlans, setStudyPlans] = useState([])
  const [courses, setCourses] = useState([])
  const [selectedPlan, setSelectedPlan] = useState(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState("")
  const [success, setSuccess] = useState("")
  const [showForm, setShowForm] = useState(false)

  const [form, setForm] = useState({
    course_id: "",
    title: "",
    exam_date: "",
    hours_per_day: 2,
    difficulty: "Medium",
    description: "",
  })

  const fetchData = async () => {
    try {
      const [plansResponse, coursesResponse] = await Promise.all([
        api.get("/study-plans"),
        api.get("/courses"),
      ])

      setStudyPlans(plansResponse.data.study_plans)
      setCourses(coursesResponse.data.courses)

      if (plansResponse.data.study_plans.length > 0) {
        setSelectedPlan(plansResponse.data.study_plans[0])
      }
    } catch (err) {
      setError("Could not load study plans.")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchData()
  }, [])

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
    setSuccess("")

    try {
      const response = await api.post("/study-plans", {
        ...form,
        course_id: form.course_id || null,
        hours_per_day: Number(form.hours_per_day),
      })

      setStudyPlans([response.data.study_plan, ...studyPlans])
      setSelectedPlan(response.data.study_plan)
      setSuccess("Study plan generated successfully.")

      setForm({
        course_id: "",
        title: "",
        exam_date: "",
        hours_per_day: 2,
        difficulty: "Medium",
        description: "",
      })

      setShowForm(false)
    } catch (err) {
      if (err.response?.data?.message) {
        setError(err.response.data.message)
      } else {
        setError("Could not generate study plan.")
      }
    } finally {
      setSaving(false)
    }
  }

  const handleToggleTask = async (taskId) => {
    try {
      const response = await api.patch(`/study-plan-tasks/${taskId}/toggle`)

      const updatedTask = response.data.task

      const updatedPlans = studyPlans.map((plan) => {
        if (plan.id !== selectedPlan.id) {
          return plan
        }

        return {
          ...plan,
          tasks: plan.tasks.map((task) =>
            task.id === taskId ? updatedTask : task
          ),
        }
      })

      setStudyPlans(updatedPlans)

      setSelectedPlan({
        ...selectedPlan,
        tasks: selectedPlan.tasks.map((task) =>
          task.id === taskId ? updatedTask : task
        ),
      })
    } catch (err) {
      setError("Could not update task.")
    }
  }

  const handleDeletePlan = async (planId) => {
    const confirmed = window.confirm("Are you sure you want to delete this study plan?")

    if (!confirmed) return

    try {
      await api.delete(`/study-plans/${planId}`)

      const remainingPlans = studyPlans.filter((plan) => plan.id !== planId)
      setStudyPlans(remainingPlans)
      setSelectedPlan(remainingPlans[0] || null)
      setSuccess("Study plan deleted successfully.")
    } catch (err) {
      setError("Could not delete study plan.")
    }
  }

  const completedTasks = selectedPlan?.tasks?.filter((task) => task.is_completed).length || 0
  const totalTasks = selectedPlan?.tasks?.length || 0
  const progressPercentage = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0

  return (
    <div>
      <div className="mb-8 flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold">Study Planner</h1>
          <p className="mt-2 text-slate-400">
            Generate a smart study plan based on your exam date and available study time.
          </p>
        </div>

        <button
          type="button"
          onClick={() => setShowForm(!showForm)}
          className="rounded-2xl bg-indigo-500 px-5 py-3 font-semibold hover:bg-indigo-600"
        >
          {showForm ? "Close Form" : "Generate Study Plan"}
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
          <h2 className="mb-5 text-xl font-bold">Generate New Plan</h2>

          <div className="grid gap-5 md:grid-cols-2">
            <div>
              <label className="mb-2 block text-sm text-slate-300">Plan Title *</label>
              <input
                type="text"
                name="title"
                value={form.title}
                onChange={handleChange}
                className="w-full rounded-xl border border-slate-700 bg-slate-950 px-4 py-3 outline-none focus:border-indigo-500"
                placeholder="Database Final Exam Plan"
                required
              />
            </div>

            <div>
              <label className="mb-2 block text-sm text-slate-300">Course</label>
              <select
                name="course_id"
                value={form.course_id}
                onChange={handleChange}
                className="w-full rounded-xl border border-slate-700 bg-slate-950 px-4 py-3 outline-none focus:border-indigo-500"
              >
                <option value="">No course</option>
                {courses.map((course) => (
                  <option key={course.id} value={course.id}>
                    {course.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="mb-2 block text-sm text-slate-300">Exam Date *</label>
              <input
                type="date"
                name="exam_date"
                value={form.exam_date}
                onChange={handleChange}
                className="w-full rounded-xl border border-slate-700 bg-slate-950 px-4 py-3 outline-none focus:border-indigo-500"
                required
              />
            </div>

            <div>
              <label className="mb-2 block text-sm text-slate-300">Hours Per Day *</label>
              <input
                type="number"
                name="hours_per_day"
                min="1"
                max="12"
                value={form.hours_per_day}
                onChange={handleChange}
                className="w-full rounded-xl border border-slate-700 bg-slate-950 px-4 py-3 outline-none focus:border-indigo-500"
                required
              />
            </div>

            <div>
              <label className="mb-2 block text-sm text-slate-300">Difficulty *</label>
              <select
                name="difficulty"
                value={form.difficulty}
                onChange={handleChange}
                className="w-full rounded-xl border border-slate-700 bg-slate-950 px-4 py-3 outline-none focus:border-indigo-500"
                required
              >
                <option value="Easy">Easy</option>
                <option value="Medium">Medium</option>
                <option value="Hard">Hard</option>
              </select>
            </div>
          </div>

          <div className="mt-5">
            <label className="mb-2 block text-sm text-slate-300">Description</label>
            <textarea
              name="description"
              value={form.description}
              onChange={handleChange}
              rows="4"
              className="w-full rounded-xl border border-slate-700 bg-slate-950 px-4 py-3 outline-none focus:border-indigo-500"
              placeholder="Extra notes about what you need to study..."
            ></textarea>
          </div>

          <button
            type="submit"
            disabled={saving}
            className="mt-5 rounded-xl bg-indigo-500 px-6 py-3 font-semibold hover:bg-indigo-600 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {saving ? "Generating..." : "Generate Plan"}
          </button>
        </form>
      )}

      {loading ? (
        <div className="rounded-3xl border border-slate-800 bg-slate-900 p-8 text-center text-slate-400">
          Loading study plans...
        </div>
      ) : studyPlans.length === 0 ? (
        <div className="rounded-3xl border border-dashed border-slate-700 bg-slate-900/60 p-12 text-center">
          <p className="text-xl font-bold">No study plans yet</p>
          <p className="mt-2 text-slate-400">
            Generate your first plan based on exam date and daily study hours.
          </p>
        </div>
      ) : (
        <div className="grid gap-6 xl:grid-cols-4">
          <div className="rounded-3xl border border-slate-800 bg-slate-900 p-5 xl:col-span-1">
            <h2 className="mb-5 text-xl font-bold">My Plans</h2>

            <div className="space-y-3">
              {studyPlans.map((plan) => (
                <button
                  key={plan.id}
                  type="button"
                  onClick={() => setSelectedPlan(plan)}
                  className={`w-full rounded-2xl border px-4 py-3 text-left ${
                    selectedPlan?.id === plan.id
                      ? "border-indigo-500 bg-indigo-500/10"
                      : "border-slate-800 bg-slate-950 hover:border-indigo-500"
                  }`}
                >
                  <p className="font-semibold">{plan.title}</p>
                  <p className="mt-1 text-sm text-slate-400">
                    Exam: {formatDate(plan.exam_date)}
                  </p>
                </button>
              ))}
            </div>
          </div>

          <div className="xl:col-span-3">
            {selectedPlan && (
              <div className="space-y-6">
                <div className="rounded-3xl border border-slate-800 bg-slate-900 p-6">
                  <div className="flex flex-wrap items-start justify-between gap-4">
                    <div>
                      <h2 className="text-2xl font-bold">{selectedPlan.title}</h2>
                      <p className="mt-2 text-slate-400">
                        Course: {selectedPlan.course?.name || "No course"}
                      </p>
                      <p className="mt-1 text-slate-400">
                        Exam date: {formatDate(selectedPlan.exam_date)}
                      </p>
                    </div>

                    <button
                      type="button"
                      onClick={() => handleDeletePlan(selectedPlan.id)}
                      className="rounded-xl bg-red-500/10 px-4 py-2 text-sm text-red-300 hover:bg-red-500 hover:text-white"
                    >
                      Delete Plan
                    </button>
                  </div>

                  <div className="mt-6 grid gap-4 md:grid-cols-4">
                    <InfoCard title="Difficulty" value={selectedPlan.difficulty} />
                    <InfoCard title="Hours/Day" value={selectedPlan.hours_per_day} />
                    <InfoCard title="Tasks" value={`${completedTasks}/${totalTasks}`} />
                    <InfoCard title="Progress" value={`${progressPercentage}%`} />
                  </div>

                  <div className="mt-6">
                    <div className="mb-2 flex justify-between text-sm text-slate-400">
                      <span>Completion</span>
                      <span>{progressPercentage}%</span>
                    </div>

                    <div className="h-3 rounded-full bg-slate-800">
                      <div
                        className="h-3 rounded-full bg-gradient-to-r from-indigo-500 to-cyan-400"
                        style={{ width: `${progressPercentage}%` }}
                      ></div>
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  {selectedPlan.tasks
                    ?.slice()
                    .sort((a, b) => new Date(a.task_date) - new Date(b.task_date))
                    .map((task) => (
                      <TaskCard
                        key={task.id}
                        task={task}
                        onToggle={handleToggleTask}
                      />
                    ))}
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}

function InfoCard({ title, value }) {
  return (
    <div className="rounded-2xl bg-slate-950 p-4">
      <p className="text-sm text-slate-500">{title}</p>
      <p className="mt-2 text-2xl font-bold">{value}</p>
    </div>
  )
}

function TaskCard({ task, onToggle }) {
  return (
    <div
      className={`rounded-3xl border p-6 ${
        task.is_completed
          ? "border-green-500/30 bg-green-500/5"
          : "border-slate-800 bg-slate-900"
      }`}
    >
      <div className="flex flex-wrap items-start justify-between gap-5">
        <div className="flex gap-4">
          <button
            type="button"
            onClick={() => onToggle(task.id)}
            className={`mt-1 flex h-6 w-6 items-center justify-center rounded-lg border ${
              task.is_completed
                ? "border-green-500 bg-green-500 text-white"
                : "border-slate-600 hover:border-indigo-500"
            }`}
          >
            {task.is_completed ? "✓" : ""}
          </button>

          <div>
            <p className="text-sm text-indigo-300">{formatDate(task.task_date)}</p>
            <h3
              className={`mt-2 text-xl font-bold ${
                task.is_completed ? "line-through text-slate-500" : ""
              }`}
            >
              {task.title}
            </h3>
            <p className="mt-2 max-w-3xl leading-7 text-slate-400">
              {task.description}
            </p>
          </div>
        </div>

        <div className="rounded-2xl bg-slate-950 px-4 py-3 text-sm text-slate-300">
          {task.estimated_hours} hour(s)
        </div>
      </div>
    </div>
  )
}

function formatDate(dateValue) {
  return new Date(dateValue).toLocaleDateString()
}

export default StudyPlannerPage