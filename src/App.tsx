import { type ChangeEvent, type FormEvent, useEffect, useMemo, useRef, useState } from 'react'
import {
  ArrowRight,
  ChevronRight,
  ExternalLink,
  Menu,
  X,
} from 'lucide-react'
import { BrowserRouter, Link, NavLink, Navigate, Route, Routes, useNavigate, useSearchParams } from 'react-router-dom'
import { supabase } from './lib/supabase'
import BackgroundMusicPlayer from './components/BackgroundMusicPlayer'

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

type VideoRecord = {
  id: string
  title: string
  description: string
  youtube_url: string
  is_published: boolean
  published_at: string | null
  created_at: string
  updated_at: string
  owner_id: string
}

const navItems = [
  { label: 'Home', to: '/' },
  { label: 'About', to: '/about' },
  { label: 'Projects', to: '/projects' },
  { label: 'Contact', to: '/contact' },
  { label: 'Watch', to: '/watch' },
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
      <div className="min-h-screen bg-[#edf1f5] text-[#17243b]">
        <BackgroundMusicPlayer />
        <header className="sticky top-0 z-40 border-b border-[#cad4df] bg-[#edf1f5]/95 backdrop-blur-md">
          <nav className="relative mx-auto flex max-w-6xl items-center justify-between px-5 py-4 sm:px-8 lg:px-10">
            <Link to="/" className="text-sm font-semibold tracking-[0.08em] text-[#17243b]">
              NOEL COLLANO
            </Link>
            <div className="hidden items-center gap-8 md:flex">
              {navItems.map((item) => (
                <NavLink
                  key={item.to}
                  to={item.to}
                  end={item.to === '/'}
                  className={({ isActive }) =>
                    `relative text-sm font-medium transition-colors after:absolute after:-bottom-2 after:left-0 after:h-px after:bg-[#17243b] after:transition-all ${
                      isActive ? 'text-[#17243b] after:w-full' : 'text-[#66758a] after:w-0 hover:text-[#17243b] hover:after:w-full'
                    }`
                  }
                >
                  {item.label}
                </NavLink>
              ))}
            </div>

            <div className="hidden md:block">
              <Link
                to="/signin"
                className="inline-flex items-center gap-2 border-b border-[#17243b] pb-1 text-sm font-semibold text-[#17243b]"
              >
                Sign In
                <ArrowRight size={16} />
              </Link>
            </div>

            <button
              type="button"
              onClick={() => setMenuOpen((open) => !open)}
              className="inline-flex h-11 w-11 items-center justify-center rounded-full border border-[#cad4df] text-[#17243b] md:hidden"
              aria-label={menuOpen ? 'Close menu' : 'Open menu'}
              aria-expanded={menuOpen}
            >
              {menuOpen ? <X size={18} /> : <Menu size={18} />}
            </button>
          </nav>

          {menuOpen && (
            <div className="border-t border-[#cad4df] bg-[#edf1f5] px-5 py-5 md:hidden">
              <div className="mx-auto flex max-w-6xl flex-col gap-1">
                {navItems.map((item) => (
                  <NavLink
                    key={item.to}
                    to={item.to}
                    end={item.to === '/'}
                    onClick={() => setMenuOpen(false)}
                    className={({ isActive }) =>
                      `border-b border-[#cad4df] py-3 text-sm font-medium ${
                        isActive ? 'text-[#17243b]' : 'text-[#66758a]'
                      }`
                    }
                  >
                    {item.label}
                  </NavLink>
                ))}
                <Link
                  to="/signin"
                  onClick={() => setMenuOpen(false)}
                  className="mt-4 inline-flex items-center gap-2 py-2 text-sm font-semibold"
                >
                  Sign In
                  <ArrowRight size={16} />
                </Link>
              </div>
            </div>
          )}
        </header>

        <main className="mx-auto max-w-6xl px-5 py-10 sm:px-8 lg:px-10 lg:py-14">
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/about" element={<AboutPage />} />
            <Route path="/projects" element={<ProjectsPage />} />
            <Route path="/contact" element={<ContactPage />} />
            <Route path="/watch" element={<WatchPage />} />
            <Route path="/signin" element={<SignInPage />} />
            <Route path="/reset-password" element={<ResetPasswordPage />} />
            <Route path="/admin" element={<AdminPage />} />
          </Routes>
        </main>

        <footer className="border-t border-[#cad4df]">
          <div className="mx-auto flex max-w-6xl flex-col gap-6 px-5 py-8 sm:px-8 lg:flex-row lg:items-center lg:justify-between lg:px-10">
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.16em]">Noel Collano</p>
              <p className="mt-2 text-sm text-[#66758a]">Customer service · AI full-stack development · Automation</p>
            </div>
            <div className="flex flex-wrap items-center gap-6 text-sm text-[#66758a]">
              {navItems.map((item) => (
                <Link key={item.to} to={item.to} className="transition-colors hover:text-[#17243b]">
                  {item.label}
                </Link>
              ))}
            </div>
          </div>
        </footer>
      </div>
    </>
  )
}

