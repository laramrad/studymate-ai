import { useEffect, useState } from "react"
import api from "../services/api"

function AdminMaterialsPage() {
  const [materials, setMaterials] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")

  const fetchMaterials = async () => {
    try {
      const response = await api.get("/admin/materials")
      setMaterials(response.data.materials)
    } catch (err) {
      setError("Could not load materials.")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchMaterials()
  }, [])

  if (loading) {
    return (
      <div className="rounded-3xl border border-slate-800 bg-slate-900 p-8 text-center text-slate-400">
        Loading materials...
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
        <h1 className="text-3xl font-bold">All Materials</h1>
        <p className="mt-2 text-slate-400">
          View all uploaded files and their owners.
        </p>
      </div>

      {materials.length === 0 ? (
        <EmptyState text="No materials found." />
      ) : (
        <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
          {materials.map((material) => (
            <div key={material.id} className="rounded-3xl border border-slate-800 bg-slate-900 p-6">
              <span className="rounded-full bg-cyan-500/10 px-3 py-1 text-sm uppercase text-cyan-300">
                {material.file_type || "file"}
              </span>

              <h2 className="mt-4 text-xl font-bold">{material.title}</h2>

              <div className="mt-4 space-y-2 text-sm text-slate-400">
                <p>Student: {material.user?.name || "Unknown"}</p>
                <p>Email: {material.user?.email || "-"}</p>
                <p>Course: {material.course?.name || "No course"}</p>
                <p>File: {material.original_filename}</p>
                <p>Size: {formatSize(material.file_size)}</p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

function formatSize(size) {
  if (!size) {
    return "0.00 MB"
  }

  return `${(size / 1024 / 1024).toFixed(2)} MB`
}

function EmptyState({ text }) {
  return (
    <div className="rounded-3xl border border-dashed border-slate-700 bg-slate-900/60 p-12 text-center text-slate-400">
      {text}
    </div>
  )
}

export default AdminMaterialsPage