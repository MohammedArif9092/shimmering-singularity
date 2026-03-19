import { useState } from 'react'
import { useAuth } from '../../context/AuthContext'
import Sidebar from '../../components/Sidebar'
import Navbar from '../../components/Navbar'
import StatsCard from '../../components/StatsCard'
import DataTable from '../../components/DataTable'
import { HiOutlineBriefcase, HiOutlineClipboardList, HiOutlineUserGroup,
  HiOutlineCheckCircle, HiOutlinePlus, HiOutlineTrash, HiOutlineEye } from 'react-icons/hi'
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, BarChart, Bar, XAxis, YAxis, CartesianGrid } from 'recharts'

const TABS = ['overview', 'jobs', 'applications', 'students']
const TAB_LABELS = {
  overview: 'Dashboard', jobs: 'Job Postings', applications: 'Applications', students: 'Student Profiles'
}

const DEMO_JOBS = [
  { id: 1, title: 'Software Engineer Intern', company: 'Google', type: 'internship', location: 'Bangalore', salary: '₹80,000/month', status: 'active', deadline: '2026-04-15', applications: 45, skills: 'Python, DSA, ML' },
  { id: 2, title: 'Full Stack Developer', company: 'Microsoft', type: 'job', location: 'Hyderabad', salary: '₹18 LPA', status: 'active', deadline: '2026-04-10', applications: 32, skills: 'React, Node.js, SQL' },
  { id: 3, title: 'Data Analyst Intern', company: 'Amazon', type: 'internship', location: 'Remote', salary: '₹60,000/month', status: 'active', deadline: '2026-04-20', applications: 28, skills: 'SQL, Python, Excel' },
  { id: 4, title: 'Backend Developer', company: 'Flipkart', type: 'job', location: 'Bangalore', salary: '₹15 LPA', status: 'closed', deadline: '2026-03-10', applications: 56, skills: 'Java, Spring Boot' },
]
const DEMO_APPLICATIONS = [
  { id: 'a1', student: 'Aarav Sharma', email: 'aarav@uni.edu', roll: 'CSE2023001', job: 'SWE Intern - Google', skills: 'Python, ML, React', cgpa: 8.7, status: 'pending', applied: '2026-03-15' },
  { id: 'a2', student: 'Priya Patel', email: 'priya@uni.edu', roll: 'CSE2023002', job: 'Full Stack - Microsoft', skills: 'React, Node.js, MongoDB', cgpa: 9.1, status: 'shortlisted', applied: '2026-03-14' },
  { id: 'a3', student: 'Rahul Gupta', email: 'rahul@uni.edu', roll: 'CSE2023003', job: 'SWE Intern - Google', skills: 'Java, DSA, SQL', cgpa: 7.8, status: 'pending', applied: '2026-03-16' },
  { id: 'a4', student: 'Sneha Reddy', email: 'sneha@uni.edu', roll: 'ECE2023004', job: 'Data Analyst - Amazon', skills: 'Python, SQL, Tableau', cgpa: 8.4, status: 'accepted', applied: '2026-03-12' },
  { id: 'a5', student: 'Vikram Singh', email: 'vikram@uni.edu', roll: 'CSE2023005', job: 'Backend Dev - Flipkart', skills: 'Java, Spring Boot, MySQL', cgpa: 8.9, status: 'rejected', applied: '2026-03-10' },
  { id: 'a6', student: 'Meera Nair', email: 'meera@uni.edu', roll: 'IT2023008', job: 'Full Stack - Microsoft', skills: 'React, Python, PostgreSQL', cgpa: 8.2, status: 'shortlisted', applied: '2026-03-13' },
]
const DEMO_STUDENT_PROFILES = [
  { id: 's1', name: 'Aarav Sharma', email: 'aarav@uni.edu', roll: 'CSE2023001', dept: 'CSE', year: 3, cgpa: 8.7, skills: 'Python, ML, React, TensorFlow', applications: 3 },
  { id: 's2', name: 'Priya Patel', email: 'priya@uni.edu', roll: 'CSE2023002', dept: 'CSE', year: 3, cgpa: 9.1, skills: 'React, Node.js, MongoDB, Express', applications: 2 },
  { id: 's3', name: 'Rahul Gupta', email: 'rahul@uni.edu', roll: 'CSE2023003', dept: 'CSE', year: 3, cgpa: 7.8, skills: 'Java, DSA, SQL, Algorithms', applications: 4 },
  { id: 's4', name: 'Sneha Reddy', email: 'sneha@uni.edu', roll: 'ECE2023004', dept: 'ECE', year: 4, cgpa: 8.4, skills: 'Python, SQL, Tableau, Data Analysis', applications: 1 },
  { id: 's5', name: 'Vikram Singh', email: 'vikram@uni.edu', roll: 'CSE2023005', dept: 'CSE', year: 4, cgpa: 8.9, skills: 'Java, Spring Boot, MySQL, Microservices', applications: 5 },
  { id: 's6', name: 'Ananya Joshi', email: 'ananya@uni.edu', roll: 'IT2023006', dept: 'IT', year: 3, cgpa: 8.0, skills: 'HTML, CSS, JavaScript, React', applications: 2 },
  { id: 's7', name: 'Karthik M', email: 'karthik@uni.edu', roll: 'ME2023007', dept: 'ME', year: 2, cgpa: 7.5, skills: 'AutoCAD, SolidWorks, MATLAB', applications: 0 },
  { id: 's8', name: 'Meera Nair', email: 'meera@uni.edu', roll: 'IT2023008', dept: 'IT', year: 4, cgpa: 8.2, skills: 'React, Python, PostgreSQL, AWS', applications: 3 },
]

