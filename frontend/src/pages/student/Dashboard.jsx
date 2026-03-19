import { useState, useEffect, useRef } from 'react'
import { useAuth } from '../../context/AuthContext'
import Sidebar from '../../components/Sidebar'
import Navbar from '../../components/Navbar'
import StatsCard from '../../components/StatsCard'
import DataTable from '../../components/DataTable'
import { HiOutlineClipboardCheck, HiOutlineDocumentText, HiOutlineChartBar,
  HiOutlineBriefcase, HiOutlineCalendar, HiOutlineBell, HiOutlineChatAlt2,
  HiOutlinePaperAirplane } from 'react-icons/hi'
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts'

const TABS = ['overview', 'timetable', 'attendance', 'assignments', 'marks', 'jobs', 'chat', 'notifications']
const TAB_LABELS = {
  overview: 'Overview', timetable: 'Timetable', attendance: 'Attendance',
  assignments: 'Assignments', marks: 'Marks & Results', jobs: 'Job Opportunities',
  chat: 'AI Assistant', notifications: 'Notifications'
}

// Demo data for when backend isn't connected
const DEMO_STATS = { attendance: 87, assignments: 5, marks: 78.5, jobs: 12 }
const DEMO_TIMETABLE = [
  { day: 'Monday', slots: [
    { course: 'Data Structures', code: 'CS201', time: '9:00 - 10:00', room: 'LH-201' },
    { course: 'Operating Systems', code: 'CS301', time: '11:00 - 12:00', room: 'LH-105' },
  ]},
  { day: 'Tuesday', slots: [
    { course: 'Database Systems', code: 'CS202', time: '10:00 - 11:00', room: 'Lab-3' },
    { course: 'Computer Networks', code: 'CS302', time: '2:00 - 3:00', room: 'LH-201' },
  ]},
  { day: 'Wednesday', slots: [
    { course: 'Data Structures Lab', code: 'CS201L', time: '9:00 - 11:00', room: 'Lab-1' },
    { course: 'Mathematics III', code: 'MA201', time: '12:00 - 1:00', room: 'LH-301' },
  ]},
  { day: 'Thursday', slots: [
    { course: 'Operating Systems', code: 'CS301', time: '9:00 - 10:00', room: 'LH-105' },
    { course: 'Database Systems', code: 'CS202', time: '11:00 - 12:00', room: 'Lab-3' },
  ]},
  { day: 'Friday', slots: [
    { course: 'Computer Networks', code: 'CS302', time: '10:00 - 11:00', room: 'LH-201' },
    { course: 'Mathematics III', code: 'MA201', time: '2:00 - 3:00', room: 'LH-301' },
  ]},
]
const DEMO_ATTENDANCE = [
  { id: 1, course: 'Data Structures', code: 'CS201', present: 28, total: 32, pct: 87.5 },
  { id: 2, course: 'Operating Systems', code: 'CS301', present: 25, total: 30, pct: 83.3 },
  { id: 3, course: 'Database Systems', code: 'CS202', present: 30, total: 32, pct: 93.8 },
  { id: 4, course: 'Computer Networks', code: 'CS302', present: 22, total: 28, pct: 78.6 },
  { id: 5, course: 'Mathematics III', code: 'MA201', present: 27, total: 30, pct: 90.0 },
]
const DEMO_ASSIGNMENTS = [
  { id: 1, title: 'Binary Tree Implementation', course: 'Data Structures', due: '2026-03-25', status: 'pending', max_marks: 100 },
  { id: 2, title: 'Process Scheduling Simulator', course: 'Operating Systems', due: '2026-03-22', status: 'submitted', max_marks: 50 },
  { id: 3, title: 'ER Diagram Design', course: 'Database Systems', due: '2026-03-20', status: 'graded', max_marks: 30, grade: 27 },
  { id: 4, title: 'TCP/IP Socket Programming', course: 'Computer Networks', due: '2026-03-28', status: 'pending', max_marks: 100 },
  { id: 5, title: 'Fourier Transform Problems', course: 'Mathematics III', due: '2026-03-30', status: 'pending', max_marks: 50 },
]
const DEMO_MARKS = [
  { id: 1, course: 'Data Structures', exam: 'Midterm', obtained: 42, max: 50 },
  { id: 2, course: 'Operating Systems', exam: 'Quiz 1', obtained: 8, max: 10 },
  { id: 3, course: 'Database Systems', exam: 'Midterm', obtained: 38, max: 50 },
  { id: 4, course: 'Computer Networks', exam: 'Quiz 1', obtained: 7, max: 10 },
  { id: 5, course: 'Mathematics III', exam: 'Midterm', obtained: 35, max: 50 },
]
const DEMO_JOBS = [
  { id: 1, title: 'Software Engineer Intern', company: 'Google', type: 'internship', location: 'Bangalore', salary: '₹80,000/month', deadline: '2026-04-15', skills: 'Python, DSA, ML' },
  { id: 2, title: 'Full Stack Developer', company: 'Microsoft', type: 'job', location: 'Hyderabad', salary: '₹18 LPA', deadline: '2026-04-10', skills: 'React, Node.js, SQL' },
  { id: 3, title: 'Data Analyst Intern', company: 'Amazon', type: 'internship', location: 'Remote', salary: '₹60,000/month', deadline: '2026-04-20', skills: 'SQL, Python, Excel' },
  { id: 4, title: 'Backend Developer', company: 'Flipkart', type: 'job', location: 'Bangalore', salary: '₹15 LPA', deadline: '2026-04-12', skills: 'Java, Spring Boot' },
]
const DEMO_NOTIFICATIONS = [
  { id: 1, title: 'Mid-Semester Exams', message: 'Mid-semester examinations will begin from April 5th. Check your hall tickets.', created_at: '2026-03-18T10:00:00' },
  { id: 2, title: 'Hackathon Registration', message: 'Register for the 48-hour national hackathon by March 25th.', created_at: '2026-03-17T14:30:00' },
  { id: 3, title: 'Library Notice', message: 'Return all borrowed books before the semester end to avoid fines.', created_at: '2026-03-15T09:00:00' },
]

