import { useEffect, useState } from "react"
import { Link, Outlet, useLocation, useNavigate } from "react-router-dom"
import {
  LayoutDashboard,
  BookOpen,
  FileText,
  Bot,
  ClipboardList,
  Brain,
  CalendarDays,
  AlarmClock,
  User,
  ShieldCheck,
  Users,
  School,
  FolderOpen,
  ListChecks,
  Siren,
  LogOut,
  Menu,
  X,
  Sun,
  Moon,
  GraduationCap,
  PanelLeftOpen,
  Home,
} from "lucide-react"
import api from "../services/api"

function DashboardLayout() {
  const location = useLocation()
  const navigate = useNavigate()
  const user = JSON.parse(localStorage.getItem("user"))

  const savedTheme = localStorage.getItem("theme") || "dark"
  const savedSidebar = localStorage.getItem("sidebarOpen")

  const [theme, setTheme] = useState(savedTheme)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [sidebarOpen, setSidebarOpen] = useState(savedSidebar !== "false")

  useEffect(() => {
    localStorage.setItem("theme", theme)

    if (theme === "light") {
      document.documentElement.classList.add("light-theme")
    } else {
      document.documentElement.classList.remove("light-theme")
    }
  }, [theme])

  useEffect(() => {
    localStorage.setItem("sidebarOpen", sidebarOpen ? "true" : "false")
  }, [sidebarOpen])

  const studentMenuItems = [
    { name: "Dashboard", path: "/dashboard", icon: LayoutDashboard },
    { name: "Courses", path: "/courses", icon: BookOpen },
    { name: "Materials", path: "/materials", icon: FileText },
    { name: "AI Assistant", path: "/ai-assistant", icon: Bot },
    { name: "Quizzes", path: "/quizzes", icon: ClipboardList },
    { name: "Flashcards", path: "/flashcards", icon: Brain },
    { name: "Study Planner", path: "/study-planner", icon: CalendarDays },
    { name: "Deadlines", path: "/deadlines", icon: AlarmClock },
    { name: "Profile", path: "/profile", icon: User },
  ]

  const adminMenuItems = [
    { name: "Admin Dashboard", path: "/admin/dashboard", icon: ShieldCheck },
    { name: "Students", path: "/admin/students", icon: Users },
    { name: "All Courses", path: "/admin/courses", icon: School },
    { name: "All Materials", path: "/admin/materials", icon: FolderOpen },
    { name: "All Quizzes", path: "/admin/quizzes", icon: ListChecks },
    { name: "All Deadlines", path: "/admin/deadlines", icon: Siren },
  ]

  const isAdmin = user?.role === "admin"
  const ThemeIcon = theme === "dark" ? Sun : Moon

  const handleLogout = async () => {
    try {
      await api.post("/logout")
    } catch (err) {
      // Even if backend logout fails, clear local session.
    } finally {
      localStorage.removeItem("token")
      localStorage.removeItem("user")
      navigate("/login", { replace: true })
    }
  }

  const closeMobileMenu = () => {
    setMobileMenuOpen(false)
  }

  const toggleTheme = () => {
    setTheme(theme === "dark" ? "light" : "dark")
  }

  return (
    <div className="min-h-screen bg-slate-950 text-white">
      {sidebarOpen && (
        <aside className="fixed left-0 top-0 hidden h-screen w-72 overflow-y-auto border-r border-slate-800 bg-slate-900/90 p-6 lg:block colorful-sidebar">
          <SidebarContent
            user={user}
            isAdmin={isAdmin}
            studentMenuItems={studentMenuItems}
            adminMenuItems={adminMenuItems}
            location={location}
            onLogout={handleLogout}
            onNavigate={closeMobileMenu}
            theme={theme}
            onToggleTheme={toggleTheme}
          />
        </aside>
      )}

      {!sidebarOpen && (
        <button
          type="button"
          onClick={() => setSidebarOpen(true)}
          className="fixed left-5 top-5 z-40 hidden h-12 w-12 items-center justify-center rounded-2xl border border-slate-700 bg-slate-900 text-white shadow-xl shadow-slate-950/30 hover:bg-slate-800 lg:flex"
          title="Open sidebar"
        >
          <PanelLeftOpen size={21} />
        </button>
      )}

      {mobileMenuOpen && (
        <button
          type="button"
          onClick={closeMobileMenu}
          className="fixed inset-0 z-40 bg-black/60 lg:hidden"
          aria-label="Close menu overlay"
        ></button>
      )}

      <aside
        className={`fixed left-0 top-0 z-50 h-screen w-80 max-w-[85vw] overflow-y-auto border-r border-slate-800 bg-slate-900 p-6 shadow-2xl transition-transform duration-300 lg:hidden colorful-sidebar ${
          mobileMenuOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="mb-10 flex items-center justify-between gap-3">
          <BrandLogo isAdmin={isAdmin} />

          <button
            type="button"
            onClick={closeMobileMenu}
            className="flex h-10 w-10 items-center justify-center rounded-xl border border-slate-700 hover:bg-slate-800"
            aria-label="Close menu"
          >
            <X size={20} />
          </button>
        </div>

        <SidebarContent
          user={user}
          isAdmin={isAdmin}
          studentMenuItems={studentMenuItems}
          adminMenuItems={adminMenuItems}
          location={location}
          onLogout={handleLogout}
          onNavigate={closeMobileMenu}
          hideLogo
          theme={theme}
          onToggleTheme={toggleTheme}
        />
      </aside>

      <main
        className={`flex min-h-screen flex-col transition-all duration-300 ${
          sidebarOpen ? "lg:ml-72" : "lg:ml-0"
        }`}
      >
        <header className="sticky top-0 z-30 border-b border-slate-800 bg-slate-950/90 px-4 py-4 backdrop-blur md:px-6 colorful-header">
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <button
                type="button"
                onClick={() => setMobileMenuOpen(true)}
                className="rounded-xl border border-slate-700 p-2 hover:bg-slate-800 lg:hidden"
                aria-label="Open menu"
              >
                <Menu size={24} />
              </button>

              {!sidebarOpen && (
                <button
                  type="button"
                  onClick={() => setSidebarOpen(true)}
                  className="hidden h-11 w-11 items-center justify-center rounded-2xl border border-slate-700 bg-slate-900 hover:bg-slate-800 lg:flex"
                  title="Open sidebar"
                >
                  <PanelLeftOpen size={21} />
                </button>
              )}

              <div>
                <p className="text-sm text-slate-400">Welcome back,</p>
                <h2 className="text-xl font-bold md:text-2xl">
                  {user?.name || "Student"}
                </h2>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <Link
                to="/"
                className="hidden items-center gap-2 rounded-2xl border border-slate-700 bg-slate-900 px-4 py-2 text-sm font-semibold text-slate-300 hover:bg-slate-800 md:flex"
                title="Go to landing page"
              >
                <Home size={17} />
                Home
              </Link>

              <button
                type="button"
                onClick={toggleTheme}
                className="flex h-11 w-11 items-center justify-center rounded-2xl border border-slate-700 bg-slate-900 hover:bg-slate-800"
                title={theme === "dark" ? "Switch to light mode" : "Switch to night mode"}
              >
                <ThemeIcon size={20} />
              </button>

              <div className="hidden rounded-2xl border border-slate-800 bg-slate-900 px-4 py-2 text-sm text-slate-300 md:block">
                {new Date().toLocaleDateString()}
              </div>

              <Link
                to="/profile"
                className="flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-br from-sky-500 via-cyan-500 to-emerald-400 font-bold text-white shadow-lg shadow-cyan-500/20 hover:opacity-90"
              >
                {user?.name?.charAt(0)?.toUpperCase() || "S"}
              </Link>
            </div>
          </div>
        </header>

        <div className="flex-1 p-4 md:p-6">
          <Outlet />
        </div>

        <footer className="border-t border-slate-800 px-6 py-5 text-center text-sm text-slate-500">
          © {new Date().getFullYear()} StudyMate AI. All rights reserved.
        </footer>
      </main>
    </div>
  )
}

function SidebarContent({
  user,
  isAdmin,
  studentMenuItems,
  adminMenuItems,
  location,
  onLogout,
  onNavigate,
  hideLogo = false,
  theme,
  onToggleTheme,
}) {
  const ThemeIcon = theme === "dark" ? Sun : Moon

  return (
    <div className="flex min-h-full flex-col">
      {!hideLogo && (
        <div className="mb-10">
          <BrandLogo isAdmin={isAdmin} />
        </div>
      )}

      <nav className="space-y-2">
        <MenuSection
          title="Student"
          items={studentMenuItems}
          location={location}
          onNavigate={onNavigate}
        />

        {isAdmin && (
          <MenuSection
            title="Admin"
            items={adminMenuItems}
            location={location}
            onNavigate={onNavigate}
          />
        )}
      </nav>

      <div className="mt-8 rounded-3xl border border-slate-800 bg-slate-950 p-4 colorful-user-card">
        <p className="text-sm font-semibold">{user?.name || "User"}</p>
        <p className="truncate text-xs text-slate-500">{user?.email}</p>

        <p className="mt-2 inline-block rounded-full bg-cyan-500/10 px-3 py-1 text-xs capitalize text-cyan-300">
          {user?.role || "student"}
        </p>

        <Link
          to="/"
          onClick={onNavigate}
          className="mt-4 flex w-full items-center justify-center gap-2 rounded-xl border border-slate-700 px-4 py-2 text-sm font-semibold hover:bg-slate-800"
        >
          <Home size={16} />
          Home Page
        </Link>

        <button
          type="button"
          onClick={onToggleTheme}
          className="mt-3 flex h-11 w-full items-center justify-center rounded-xl border border-slate-700 hover:bg-slate-800"
          title={theme === "dark" ? "Switch to light mode" : "Switch to night mode"}
        >
          <ThemeIcon size={20} />
        </button>

        <button
          onClick={onLogout}
          className="mt-3 flex w-full items-center justify-center gap-2 rounded-xl bg-red-500/10 px-4 py-2 text-sm font-semibold text-red-300 hover:bg-red-500 hover:text-white"
        >
          <LogOut size={16} />
          Logout
        </button>
      </div>
    </div>
  )
}

function BrandLogo({ isAdmin }) {
  return (
    <Link to="/" className="flex items-center gap-3">
      <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-sky-500 via-cyan-500 to-emerald-400 text-white shadow-lg shadow-cyan-500/25">
        <GraduationCap size={26} />
      </div>

      <div>
        <h1 className="text-xl font-bold">StudyMate AI</h1>
        <p className="text-xs text-slate-400">
          {isAdmin ? "Admin Panel" : "Student Dashboard"}
        </p>
      </div>
    </Link>
  )
}

function MenuSection({ title, items, location, onNavigate }) {
  return (
    <div className="mb-6">
      <p className="mb-3 px-4 text-xs font-semibold uppercase tracking-wider text-slate-500">
        {title}
      </p>

      <div className="space-y-2">
        {items.map((item) => {
          const active =
            location.pathname === item.path ||
            location.pathname.startsWith(`${item.path}/`)

          const Icon = item.icon

          return (
            <Link
              key={item.path}
              to={item.path}
              onClick={onNavigate}
              className={`flex items-center gap-3 rounded-2xl px-4 py-3 text-sm font-medium transition ${
                active
                  ? "bg-gradient-to-r from-sky-500 via-cyan-500 to-emerald-400 text-white shadow-lg shadow-cyan-500/20"
                  : "text-slate-400 hover:bg-slate-800 hover:text-white"
              }`}
            >
              <Icon size={18} />
              <span>{item.name}</span>
            </Link>
          )
        })}
      </div>
    </div>
  )
}

export default DashboardLayout