const statusData = [
  { name: 'Pending', value: 2, fill: '#f59e0b' },
  { name: 'Shortlisted', value: 2, fill: '#3b82f6' },
  { name: 'Accepted', value: 1, fill: '#22c55e' },
  { name: 'Rejected', value: 1, fill: '#ef4444' },
]
const companyData = [
  { name: 'Google', apps: 45 },
  { name: 'Microsoft', apps: 32 },
  { name: 'Amazon', apps: 28 },
  { name: 'Flipkart', apps: 56 },
]

export default function PlacementDashboard() {
  const { profile } = useAuth()
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [activeTab, setActiveTab] = useState('overview')
  const [showJobModal, setShowJobModal] = useState(false)
  const [skillFilter, setSkillFilter] = useState('')

  const filteredStudents = skillFilter
    ? DEMO_STUDENT_PROFILES.filter(s => s.skills.toLowerCase().includes(skillFilter.toLowerCase()))
    : DEMO_STUDENT_PROFILES

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
                <h1>Placement Dashboard 💼</h1>
                <p>Manage job postings and track applications</p>
              </div>

              <div className="stats-grid">
                <StatsCard icon={HiOutlineBriefcase} label="Active Job Postings" value={3} color="purple" />
                <StatsCard icon={HiOutlineClipboardList} label="Total Applications" value={161} color="blue" change={12} />
                <StatsCard icon={HiOutlineCheckCircle} label="Shortlisted" value={34} color="green" />
                <StatsCard icon={HiOutlineUserGroup} label="Eligible Students" value={820} color="orange" />
              </div>

              <div className="grid-2">
                <div className="chart-card">
                  <h3>Application Status Breakdown</h3>
                  <ResponsiveContainer width="100%" height={280}>
                    <PieChart>
                      <Pie data={statusData} cx="50%" cy="50%" innerRadius={60} outerRadius={95} paddingAngle={4} dataKey="value"
                        label={({ name, value }) => `${name}: ${value}`}>
                        {statusData.map((entry, i) => <Cell key={i} fill={entry.fill} />)}
                      </Pie>
                      <Tooltip contentStyle={{ background: '#1a1a2e', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 8 }} />
                    </PieChart>
                  </ResponsiveContainer>
                </div>

                <div className="chart-card">
                  <h3>Applications per Company</h3>
                  <ResponsiveContainer width="100%" height={280}>
                    <BarChart data={companyData}>
                      <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                      <XAxis dataKey="name" stroke="var(--text-muted)" fontSize={12} />
                      <YAxis stroke="var(--text-muted)" fontSize={12} />
                      <Tooltip contentStyle={{ background: '#1a1a2e', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 8 }} />
                      <Bar dataKey="apps" fill="#6366f1" radius={[6,6,0,0]} name="Applications" />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </div>
          )}

          {/* ═══ Jobs ═══ */}
          {activeTab === 'jobs' && (
            <div className="slide-up">
              <div className="page-header flex justify-between items-center">
                <div>
                  <h1>Job Postings</h1>
                  <p>Create and manage job/internship opportunities</p>
                </div>
                <button className="btn btn-primary" onClick={() => setShowJobModal(true)}><HiOutlinePlus /> Post New Job</button>
              </div>

              <div className="grid-2">
                {DEMO_JOBS.map(job => (
                  <div key={job.id} className="card">
                    <div className="flex justify-between items-center" style={{ marginBottom: 12 }}>
                      <div className="flex gap-2">
                        <span className={`badge ${job.type === 'internship' ? 'info' : 'success'}`}>{job.type}</span>
                        <span className={`badge ${job.status}`}>{job.status}</span>
                      </div>
                      <button className="btn btn-danger btn-sm" style={{ padding: 6 }}><HiOutlineTrash /></button>
                    </div>
                    <h3 style={{ fontSize: 18, fontWeight: 700, marginBottom: 6 }}>{job.title}</h3>
                    <p style={{ color: 'var(--text-secondary)', fontSize: 14, marginBottom: 4 }}>{job.company} • {job.location}</p>
                    <p style={{ color: 'var(--primary-400)', fontWeight: 600 }}>{job.salary}</p>
                    <div style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 8, marginBottom: 8 }}>
                      Skills: {job.skills} | Deadline: {job.deadline}
                    </div>
                    <div className="flex justify-between items-center" style={{ marginTop: 8 }}>
                      <span style={{ fontSize: 13, color: 'var(--text-secondary)' }}>📩 {job.applications} applications</span>
                      <button className="btn btn-secondary btn-sm"><HiOutlineEye /> View</button>
                    </div>
                  </div>
                ))}
              </div>

              {showJobModal && (
                <div className="modal-overlay" onClick={() => setShowJobModal(false)}>
                  <div className="modal" onClick={e => e.stopPropagation()}>
                    <h2>Post New Job/Internship</h2>
                    <div className="form-group">
                      <label className="form-label">Job Title</label>
                      <input className="form-input" placeholder="e.g. Software Engineer Intern" style={{ width: '100%' }} />
                    </div>
                    <div className="grid-2">
                      <div className="form-group">
                        <label className="form-label">Company</label>
                        <input className="form-input" placeholder="Company name" style={{ width: '100%' }} />
                      </div>
                      <div className="form-group">
                        <label className="form-label">Type</label>
                        <select className="form-select">
                          <option value="job">Full-Time Job</option>
                          <option value="internship">Internship</option>
                        </select>
                      </div>
                    </div>
                    <div className="grid-2">
                      <div className="form-group">
                        <label className="form-label">Location</label>
                        <input className="form-input" placeholder="City / Remote" style={{ width: '100%' }} />
                      </div>
                      <div className="form-group">
                        <label className="form-label">Salary / Stipend</label>
                        <input className="form-input" placeholder="e.g. ₹15 LPA" style={{ width: '100%' }} />
                      </div>
                    </div>
                    <div className="form-group">
                      <label className="form-label">Description</label>
                      <textarea className="form-textarea" placeholder="Job description..." style={{ width: '100%' }} rows={3} />
                    </div>
                    <div className="grid-2">
                      <div className="form-group">
                        <label className="form-label">Required Skills</label>
                        <input className="form-input" placeholder="Python, React, SQL" style={{ width: '100%' }} />
                      </div>
                      <div className="form-group">
                        <label className="form-label">Application Deadline</label>
                        <input type="date" className="form-input" style={{ width: '100%' }} />
                      </div>
                    </div>
                    <div className="modal-actions">
                      <button className="btn btn-secondary" onClick={() => setShowJobModal(false)}>Cancel</button>
                      <button className="btn btn-primary" onClick={() => setShowJobModal(false)}>Post Job</button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* ═══ Applications ═══ */}
          {activeTab === 'applications' && (
            <div className="slide-up">
              <div className="page-header">
                <h1>Applications</h1>
                <p>Review and manage student job applications</p>
              </div>
              <div className="table-container">
                <DataTable
                  columns={[
                    { key: 'student', label: 'Student', render: (v, row) => (
                      <div>
                        <strong>{v}</strong>
                        <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>{row.roll} • CGPA: {row.cgpa}</div>
                      </div>
                    )},
                    { key: 'job', label: 'Applied For' },
                    { key: 'skills', label: 'Skills', render: (v) => (
                      <div style={{ fontSize: 12 }}>{v.split(',').slice(0, 3).map((s, i) => (
                        <span key={i} className="badge info" style={{ marginRight: 4, marginBottom: 2 }}>{s.trim()}</span>
                      ))}</div>
                    )},
                    { key: 'applied', label: 'Applied On' },
                    { key: 'status', label: 'Status', render: (v) => <span className={`badge ${v}`}>{v}</span> },
                    { key: 'id', label: 'Actions', render: (_, row) => (
                      <div className="flex gap-2">
                        {row.status === 'pending' && (
                          <>
                            <button className="btn btn-success btn-sm">Shortlist</button>
                            <button className="btn btn-danger btn-sm">Reject</button>
                          </>
                        )}
                        {row.status === 'shortlisted' && (
                          <button className="btn btn-success btn-sm">Accept</button>
                        )}
                      </div>
                    )},
                  ]}
                  data={DEMO_APPLICATIONS}
                />
              </div>
            </div>
          )}

          {/* ═══ Student Profiles ═══ */}
          {activeTab === 'students' && (
            <div className="slide-up">
              <div className="page-header">
                <h1>Student Profiles</h1>
                <p>Browse student profiles with skill-based filtering</p>
              </div>

              <div className="card mb-6">
                <div className="flex gap-4 items-center" style={{ flexWrap: 'wrap' }}>
                  <div className="form-group" style={{ marginBottom: 0, flex: '1 1 300px' }}>
                    <label className="form-label">Filter by Skills</label>
                    <input className="form-input" placeholder="e.g. Python, React, ML"
                      value={skillFilter} onChange={e => setSkillFilter(e.target.value)}
                      style={{ width: '100%' }} />
                  </div>
                  <div style={{ paddingTop: 20 }}>
                    <span style={{ fontSize: 13, color: 'var(--text-muted)' }}>Showing {filteredStudents.length} students</span>
                  </div>
                </div>
              </div>

              <div className="table-container">
                <DataTable
                  columns={[
                    { key: 'name', label: 'Student', render: (v, row) => (
                      <div>
                        <strong>{v}</strong>
                        <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>{row.roll} • {row.dept} • Year {row.year}</div>
                      </div>
                    )},
                    { key: 'email', label: 'Email' },
                    { key: 'cgpa', label: 'CGPA', render: (v) => (
                      <span style={{ fontWeight: 700, color: v >= 8.5 ? 'var(--success)' : v >= 7 ? 'var(--warning)' : 'var(--danger)' }}>{v}</span>
                    )},
                    { key: 'skills', label: 'Skills', render: (v) => (
                      <div style={{ fontSize: 12, maxWidth: 250 }}>{v.split(',').map((s, i) => (
                        <span key={i} className="badge info" style={{ marginRight: 4, marginBottom: 2 }}>{s.trim()}</span>
                      ))}</div>
                    )},
                    { key: 'applications', label: 'Applications' },
                  ]}
                  data={filteredStudents}
                />
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