function HomePage() {
  return (
    <>
      <section className="grid min-h-[620px] items-center border-b border-[#cad4df] pb-14">
        <div className="space-y-8">
          <p className="text-xs font-semibold uppercase tracking-[0.26em] text-[#62799a]">
            Virtual Assistant · AI Automation
          </p>
          <h1 className="max-w-2xl text-5xl font-semibold leading-[0.98] tracking-[-0.06em] sm:text-6xl lg:text-7xl">
            Practical support,
            <br />
            smarter systems.
          </h1>
          <p className="max-w-xl text-lg leading-8 text-[#66758a]">
            I help teams serve customers better and reduce repetitive work through dependable support, AI automation, and thoughtful web development.
          </p>
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
            <Link
              to="/projects"
              className="inline-flex items-center justify-center gap-3 bg-[#17243b] px-5 py-3.5 text-sm font-semibold text-white transition-colors hover:bg-[#263b5a]"
            >
              View my work
              <ArrowRight size={16} />
            </Link>
            <Link
              to="/contact"
              className="inline-flex items-center justify-center gap-2 border-b border-[#17243b] px-1 py-2 text-sm font-semibold"
            >
              Start a conversation
            </Link>
          </div>
          <p className="flex items-center gap-3 text-sm text-[#66758a]">
            <span className="h-2 w-2 rounded-full bg-[#62799a]" />
            Based in the Philippines · Open to remote work
          </p>
        </div>

      </section>

      <section className="py-14">
        <div className="grid gap-10 lg:grid-cols-[0.28fr_0.72fr]">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.24em] text-[#62799a]">Core strengths</p>
            <h2 className="mt-3 text-3xl font-semibold tracking-[-0.05em]">How I help</h2>
          </div>
          <div className="divide-y divide-[#cad4df] border-y border-[#cad4df]">
            {heroHighlights.map((highlight, index) => (
              <div key={highlight} className="grid grid-cols-[3.5rem_1fr] items-center py-5">
                <span className="text-sm text-[#62799a]">0{index + 1}</span>
                <p className="text-base font-medium sm:text-lg">{highlight}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="border-t border-[#cad4df] py-14">
        <div className="flex items-end justify-between gap-6">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.24em] text-[#62799a]">Selected work</p>
            <h2 className="mt-3 text-3xl font-semibold tracking-[-0.05em] sm:text-4xl">Recent projects</h2>
          </div>
          <Link to="/projects" className="hidden items-center gap-2 border-b border-[#17243b] pb-1 text-sm font-semibold sm:inline-flex">
            View all
            <ChevronRight size={16} />
          </Link>
        </div>

        <div className="mt-8 divide-y divide-[#cad4df] border-y border-[#cad4df]">
          {projects.map((project, index) => (
            <article key={project.title} className="grid gap-5 py-7 lg:grid-cols-[4rem_0.32fr_0.68fr] lg:items-start">
              <span className="text-sm text-[#62799a]">0{index + 1}</span>
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#62799a]">{project.category}</p>
                <h3 className="mt-2 text-xl font-semibold tracking-[-0.03em]">{project.title}</h3>
              </div>
              <div className="lg:flex lg:items-end lg:justify-between lg:gap-8">
                <p className="max-w-xl text-sm leading-7 text-[#66758a]">{project.overview}</p>
                <Link to="/projects" className="mt-5 inline-flex shrink-0 items-center gap-2 border-b border-[#17243b] pb-1 text-sm font-semibold lg:mt-0">
                  Details
                  <ExternalLink size={14} />
                </Link>
              </div>
            </article>
          ))}
        </div>
      </section>

      <section className="border-t border-[#cad4df] py-14">
        <div className="grid gap-8 lg:grid-cols-[0.65fr_0.35fr] lg:items-end">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.24em] text-[#62799a]">Let&apos;s work together</p>
            <h2 className="mt-3 max-w-2xl text-4xl font-semibold leading-tight tracking-[-0.05em] sm:text-5xl">
              Ready to improve your customer experience or workflow?
            </h2>
          </div>
          <Link
            to="/contact"
            className="inline-flex w-fit items-center gap-3 border-b border-[#17243b] pb-2 text-sm font-semibold"
          >
            Get in touch
            <ArrowRight size={16} />
          </Link>
        </div>
      </section>
    </>
  )
}

function AboutPage() {
  return (
    <div className="space-y-14">
      <section className="grid gap-8 border-b border-[#cad4df] pb-14 lg:grid-cols-[0.95fr_1.05fr]">
        <div className="space-y-6">
          <p className="text-xs font-semibold uppercase tracking-[0.24em] text-[#62799a]">About</p>
          <h1 className="text-5xl font-semibold leading-none tracking-[-0.06em] sm:text-6xl">A little about me</h1>
        </div>

        <div className="space-y-5 text-base leading-8 text-[#66758a]">
          <p>
            I&apos;m a customer service professional from the Philippines with an undergraduate background in Mechanical Engineering. My professional experience includes supporting customers with mobile, internet, and landline services for Comcast and Xfinity.
          </p>
          <p>
            I&apos;m also developing my skills in AI automation and web technologies to help businesses streamline repetitive tasks, improve efficiency, and deliver better customer experiences.
          </p>
        </div>
      </section>

      <section className="grid gap-10 border-b border-[#cad4df] pb-14 lg:grid-cols-2">
        <div>
          <h2 className="text-2xl font-semibold tracking-[-0.05em]">Professional background</h2>
          <ul className="mt-6 divide-y divide-[#cad4df] border-y border-[#cad4df] text-sm leading-7 text-[#66758a]">
            <li className="py-4">Customer service and telecommunications support.</li>
            <li className="py-4">Customer communication and problem-solving.</li>
            <li className="py-4">Mechanical Engineering academic background.</li>
            <li className="py-4">Continued development in AI automation and web technologies.</li>
          </ul>
        </div>

        <div>
          <h2 className="text-2xl font-semibold tracking-[-0.05em]">My approach</h2>
          <p className="mt-6 border-t border-[#cad4df] pt-6 text-sm leading-7 text-[#66758a]">
            I believe the best customer and business experiences come from clear communication, dependable support, and the smart use of practical technology. I bring a calm, solutions-focused mindset to every challenge and continue learning to improve the quality of my work.
          </p>
        </div>
      </section>

      <section className="space-y-5">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.24em] text-[#62799a]">Core skills</p>
          <h2 className="mt-2 text-3xl font-semibold tracking-[-0.05em]">What I bring</h2>
        </div>

        <div className="grid border-y border-[#cad4df] md:grid-cols-3">
          {skillGroups.map((group) => (
            <div key={group.title} className="border-b border-[#cad4df] py-6 md:border-b-0 md:border-r md:px-6 md:first:pl-0 md:last:border-r-0 md:last:pr-0">
              <h3 className="text-lg font-semibold">{group.title}</h3>
              <ul className="mt-4 space-y-3 text-sm text-[#66758a]">
                {group.items.map((skill) => (
                  <li key={skill} className="flex items-center gap-2">
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
    <div className="space-y-10">
      <section className="space-y-5 border-b border-[#cad4df] pb-10">
        <p className="text-xs font-semibold uppercase tracking-[0.24em] text-[#62799a]">Projects</p>
        <h1 className="max-w-3xl text-5xl font-semibold leading-none tracking-[-0.06em] sm:text-6xl">Practical ideas and growing skills</h1>
      </section>

      <div className="flex flex-wrap gap-x-6 gap-y-3 border-b border-[#cad4df] pb-5">
        {filterOptions.map((option) => (
          <button
            key={option}
            type="button"
            onClick={() => setActiveFilter(option)}
            className={`border-b pb-1 text-sm font-medium transition-colors ${
              activeFilter === option
                ? 'border-[#17243b] text-[#17243b]'
                : 'border-transparent text-[#66758a] hover:text-[#17243b]'
            }`}
          >
            {option}
          </button>
        ))}
      </div>

      <section className="divide-y divide-[#cad4df] border-y border-[#cad4df]">
        {filteredProjects.map((project) => (
          <article key={project.title} className="grid gap-6 py-8 lg:grid-cols-[0.34fr_0.66fr]">
            <div>
              <img src={project.image} alt={project.title} className="h-64 w-full object-cover grayscale-[15%]" />
            </div>
            <div className="space-y-5">
              <div className="flex items-center justify-between gap-3">
                <span className="text-xs font-semibold uppercase tracking-[0.18em] text-[#62799a]">
                  {project.category}
                </span>
                <span className="text-xs font-medium text-[#66758a]">{project.status}</span>
              </div>

              <div>
                <h2 className="text-2xl font-semibold tracking-[-0.05em]">{project.title}</h2>
                <p className="mt-3 text-sm leading-7 text-[#66758a]">{project.overview}</p>
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-[#62799a]">Problem</p>
                  <p className="mt-2 text-sm leading-6 text-[#66758a]">{project.problem}</p>
                </div>
                <div>
                  <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-[#62799a]">Solution</p>
                  <p className="mt-2 text-sm leading-6 text-[#66758a]">{project.solution}</p>
                </div>
              </div>

              <div className="flex flex-wrap gap-2">
                {project.technologies.map((tech) => (
                  <span key={tech} className="border-l border-[#62799a] pl-2.5 text-[10px] uppercase tracking-[0.14em] text-[#66758a]">
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

function getYouTubeVideoId(url: string): string | null {
  try {
    const parsed = new URL(url)
    const hostname = parsed.hostname.toLowerCase()
    if (hostname === 'youtu.be') {
      return parsed.pathname.slice(1).split('/')[0] || null
    }
    if (hostname === 'youtube.com' || hostname.endsWith('.youtube.com')) {
      const pathSegments = parsed.pathname.split('/').filter(Boolean)
      if (['embed', 'shorts', 'live'].includes(pathSegments[0])) {
        return pathSegments[1] || null
      }
      return parsed.searchParams.get('v')
    }
  } catch {
    return null
  }
  return null
}

function WatchPage() {
  const [videos, setVideos] = useState<VideoRecord[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    const client = supabase
    if (!client) {
      setError('Videos are temporarily unavailable.')
      setLoading(false)
      return
    }

    const loadVideos = async () => {
      const { data, error: fetchError } = await client
        .from('videos')
        .select('id,title,description,youtube_url,is_published,published_at,created_at,updated_at,owner_id')
        .eq('is_published', true)
        .order('published_at', { ascending: false })

      if (fetchError) {
        setError('Videos are temporarily unavailable.')
      } else {
        setVideos((data as VideoRecord[]) || [])
      }
      setLoading(false)
    }

    loadVideos()

    const channel = client
      .channel('published-videos')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'videos', filter: 'is_published=eq.true' },
        loadVideos,
      )
      .subscribe()

    return () => {
      client.removeChannel(channel)
    }
  }, [])

  return (
    <div className="space-y-10">
      <section className="space-y-5 border-b border-[#cad4df] pb-10">
        <p className="text-xs font-semibold uppercase tracking-[0.24em] text-[#62799a]">Watch</p>
        <h1 className="max-w-3xl text-5xl font-semibold leading-none tracking-[-0.06em] sm:text-6xl">Videos</h1>
      </section>

      {loading && <p className="text-sm text-[#66758a]">Loading videos...</p>}
      {!loading && error && <p className="border-t border-[#cad4df] py-8 text-sm text-[#66758a]">{error}</p>}
      {!loading && !error && videos.length === 0 && (
        <p className="border-y border-[#cad4df] py-12 text-center text-sm text-[#66758a]">
          No videos are available yet. Please check back soon.
        </p>
      )}

      {!loading && !error && videos.length > 0 && (
        <section className="grid gap-8 md:grid-cols-2">
          {videos.map((video) => {
            const videoId = getYouTubeVideoId(video.youtube_url)
            if (!videoId) return null

            return (
              <article key={video.id} className="border-b border-[#cad4df] pb-8">
                <div className="aspect-video overflow-hidden bg-[#dbe3ec]">
                  <iframe
                    src={`https://www.youtube-nocookie.com/embed/${videoId}`}
                    title={video.title}
                    className="h-full w-full"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                    referrerPolicy="strict-origin-when-cross-origin"
                    allowFullScreen
                    loading="lazy"
                  />
                </div>
                <h2 className="mt-5 text-xl font-semibold tracking-[-0.03em]">{video.title}</h2>
                {video.description && (
                  <p className="mt-3 text-sm leading-7 text-[#66758a]">{video.description}</p>
                )}
              </article>
            )
          })}
        </section>
      )}
    </div>
  )
}

function SignInPage() {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const recoveryMode = searchParams.get('mode') === 'recovery'
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [recoverySent, setRecoverySent] = useState(false)

  useEffect(() => {
    if (!supabase) return
    supabase.auth.getSession().then(({ data }) => {
      if (data.session) navigate('/admin', { replace: true })
    })
  }, [navigate])

  const handleSignIn = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setError('')
    if (!supabase) {
      setError('Sign in is not configured yet.')
      return
    }
    setSubmitting(true)
    const { error: signInError } = await supabase.auth.signInWithPassword({ email, password })
    setSubmitting(false)
    if (signInError) {
      setError(signInError.message)
      return
    }
    navigate('/admin', { replace: true })
  }

  const handleRecoveryRequest = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setError('')
    setRecoverySent(false)
    if (!supabase) {
      setError('Password recovery is not configured yet.')
      return
    }

    setSubmitting(true)
    try {
      const { error: recoveryError } = await supabase.auth.resetPasswordForEmail(email.trim(), {
        redirectTo: new URL('/reset-password', window.location.origin).toString(),
      })
      if (recoveryError) {
        setError(recoveryError.message)
        return
      }
      setRecoverySent(true)
    } catch (recoveryError) {
      setError(recoveryError instanceof Error ? recoveryError.message : 'Unable to send a password recovery email.')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="mx-auto max-w-md border-y border-[#cad4df] py-10">
      <p className="text-xs font-semibold uppercase tracking-[0.24em] text-[#62799a]">Admin</p>
      <h1 className="mt-3 text-4xl font-semibold tracking-[-0.05em]">
        {recoveryMode ? 'Reset your password' : 'Sign in'}
      </h1>
      {recoverySent && (
        <p role="status" className="mt-5 text-sm text-[#385d48]">
          If an account exists for that email, a password recovery link has been sent.
        </p>
      )}
      <form onSubmit={recoveryMode ? handleRecoveryRequest : handleSignIn} className="mt-8 space-y-6">
        <div>
          <label htmlFor="signin-email" className="mb-2 block text-sm font-medium">Email</label>
          <input
            id="signin-email"
            type="email"
            required
            autoComplete="email"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            className="w-full border-b border-[#cad4df] bg-transparent px-0 py-3 outline-none focus:border-[#17243b]"
          />
        </div>
        {!recoveryMode && (
          <div>
            <label htmlFor="signin-password" className="mb-2 block text-sm font-medium">Password</label>
            <input
              id="signin-password"
              type="password"
              required
              autoComplete="current-password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              className="w-full border-b border-[#cad4df] bg-transparent px-0 py-3 outline-none focus:border-[#17243b]"
            />
          </div>
        )}
        {error && <p role="alert" className="text-sm text-[#8c4335]">{error}</p>}
        <button
          type="submit"
          disabled={submitting}
          className="inline-flex w-full items-center justify-center bg-[#17243b] px-5 py-3.5 text-sm font-semibold text-white hover:bg-[#263b5a] disabled:opacity-75"
        >
          {submitting
            ? recoveryMode ? 'Sending link...' : 'Signing in...'
            : recoveryMode ? 'Send recovery link' : 'Sign In'}
        </button>
      </form>
      <div className="mt-5 text-sm">
        {recoveryMode ? (
          <Link to="/signin" className="font-medium text-[#17243b] underline underline-offset-4">
            Back to sign in
          </Link>
        ) : (
          <Link to="/signin?mode=recovery" className="font-medium text-[#17243b] underline underline-offset-4">
            Forgot Password?
          </Link>
        )}
      </div>
    </div>
  )
}

function ResetPasswordPage() {
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)
  const [hasSession, setHasSession] = useState(false)
  const [sessionChecked, setSessionChecked] = useState(false)
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    if (!supabase) return
    let active = true

    supabase.auth.getSession()
      .then(({ data, error: sessionError }) => {
        if (!active) return
        if (sessionError) setError(sessionError.message)
        else setHasSession(Boolean(data.session))
      })
      .catch((sessionError: unknown) => {
        if (!active) return
        setError(sessionError instanceof Error ? sessionError.message : 'Unable to verify the recovery session.')
      })
      .finally(() => {
        if (active) setSessionChecked(true)
      })

    return () => {
      active = false
    }
  }, [])

  const handlePasswordUpdate = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setError('')
    setSuccess(false)
    if (password !== confirmPassword) {
      setError('The passwords do not match.')
      return
    }
    if (!supabase) {
      setError('Password recovery is not configured yet.')
      return
    }

    setSubmitting(true)
    try {
      const { error: updateError } = await supabase.auth.updateUser({ password })
      if (updateError) {
        setError(updateError.message)
        return
      }
      setSuccess(true)
    } catch (updateError) {
      setError(updateError instanceof Error ? updateError.message : 'Unable to update the password.')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="mx-auto max-w-md border-y border-[#cad4df] py-10">
      <p className="text-xs font-semibold uppercase tracking-[0.24em] text-[#62799a]">Admin</p>
      <h1 className="mt-3 text-4xl font-semibold tracking-[-0.05em]">Choose a new password</h1>
      {!supabase ? (
        <p role="alert" className="mt-6 text-sm text-[#8c4335]">Password recovery is not configured yet.</p>
      ) : !sessionChecked ? (
        <p className="mt-6 text-sm text-[#66758a]">Verifying your recovery link...</p>
      ) : !hasSession ? (
        <div className="mt-6 space-y-4">
          <p role="alert" className="text-sm text-[#8c4335]">
            {error || 'This password recovery link is invalid or expired. Request a new link to continue.'}
          </p>
          <Link
            to="/signin?mode=recovery"
            className="inline-flex text-sm font-medium text-[#17243b] underline underline-offset-4"
          >
            Request a new recovery link
          </Link>
        </div>
      ) : (
        <>
          {error && <p role="alert" className="mt-6 text-sm text-[#8c4335]">{error}</p>}
          {success ? (
            <div className="mt-6 space-y-4">
              <p role="status" className="text-sm text-[#385d48]">Your password has been updated successfully.</p>
              <Link to="/admin" className="inline-flex text-sm font-medium text-[#17243b] underline underline-offset-4">
                Continue to admin
              </Link>
            </div>
          ) : (
            <form onSubmit={handlePasswordUpdate} className="mt-8 space-y-6">
              <div>
                <label htmlFor="new-password" className="mb-2 block text-sm font-medium">New password</label>
                <input
                  id="new-password"
                  type="password"
                  required
                  minLength={6}
                  autoComplete="new-password"
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                  className="w-full border-b border-[#cad4df] bg-transparent px-0 py-3 outline-none focus:border-[#17243b]"
                />
              </div>
              <div>
                <label htmlFor="confirm-password" className="mb-2 block text-sm font-medium">Confirm new password</label>
                <input
                  id="confirm-password"
                  type="password"
                  required
                  minLength={6}
                  autoComplete="new-password"
                  value={confirmPassword}
                  onChange={(event) => setConfirmPassword(event.target.value)}
                  className="w-full border-b border-[#cad4df] bg-transparent px-0 py-3 outline-none focus:border-[#17243b]"
                />
              </div>
              <button
                type="submit"
                disabled={submitting}
                className="inline-flex w-full items-center justify-center bg-[#17243b] px-5 py-3.5 text-sm font-semibold text-white hover:bg-[#263b5a] disabled:opacity-75"
              >
                {submitting ? 'Updating password...' : 'Update password'}
              </button>
            </form>
          )}
        </>
      )}
    </div>
  )
}

function AdminPage() {
  const navigate = useNavigate()
  const [sessionChecked, setSessionChecked] = useState(false)
  const [authenticated, setAuthenticated] = useState(false)
  const [videos, setVideos] = useState<VideoRecord[]>([])
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [youtubeUrl, setYoutubeUrl] = useState('')
  const [isPublished, setIsPublished] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [message, setMessage] = useState('')

  useEffect(() => {
    if (!supabase) {
      setSessionChecked(true)
      return
    }

    supabase.auth.getSession().then(({ data }) => {
      setAuthenticated(Boolean(data.session))
      setSessionChecked(true)
    })

    const { data } = supabase.auth.onAuthStateChange((_event, session) => {
      setAuthenticated(Boolean(session))
      setSessionChecked(true)
    })
    return () => data.subscription.unsubscribe()
  }, [])

  useEffect(() => {
    if (!authenticated || !supabase) return

    supabase
      .from('videos')
      .select('id,title,description,youtube_url,is_published,published_at,created_at,updated_at,owner_id')
      .order('created_at', { ascending: false })
      .then(({ data, error }) => {
        if (!error) setVideos((data as VideoRecord[]) || [])
      })
  }, [authenticated])

  if (!sessionChecked) return <p className="text-sm text-[#66758a]">Loading...</p>
  if (!authenticated) return <Navigate to="/signin" replace />

  const resetForm = () => {
    setTitle('')
    setDescription('')
    setYoutubeUrl('')
    setIsPublished(false)
    setEditingId(null)
  }

  const reloadVideos = async () => {
    if (!supabase) return
    const { data, error } = await supabase
      .from('videos')
      .select('id,title,description,youtube_url,is_published,published_at,created_at,updated_at,owner_id')
      .order('created_at', { ascending: false })
    if (!error) setVideos((data as VideoRecord[]) || [])
  }

  const saveVideo = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setMessage('')
    if (!supabase) return
    if (!getYouTubeVideoId(youtubeUrl)) {
      setMessage('Please enter a valid YouTube URL.')
      return
    }

    const { data: { session } } = await supabase.auth.getSession()
    if (!session) return

    const payload = {
      title: title.trim(),
      description: description.trim(),
      youtube_url: youtubeUrl.trim(),
      is_published: isPublished,
      published_at: isPublished ? new Date().toISOString() : null,
      owner_id: session.user.id,
    }

    const response = editingId
      ? await supabase.from('videos').update(payload).eq('id', editingId)
      : await supabase.from('videos').insert(payload)

    if (response.error) {
      setMessage(`Unable to save the video: ${response.error.message}`)
    } else {
      setMessage(editingId ? 'Video updated.' : 'Video added.')
      resetForm()
      await reloadVideos()
    }
  }

  const editVideo = (video: VideoRecord) => {
    setEditingId(video.id)
    setTitle(video.title)
    setDescription(video.description)
    setYoutubeUrl(video.youtube_url)
    setIsPublished(video.is_published)
  }

  const deleteVideo = async (video: VideoRecord) => {
    if (!supabase || !window.confirm(`Delete "${video.title}"?`)) return
    const { error } = await supabase.from('videos').delete().eq('id', video.id)
    if (error) {
      setMessage('Unable to delete the video.')
    } else {
      await reloadVideos()
    }
  }

  const signOut = async () => {
    if (!supabase) return
    await supabase.auth.signOut()
    navigate('/signin', { replace: true })
  }

  return (
    <div className="space-y-10">
      <section className="flex items-end justify-between gap-6 border-b border-[#cad4df] pb-8">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.24em] text-[#62799a]">Private Dashboard</p>
          <h1 className="mt-3 text-4xl font-semibold tracking-[-0.05em]">Manage videos</h1>
        </div>
        <button type="button" onClick={signOut} className="border-b border-[#17243b] pb-1 text-sm font-semibold">
          Sign Out
        </button>
      </section>

      <form onSubmit={saveVideo} className="grid gap-5 border-b border-[#cad4df] pb-10 sm:grid-cols-2">
        <div>
          <label htmlFor="video-title" className="mb-2 block text-sm font-medium">Title</label>
          <input id="video-title" required maxLength={200} value={title} onChange={(event) => setTitle(event.target.value)} className="w-full border-b border-[#cad4df] bg-transparent px-0 py-3 outline-none focus:border-[#17243b]" />
        </div>
        <div>
          <label htmlFor="video-url" className="mb-2 block text-sm font-medium">YouTube URL</label>
          <input id="video-url" required type="url" value={youtubeUrl} onChange={(event) => setYoutubeUrl(event.target.value)} className="w-full border-b border-[#cad4df] bg-transparent px-0 py-3 outline-none focus:border-[#17243b]" />
        </div>
        <div className="sm:col-span-2">
          <label htmlFor="video-description" className="mb-2 block text-sm font-medium">Description</label>
          <textarea id="video-description" maxLength={5000} rows={4} value={description} onChange={(event) => setDescription(event.target.value)} className="w-full resize-y border-b border-[#cad4df] bg-transparent px-0 py-3 outline-none focus:border-[#17243b]" />
        </div>
        <label className="flex items-center gap-3 text-sm font-medium">
          <input type="checkbox" checked={isPublished} onChange={(event) => setIsPublished(event.target.checked)} />
          Published
        </label>
        <div className="flex items-end gap-4">
          <button type="submit" className="bg-[#17243b] px-5 py-3 text-sm font-semibold text-white hover:bg-[#263b5a]">
            {editingId ? 'Update Video' : 'Add Video'}
          </button>
          {editingId && (
            <button type="button" onClick={resetForm} className="border-b border-[#17243b] pb-1 text-sm font-semibold">Cancel</button>
          )}
        </div>
        {message && <p role="status" className="sm:col-span-2 text-sm text-[#66758a]">{message}</p>}
      </form>

      <section className="divide-y divide-[#cad4df] border-y border-[#cad4df]">
        {videos.map((video) => (
          <article key={video.id} className="grid gap-4 py-5 sm:grid-cols-[1fr_auto] sm:items-center">
            <div>
              <h2 className="text-lg font-semibold">{video.title}</h2>
              <p className="mt-1 text-sm text-[#66758a]">{video.is_published ? 'Published' : 'Draft'}</p>
            </div>
            <div className="flex gap-5 text-sm font-semibold">
              <button type="button" onClick={() => editVideo(video)} className="border-b border-[#17243b] pb-1">Edit</button>
              <button type="button" onClick={() => deleteVideo(video)} className="border-b border-[#8c4335] pb-1 text-[#8c4335]">Delete</button>
            </div>
          </article>
        ))}
        {videos.length === 0 && <p className="py-8 text-sm text-[#66758a]">No videos have been added yet.</p>}
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
    <div className="grid gap-12 border-t border-[#cad4df] pt-10 lg:grid-cols-[0.9fr_1.1fr]">
      <section className="space-y-6">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.24em] text-[#62799a]">Contact</p>
          <h1 className="mt-3 text-5xl font-semibold leading-none tracking-[-0.06em] sm:text-6xl">Let&apos;s work together.</h1>
        </div>

        <p className="max-w-lg text-base leading-8 text-[#66758a]">
          I&apos;m interested in remote opportunities, customer experience roles, freelance projects, and practical AI automation initiatives. Feel free to reach out to discuss a potential collaboration.
        </p>

        <div className="border-t border-[#cad4df] pt-5 text-sm text-[#66758a]">
          <p>Email: <a href="mailto:noelcollano7@gmail.com" className="font-semibold text-[#17243b] underline underline-offset-4">noelcollano7@gmail.com</a></p>
        </div>
      </section>

      <section className="border-t border-[#cad4df] pt-6">
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
              <label htmlFor="name" className="mb-2 block text-sm font-medium text-[#17243b]">Full Name</label>
              <input
                id="name"
                name="name"
                type="text"
                maxLength={120}
                value={form.name}
                onChange={handleChange}
                disabled={isSubmitting}
                aria-invalid={Boolean(errors.name)}
                className="w-full border-b border-[#cad4df] bg-transparent px-0 py-3 text-[#17243b] outline-none transition focus:border-[#17243b]"
              />
              {errors.name && <p className="mt-2 text-sm text-[#8c4335]">{errors.name}</p>}
            </div>

            <div>
              <label htmlFor="email" className="mb-2 block text-sm font-medium text-[#17243b]">Email Address</label>
              <input
                id="email"
                name="email"
                type="email"
                maxLength={254}
                value={form.email}
                onChange={handleChange}
                disabled={isSubmitting}
                aria-invalid={Boolean(errors.email)}
                className="w-full border-b border-[#cad4df] bg-transparent px-0 py-3 text-[#17243b] outline-none transition focus:border-[#17243b]"
              />
              {errors.email && <p className="mt-2 text-sm text-[#8c4335]">{errors.email}</p>}
            </div>
          </div>

          <div>
            <label htmlFor="subject" className="mb-2 block text-sm font-medium text-[#17243b]">Subject</label>
            <input
              id="subject"
              name="subject"
              type="text"
              maxLength={200}
              value={form.subject}
              onChange={handleChange}
              disabled={isSubmitting}
              aria-invalid={Boolean(errors.subject)}
              className="w-full border-b border-[#cad4df] bg-transparent px-0 py-3 text-[#17243b] outline-none transition focus:border-[#17243b]"
            />
            {errors.subject && <p className="mt-2 text-sm text-[#8c4335]">{errors.subject}</p>}
          </div>

          <div>
            <label htmlFor="message" className="mb-2 block text-sm font-medium text-[#17243b]">Message</label>
            <textarea
              id="message"
              name="message"
              value={form.message}
              onChange={handleChange}
              maxLength={5000}
              disabled={isSubmitting}
              rows={6}
              aria-invalid={Boolean(errors.message)}
              className="w-full resize-y border-b border-[#cad4df] bg-transparent px-0 py-3 text-[#17243b] outline-none transition focus:border-[#17243b]"
            />
            {errors.message && <p className="mt-2 text-sm text-[#8c4335]">{errors.message}</p>}
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="inline-flex w-full items-center justify-center gap-2 bg-[#17243b] px-5 py-3.5 text-sm font-semibold text-white transition-colors disabled:cursor-not-allowed disabled:opacity-75 hover:bg-[#263b5a]"
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
