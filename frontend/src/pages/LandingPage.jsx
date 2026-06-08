import {
  Sparkles,
  FileText,
  Bot,
  ClipboardList,
  Brain,
  AlarmClock,
  CalendarDays,
  LayoutDashboard,
  ShieldCheck,
  Database,
  Code2,
  Server,
  Lock,
  ArrowRight,
  CheckCircle2,
  UploadCloud,
  BookOpen,
  BarChart3,
} from "lucide-react"

function LandingPage() {
  const token = localStorage.getItem("token")
  const user = JSON.parse(localStorage.getItem("user"))
  const isLoggedIn = Boolean(token)

  return (
    <div className="min-h-screen overflow-hidden bg-slate-950 text-white">
      <div className="pointer-events-none fixed inset-0 -z-10">
        <div className="absolute left-[-10%] top-[-10%] h-[420px] w-[420px] rounded-full bg-indigo-500/20 blur-3xl"></div>
        <div className="absolute right-[-10%] top-[15%] h-[420px] w-[420px] rounded-full bg-cyan-500/10 blur-3xl"></div>
        <div className="absolute bottom-[-10%] left-[20%] h-[420px] w-[420px] rounded-full bg-pink-500/10 blur-3xl"></div>
      </div>

      <nav className="sticky top-0 z-40 border-b border-slate-800/70 bg-slate-950/80 px-5 py-5 backdrop-blur-xl lg:px-10">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-6">
          <a href="/" className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-sky-500 via-cyan-500 to-emerald-400 text-white shadow-lg shadow-cyan-500/25">
              <BookOpen size={24} />
            </div>

            <div>
              <h1 className="text-xl font-bold">StudyMate AI</h1>
              <p className="text-xs text-slate-400">Smart Academic Assistant</p>
            </div>
          </a>

          <div className="hidden items-center gap-8 text-sm font-medium text-slate-300 md:flex">
            <a href="#features" className="hover:text-white">Features</a>
            <a href="#workflow" className="hover:text-white">Workflow</a>
            <a href="#technology" className="hover:text-white">Technology</a>
            <a href="#admin" className="hover:text-white">Admin</a>
          </div>

          <div className="flex items-center gap-3">
            {isLoggedIn ? (
              <a
                href="/dashboard"
                className="inline-flex items-center gap-2 rounded-2xl bg-gradient-to-r from-sky-500 via-cyan-500 to-emerald-400 px-5 py-3 text-sm font-semibold text-white shadow-lg shadow-cyan-500/20 hover:opacity-90"
              >
                Go to Dashboard
                <ArrowRight size={17} />
              </a>
            ) : (
              <>
                <a
                  href="/login"
                  className="rounded-2xl border border-slate-700 px-5 py-3 text-sm font-semibold hover:bg-slate-900"
                >
                  Login
                </a>

                <a
                  href="/register"
                  className="hidden rounded-2xl bg-gradient-to-r from-sky-500 via-cyan-500 to-emerald-400 px-5 py-3 text-sm font-semibold text-white shadow-lg shadow-cyan-500/20 hover:opacity-90 sm:inline-block"
                >
                  Get Started
                </a>
              </>
            )}
          </div>
        </div>
      </nav>

      <section className="mx-auto grid min-h-[calc(100vh-88px)] max-w-7xl grid-cols-1 items-center gap-14 px-5 py-16 lg:grid-cols-2 lg:px-10">
        <div>
          <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-cyan-400/30 bg-cyan-500/10 px-4 py-2 text-sm text-cyan-200">
            <Sparkles size={16} />
            AI-powered learning platform for university students
          </div>

          {isLoggedIn && (
            <div className="mb-6 rounded-2xl border border-emerald-500/20 bg-emerald-500/10 px-5 py-4 text-sm text-emerald-200">
              You are logged in as <span className="font-semibold">{user?.name || "Student"}</span>.
            </div>
          )}

          <h2 className="max-w-3xl text-5xl font-black leading-tight tracking-tight md:text-6xl xl:text-7xl">
            Study smarter with your own{" "}
            <span className="bg-gradient-to-r from-sky-400 via-cyan-300 to-emerald-300 bg-clip-text text-transparent">
              AI assistant.
            </span>
          </h2>

          <p className="mt-6 max-w-2xl text-lg leading-8 text-slate-300">
            Upload course materials, ask questions, generate summaries, create quizzes,
            build flashcards, track deadlines, and organize exam preparation from one
            modern academic dashboard.
          </p>

          <div className="mt-8 flex flex-wrap gap-4">
            {isLoggedIn ? (
              <a
                href="/dashboard"
                className="inline-flex items-center gap-2 rounded-2xl bg-gradient-to-r from-sky-500 via-cyan-500 to-emerald-400 px-7 py-4 font-semibold text-white shadow-lg shadow-cyan-500/25 hover:opacity-90"
              >
                Continue to Dashboard
                <ArrowRight size={18} />
              </a>
            ) : (
              <a
                href="/register"
                className="inline-flex items-center gap-2 rounded-2xl bg-gradient-to-r from-sky-500 via-cyan-500 to-emerald-400 px-7 py-4 font-semibold text-white shadow-lg shadow-cyan-500/25 hover:opacity-90"
              >
                Start Learning
                <ArrowRight size={18} />
              </a>
            )}

            <a
              href="#features"
              className="rounded-2xl border border-slate-700 px-7 py-4 font-semibold hover:bg-slate-900"
            >
              View Features
            </a>
          </div>

          <div className="mt-10 grid max-w-2xl grid-cols-1 gap-4 sm:grid-cols-3">
            <HeroMiniCard icon={Bot} title="AI" subtitle="Assistant" />
            <HeroMiniCard icon={FileText} title="PDF" subtitle="Extraction" />
            <HeroMiniCard icon={ClipboardList} title="Quiz" subtitle="Generator" />
          </div>
        </div>

        <HeroDashboardCard />
      </section>

      <section className="px-5 py-20 lg:px-10">
        <div className="mx-auto max-w-7xl rounded-[2rem] border border-slate-800 bg-slate-900/60 p-8 shadow-2xl shadow-slate-950/40 md:p-10">
          <div className="grid gap-10 lg:grid-cols-2">
            <div>
              <p className="mb-3 text-sm font-bold uppercase tracking-wider text-cyan-300">
                Project Problem
              </p>
              <h3 className="text-3xl font-black leading-tight md:text-4xl">
                Students have many files, deadlines, quizzes, and exams, but no single smart study system.
              </h3>
            </div>

            <p className="text-lg leading-8 text-slate-300">
              University students receive PDFs, documents, assignments, quiz dates,
              and exam deadlines from different sources. StudyMate AI brings everything
              together by allowing students to upload materials, extract text, ask
              study questions, generate quizzes and flashcards, and create study plans.
            </p>
          </div>
        </div>
      </section>

      <section id="features" className="px-5 py-20 lg:px-10">
        <SectionHeader
          label="Core Features"
          title="Everything students need in one platform"
          description="StudyMate AI combines file management, AI assistance, quizzes, flashcards, deadlines, and study planning in one full-stack web application."
        />

        <div className="mx-auto mt-12 grid max-w-7xl gap-6 md:grid-cols-2 xl:grid-cols-3">
          <FeatureCard
            icon={UploadCloud}
            title="Material Upload"
            description="Upload TXT, PDF, DOC, and DOCX files, then extract readable text for AI-powered study support."
          />
          <FeatureCard
            icon={Bot}
            title="AI Assistant"
            description="Ask questions about uploaded materials and receive helpful explanations based on the file content."
          />
          <FeatureCard
            icon={ClipboardList}
            title="Quiz Generator"
            description="Generate practice quizzes from uploaded course material with custom question counts."
          />
          <FeatureCard
            icon={Brain}
            title="Flashcards"
            description="Create flashcards grouped by material decks and review them using interactive flip cards."
          />
          <FeatureCard
            icon={AlarmClock}
            title="Deadline Tracker"
            description="Track assignments, exams, projects, and presentations with priority and completion status."
          />
          <FeatureCard
            icon={CalendarDays}
            title="Study Planner"
            description="Generate a study plan based on exam date, difficulty, and available daily study hours."
          />
        </div>
      </section>

      <section id="workflow" className="px-5 py-20 lg:px-10">
        <SectionHeader
          label="Student Workflow"
          title="How the system works"
          description="A simple academic workflow from course creation to AI-powered study preparation."
        />

        <div className="mx-auto mt-12 grid max-w-7xl gap-6 md:grid-cols-2 xl:grid-cols-4">
          <StepCard
            number="01"
            icon={BookOpen}
            title="Create Course"
            description="The student creates a course such as Database Systems, AI, or Web Development."
          />
          <StepCard
            number="02"
            icon={UploadCloud}
            title="Upload Material"
            description="The student uploads PDFs, notes, or documents and links them to a course."
          />
          <StepCard
            number="03"
            icon={Sparkles}
            title="Use AI Tools"
            description="The system generates summaries, quizzes, flashcards, and AI answers."
          />
          <StepCard
            number="04"
            icon={BarChart3}
            title="Track Progress"
            description="The dashboard shows scores, deadlines, study plans, and recent activity."
          />
        </div>
      </section>

      <section id="admin" className="px-5 py-20 lg:px-10">
        <div className="mx-auto grid max-w-7xl gap-8 lg:grid-cols-2">
          <div className="rounded-[2rem] border border-slate-800 bg-slate-900/70 p-8">
            <div className="mb-5 flex h-14 w-14 items-center justify-center rounded-2xl bg-cyan-500/15 text-cyan-300">
              <ShieldCheck size={28} />
            </div>

            <p className="mb-3 text-sm font-bold uppercase tracking-wider text-cyan-300">
              Admin Monitoring
            </p>

            <h3 className="text-3xl font-black">Built-in admin panel</h3>

            <p className="mt-4 leading-7 text-slate-400">
              Admins can monitor registered students, uploaded materials, courses,
              generated quizzes, deadlines, and study activity from a dedicated admin dashboard.
            </p>

            <div className="mt-8 grid grid-cols-2 gap-4">
              <MiniCard label="Students" value="Manage" />
              <MiniCard label="Courses" value="View" />
              <MiniCard label="Materials" value="Track" />
              <MiniCard label="Quizzes" value="Monitor" />
            </div>
          </div>

          <div className="rounded-[2rem] border border-slate-800 bg-slate-900/70 p-8">
            <div className="mb-5 flex h-14 w-14 items-center justify-center rounded-2xl bg-emerald-500/15 text-emerald-300">
              <LayoutDashboard size={28} />
            </div>

            <p className="mb-3 text-sm font-bold uppercase tracking-wider text-emerald-300">
              Academic Value
            </p>

            <h3 className="text-3xl font-black">A complete senior project</h3>

            <p className="mt-4 leading-7 text-slate-400">
              The project includes authentication, role-based access, file upload,
              database relationships, AI-ready architecture, CRUD modules, dashboards,
              progress tracking, and admin reports.
            </p>

            <div className="mt-8 space-y-3">
              <CheckItem text="React frontend with protected routes" />
              <CheckItem text="Laravel API backend with Sanctum authentication" />
              <CheckItem text="MySQL database with related tables" />
              <CheckItem text="AI-ready architecture using uploaded material text" />
            </div>
          </div>
        </div>
      </section>

      <section id="technology" className="px-5 py-20 lg:px-10">
        <SectionHeader
          label="Technology Stack"
          title="Modern full-stack development"
          description="The project is built using common technologies required in real-world web applications."
        />

        <div className="mx-auto mt-12 grid max-w-7xl gap-6 md:grid-cols-2 xl:grid-cols-4">
          <TechCard icon={Code2} title="React" description="Modern frontend UI and routing" />
          <TechCard icon={Server} title="Laravel API" description="Backend logic and REST endpoints" />
          <TechCard icon={Database} title="MySQL" description="Relational database storage" />
          <TechCard icon={Lock} title="Sanctum" description="Token-based authentication" />
        </div>
      </section>

      <section className="px-5 py-20 lg:px-10">
        <div className="mx-auto max-w-5xl rounded-[2rem] border border-cyan-500/30 bg-gradient-to-r from-sky-500/20 via-cyan-500/10 to-emerald-500/10 p-10 text-center shadow-2xl shadow-cyan-950/30">
          <h3 className="text-4xl font-black">
            {isLoggedIn ? "Welcome back to StudyMate AI" : "Ready to study smarter?"}
          </h3>

          <p className="mx-auto mt-4 max-w-2xl leading-7 text-slate-300">
            {isLoggedIn
              ? "You are already logged in. Continue to your dashboard and keep managing your courses, materials, quizzes, and study plans."
              : "Create an account, upload course material, and start using AI-powered tools to organize your learning."}
          </p>

          <div className="mt-8 flex flex-wrap justify-center gap-4">
            {isLoggedIn ? (
              <a
                href="/dashboard"
                className="inline-flex items-center gap-2 rounded-2xl bg-gradient-to-r from-sky-500 via-cyan-500 to-emerald-400 px-7 py-4 font-semibold text-white hover:opacity-90"
              >
                Go to Dashboard
                <ArrowRight size={18} />
              </a>
            ) : (
              <>
                <a
                  href="/register"
                  className="inline-flex items-center gap-2 rounded-2xl bg-gradient-to-r from-sky-500 via-cyan-500 to-emerald-400 px-7 py-4 font-semibold text-white hover:opacity-90"
                >
                  Create Account
                  <ArrowRight size={18} />
                </a>

                <a
                  href="/login"
                  className="rounded-2xl border border-slate-700 px-7 py-4 font-semibold hover:bg-slate-900"
                >
                  Login
                </a>
              </>
            )}
          </div>
        </div>
      </section>

      <footer className="border-t border-slate-800 px-5 py-8 text-center text-sm text-slate-500">
        © {new Date().getFullYear()} StudyMate AI. All rights reserved.
      </footer>
    </div>
  )
}

