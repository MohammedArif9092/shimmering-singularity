import { useState } from 'react'
import { useAuth } from '../../context/AuthContext'
import Sidebar from '../../components/Sidebar'
import Navbar from '../../components/Navbar'
import StatsCard from '../../components/StatsCard'
import DataTable from '../../components/DataTable'
import { HiOutlineUsers, HiOutlineAcademicCap, HiOutlineOfficeBuilding,
  HiOutlineBriefcase, HiOutlineBell, HiOutlineChartBar, HiOutlinePlus,
  HiOutlineTrash, HiOutlineDocumentReport } from 'react-icons/hi'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts'

const TABS = ['overview', 'users', 'departments', 'courses', 'reports', 'notifications']
const TAB_LABELS = {
  overview: 'Dashboard', users: 'User Management', departments: 'Departments',
  courses: 'Courses', reports: 'Reports', notifications: 'Notifications'
}

const DEMO_USERS = [
  { id: 'u1', name: 'Aarav Sharma', email: 'aarav@uni.edu', role: 'student', created_at: '2026-01-15' },
  { id: 'u2', name: 'Dr. Priya Mehta', email: 'priya@uni.edu', role: 'faculty', created_at: '2025-08-10' },
  { id: 'u3', name: 'Rahul Kumar', email: 'rahul@uni.edu', role: 'student', created_at: '2026-01-15' },
  { id: 'u4', name: 'Sneha Reddy', email: 'sneha@uni.edu', role: 'student', created_at: '2026-01-16' },
  { id: 'u5', name: 'Prof. Vikram Singh', email: 'vikram@uni.edu', role: 'faculty', created_at: '2025-06-01' },
  { id: 'u6', name: 'Ananya Joshi', email: 'ananya@uni.edu', role: 'placement_officer', created_at: '2025-09-01' },
  { id: 'u7', name: 'Karthik M', email: 'karthik@uni.edu', role: 'student', created_at: '2026-01-15' },
  { id: 'u8', name: 'Admin User', email: 'admin@uni.edu', role: 'admin', created_at: '2025-01-01' },
]
const DEMO_DEPARTMENTS = [
  { id: 'd1', name: 'Computer Science', code: 'CSE', students: 280, faculty: 15 },
  { id: 'd2', name: 'Electronics', code: 'ECE', students: 210, faculty: 12 },
  { id: 'd3', name: 'Mechanical', code: 'ME', students: 180, faculty: 10 },
  { id: 'd4', name: 'Civil', code: 'CE', students: 150, faculty: 8 },
  { id: 'd5', name: 'Information Technology', code: 'IT', students: 240, faculty: 13 },
]
const DEMO_COURSES_ADMIN = [
  { id: 'c1', name: 'Data Structures', code: 'CS201', department: 'CSE', faculty: 'Dr. Priya Mehta', semester: 3, credits: 4 },
  { id: 'c2', name: 'Operating Systems', code: 'CS301', department: 'CSE', faculty: 'Prof. Vikram Singh', semester: 5, credits: 3 },
  { id: 'c3', name: 'Digital Electronics', code: 'EC201', department: 'ECE', faculty: 'Dr. Ramesh K', semester: 3, credits: 4 },
  { id: 'c4', name: 'Thermodynamics', code: 'ME201', department: 'ME', faculty: 'Dr. Sunil P', semester: 3, credits: 3 },
]
const DEMO_SENT_NOTIFICATIONS = [
  { id: 'n1', title: 'Mid-Semester Exams', message: 'Exams begin April 5th', target_role: 'all', created_at: '2026-03-18' },
  { id: 'n2', title: 'Fee Reminder', message: 'Last date for fee payment: March 31st', target_role: 'student', created_at: '2026-03-15' },
]

const deptData = DEMO_DEPARTMENTS.map(d => ({ name: d.code, students: d.students, faculty: d.faculty }))
const roleData = [
  { name: 'Students', value: 5, fill: '#6366f1' },
  { name: 'Faculty', value: 2, fill: '#22c55e' },
  { name: 'Admin', value: 1, fill: '#f59e0b' },
  { name: 'Placement', value: 1, fill: '#3b82f6' },
]

