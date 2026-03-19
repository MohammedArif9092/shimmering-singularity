import { useState } from 'react'
import { useAuth } from '../../context/AuthContext'
import Sidebar from '../../components/Sidebar'
import Navbar from '../../components/Navbar'
import StatsCard from '../../components/StatsCard'
import DataTable from '../../components/DataTable'
import { HiOutlineAcademicCap, HiOutlineClipboardCheck, HiOutlineDocumentText,
  HiOutlineChartBar, HiOutlineBell, HiOutlineUserGroup, HiOutlinePlus } from 'react-icons/hi'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts'

const TABS = ['overview', 'courses', 'attendance', 'assignments', 'marks', 'announcements']
const TAB_LABELS = {
  overview: 'Dashboard', courses: 'My Courses', attendance: 'Mark Attendance',
  assignments: 'Assignments', marks: 'Enter Marks', announcements: 'Announcements'
}

const DEMO_COURSES = [
  { id: 1, name: 'Data Structures', code: 'CS201', department: 'CSE', semester: 3, students: 45 },
  { id: 2, name: 'Operating Systems', code: 'CS301', department: 'CSE', semester: 5, students: 38 },
  { id: 3, name: 'Database Systems', code: 'CS202', department: 'CSE', semester: 3, students: 42 },
]
const DEMO_STUDENTS = [
  { id: 's1', name: 'Aarav Sharma', roll: 'CSE2023001', status: 'present' },
  { id: 's2', name: 'Priya Patel', roll: 'CSE2023002', status: 'present' },
  { id: 's3', name: 'Rahul Gupta', roll: 'CSE2023003', status: 'absent' },
  { id: 's4', name: 'Sneha Reddy', roll: 'CSE2023004', status: 'present' },
  { id: 's5', name: 'Vikram Singh', roll: 'CSE2023005', status: 'late' },
  { id: 's6', name: 'Ananya Joshi', roll: 'CSE2023006', status: 'present' },
  { id: 's7', name: 'Karthik Kumar', roll: 'CSE2023007', status: 'present' },
  { id: 's8', name: 'Meera Nair', roll: 'CSE2023008', status: 'absent' },
]
const DEMO_FACULTY_ASSIGNMENTS = [
  { id: 1, title: 'Binary Tree Implementation', course: 'Data Structures', due: '2026-03-25', submissions: 28, total: 45 },
  { id: 2, title: 'ER Diagram Design', course: 'Database Systems', due: '2026-03-20', submissions: 42, total: 42 },
  { id: 3, title: 'Process Scheduling Report', course: 'Operating Systems', due: '2026-03-22', submissions: 15, total: 38 },
]
const DEMO_ANNOUNCEMENTS = [
  { id: 1, title: 'Mid-Semester Project Demos', content: 'All students must present their project demos in the lab on April 5th.', course: 'Data Structures', created_at: '2026-03-18' },
  { id: 2, title: 'Quiz 2 Scheduled', content: 'Quiz 2 for OS will be held on March 28th. Topics: Process Scheduling, Memory Management.', course: 'Operating Systems', created_at: '2026-03-17' },
]

const performanceData = [
  { name: 'CS201', avg: 78, fill: '#6366f1' },
  { name: 'CS301', avg: 72, fill: '#8b5cf6' },
  { name: 'CS202', avg: 82, fill: '#22c55e' },
]

