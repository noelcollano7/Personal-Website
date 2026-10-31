import { lazy, Suspense, type ChangeEvent, type FormEvent, useMemo, useRef, useState } from 'react'
import {
  ArrowRight,
  Check,
  ChevronRight,
  ExternalLink,
  Menu,
  Sparkles,
  X,
} from 'lucide-react'
import { BrowserRouter, Link, NavLink, Route, Routes } from 'react-router-dom'
import { supabase } from './lib/supabase'
import homeImage from '../image.png'

const Chatbot = lazy(() => import('./components/Chatbot'))

type Project = {
  title: string
  category: 'Web Development' | 'AI Automation' | 'Customer Experience'
  overview: string
  problem: string
  solution: string
  technologies: string[]
  status: 'Prototype' | 'Concept'
  image: string
}

type FormState = {
  name: string
  email: string
  subject: string
  message: string
}

const navItems = [
  { label: 'Home', to: '/' },
  { label: 'About', to: '/about' },
  { label: 'Projects', to: '/projects' },
  { label: 'Contact', to: '/contact' },
]

const heroHighlights = [
  'Customer Service & Admin support',
  'Customer Experience Optimization',
  'AI Development & GHL Automation',
  'Responsive Web Projects',
]

const skillGroups = [
  {
    title: 'Customer Service',
    items: ['Customer Support', 'Technical Troubleshooting', 'Customer Communication', 'Issue Resolution'],
  },
  {
    title: 'AI & Technology',
    items: ['AI Tools and Automation', 'Workflow Optimization', 'Prompt Engineering', 'Web Development Fundamentals'],
  },
  {
    title: 'Professional Skills',
    items: ['Adaptability', 'Critical Thinking', 'Time Management', 'Continuous Learning'],
  },
]

const projects: Project[] = [
  {
    title: 'Personal Portfolio Website',
    category: 'Web Development',
    overview:
      'A polished personal portfolio designed to present my customer service background, AI Full stack development and project work with clarity and confidence.',
    problem:
      'I needed a digital presence that communicated my value clearly to international clients and remote employers without looking overly generic.',
    solution:
      'I built a clean editorial-style portfolio with a strong narrative, thoughtful layout, and direct calls to action that help visitors understand my skills quickly.',
    technologies: ['React', 'Vite', 'Data Base', 'TypeScript', 'Tailwind CSS'],
    status: 'Prototype',
    image:
      'https://images.unsplash.com/photo-1522202176988-66273c2fd55f?auto=format&fit=crop&w=900&q=80',
  },
  {
    title: 'AI Customer Support Automation',
    category: 'AI Automation',
    overview:
      'A concept workflow that uses AI to triage common support questions, route customer issues, and reduce repetitive manual work for service teams.',
    problem:
      'Support teams often spend time answering the same questions repeatedly, which slows response times and reduces focus on complex cases.',
    solution:
      'I designed a practical automation flow using AI-assisted messaging and structured templates to surface faster responses and support consistency.',
    technologies: ['AI Workflow Design', 'Prompt Engineering', 'Customer Experience', 'Automation'],
    status: 'Concept',
    image:
      'https://images.unsplash.com/photo-1552664730-d307ca884978?auto=format&fit=crop&w=900&q=80',
  },
  {
    title: 'Customer Service',
    category: 'Customer Experience',
    overview:
      'Provided excellent customer service to Comcast and Xfinity customers, assisting with mobile, internet, and landline services while ensuring customer satisfaction.',
    problem:
      'Operational bottlenecks and duplicate work create inefficiencies that affect customer service quality and team productivity.',
    solution:
      'The concept focuses on reducing manual tasks, standardizing communication flows, and helping teams spend more time on customers and complex problem-solving.',
    technologies: ['Workflow Mapping', 'Sales Calls', 'Cold Calling', 'Operations'],
    status: 'Concept',
    image:
      'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?auto=format&fit=crop&w=900&q=80',
  },
]