export default function AdminDashboard() {
  const { profile } = useAuth()
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [activeTab, setActiveTab] = useState('overview')
  const [userFilter, setUserFilter] = useState('all')
  const [showUserModal, setShowUserModal] = useState(false)
  const [showDeptModal, setShowDeptModal] = useState(false)
  const [showCourseModal, setShowCourseModal] = useState(false)
  const [showNotifModal, setShowNotifModal] = useState(false)

  const filteredUsers = userFilter === 'all' ? DEMO_USERS : DEMO_USERS.filter(u => u.role === userFilter)

  return (
    <div className="app-layout">
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      <div className="main-content">
        <Navbar title={TAB_LABELS[activeTab]} onMenuClick={() => setSidebarOpen(!sidebarOpen)} />

        <div className="fade-in">
          <div className="tabs">
            {TABS.map(tab => (
              <button key={tab} className={`tab ${activeTab === tab ? 'active' : ''}`} onClick={() => setActiveTab(tab)}>
                {TAB_LABELS[tab]}
              </button>
            ))}
          </div>

          {/* ═══ Overview ═══ */}
          {activeTab === 'overview' && (
            <div className="slide-up">
              <div className="page-header">
                <h1>Admin Dashboard 🏛️</h1>
                <p>System overview and management</p>
              </div>

              <div className="stats-grid">
                <StatsCard icon={HiOutlineUsers} label="Total Students" value={1060} color="purple" change={8} />
                <StatsCard icon={HiOutlineAcademicCap} label="Faculty Members" value={58} color="green" />
                <StatsCard icon={HiOutlineOfficeBuilding} label="Departments" value={5} color="blue" />
                <StatsCard icon={HiOutlineBriefcase} label="Active Jobs" value={12} color="orange" />
              </div>

              <div className="grid-2">
                <div className="chart-card">
                  <h3>Students & Faculty by Department</h3>
                  <ResponsiveContainer width="100%" height={280}>
                    <BarChart data={deptData}>
                      <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                      <XAxis dataKey="name" stroke="var(--text-muted)" fontSize={12} />
                      <YAxis stroke="var(--text-muted)" fontSize={12} />
                      <Tooltip contentStyle={{ background: '#1a1a2e', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 8 }} />
                      <Bar dataKey="students" fill="#6366f1" radius={[4,4,0,0]} name="Students" />
                      <Bar dataKey="faculty" fill="#22c55e" radius={[4,4,0,0]} name="Faculty" />
                    </BarChart>
                  </ResponsiveContainer>
                </div>

                <div className="chart-card">
                  <h3>User Distribution by Role</h3>
                  <ResponsiveContainer width="100%" height={280}>
                    <PieChart>
                      <Pie data={roleData} cx="50%" cy="50%" innerRadius={55} outerRadius={90} paddingAngle={4} dataKey="value" label={({ name, value }) => `${name}: ${value}`}>
                        {roleData.map((entry, i) => <Cell key={i} fill={entry.fill} />)}
                      </Pie>
                      <Tooltip contentStyle={{ background: '#1a1a2e', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 8 }} />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </div>
          )}

          {/* ═══ Users ═══ */}
          {activeTab === 'users' && (
            <div className="slide-up">
              <div className="page-header flex justify-between items-center">
                <div>
                  <h1>User Management</h1>
                  <p>Manage all system users</p>
                </div>
              </div>

              <div className="flex gap-3 mb-6" style={{ flexWrap: 'wrap' }}>
                {['all', 'student', 'faculty', 'admin', 'placement_officer'].map(r => (
                  <button key={r} className={`btn btn-sm ${userFilter === r ? 'btn-primary' : 'btn-secondary'}`}
                    onClick={() => setUserFilter(r)} style={{ textTransform: 'capitalize' }}>
                    {r === 'all' ? 'All Users' : r.replace('_', ' ')}
                  </button>
                ))}
              </div>

              <div className="table-container">
                <DataTable
                  columns={[
                    { key: 'name', label: 'Name', render: (v) => <strong>{v}</strong> },
                    { key: 'email', label: 'Email' },
                    { key: 'role', label: 'Role', render: (v) => (
                      <span className={`badge ${v === 'admin' ? 'warning' : v === 'faculty' ? 'info' : v === 'placement_officer' ? 'success' : 'draft'}`}
                        style={{ textTransform: 'capitalize' }}>
                        {v.replace('_', ' ')}
                      </span>
                    )},
                    { key: 'created_at', label: 'Joined' },
                    { key: 'id', label: 'Actions', render: (_, row) => row.role !== 'admin' ? (
                      <button className="btn btn-danger btn-sm"><HiOutlineTrash /> Remove</button>
                    ) : null },
                  ]}
                  data={filteredUsers}
                />
              </div>
            </div>
          )}

          {/* ═══ Departments ═══ */}
          {activeTab === 'departments' && (
            <div className="slide-up">
              <div className="page-header flex justify-between items-center">
                <div>
                  <h1>Departments</h1>
                  <p>Manage academic departments</p>
                </div>
                <button className="btn btn-primary" onClick={() => setShowDeptModal(true)}><HiOutlinePlus /> Add Department</button>
              </div>
              <div className="grid-3">
                {DEMO_DEPARTMENTS.map(d => (
                  <div key={d.id} className="card">
                    <div className="flex justify-between items-center" style={{ marginBottom: 16 }}>
                      <span className="badge info" style={{ fontSize: 14, padding: '6px 16px' }}>{d.code}</span>
                      <button className="btn btn-danger btn-sm" style={{ padding: 6 }}><HiOutlineTrash /></button>
                    </div>
                    <h3 style={{ fontSize: 18, fontWeight: 700, marginBottom: 12 }}>{d.name}</h3>
                    <div className="flex justify-between" style={{ fontSize: 13, color: 'var(--text-secondary)' }}>
                      <span>👨‍🎓 {d.students} Students</span>
                      <span>👨‍🏫 {d.faculty} Faculty</span>
                    </div>
                  </div>
                ))}
              </div>

              {showDeptModal && (
                <div className="modal-overlay" onClick={() => setShowDeptModal(false)}>
                  <div className="modal" onClick={e => e.stopPropagation()}>
                    <h2>Add Department</h2>
                    <div className="form-group">
                      <label className="form-label">Department Name</label>
                      <input className="form-input" placeholder="e.g. Computer Science" style={{ width: '100%' }} />
                    </div>
                    <div className="form-group">
                      <label className="form-label">Department Code</label>
                      <input className="form-input" placeholder="e.g. CSE" style={{ width: '100%' }} />
                    </div>
                    <div className="modal-actions">
                      <button className="btn btn-secondary" onClick={() => setShowDeptModal(false)}>Cancel</button>
                      <button className="btn btn-primary" onClick={() => setShowDeptModal(false)}>Add Department</button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* ═══ Courses ═══ */}
          {activeTab === 'courses' && (
            <div className="slide-up">
              <div className="page-header flex justify-between items-center">
                <div>
                  <h1>Course Management</h1>
                  <p>Manage all courses across departments</p>
                </div>
                <button className="btn btn-primary" onClick={() => setShowCourseModal(true)}><HiOutlinePlus /> Add Course</button>
              </div>
              <div className="table-container">
                <DataTable
                  columns={[
                    { key: 'code', label: 'Code', render: (v) => <span className="badge info">{v}</span> },
                    { key: 'name', label: 'Course Name', render: (v) => <strong>{v}</strong> },
                    { key: 'department', label: 'Department' },
                    { key: 'faculty', label: 'Faculty' },
                    { key: 'semester', label: 'Semester' },
                    { key: 'credits', label: 'Credits' },
                    { key: 'id', label: 'Actions', render: () => (
                      <button className="btn btn-danger btn-sm"><HiOutlineTrash /></button>
                    )},
                  ]}
                  data={DEMO_COURSES_ADMIN}
                />
              </div>

              {showCourseModal && (
                <div className="modal-overlay" onClick={() => setShowCourseModal(false)}>
                  <div className="modal" onClick={e => e.stopPropagation()}>
                    <h2>Add Course</h2>
                    <div className="grid-2">
                      <div className="form-group">
                        <label className="form-label">Course Name</label>
                        <input className="form-input" placeholder="Course name" style={{ width: '100%' }} />
                      </div>
                      <div className="form-group">
                        <label className="form-label">Course Code</label>
                        <input className="form-input" placeholder="CS201" style={{ width: '100%' }} />
                      </div>
                    </div>
                    <div className="grid-2">
                      <div className="form-group">
                        <label className="form-label">Department</label>
                        <select className="form-select">
                          {DEMO_DEPARTMENTS.map(d => <option key={d.id}>{d.name}</option>)}
                        </select>
                      </div>
                      <div className="form-group">
                        <label className="form-label">Semester</label>
                        <select className="form-select">
                          {[1,2,3,4,5,6,7,8].map(s => <option key={s} value={s}>Semester {s}</option>)}
                        </select>
                      </div>
                    </div>
                    <div className="form-group">
                      <label className="form-label">Credits</label>
                      <input type="number" className="form-input" defaultValue={3} style={{ width: '100%' }} />
                    </div>
                    <div className="modal-actions">
                      <button className="btn btn-secondary" onClick={() => setShowCourseModal(false)}>Cancel</button>
                      <button className="btn btn-primary" onClick={() => setShowCourseModal(false)}>Add Course</button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* ═══ Reports ═══ */}
          {activeTab === 'reports' && (
            <div className="slide-up">
              <div className="page-header">
                <h1>System Reports</h1>
                <p>Attendance and performance analytics</p>
              </div>

              <div className="stats-grid" style={{ gridTemplateColumns: 'repeat(4, 1fr)' }}>
                <StatsCard icon={HiOutlineChartBar} label="Attendance Rate" value="85.2%" color="green" />
                <StatsCard icon={HiOutlineDocumentReport} label="Avg Score" value="74.5%" color="purple" />
                <StatsCard icon={HiOutlineUsers} label="Active Students" value="1,024" color="blue" />
                <StatsCard icon={HiOutlineBriefcase} label="Placement Rate" value="72%" color="orange" />
              </div>

              <div className="grid-2">
                <div className="chart-card">
                  <h3>📊 Attendance Overview</h3>
                  <div style={{ padding: '20px 0' }}>
                    {['CSE', 'ECE', 'ME', 'CE', 'IT'].map((dept, i) => {
                      const values = [88, 82, 79, 85, 91]
                      const v = values[i]
                      const color = v >= 85 ? 'var(--success)' : v >= 75 ? 'var(--warning)' : 'var(--danger)'
                      return (
                        <div key={dept} style={{ marginBottom: 16 }}>
                          <div className="flex justify-between" style={{ fontSize: 13, marginBottom: 6 }}>
                            <span>{dept}</span><span style={{ color, fontWeight: 600 }}>{v}%</span>
                          </div>
                          <div style={{ height: 8, background: 'rgba(255,255,255,0.05)', borderRadius: 4 }}>
                            <div style={{ width: `${v}%`, height: '100%', background: color, borderRadius: 4, transition: 'width 0.8s ease' }}></div>
                          </div>
                        </div>
                      )
                    })}
                  </div>
                </div>

                <div className="chart-card">
                  <h3>📈 Performance by Department</h3>
                  <ResponsiveContainer width="100%" height={250}>
                    <BarChart data={deptData.map((d, i) => ({ ...d, score: [78, 72, 68, 75, 82][i] }))}>
                      <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                      <XAxis dataKey="name" stroke="var(--text-muted)" fontSize={12} />
                      <YAxis stroke="var(--text-muted)" fontSize={12} />
                      <Tooltip contentStyle={{ background: '#1a1a2e', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 8 }} />
                      <Bar dataKey="score" fill="#8b5cf6" radius={[4,4,0,0]} name="Avg Score %" />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </div>
          )}

          {/* ═══ Notifications ═══ */}
          {activeTab === 'notifications' && (
            <div className="slide-up">
              <div className="page-header flex justify-between items-center">
                <div>
                  <h1>Send Notifications</h1>
                  <p>Broadcast messages to users</p>
                </div>
                <button className="btn btn-primary" onClick={() => setShowNotifModal(true)}><HiOutlinePlus /> New Notification</button>
              </div>

              <div className="table-container">
                <DataTable
                  columns={[
                    { key: 'title', label: 'Title', render: (v) => <strong>{v}</strong> },
                    { key: 'message', label: 'Message' },
                    { key: 'target_role', label: 'Target', render: (v) => <span className="badge info" style={{ textTransform: 'capitalize' }}>{v}</span> },
                    { key: 'created_at', label: 'Sent Date' },
                  ]}
                  data={DEMO_SENT_NOTIFICATIONS}
                />
              </div>

              {showNotifModal && (
                <div className="modal-overlay" onClick={() => setShowNotifModal(false)}>
                  <div className="modal" onClick={e => e.stopPropagation()}>
                    <h2>Send Notification</h2>
                    <div className="form-group">
                      <label className="form-label">Title</label>
                      <input className="form-input" placeholder="Notification title" style={{ width: '100%' }} />
                    </div>
                    <div className="form-group">
                      <label className="form-label">Message</label>
                      <textarea className="form-textarea" placeholder="Notification message..." style={{ width: '100%' }} rows={3} />
                    </div>
                    <div className="form-group">
                      <label className="form-label">Target Audience</label>
                      <select className="form-select">
                        <option value="all">All Users</option>
                        <option value="student">Students Only</option>
                        <option value="faculty">Faculty Only</option>
                        <option value="placement_officer">Placement Officers</option>
                      </select>
                    </div>
                    <div className="modal-actions">
                      <button className="btn btn-secondary" onClick={() => setShowNotifModal(false)}>Cancel</button>
                      <button className="btn btn-primary" onClick={() => setShowNotifModal(false)}>Send Notification</button>
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