export default function FacultyDashboard() {
  const { profile } = useAuth()
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [activeTab, setActiveTab] = useState('overview')
  const [selectedCourse, setSelectedCourse] = useState(DEMO_COURSES[0])
  const [attendanceList, setAttendanceList] = useState(DEMO_STUDENTS)
  const [attendanceDate, setAttendanceDate] = useState(new Date().toISOString().slice(0, 10))
  const [showAssignmentModal, setShowAssignmentModal] = useState(false)
  const [showAnnouncementModal, setShowAnnouncementModal] = useState(false)

  const navigateTab = (tab) => setActiveTab(tab)

  const toggleAttendance = (id, status) => {
    setAttendanceList(prev => prev.map(s => s.id === id ? { ...s, status } : s))
  }

  const presentCount = attendanceList.filter(s => s.status === 'present').length
  const absentCount = attendanceList.filter(s => s.status === 'absent').length

  return (
    <div className="app-layout">
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      <div className="main-content">
        <Navbar title={TAB_LABELS[activeTab]} onMenuClick={() => setSidebarOpen(!sidebarOpen)} />

        <div className="fade-in">
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
                <h1>Welcome, {profile?.name || 'Professor'} 👋</h1>
                <p>Your teaching overview for this semester</p>
              </div>

              <div className="stats-grid">
                <StatsCard icon={HiOutlineAcademicCap} label="Active Courses" value={DEMO_COURSES.length} color="purple" />
                <StatsCard icon={HiOutlineUserGroup} label="Total Students" value={125} color="blue" />
                <StatsCard icon={HiOutlineDocumentText} label="Active Assignments" value={DEMO_FACULTY_ASSIGNMENTS.length} color="orange" />
                <StatsCard icon={HiOutlineBell} label="Announcements" value={DEMO_ANNOUNCEMENTS.length} color="green" />
              </div>

              <div className="grid-2">
                <div className="chart-card">
                  <h3>Class Average by Course</h3>
                  <ResponsiveContainer width="100%" height={250}>
                    <BarChart data={performanceData}>
                      <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                      <XAxis dataKey="name" stroke="var(--text-muted)" fontSize={12} />
                      <YAxis stroke="var(--text-muted)" fontSize={12} />
                      <Tooltip contentStyle={{ background: '#1a1a2e', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 8 }} />
                      <Bar dataKey="avg" radius={[6, 6, 0, 0]}>
                        {performanceData.map((entry, i) => <Cell key={i} fill={entry.fill} />)}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </div>

                <div className="table-container">
                  <div className="table-header">
                    <h2>Assignment Submissions</h2>
                  </div>
                  <DataTable
                    columns={[
                      { key: 'title', label: 'Assignment', render: (v) => <strong>{v}</strong> },
                      { key: 'course', label: 'Course' },
                      { key: 'submissions', label: 'Submitted', render: (v, row) => (
                        <span style={{ color: v === row.total ? 'var(--success)' : 'var(--warning)' }}>{v}/{row.total}</span>
                      )},
                      { key: 'due', label: 'Due Date' },
                    ]}
                    data={DEMO_FACULTY_ASSIGNMENTS}
                  />
                </div>
              </div>
            </div>
          )}

          {/* ═══ Courses ═══ */}
          {activeTab === 'courses' && (
            <div className="slide-up">
              <div className="page-header">
                <h1>My Courses</h1>
                <p>Courses assigned to you this semester</p>
              </div>
              <div className="grid-3">
                {DEMO_COURSES.map(c => (
                  <div key={c.id} className="card">
                    <div className="flex justify-between items-center mb-4">
                      <span className="badge info">{c.code}</span>
                      <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>Sem {c.semester}</span>
                    </div>
                    <h3 style={{ fontSize: 18, fontWeight: 700, marginBottom: 8 }}>{c.name}</h3>
                    <p style={{ fontSize: 13, color: 'var(--text-secondary)', marginBottom: 4 }}>Department: {c.department}</p>
                    <p style={{ fontSize: 13, color: 'var(--text-muted)' }}>{c.students} students enrolled</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ═══ Mark Attendance ═══ */}
          {activeTab === 'attendance' && (
            <div className="slide-up">
              <div className="page-header">
                <h1>Mark Attendance</h1>
                <p>Record attendance for your classes</p>
              </div>

              <div className="card mb-6">
                <div className="flex gap-4 items-center" style={{ flexWrap: 'wrap' }}>
                  <div className="form-group" style={{ marginBottom: 0, flex: '1 1 200px' }}>
                    <label className="form-label">Course</label>
                    <select className="form-select" value={selectedCourse.id} onChange={e => setSelectedCourse(DEMO_COURSES.find(c => c.id === +e.target.value))}>
                      {DEMO_COURSES.map(c => <option key={c.id} value={c.id}>{c.code} — {c.name}</option>)}
                    </select>
                  </div>
                  <div className="form-group" style={{ marginBottom: 0, flex: '0 0 180px' }}>
                    <label className="form-label">Date</label>
                    <input type="date" className="form-input" value={attendanceDate} onChange={e => setAttendanceDate(e.target.value)} />
                  </div>
                </div>
              </div>

              <div className="stats-grid" style={{ gridTemplateColumns: 'repeat(3, 1fr)' }}>
                <StatsCard icon={HiOutlineClipboardCheck} label="Present" value={presentCount} color="green" />
                <StatsCard icon={HiOutlineClipboardCheck} label="Absent" value={absentCount} color="red" />
                <StatsCard icon={HiOutlineUserGroup} label="Total Students" value={attendanceList.length} color="blue" />
              </div>

              <div className="table-container">
                <DataTable
                  columns={[
                    { key: 'roll', label: 'Roll No' },
                    { key: 'name', label: 'Student Name', render: (v) => <strong>{v}</strong> },
                    { key: 'status', label: 'Status', render: (v, row) => (
                      <div className="flex gap-2">
                        {['present', 'absent', 'late'].map(s => (
                          <button key={s} className={`btn btn-sm ${v === s ? (s === 'present' ? 'btn-success' : s === 'absent' ? 'btn-danger' : 'btn-secondary') : 'btn-secondary'}`}
                            style={{ textTransform: 'capitalize', minWidth: 70 }}
                            onClick={() => toggleAttendance(row.id, s)}>
                            {s}
                          </button>
                        ))}
                      </div>
                    )},
                  ]}
                  data={attendanceList}
                />
              </div>

              <div style={{ textAlign: 'right', marginTop: 16 }}>
                <button className="btn btn-primary">Save Attendance</button>
              </div>
            </div>
          )}

          {/* ═══ Assignments ═══ */}
          {activeTab === 'assignments' && (
            <div className="slide-up">
              <div className="page-header flex justify-between items-center">
                <div>
                  <h1>Assignments</h1>
                  <p>Create and manage assignments for your courses</p>
                </div>
                <button className="btn btn-primary" onClick={() => setShowAssignmentModal(true)}>
                  <HiOutlinePlus /> New Assignment
                </button>
              </div>
              <div className="table-container">
                <DataTable
                  columns={[
                    { key: 'title', label: 'Assignment', render: (v) => <strong>{v}</strong> },
                    { key: 'course', label: 'Course' },
                    { key: 'due', label: 'Due Date' },
                    { key: 'submissions', label: 'Submissions', render: (v, row) => `${v}/${row.total}` },
                    { key: 'id', label: 'Actions', render: () => (
                      <button className="btn btn-secondary btn-sm">View Submissions</button>
                    )},
                  ]}
                  data={DEMO_FACULTY_ASSIGNMENTS}
                />
              </div>

              {showAssignmentModal && (
                <div className="modal-overlay" onClick={() => setShowAssignmentModal(false)}>
                  <div className="modal" onClick={e => e.stopPropagation()}>
                    <h2>Create New Assignment</h2>
                    <div className="form-group">
                      <label className="form-label">Course</label>
                      <select className="form-select">
                        {DEMO_COURSES.map(c => <option key={c.id}>{c.code} — {c.name}</option>)}
                      </select>
                    </div>
                    <div className="form-group">
                      <label className="form-label">Title</label>
                      <input className="form-input" placeholder="Assignment title" style={{ width: '100%' }} />
                    </div>
                    <div className="form-group">
                      <label className="form-label">Description</label>
                      <textarea className="form-textarea" placeholder="Assignment details..." style={{ width: '100%' }} />
                    </div>
                    <div className="grid-2">
                      <div className="form-group">
                        <label className="form-label">Due Date</label>
                        <input type="date" className="form-input" style={{ width: '100%' }} />
                      </div>
                      <div className="form-group">
                        <label className="form-label">Max Marks</label>
                        <input type="number" className="form-input" defaultValue={100} style={{ width: '100%' }} />
                      </div>
                    </div>
                    <div className="modal-actions">
                      <button className="btn btn-secondary" onClick={() => setShowAssignmentModal(false)}>Cancel</button>
                      <button className="btn btn-primary" onClick={() => setShowAssignmentModal(false)}>Create Assignment</button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* ═══ Marks ═══ */}
          {activeTab === 'marks' && (
            <div className="slide-up">
              <div className="page-header">
                <h1>Enter Marks</h1>
                <p>Record exam scores for your students</p>
              </div>
              <div className="card mb-6">
                <div className="flex gap-4 items-center" style={{ flexWrap: 'wrap' }}>
                  <div className="form-group" style={{ marginBottom: 0, flex: '1 1 200px' }}>
                    <label className="form-label">Course</label>
                    <select className="form-select">
                      {DEMO_COURSES.map(c => <option key={c.id}>{c.code} — {c.name}</option>)}
                    </select>
                  </div>
                  <div className="form-group" style={{ marginBottom: 0, flex: '0 0 180px' }}>
                    <label className="form-label">Exam Type</label>
                    <select className="form-select">
                      <option>Midterm</option><option>Final</option><option>Quiz</option><option>Practical</option>
                    </select>
                  </div>
                  <div className="form-group" style={{ marginBottom: 0, flex: '0 0 120px' }}>
                    <label className="form-label">Max Marks</label>
                    <input type="number" className="form-input" defaultValue={50} style={{ width: '100%' }} />
                  </div>
                </div>
              </div>
              <div className="table-container">
                <DataTable
                  columns={[
                    { key: 'roll', label: 'Roll No' },
                    { key: 'name', label: 'Student', render: (v) => <strong>{v}</strong> },
                    { key: 'id', label: 'Marks', render: () => (
                      <input type="number" className="form-input" placeholder="0" style={{ width: 80 }} min={0} />
                    )},
                  ]}
                  data={DEMO_STUDENTS}
                />
              </div>
              <div style={{ textAlign: 'right', marginTop: 16 }}>
                <button className="btn btn-primary">Save Marks</button>
              </div>
            </div>
          )}

          {/* ═══ Announcements ═══ */}
          {activeTab === 'announcements' && (
            <div className="slide-up">
              <div className="page-header flex justify-between items-center">
                <div>
                  <h1>Announcements</h1>
                  <p>Post announcements for your courses</p>
                </div>
                <button className="btn btn-primary" onClick={() => setShowAnnouncementModal(true)}>
                  <HiOutlinePlus /> New Announcement
                </button>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                {DEMO_ANNOUNCEMENTS.map(a => (
                  <div key={a.id} className="card">
                    <div className="flex justify-between items-center mb-4">
                      <span className="badge info">{a.course}</span>
                      <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>{a.created_at}</span>
                    </div>
                    <h3 style={{ fontSize: 16, fontWeight: 700, marginBottom: 6 }}>{a.title}</h3>
                    <p style={{ fontSize: 14, color: 'var(--text-secondary)', lineHeight: 1.5 }}>{a.content}</p>
                  </div>
                ))}
              </div>

              {showAnnouncementModal && (
                <div className="modal-overlay" onClick={() => setShowAnnouncementModal(false)}>
                  <div className="modal" onClick={e => e.stopPropagation()}>
                    <h2>Post Announcement</h2>
                    <div className="form-group">
                      <label className="form-label">Course (optional)</label>
                      <select className="form-select">
                        <option value="">All courses</option>
                        {DEMO_COURSES.map(c => <option key={c.id}>{c.name}</option>)}
                      </select>
                    </div>
                    <div className="form-group">
                      <label className="form-label">Title</label>
                      <input className="form-input" placeholder="Announcement title" style={{ width: '100%' }} />
                    </div>
                    <div className="form-group">
                      <label className="form-label">Content</label>
                      <textarea className="form-textarea" placeholder="Announcement details..." style={{ width: '100%' }} rows={4} />
                    </div>
                    <div className="modal-actions">
                      <button className="btn btn-secondary" onClick={() => setShowAnnouncementModal(false)}>Cancel</button>
                      <button className="btn btn-primary" onClick={() => setShowAnnouncementModal(false)}>Post Announcement</button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