const filterOptions = ['All Projects', 'Web Development', 'AI Automation', 'Customer Experience']

function App() {
  return (
    <BrowserRouter>
      <PortfolioApp />
    </BrowserRouter>
  )
}

function PortfolioApp() {
  const [menuOpen, setMenuOpen] = useState(false)

  return (
    <>
      <div className="min-h-screen bg-[#ece3d7] px-3 py-4 text-[#252525] sm:px-6 lg:px-8">
        <div className="mx-auto max-w-[1400px] overflow-hidden rounded-[28px] border border-[#cabfb4] bg-[#f7f3ee] shadow-[0_30px_80px_rgba(37,37,37,0.08)]">
        <header className="border-b border-[#cabfb4] bg-[#f7f3ee]/90 backdrop-blur-sm">
          <nav className="relative mx-auto flex max-w-6xl items-center justify-end px-4 py-5 sm:px-6 lg:px-8">
            <div className="absolute left-1/2 hidden -translate-x-1/2 items-center gap-8 md:flex">
              {navItems.map((item) => (
                <NavLink
                  key={item.to}
                  to={item.to}
                  end={item.to === '/'}
                  className={({ isActive }) =>
                    `text-sm font-medium transition-colors ${
                      isActive ? 'text-[#252525]' : 'text-[#68635f] hover:text-[#252525]'
                    }`
                  }
                >
                  {item.label}
                </NavLink>
              ))}
            </div>

            <div className="hidden md:block">
              <Link
                to="/contact"
                className="inline-flex items-center gap-2 rounded-full border border-[#6e7560] bg-[#6e7560] px-4 py-2.5 text-sm font-medium text-[#f8f5f1] transition-transform hover:-translate-y-0.5 hover:bg-[#59654c]"
              >
                Let&apos;s Talk
                <ArrowRight size={16} />
              </Link>
            </div>

            <button
              type="button"
              onClick={() => setMenuOpen((open) => !open)}
              className="inline-flex h-11 w-11 items-center justify-center rounded-full border border-[#cabfb4] text-[#252525] md:hidden"
              aria-label={menuOpen ? 'Close menu' : 'Open menu'}
              aria-expanded={menuOpen}
            >
              {menuOpen ? <X size={18} /> : <Menu size={18} />}
            </button>
          </nav>

          {menuOpen && (
            <div className="border-t border-[#cabfb4] bg-[#f7f3ee] px-4 py-4 md:hidden">
              <div className="mx-auto flex max-w-6xl flex-col gap-3">
                {navItems.map((item) => (
                  <NavLink
                    key={item.to}
                    to={item.to}
                    end={item.to === '/'}
                    onClick={() => setMenuOpen(false)}
                    className={({ isActive }) =>
                      `rounded-xl px-3 py-2 text-sm font-medium ${
                        isActive ? 'bg-[#efe7df] text-[#252525]' : 'text-[#68635f] hover:bg-[#f1ece7]'
                      }`
                    }
                  >
                    {item.label}
                  </NavLink>
                ))}
                <Link
                  to="/contact"
                  onClick={() => setMenuOpen(false)}
                  className="mt-2 inline-flex items-center justify-center gap-2 rounded-full border border-[#6e7560] bg-[#6e7560] px-4 py-2.5 text-sm font-medium text-[#f8f5f1]"
                >
                  Let&apos;s Talk
                  <ArrowRight size={16} />
                </Link>
              </div>
            </div>
          )}
        </header>

        <main className="mx-auto max-w-6xl px-4 py-6 sm:px-6 lg:px-8 lg:py-10">
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/about" element={<AboutPage />} />
            <Route path="/projects" element={<ProjectsPage />} />
            <Route path="/contact" element={<ContactPage />} />
          </Routes>
        </main>

        <footer className="border-t border-[#cabfb4] bg-[#f3eee9]">
          <div className="mx-auto flex max-w-6xl flex-col gap-6 px-4 py-8 sm:px-6 lg:flex-row lg:items-center lg:justify-between lg:px-8">
            <div>
              <p className="text-sm uppercase tracking-[0.2em] text-[#68635f]">Noel Collano</p>
              <p className="mt-2 text-sm text-[#68635f]">Customer service professional · AI Full-Stack Developer · AI Automation Specialist</p>
            </div>
            <div className="flex flex-wrap items-center gap-6 text-sm text-[#68635f]">
              {navItems.map((item) => (
                <Link key={item.to} to={item.to} className="transition-colors hover:text-[#252525]">
                  {item.label}
                </Link>
              ))}
            </div>
          </div>
        </footer>
        </div>
      </div>
      <Suspense fallback={null}>
        <Chatbot />
      </Suspense>
    </>
  )
}