export default function StudentDashboard() {
  const { profile, apiFetch } = useAuth()
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [activeTab, setActiveTab] = useState('overview')
  const [chatMessages, setChatMessages] = useState([
    { role: 'bot', text: `Hello ${profile?.name || 'there'}! 👋 I'm your CampusConnect AI assistant. Ask me about your attendance, assignments, marks, or placements!`,
      suggestions: ['Show my attendance', 'Upcoming deadlines', 'Available jobs', 'My marks'] }
  ])
  const [chatInput, setChatInput] = useState('')
  const [chatLoading, setChatLoading] = useState(false)
  const chatEndRef = useRef(null)

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [chatMessages])

  // Derive active tab from URL hash or state
  useEffect(() => {
    const path = window.location.pathname.split('/').pop()
    if (TABS.includes(path)) setActiveTab(path)
  }, [])

  const navigateTab = (tab) => {
    setActiveTab(tab)
    window.history.pushState(null, '', `/student${tab === 'overview' ? '' : '/' + tab}`)
  }

  const sendChatMessage = async (text) => {
    if (!text.trim()) return
    const userMsg = { role: 'user', text }
    setChatMessages(prev => [...prev, userMsg])
    setChatInput('')
    setChatLoading(true)

    try {
      const data = await apiFetch('/chatbot/message', {
        method: 'POST',
        body: JSON.stringify({ message: text })
      })
      setChatMessages(prev => [...prev, { role: 'bot', text: data.reply, suggestions: data.suggestions }])
    } catch {
      // Fallback for demo mode
      const fallback = getFallbackResponse(text)
      setChatMessages(prev => [...prev, { role: 'bot', text: fallback.reply, suggestions: fallback.suggestions }])
    }
    setChatLoading(false)
  }

  const getFallbackResponse = (msg) => {
    const m = msg.toLowerCase()
    if (m.includes('attendance'))
      return { reply: '📊 Your overall attendance is **87%** across all courses. Data Structures: 87.5%, OS: 83.3%, DBMS: 93.8%. Keep it up!', suggestions: ['My marks', 'Upcoming deadlines'] }
    if (m.includes('deadline') || m.includes('assignment'))
      return { reply: '📝 **Upcoming Deadlines:**\n• Binary Tree Implementation (DS) — Due: Mar 25\n• TCP/IP Socket Programming (CN) — Due: Mar 28\n• Fourier Transform Problems (Math) — Due: Mar 30', suggestions: ['My attendance', 'Available jobs'] }
    if (m.includes('mark') || m.includes('result'))
      return { reply: '📈 **Recent Results:**\n• Data Structures (Midterm): 42/50 (84%)\n• OS (Quiz 1): 8/10 (80%)\n• DBMS (Midterm): 38/50 (76%)', suggestions: ['My attendance', 'Available jobs'] }
    if (m.includes('job') || m.includes('placement') || m.includes('intern'))
      return { reply: '💼 **Active Opportunities:**\n• SWE Intern at Google — ₹80K/month\n• Full Stack Dev at Microsoft — ₹18 LPA\n• Data Analyst Intern at Amazon — Remote', suggestions: ['My marks', 'My attendance'] }
    return { reply: "I can help with attendance, assignments, marks, and placements. What would you like to know?", suggestions: ['Show my attendance', 'Upcoming deadlines', 'Available jobs', 'My marks'] }
  }

  const attendancePieData = DEMO_ATTENDANCE.map(a => ({ name: a.code, value: a.pct }))
  const PIE_COLORS = ['#6366f1', '#8b5cf6', '#22c55e', '#f59e0b', '#3b82f6']

  return (
    <div className="app-layout">
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      <div className="main-content">
        <Navbar title={TAB_LABELS[activeTab]} onMenuClick={() => setSidebarOpen(!sidebarOpen)} />

        <div className="fade-in">
          {/* Tab navigation */}
          <div className="tabs">
            {TABS.map(tab => (
              <button key={tab} className={`tab ${activeTab === tab ? 'active' : ''}`} onClick={() => navigateTab(tab)}>
                {TAB_LABELS[tab]}
              </button>
            ))}
          </div>

          {/* ═══ Overview ═══ */}
          {activeTab === 'overview' && (
            <div className="slide-up">
              <div className="page-header">
                <h1>Welcome back, {profile?.name || 'Student'} 👋</h1>
                <p>Here's your academic overview for this semester</p>
              </div>

              <div className="stats-grid">
                <StatsCard icon={HiOutlineClipboardCheck} label="Attendance Rate" value={`${DEMO_STATS.attendance}%`} color="green" change={2.5} />
                <StatsCard icon={HiOutlineDocumentText} label="Pending Assignments" value={DEMO_STATS.assignments} color="orange" />
                <StatsCard icon={HiOutlineChartBar} label="Average Score" value={`${DEMO_STATS.marks}%`} color="purple" change={5.2} />
                <StatsCard icon={HiOutlineBriefcase} label="Active Opportunities" value={DEMO_STATS.jobs} color="blue" />
              </div>

              <div className="grid-2">
                <div className="chart-card">
                  <h3>Attendance by Course</h3>
                  <ResponsiveContainer width="100%" height={250}>
                    <PieChart>
                      <Pie data={attendancePieData} cx="50%" cy="50%" innerRadius={60} outerRadius={95} paddingAngle={3} dataKey="value">
                        {attendancePieData.map((_, i) => <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />)}
                      </Pie>
                      <Tooltip formatter={v => `${v}%`} contentStyle={{ background: '#1a1a2e', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 8 }} />
                    </PieChart>
                  </ResponsiveContainer>
                  <div className="flex gap-3" style={{ flexWrap: 'wrap', justifyContent: 'center', marginTop: 8 }}>
                    {DEMO_ATTENDANCE.map((a, i) => (
                      <div key={a.id} className="flex items-center gap-2" style={{ fontSize: 12, color: 'var(--text-secondary)' }}>
                        <div style={{ width: 10, height: 10, borderRadius: '50%', background: PIE_COLORS[i] }}></div>
                        {a.code}: {a.pct}%
                      </div>
                    ))}
                  </div>
                </div>

                <div className="table-container">
                  <div className="table-header">
                    <h2>Upcoming Deadlines</h2>
                  </div>
                  <DataTable
                    columns={[
                      { key: 'title', label: 'Assignment' },
                      { key: 'course', label: 'Course' },
                      { key: 'due', label: 'Due Date' },
                      { key: 'status', label: 'Status', render: (v) => <span className={`badge ${v}`}>{v}</span> },
                    ]}
                    data={DEMO_ASSIGNMENTS.filter(a => a.status === 'pending')}
                  />
                </div>
              </div>

              <div className="table-container mt-4">
                <div className="table-header">
                  <h2>Recent Notifications</h2>
                </div>
                <DataTable
                  columns={[
                    { key: 'title', label: 'Title', render: (v) => <strong>{v}</strong> },
                    { key: 'message', label: 'Message' },
                    { key: 'created_at', label: 'Date', render: (v) => new Date(v).toLocaleDateString() },
                  ]}
                  data={DEMO_NOTIFICATIONS}
                />
              </div>
            </div>
          )}

          {/* ═══ Timetable ═══ */}
          {activeTab === 'timetable' && (
            <div className="slide-up">
              <div className="page-header">
                <h1>Weekly Timetable</h1>
                <p>Your class schedule for this semester</p>
              </div>
              <div className="grid-1" style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                {DEMO_TIMETABLE.map(day => (
                  <div key={day.day} className="card">
                    <h3 style={{ color: 'var(--primary-400)', marginBottom: 16, fontSize: 16, fontWeight: 700 }}>
                      <HiOutlineCalendar style={{ verticalAlign: -2, marginRight: 8 }} />{day.day}
                    </h3>
                    <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
                      {day.slots.map((slot, i) => (
                        <div key={i} style={{ flex: '1 1 200px', background: 'rgba(99,102,241,0.07)', borderRadius: 'var(--radius-sm)', padding: '14px 18px', border: '1px solid var(--border-color)' }}>
                          <div style={{ fontWeight: 600, color: 'var(--text-primary)', marginBottom: 4 }}>{slot.course}</div>
                          <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>{slot.code} • {slot.time}</div>
                          <div style={{ fontSize: 12, color: 'var(--primary-400)', marginTop: 4 }}>📍 {slot.room}</div>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ═══ Attendance ═══ */}
          {activeTab === 'attendance' && (
            <div className="slide-up">
              <div className="page-header">
                <h1>Attendance Record</h1>
                <p>Your attendance across all courses this semester</p>
              </div>
              <div className="table-container">
                <DataTable
                  columns={[
                    { key: 'course', label: 'Course', render: (v, row) => <><strong>{v}</strong> <span style={{color:'var(--text-muted)', fontSize:12}}>({row.code})</span></> },
                    { key: 'present', label: 'Present' },
                    { key: 'total', label: 'Total Classes' },
                    { key: 'pct', label: 'Percentage', render: (v) => {
                      const color = v >= 85 ? 'var(--success)' : v >= 75 ? 'var(--warning)' : 'var(--danger)'
                      return (
                        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                          <div style={{ flex: 1, maxWidth: 120, height: 6, background: 'rgba(255,255,255,0.1)', borderRadius: 3 }}>
                            <div style={{ width: `${v}%`, height: '100%', background: color, borderRadius: 3, transition: 'width 0.6s ease' }}></div>
                          </div>
                          <span style={{ color, fontWeight: 600 }}>{v}%</span>
                        </div>
                      )
                    }},
                  ]}
                  data={DEMO_ATTENDANCE}
                />
              </div>
            </div>
          )}

          {/* ═══ Assignments ═══ */}
          {activeTab === 'assignments' && (
            <div className="slide-up">
              <div className="page-header">
                <h1>Assignments</h1>
                <p>Track and submit your coursework</p>
              </div>
              <div className="table-container">
                <DataTable
                  columns={[
                    { key: 'title', label: 'Assignment', render: (v) => <strong>{v}</strong> },
                    { key: 'course', label: 'Course' },
                    { key: 'due', label: 'Due Date' },
                    { key: 'max_marks', label: 'Max Marks' },
                    { key: 'status', label: 'Status', render: (v, row) => (
                      <span className={`badge ${v === 'graded' ? 'success' : v === 'submitted' ? 'info' : 'warning'}`}>
                        {v === 'graded' ? `Graded: ${row.grade}/${row.max_marks}` : v}
                      </span>
                    )},
                    { key: 'id', label: 'Action', render: (_, row) => row.status === 'pending' ? (
                      <button className="btn btn-primary btn-sm">Submit</button>
                    ) : null },
                  ]}
                  data={DEMO_ASSIGNMENTS}
                />
              </div>
            </div>
          )}

          {/* ═══ Marks ═══ */}
          {activeTab === 'marks' && (
            <div className="slide-up">
              <div className="page-header">
                <h1>Marks & Results</h1>
                <p>Your examination scores and performance</p>
              </div>
              <div className="table-container">
                <DataTable
                  columns={[
                    { key: 'course', label: 'Course', render: (v) => <strong>{v}</strong> },
                    { key: 'exam', label: 'Exam Type' },
                    { key: 'obtained', label: 'Obtained' },
                    { key: 'max', label: 'Max Marks' },
                    { key: 'obtained', label: 'Percentage', render: (v, row) => {
                      const pct = ((v / row.max) * 100).toFixed(1)
                      const color = pct >= 80 ? 'var(--success)' : pct >= 60 ? 'var(--warning)' : 'var(--danger)'
                      return <span style={{ color, fontWeight: 600 }}>{pct}%</span>
                    }},
                  ]}
                  data={DEMO_MARKS}
                />
              </div>
            </div>
          )}

          {/* ═══ Jobs ═══ */}
          {activeTab === 'jobs' && (
            <div className="slide-up">
              <div className="page-header">
                <h1>Job & Internship Opportunities</h1>
                <p>Browse and apply for career opportunities</p>
              </div>
              <div className="grid-2">
                {DEMO_JOBS.map(job => (
                  <div key={job.id} className="card" style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                    <div className="flex justify-between items-center">
                      <span className={`badge ${job.type === 'internship' ? 'info' : 'success'}`}>{job.type}</span>
                      <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>Deadline: {job.deadline}</span>
                    </div>
                    <h3 style={{ fontSize: 18, fontWeight: 700 }}>{job.title}</h3>
                    <p style={{ color: 'var(--text-secondary)', fontSize: 14 }}>{job.company} • {job.location}</p>
                    <p style={{ color: 'var(--primary-400)', fontWeight: 600, fontSize: 15 }}>{job.salary}</p>
                    <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>Skills: {job.skills}</div>
                    <button className="btn btn-primary btn-sm" style={{ alignSelf: 'flex-start', marginTop: 4 }}>Apply Now</button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ═══ AI Chat ═══ */}
          {activeTab === 'chat' && (
            <div className="slide-up">
              <div className="page-header">
                <h1>AI Assistant</h1>
                <p>Ask me about attendance, assignments, marks, or placements</p>
              </div>
              <div className="chat-container">
                <div className="chat-messages">
                  {chatMessages.map((msg, i) => (
                    <div key={i}>
                      <div className={`chat-message ${msg.role === 'user' ? 'user' : 'bot'}`}>
                        {msg.text.split('\n').map((line, j) => <div key={j}>{line}</div>)}
                      </div>
                      {msg.suggestions && (
                        <div className="chat-suggestions">
                          {msg.suggestions.map((s, j) => (
                            <button key={j} className="chat-suggestion-btn" onClick={() => sendChatMessage(s)}>{s}</button>
                          ))}
                        </div>
                      )}
                    </div>
                  ))}
                  {chatLoading && (
                    <div className="chat-message bot">
                      <div className="spinner" style={{ width: 20, height: 20, borderWidth: 2 }}></div>
                    </div>
                  )}
                  <div ref={chatEndRef} />
                </div>
                <div className="chat-input-area">
                  <input
                    value={chatInput}
                    onChange={e => setChatInput(e.target.value)}
                    onKeyDown={e => e.key === 'Enter' && sendChatMessage(chatInput)}
                    placeholder="Ask me anything..."
                    disabled={chatLoading}
                  />
                  <button onClick={() => sendChatMessage(chatInput)} disabled={chatLoading || !chatInput.trim()}>
                    <HiOutlinePaperAirplane style={{ transform: 'rotate(90deg)' }} /> Send
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* ═══ Notifications ═══ */}
          {activeTab === 'notifications' && (
            <div className="slide-up">
              <div className="page-header">
                <h1>Notifications</h1>
                <p>Stay updated with the latest announcements</p>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                {DEMO_NOTIFICATIONS.map(n => (
                  <div key={n.id} className="card" style={{ display: 'flex', gap: 16, alignItems: 'flex-start' }}>
                    <div className="stat-icon blue" style={{ width: 40, height: 40, fontSize: 18 }}>
                      <HiOutlineBell />
                    </div>
                    <div style={{ flex: 1 }}>
                      <h3 style={{ fontSize: 15, fontWeight: 600, marginBottom: 4 }}>{n.title}</h3>
                      <p style={{ fontSize: 13, color: 'var(--text-secondary)', lineHeight: 1.5 }}>{n.message}</p>
                      <p style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 6 }}>{new Date(n.created_at).toLocaleDateString()}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