function HeroDashboardCard() {
  return (
    <div className="relative">
      <div className="absolute -inset-5 rounded-[2.5rem] bg-gradient-to-r from-sky-500 via-cyan-500 to-emerald-400 opacity-20 blur-3xl"></div>

      <div className="relative rounded-[2rem] border border-slate-800 bg-slate-900/80 p-6 shadow-2xl shadow-slate-950/60 backdrop-blur">
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h3 className="text-xl font-bold">AI Study Dashboard</h3>
            <p className="text-sm text-slate-400">Database Systems course</p>
          </div>

          <span className="rounded-full bg-green-500/10 px-3 py-1 text-sm font-semibold text-green-400">
            Active
          </span>
        </div>

        <div className="space-y-4">
          <div className="rounded-2xl border border-slate-800 bg-slate-950 p-5">
            <p className="mb-2 text-sm text-slate-400">Uploaded Material</p>
            <p className="font-semibold">Chapter 3 - Normalization.pdf</p>
          </div>

          <div className="rounded-2xl border border-cyan-400/20 bg-cyan-500/10 p-5">
            <p className="mb-2 text-sm text-cyan-300">AI Summary</p>
            <p className="text-sm leading-6 text-slate-200">
              Normalization organizes database tables to reduce redundancy and
              improve data consistency. Students can review the concept using quizzes
              and flashcards.
            </p>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <StatBox number="86%" label="Quiz Score" />
            <StatBox number="7" label="Study Tasks" />
          </div>

          <div className="rounded-2xl border border-slate-800 p-5">
            <p className="mb-3 text-sm text-slate-400">Study Progress</p>
            <div className="h-3 rounded-full bg-slate-800">
              <div className="h-3 w-[72%] rounded-full bg-gradient-to-r from-sky-500 via-cyan-500 to-emerald-400"></div>
            </div>
            <p className="mt-2 text-sm text-slate-400">72% completed</p>
          </div>
        </div>
      </div>
    </div>
  )
}

