import { useEffect, useMemo, useState } from "react"
import { Link } from "react-router-dom"
import api from "../services/api"

function FlashcardsPage() {
  const [flashcards, setFlashcards] = useState([])
  const [flippedCards, setFlippedCards] = useState({})
  const [selectedMaterial, setSelectedMaterial] = useState(null)
  const [selectedCourse, setSelectedCourse] = useState("all")
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const [success, setSuccess] = useState("")

  const fetchFlashcards = async () => {
    try {
      const response = await api.get("/flashcards")
      setFlashcards(response.data.flashcards)
    } catch (err) {
      setError("Could not load flashcards.")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchFlashcards()
  }, [])

  const courses = useMemo(() => {
    const courseMap = new Map()

    flashcards.forEach((card) => {
      if (card.material?.course) {
        courseMap.set(card.material.course.id, card.material.course)
      }
    })

    return Array.from(courseMap.values())
  }, [flashcards])

  const materialDecks = useMemo(() => {
    const deckMap = new Map()

    flashcards.forEach((card) => {
      const material = card.material

      if (!material) return

      if (selectedCourse !== "all" && Number(material.course_id) !== Number(selectedCourse)) {
        return
      }

      if (!deckMap.has(material.id)) {
        deckMap.set(material.id, {
          material,
          cards: [],
        })
      }

      deckMap.get(material.id).cards.push(card)
    })

    return Array.from(deckMap.values())
  }, [flashcards, selectedCourse])

  const activeDeck = useMemo(() => {
    if (!selectedMaterial) return null

    return materialDecks.find((deck) => Number(deck.material.id) === Number(selectedMaterial))
  }, [materialDecks, selectedMaterial])

  const toggleFlip = (cardId) => {
    setFlippedCards({
      ...flippedCards,
      [cardId]: !flippedCards[cardId],
    })
  }

  const handleDelete = async (cardId) => {
    const confirmed = window.confirm("Are you sure you want to delete this flashcard?")

    if (!confirmed) return

    try {
      await api.delete(`/flashcards/${cardId}`)
      setFlashcards(flashcards.filter((flashcard) => flashcard.id !== cardId))
      setSuccess("Flashcard deleted successfully.")
    } catch (err) {
      setError("Could not delete flashcard.")
    }
  }

  const handleDeleteDeck = async (materialId) => {
    const confirmed = window.confirm("Are you sure you want to delete all flashcards for this material?")

    if (!confirmed) return

    try {
      await api.delete(`/materials/${materialId}/flashcards`)
      setFlashcards(flashcards.filter((card) => Number(card.material_id) !== Number(materialId)))
      setSelectedMaterial(null)
      setSuccess("Material flashcards deleted successfully.")
    } catch (err) {
      setError("Could not delete material flashcards.")
    }
  }

  const handleSelectCourse = (courseId) => {
    setSelectedCourse(courseId)
    setSelectedMaterial(null)
    setFlippedCards({})
  }

  const handleOpenDeck = (materialId) => {
    setSelectedMaterial(materialId)
    setFlippedCards({})
    window.scrollTo({ top: 0, behavior: "smooth" })
  }

  return (
    <div>
      <div className="mb-8 flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold">Flashcards</h1>
          <p className="mt-2 text-slate-400">
            Review flashcards grouped by material so your study sessions stay organized.
          </p>
        </div>

        <Link
          to="/materials"
          className="rounded-2xl bg-gradient-to-r from-indigo-500 to-purple-500 px-5 py-3 font-semibold text-white hover:from-indigo-600 hover:to-purple-600"
        >
          Generate From Material
        </Link>
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
          Loading flashcards...
        </div>
      ) : flashcards.length === 0 ? (
        <div className="rounded-3xl border border-dashed border-slate-700 bg-slate-900/60 p-12 text-center">
          <p className="text-xl font-bold">No flashcards yet</p>
          <p className="mt-2 text-slate-400">
            Go to Materials and click Generate Flashcards.
          </p>

          <Link
            to="/materials"
            className="mt-6 inline-block rounded-xl bg-indigo-500 px-5 py-3 font-semibold hover:bg-indigo-600"
          >
            Go to Materials
          </Link>
        </div>
      ) : (
        <div className="grid gap-6 xl:grid-cols-4">
          <div className="xl:col-span-1">
            <div className="sticky top-28 rounded-3xl border border-slate-800 bg-slate-900 p-5">
              <h2 className="text-xl font-bold">Flashcard Decks</h2>
              <p className="mt-2 text-sm text-slate-400">
                Choose a material deck to start reviewing.
              </p>

              <div className="mt-5">
                <label className="mb-2 block text-sm text-slate-300">Filter by Course</label>
                <select
                  value={selectedCourse}
                  onChange={(e) => handleSelectCourse(e.target.value)}
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

              <div className="mt-6 space-y-3">
                {materialDecks.length === 0 ? (
                  <div className="rounded-2xl border border-dashed border-slate-700 p-5 text-center text-sm text-slate-400">
                    No decks for this course.
                  </div>
                ) : (
                  materialDecks.map((deck) => (
                    <button
                      key={deck.material.id}
                      type="button"
                      onClick={() => handleOpenDeck(deck.material.id)}
                      className={`w-full rounded-2xl border p-4 text-left transition ${
                        Number(selectedMaterial) === Number(deck.material.id)
                          ? "border-purple-500 bg-purple-500/10"
                          : "border-slate-800 bg-slate-950 hover:border-purple-500"
                      }`}
                    >
                      <p className="font-semibold">{deck.material.title}</p>
                      <p className="mt-1 text-sm text-slate-400">
                        {deck.material.course?.name || "No course"}
                      </p>
                      <p className="mt-2 text-xs text-purple-300">
                        {deck.cards.length} flashcards
                      </p>
                    </button>
                  ))
                )}
              </div>
            </div>
          </div>

          <div className="xl:col-span-3">
            {!activeDeck ? (
              <div className="rounded-3xl border border-dashed border-slate-700 bg-slate-900/60 p-12 text-center">
                <p className="text-xl font-bold">Choose a flashcard deck</p>
                <p className="mt-2 text-slate-400">
                  Select a material from the left to view and review its flashcards.
                </p>
              </div>
            ) : (
              <div>
                <div className="mb-6 rounded-3xl border border-slate-800 bg-gradient-to-r from-purple-500/20 to-indigo-500/10 p-6">
                  <div className="flex flex-wrap items-start justify-between gap-4">
                    <div>
                      <p className="text-sm text-purple-300">Selected Deck</p>
                      <h2 className="mt-2 text-2xl font-bold">{activeDeck.material.title}</h2>
                      <p className="mt-2 text-slate-400">
                        Course: {activeDeck.material.course?.name || "No course"} ·{" "}
                        {activeDeck.cards.length} flashcards
                      </p>
                    </div>

                    <button
                      type="button"
                      onClick={() => handleDeleteDeck(activeDeck.material.id)}
                      className="rounded-xl bg-red-500/10 px-4 py-2 text-sm text-red-300 hover:bg-red-500 hover:text-white"
                    >
                      Delete Deck
                    </button>
                  </div>
                </div>

                <div className="grid gap-6 md:grid-cols-2">
                  {activeDeck.cards.map((card) => (
                    <Flashcard
                      key={card.id}
                      card={card}
                      isFlipped={Boolean(flippedCards[card.id])}
                      onFlip={toggleFlip}
                      onDelete={handleDelete}
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

function Flashcard({ card, isFlipped, onFlip, onDelete }) {
  return (
    <div className="rounded-3xl border border-slate-800 bg-slate-900 p-6 hover:border-purple-500/50">
      <div className="mb-4 flex items-center justify-between gap-3">
        <span className="rounded-full bg-purple-500/10 px-3 py-1 text-sm text-purple-300">
          {isFlipped ? "Back" : "Front"}
        </span>

        <button
          onClick={() => onDelete(card.id)}
          className="rounded-xl bg-red-500/10 px-3 py-2 text-sm text-red-300 hover:bg-red-500 hover:text-white"
        >
          Delete
        </button>
      </div>

      <button
        type="button"
        onClick={() => onFlip(card.id)}
        className="min-h-[240px] w-full rounded-2xl border border-slate-800 bg-slate-950 p-6 text-left transition hover:border-purple-500"
      >
        {!isFlipped ? (
          <div>
            <p className="mb-4 text-sm text-slate-500">Question</p>
            <h3 className="text-2xl font-bold leading-9">{card.front}</h3>
          </div>
        ) : (
          <div>
            <p className="mb-4 text-sm text-slate-500">Answer</p>
            <p className="leading-7 text-slate-300">{card.back}</p>
          </div>
        )}
      </button>

      <p className="mt-4 text-center text-sm text-slate-500">
        Click the card to flip
      </p>
    </div>
  )
}

export default FlashcardsPage