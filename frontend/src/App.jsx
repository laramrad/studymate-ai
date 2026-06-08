import { useEffect } from "react"
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom"
import LandingPage from "./pages/LandingPage"
import LoginPage from "./pages/LoginPage"
import RegisterPage from "./pages/RegisterPage"
import DashboardLayout from "./layouts/DashboardLayout"
import DashboardPage from "./pages/DashboardPage"
import CoursesPage from "./pages/CoursesPage"
import CourseDetailsPage from "./pages/CourseDetailsPage"
import MaterialsPage from "./pages/MaterialsPage"
import MaterialDetailsPage from "./pages/MaterialDetailsPage"
import AiAssistantPage from "./pages/AiAssistantPage"
import QuizzesPage from "./pages/QuizzesPage"
import QuizDetailsPage from "./pages/QuizDetailsPage"
import FlashcardsPage from "./pages/FlashcardsPage"
import StudyPlannerPage from "./pages/StudyPlannerPage"
import DeadlinesPage from "./pages/DeadlinesPage"
import ProfilePage from "./pages/ProfilePage"
import AdminDashboardPage from "./pages/AdminDashboardPage"
import AdminStudentsPage from "./pages/AdminStudentsPage"
import AdminCoursesPage from "./pages/AdminCoursesPage"
import AdminMaterialsPage from "./pages/AdminMaterialsPage"
import AdminQuizzesPage from "./pages/AdminQuizzesPage"
import AdminDeadlinesPage from "./pages/AdminDeadlinesPage"

function ProtectedRoute({ children }) {
  const token = localStorage.getItem("token")

  if (!token) {
    return <Navigate to="/login" replace />
  }

  return children
}

function AdminRoute({ children }) {
  const user = JSON.parse(localStorage.getItem("user"))

  if (user?.role !== "admin") {
    return <Navigate to="/dashboard" replace />
  }

  return children
}

function App() {
  useEffect(() => {
    const savedTheme = localStorage.getItem("theme") || "dark"

    if (savedTheme === "light") {
      document.documentElement.classList.add("light-theme")
    } else {
      document.documentElement.classList.remove("light-theme")
    }
  }, [])

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />

        <Route
          element={
            <ProtectedRoute>
              <DashboardLayout />
            </ProtectedRoute>
          }
        >
          <Route path="/dashboard" element={<DashboardPage />} />

          <Route path="/courses" element={<CoursesPage />} />
          <Route path="/courses/:id" element={<CourseDetailsPage />} />

          <Route path="/materials" element={<MaterialsPage />} />
          <Route path="/materials/:id" element={<MaterialDetailsPage />} />

          <Route path="/ai-assistant" element={<AiAssistantPage />} />
          <Route path="/ai-assistant/:materialId" element={<AiAssistantPage />} />

          <Route path="/quizzes" element={<QuizzesPage />} />
          <Route path="/quizzes/:id" element={<QuizDetailsPage />} />

          <Route path="/flashcards" element={<FlashcardsPage />} />
          <Route path="/study-planner" element={<StudyPlannerPage />} />
          <Route path="/deadlines" element={<DeadlinesPage />} />
          <Route path="/profile" element={<ProfilePage />} />

          <Route
            path="/admin/dashboard"
            element={
              <AdminRoute>
                <AdminDashboardPage />
              </AdminRoute>
            }
          />

          <Route
            path="/admin/students"
            element={
              <AdminRoute>
                <AdminStudentsPage />
              </AdminRoute>
            }
          />

          <Route
            path="/admin/courses"
            element={
              <AdminRoute>
                <AdminCoursesPage />
              </AdminRoute>
            }
          />

          <Route
            path="/admin/materials"
            element={
              <AdminRoute>
                <AdminMaterialsPage />
              </AdminRoute>
            }
          />

          <Route
            path="/admin/quizzes"
            element={
              <AdminRoute>
                <AdminQuizzesPage />
              </AdminRoute>
            }
          />

          <Route
            path="/admin/deadlines"
            element={
              <AdminRoute>
                <AdminDeadlinesPage />
              </AdminRoute>
            }
          />
        </Route>
      </Routes>
    </BrowserRouter>
  )
}

export default App