function HeroMiniCard({ icon: Icon, title, subtitle }) {
  return (
    <div className="rounded-3xl border border-slate-800 bg-slate-900/70 p-5">
      <Icon className="mb-4 text-cyan-300" size={26} />
      <p className="text-2xl font-black">{title}</p>
      <p className="text-sm text-slate-400">{subtitle}</p>
    </div>
  )
}

function StatBox({ number, label }) {
  return (
    <div className="rounded-2xl border border-slate-800 bg-slate-950 p-5">
      <p className="text-3xl font-black">{number}</p>
      <p className="text-sm text-slate-400">{label}</p>
    </div>
  )
}

function SectionHeader({ label, title, description }) {
  return (
    <div className="mx-auto max-w-3xl text-center">
      <p className="mb-3 text-sm font-bold uppercase tracking-wider text-cyan-300">
        {label}
      </p>
      <h3 className="text-4xl font-black leading-tight md:text-5xl">{title}</h3>
      <p className="mx-auto mt-4 max-w-2xl leading-7 text-slate-400">
        {description}
      </p>
    </div>
  )
}

function FeatureCard({ icon: Icon, title, description }) {
  return (
    <div className="group rounded-[2rem] border border-slate-800 bg-slate-900/70 p-7 transition hover:-translate-y-1 hover:border-cyan-500/50 hover:shadow-2xl hover:shadow-cyan-950/20">
      <div className="mb-5 flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-sky-500/20 to-emerald-500/20 text-cyan-300">
        <Icon size={28} />
      </div>

      <h4 className="mb-3 text-xl font-bold">{title}</h4>
      <p className="leading-7 text-slate-400">{description}</p>
    </div>
  )
}