function HomePage() {
  return (
    <>
      <section className="rounded-[28px] border border-[#cabfb4] bg-[#f8f4f0] p-4 sm:p-6 lg:p-8">
        <div className="grid items-center gap-8 lg:grid-cols-[1.1fr_0.9fr] lg:gap-12">
          <div className="space-y-7">
            <div className="inline-flex items-center gap-2 rounded-full border border-[#cabfb4] bg-[#efe7df] px-3 py-1.5 text-[11px] font-medium uppercase tracking-[0.24em] text-[#5d5a57]">
              <Sparkles size={12} />
              Customer service · AI Web Development
            </div>

            <div className="space-y-5">
              <h1 className="max-w-xl text-4xl font-semibold leading-[1.04] tracking-[-0.06em] text-[#252525] sm:text-5xl lg:text-6xl">
                Virtual Assistant / AI Automation Specialist
              </h1>

              <p className="max-w-xl text-base leading-8 text-[#5c5854] sm:text-lg">
                I'm a customer service professional with experience supporting telecommunications customers and an AI full-stack developer.
              </p>
            </div>

            <div className="flex flex-col gap-3 sm:flex-row">
              <Link
                to="/projects"
                className="inline-flex items-center justify-center gap-2 rounded-full bg-[#6e7560] px-5 py-3 text-sm font-medium text-[#f8f5f1] transition-transform hover:-translate-y-0.5 hover:bg-[#59654c]"
              >
                Explore My Projects
                <ArrowRight size={16} />
              </Link>
              <Link
                to="/contact"
                className="inline-flex items-center justify-center gap-2 rounded-full border border-[#cabfb4] bg-white/60 px-5 py-3 text-sm font-medium text-[#252525] transition-colors hover:bg-white"
              >
                Get in Touch
              </Link>
            </div>

            <p className="flex items-center gap-2 text-sm text-[#5d5a57]">
              <span className="inline-block h-2.5 w-2.5 rounded-full bg-[#6e7560]" />
              Open to Remote Opportunities &amp; Freelance Projects
            </p>

          </div>

          <div className="relative">
            <div className="relative overflow-hidden rounded-[28px] border border-[#cabfb4] bg-[#efe7df] p-2 shadow-[0_20px_40px_rgba(79,68,58,0.10)] transition-transform duration-300 hover:-translate-y-1">
              <img
                src={homeImage}
                alt="Professional portrait"
                className="h-[520px] w-full rounded-[20px] object-cover"
              />
            </div>
            <div className="absolute -bottom-5 left-4 rounded-2xl border border-[#cabfb4] bg-[#f7f3ee]/90 px-4 py-3 shadow-[0_12px_30px_rgba(37,37,37,0.08)] backdrop-blur-sm">
              <p className="text-[10px] uppercase tracking-[0.24em] text-[#68635f]">Based in the Philippines</p>
              <p className="mt-1 text-sm font-medium text-[#252525]">Hello! I'm Noel Collano, Virtual Assistant & AI Full-Stack Developer.</p>
            </div>
          </div>
        </div>
      </section>

      <section className="mt-8 rounded-[28px] border border-[#cabfb4] bg-[#f5efe9] p-5 sm:p-6 lg:p-8">
        <div className="flex items-center justify-between gap-4 border-b border-[#cabfb4] pb-4">
          <div>
            <p className="text-[11px] uppercase tracking-[0.22em] text-[#68635f]">Professional Highlights</p>
            <h2 className="mt-2 text-2xl font-semibold tracking-[-0.05em] text-[#252525]">How I bring value?</h2>
          </div>
        </div>

        <div className="mt-6 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          {heroHighlights.map((highlight) => (
            <div key={highlight} className="rounded-2xl border border-[#cabfb4] bg-[#f8f4f0] p-4 transition-colors hover:bg-[#f3eee7]">
              <div className="mb-4 inline-flex h-10 w-10 items-center justify-center rounded-full bg-[#e7dfd4] text-[#6e7560]">
                <Check size={18} />
              </div>
              <p className="text-base font-medium leading-7 text-[#252525]">{highlight}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="mt-8 rounded-[28px] border border-[#cabfb4] bg-[#f8f4f0] p-5 sm:p-6 lg:p-8">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-[11px] uppercase tracking-[0.22em] text-[#68635f]">Featured Projects</p>
            <h2 className="mt-2 text-3xl font-semibold tracking-[-0.05em] text-[#252525]">Selected work</h2>
          </div>
          <Link to="/projects" className="inline-flex items-center gap-2 text-sm font-medium text-[#6e7560] hover:text-[#4b5344]">
            View all projects
            <ChevronRight size={16} />
          </Link>
        </div>

        <div className="mt-6 grid gap-5 lg:grid-cols-3">
          {projects.map((project) => (
            <div key={project.title} className="group overflow-hidden rounded-[24px] border border-[#cabfb4] bg-[#f3eee8] transition-transform duration-300 hover:-translate-y-1 hover:shadow-[0_18px_35px_rgba(37,37,37,0.08)]">
              <img src={project.image} alt={project.title} className="h-52 w-full object-cover transition-transform duration-500 group-hover:scale-[1.03]" />
              <div className="space-y-4 p-5">
                <div className="flex items-center justify-between gap-3">
                  <span className="rounded-full border border-[#cdd3c5] bg-[#edf0eb] px-2.5 py-1 text-[10px] font-medium uppercase tracking-[0.18em] text-[#59654c]">
                    {project.category}
                  </span>
                  <span className="text-xs font-medium text-[#68635f]">{project.status}</span>
                </div>
                <div>
                  <h3 className="text-xl font-semibold tracking-[-0.04em] text-[#252525]">{project.title}</h3>
                  <p className="mt-2 text-sm leading-6 text-[#5d5a57]">{project.overview}</p>
                </div>
                <div className="flex flex-wrap gap-2">
                  {project.technologies.slice(0, 3).map((tech) => (
                    <span key={tech} className="rounded-full border border-[#cabfb4] bg-[#f8f4f0] px-2.5 py-1 text-[10px] uppercase tracking-[0.14em] text-[#5d5a57]">
                      {tech}
                    </span>
                  ))}
                </div>
                <Link to="/projects" className="inline-flex items-center gap-2 text-sm font-medium text-[#6e7560] hover:text-[#4a5141]">
                  View Project
                  <ExternalLink size={14} />
                </Link>
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className="mt-8 rounded-[28px] border border-[#cabfb4] bg-[#efe7df] p-6 sm:p-8">
        <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <p className="text-[11px] uppercase tracking-[0.22em] text-[#68635f]">Let&apos;s build better experiences</p>
            <h2 className="mt-2 text-3xl font-semibold tracking-[-0.05em] text-[#252525]">Have a project in mind?</h2>
            <p className="mt-3 max-w-xl text-base leading-7 text-[#5d5a57]">
              Let&apos;s discuss how I can contribute to your team or help improve your business workflows.
            </p>
          </div>
          <Link
            to="/contact"
            className="inline-flex items-center justify-center gap-2 rounded-full bg-[#252525] px-5 py-3 text-sm font-medium text-[#f8f5f1] transition-transform hover:-translate-y-0.5"
          >
            Contact Me
            <ArrowRight size={16} />
          </Link>
        </div>
      </section>
    </>
  )
}

function AboutPage() {
  return (
    <div className="space-y-8 rounded-[28px] border border-[#cabfb4] bg-[#f8f4f0] p-5 sm:p-6 lg:p-8">
      <section className="grid gap-8 lg:grid-cols-[0.95fr_1.05fr]">
        <div className="space-y-6">
          <p className="text-[11px] uppercase tracking-[0.22em] text-[#68635f]">About</p>
          <h1 className="text-4xl font-semibold tracking-[-0.06em] text-[#252525] sm:text-5xl">A Little About Me</h1>
        </div>

        <div className="space-y-5 text-base leading-8 text-[#5d5a57]">
          <p>
            I&apos;m a customer service professional from the Philippines with an undergraduate background in Mechanical Engineering. My professional experience includes supporting customers with mobile, internet, and landline services for Comcast and Xfinity.
          </p>
          <p>
            I&apos;m also developing my skills in AI automation and web technologies to help businesses streamline repetitive tasks, improve efficiency, and deliver better customer experiences.
          </p>
        </div>
      </section>

      <section className="grid gap-5 lg:grid-cols-2">
        <div className="rounded-[24px] border border-[#cabfb4] bg-[#f3eee8] p-5">
          <h2 className="text-2xl font-semibold tracking-[-0.05em] text-[#252525]">Professional Background</h2>
          <ul className="mt-5 space-y-4 text-sm leading-7 text-[#5d5a57]">
            <li className="flex gap-3"><span className="mt-2 h-2 w-2 rounded-full bg-[#6e7560]" />Customer service and telecommunications support.</li>
            <li className="flex gap-3"><span className="mt-2 h-2 w-2 rounded-full bg-[#6e7560]" />Customer communication and problem-solving.</li>
            <li className="flex gap-3"><span className="mt-2 h-2 w-2 rounded-full bg-[#6e7560]" />Mechanical Engineering academic background.</li>
            <li className="flex gap-3"><span className="mt-2 h-2 w-2 rounded-full bg-[#6e7560]" />Continued development in AI automation and web technologies.</li>
          </ul>
        </div>

        <div className="rounded-[24px] border border-[#cabfb4] bg-[#efe7df] p-5">
          <h2 className="text-2xl font-semibold tracking-[-0.05em] text-[#252525]">My Approach</h2>
          <p className="mt-4 text-sm leading-7 text-[#5d5a57]">
            I believe the best customer and business experiences come from clear communication, dependable support, and the smart use of practical technology. I bring a calm, solutions-focused mindset to every challenge and continue learning to improve the quality of my work.
          </p>
        </div>
      </section>

      <section className="space-y-5">
        <div>
          <p className="text-[11px] uppercase tracking-[0.22em] text-[#68635f]">Core Skills</p>
          <h2 className="mt-2 text-3xl font-semibold tracking-[-0.05em] text-[#252525]">What I bring</h2>
        </div>

        <div className="grid gap-4 md:grid-cols-3">
          {skillGroups.map((group) => (
            <div key={group.title} className="rounded-[22px] border border-[#cabfb4] bg-[#f3eee8] p-5">
              <h3 className="text-lg font-semibold text-[#252525]">{group.title}</h3>
              <ul className="mt-4 space-y-3 text-sm text-[#5d5a57]">
                {group.items.map((skill) => (
                  <li key={skill} className="flex items-center gap-2">
                    <span className="inline-flex h-5 w-5 items-center justify-center rounded-full bg-[#e7dfd4] text-[10px] text-[#6e7560]">
                      ✓
                    </span>
                    {skill}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </section>
    </div>
  )
}

function ProjectsPage() {
  const [activeFilter, setActiveFilter] = useState('All Projects')

  const filteredProjects = useMemo(() => {
    if (activeFilter === 'All Projects') {
      return projects
    }

    return projects.filter((project) => project.category === activeFilter)
  }, [activeFilter])

  return (
    <div className="space-y-8 rounded-[28px] border border-[#cabfb4] bg-[#f8f4f0] p-5 sm:p-6 lg:p-8">
      <section className="space-y-5">
        <p className="text-[11px] uppercase tracking-[0.22em] text-[#68635f]">Projects</p>
        <h1 className="text-4xl font-semibold tracking-[-0.06em] text-[#252525] sm:text-5xl">Practical ideas and growing skills</h1>
      </section>

      <div className="flex flex-wrap gap-3">
        {filterOptions.map((option) => (
          <button
            key={option}
            type="button"
            onClick={() => setActiveFilter(option)}
            className={`rounded-full border px-4 py-2 text-sm font-medium transition-all ${
              activeFilter === option
                ? 'border-[#6e7560] bg-[#6e7560] text-[#f8f5f1]'
                : 'border-[#cabfb4] bg-[#f3eee8] text-[#252525] hover:border-[#6e7560] hover:text-[#6e7560]'
            }`}
          >
            {option}
          </button>
        ))}
      </div>

      <section className="grid gap-5 lg:grid-cols-2">
        {filteredProjects.map((project) => (
          <article key={project.title} className="overflow-hidden rounded-[24px] border border-[#cabfb4] bg-[#f3eee8]">
            <img src={project.image} alt={project.title} className="h-56 w-full object-cover" />
            <div className="space-y-5 p-5">
              <div className="flex items-center justify-between gap-3">
                <span className="rounded-full border border-[#cdd3c5] bg-[#edf0eb] px-2.5 py-1 text-[10px] font-medium uppercase tracking-[0.16em] text-[#59654c]">
                  {project.category}
                </span>
                <span className="text-xs font-medium text-[#68635f]">{project.status}</span>
              </div>

              <div>
                <h2 className="text-2xl font-semibold tracking-[-0.05em] text-[#252525]">{project.title}</h2>
                <p className="mt-3 text-sm leading-7 text-[#5d5a57]">{project.overview}</p>
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-[#68635f]">Problem</p>
                  <p className="mt-2 text-sm leading-6 text-[#5d5a57]">{project.problem}</p>
                </div>
                <div>
                  <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-[#68635f]">Solution</p>
                  <p className="mt-2 text-sm leading-6 text-[#5d5a57]">{project.solution}</p>
                </div>
              </div>

              <div className="flex flex-wrap gap-2">
                {project.technologies.map((tech) => (
                  <span key={tech} className="rounded-full border border-[#cabfb4] bg-[#f8f4f0] px-2.5 py-1 text-[10px] uppercase tracking-[0.14em] text-[#5d5a57]">
                    {tech}
                  </span>
                ))}
              </div>

            </div>
          </article>
        ))}
      </section>
    </div>
  )
}

function ContactPage() {
  const [form, setForm] = useState<FormState>({
    name: '',
    email: '',
    subject: '',
    message: '',
  })
  const [errors, setErrors] = useState<Partial<Record<keyof FormState, string>>>({})
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(null)
  const [website, setWebsite] = useState('')
  const submissionInProgress = useRef(false)

  const handleChange = (event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = event.target

    setForm((current) => ({ ...current, [name]: value }))

    setErrors((current) => ({
      ...current,
      [name]: undefined,
    }))
  }

  const validateForm = () => {
    const nextErrors: Partial<Record<keyof FormState, string>> = {}

    if (!form.name.trim()) {
      nextErrors.name = 'Please enter your full name.'
    } else if (form.name.trim().length > 120) {
      nextErrors.name = 'Please keep your name under 120 characters.'
    }

    if (!form.email.trim()) {
      nextErrors.email = 'Please enter your email address.'
    } else if (form.email.trim().length > 254 || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email.trim())) {
      nextErrors.email = 'Please provide a valid email address.'
    }

    if (!form.subject.trim()) {
      nextErrors.subject = 'Please add a subject line.'
    } else if (form.subject.trim().length > 200) {
      nextErrors.subject = 'Please keep your subject under 200 characters.'
    }

    if (!form.message.trim()) {
      nextErrors.message = 'Please include a short message.'
    } else if (form.message.trim().length < 15) {
      nextErrors.message = 'Please share a bit more detail so I can respond thoughtfully.'
    } else if (form.message.trim().length > 5000) {
      nextErrors.message = 'Please keep your message under 5,000 characters.'
    }

    return nextErrors
  }

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    if (submissionInProgress.current) return

    const nextErrors = validateForm()

    if (Object.keys(nextErrors).length > 0) {
      setErrors(nextErrors)
      setFeedback({ type: 'error', message: 'Please fix the highlighted fields and try again.' })
      return
    }

    if (website) {
      setFeedback({ type: 'error', message: 'Unable to submit this message. Please try again.' })
      return
    }

    setErrors({})
    setFeedback(null)
    if (!supabase) {
      setFeedback({
        type: 'error',
        message: 'The contact form is not configured yet. Please try again later.',
      })
      return
    }

    submissionInProgress.current = true
    setIsSubmitting(true)

    try {
      const { data, error } = await supabase.functions.invoke<{ saved: boolean }>(
        'send-contact-email',
        {
          body: {
            name: form.name.trim(),
            email: form.email.trim(),
            subject: form.subject.trim(),
            message: form.message.trim(),
            website,
          },
        },
      )

      if (error) throw error
      if (!data?.saved) throw new Error('The contact form did not confirm that the message was saved.')

      setFeedback({
        type: 'success',
        message: 'Your message has been received. Thank you for reaching out.',
      })

      setForm({ name: '', email: '', subject: '', message: '' })
      setWebsite('')
    } catch (error) {
      console.error('Contact form submission failed:', error)
      setFeedback({
        type: 'error',
        message: 'We could not submit your message right now. Please try again.',
      })
    } finally {
      submissionInProgress.current = false
      setIsSubmitting(false)
    }
  }

  return (
    <div className="grid gap-6 rounded-[28px] border border-[#cabfb4] bg-[#f8f4f0] p-5 sm:p-6 lg:grid-cols-[0.9fr_1.1fr] lg:p-8">
      <section className="space-y-6">
        <div>
          <p className="text-[11px] uppercase tracking-[0.22em] text-[#68635f]">Contact</p>
          <h1 className="mt-2 text-4xl font-semibold tracking-[-0.06em] text-[#252525] sm:text-5xl">Let&apos;s Work Together.</h1>
        </div>

        <p className="max-w-lg text-base leading-8 text-[#5d5a57]">
          I&apos;m interested in remote opportunities, customer experience roles, freelance projects, and practical AI automation initiatives. Feel free to reach out to discuss a potential collaboration.
        </p>

        <div className="space-y-3 text-sm text-[#5d5a57]">
          <p>Email: <a href="mailto:noelcollano7@gmail.com" className="font-medium text-[#252525] underline decoration-[#6e7560] underline-offset-4">noelcollano7@gmail.com</a></p>
        </div>
      </section>

      <section className="rounded-[24px] border border-[#cabfb4] bg-[#f3eee8] p-5 sm:p-6">
        <form onSubmit={handleSubmit} noValidate className="space-y-5">
          <div className="hidden" aria-hidden="true">
            <label htmlFor="website">Leave this field empty</label>
            <input
              id="website"
              name="website"
              type="text"
              tabIndex={-1}
              autoComplete="off"
              value={website}
              onChange={(event) => setWebsite(event.target.value)}
            />
          </div>
          <div className="grid gap-5 sm:grid-cols-2">
            <div>
              <label htmlFor="name" className="mb-2 block text-sm font-medium text-[#252525]">Full Name</label>
              <input
                id="name"
                name="name"
                type="text"
                maxLength={120}
                value={form.name}
                onChange={handleChange}
                disabled={isSubmitting}
                aria-invalid={Boolean(errors.name)}
                className="w-full rounded-xl border border-[#cabfb4] bg-[#f9f5f1] px-3 py-2.5 text-[#252525] outline-none transition focus:border-[#6e7560] focus:ring-2 focus:ring-[#d1d8cc]"
              />
              {errors.name && <p className="mt-2 text-sm text-[#8c4335]">{errors.name}</p>}
            </div>

            <div>
              <label htmlFor="email" className="mb-2 block text-sm font-medium text-[#252525]">Email Address</label>
              <input
                id="email"
                name="email"
                type="email"
                maxLength={254}
                value={form.email}
                onChange={handleChange}
                disabled={isSubmitting}
                aria-invalid={Boolean(errors.email)}
                className="w-full rounded-xl border border-[#cabfb4] bg-[#f9f5f1] px-3 py-2.5 text-[#252525] outline-none transition focus:border-[#6e7560] focus:ring-2 focus:ring-[#d1d8cc]"
              />
              {errors.email && <p className="mt-2 text-sm text-[#8c4335]">{errors.email}</p>}
            </div>
          </div>

          <div>
            <label htmlFor="subject" className="mb-2 block text-sm font-medium text-[#252525]">Subject</label>
            <input
              id="subject"
              name="subject"
              type="text"
              maxLength={200}
              value={form.subject}
              onChange={handleChange}
              disabled={isSubmitting}
              aria-invalid={Boolean(errors.subject)}
              className="w-full rounded-xl border border-[#cabfb4] bg-[#f9f5f1] px-3 py-2.5 text-[#252525] outline-none transition focus:border-[#6e7560] focus:ring-2 focus:ring-[#d1d8cc]"
            />
            {errors.subject && <p className="mt-2 text-sm text-[#8c4335]">{errors.subject}</p>}
          </div>

          <div>
            <label htmlFor="message" className="mb-2 block text-sm font-medium text-[#252525]">Message</label>
            <textarea
              id="message"
              name="message"
              value={form.message}
              onChange={handleChange}
              maxLength={5000}
              disabled={isSubmitting}
              rows={6}
              aria-invalid={Boolean(errors.message)}
              className="w-full rounded-xl border border-[#cabfb4] bg-[#f9f5f1] px-3 py-2.5 text-[#252525] outline-none transition focus:border-[#6e7560] focus:ring-2 focus:ring-[#d1d8cc]"
            />
            {errors.message && <p className="mt-2 text-sm text-[#8c4335]">{errors.message}</p>}
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="inline-flex w-full items-center justify-center gap-2 rounded-full bg-[#6e7560] px-5 py-3 text-sm font-medium text-[#f8f5f1] transition-transform disabled:cursor-not-allowed disabled:opacity-75 hover:-translate-y-0.5 hover:bg-[#59654c]"
          >
            {isSubmitting ? 'Sending message...' : 'Send Message'}
            {!isSubmitting && <ArrowRight size={16} />}
          </button>

          {feedback && (
            <div
              aria-live="polite"
              className={`rounded-xl border px-3 py-2 text-sm ${
                feedback.type === 'success'
                  ? 'border-[#afc0a2] bg-[#edf3ea] text-[#3e5a38]'
                  : 'border-[#dbb0a5] bg-[#f8eae7] text-[#7f3d32]'
              }`}
            >
              {feedback.message}
            </div>
          )}
        </form>
      </section>
    </div>
  )
}

export default App