function StepCard({ number, icon: Icon, title, description }) {
  return (
    <div className="rounded-[2rem] border border-slate-800 bg-slate-900/70 p-7">
      <div className="mb-5 flex items-center justify-between">
        <p className="text-sm font-black text-cyan-300">{number}</p>
        <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-cyan-500/10 text-cyan-300">
          <Icon size={22} />
        </div>
      </div>

      <h4 className="text-xl font-bold">{title}</h4>
      <p className="mt-3 leading-7 text-slate-400">{description}</p>
    </div>
  )
}

function MiniCard({ label, value }) {
  return (
    <div className="rounded-2xl border border-slate-800 bg-slate-950 p-4">
      <p className="text-sm text-slate-500">{label}</p>
      <p className="mt-1 text-xl font-black">{value}</p>
    </div>
  )
}

function CheckItem({ text }) {
  return (
    <div className="flex items-center gap-3 rounded-2xl border border-slate-800 bg-slate-950 p-4">
      <CheckCircle2 className="text-green-400" size={22} />
      <p className="text-sm text-slate-300">{text}</p>
    </div>
  )
}

function TechCard({ icon: Icon, title, description }) {
  return (
    <div className="rounded-[2rem] border border-slate-800 bg-slate-900/70 p-6 text-center">
      <div className="mx-auto mb-5 flex h-14 w-14 items-center justify-center rounded-2xl bg-cyan-500/10 text-cyan-300">
        <Icon size={28} />
      </div>
      <h4 className="text-xl font-bold">{title}</h4>
      <p className="mt-3 text-sm leading-6 text-slate-400">{description}</p>
    </div>
  )
}

export default LandingPage