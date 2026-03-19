import { useAuth } from '../context/AuthContext'
import { useNavigate, useLocation } from 'react-router-dom'
import { HiOutlineAcademicCap, HiOutlineCalendar, HiOutlineClipboardCheck, HiOutlineDocumentText,
  HiOutlineChartBar, HiOutlineBriefcase, HiOutlineChatAlt2, HiOutlineBell, HiOutlineLogout,
  HiOutlineUsers, HiOutlineOfficeBuilding, HiOutlineCog, HiOutlineDocumentReport,
  HiOutlineClipboardList, HiOutlineUserGroup, HiOutlineHome } from 'react-icons/hi'

const navConfig = {
  student: {
    title: 'Student Portal',
    items: [
      { label: 'Dashboard', icon: HiOutlineHome, path: '/student' },
      { label: 'Timetable', icon: HiOutlineCalendar, path: '/student/timetable' },
      { label: 'Attendance', icon: HiOutlineClipboardCheck, path: '/student/attendance' },
      { label: 'Assignments', icon: HiOutlineDocumentText, path: '/student/assignments' },
      { label: 'Marks & Results', icon: HiOutlineChartBar, path: '/student/marks' },
      { section: 'Placement' },
      { label: 'Job Opportunities', icon: HiOutlineBriefcase, path: '/student/jobs' },
      { section: 'Support' },
      { label: 'AI Assistant', icon: HiOutlineChatAlt2, path: '/student/chat' },
      { label: 'Notifications', icon: HiOutlineBell, path: '/student/notifications' },
    ]
  },
  faculty: {
    title: 'Faculty Panel',
    items: [
      { label: 'Dashboard', icon: HiOutlineHome, path: '/faculty' },
      { label: 'My Courses', icon: HiOutlineAcademicCap, path: '/faculty/courses' },
      { label: 'Mark Attendance', icon: HiOutlineClipboardCheck, path: '/faculty/attendance' },
      { label: 'Assignments', icon: HiOutlineDocumentText, path: '/faculty/assignments' },
      { label: 'Enter Marks', icon: HiOutlineChartBar, path: '/faculty/marks' },
      { label: 'Announcements', icon: HiOutlineBell, path: '/faculty/announcements' },
    ]
  },
  admin: {
    title: 'Admin Panel',
    items: [
      { label: 'Dashboard', icon: HiOutlineHome, path: '/admin' },
      { section: 'Management' },
      { label: 'Users', icon: HiOutlineUsers, path: '/admin/users' },
      { label: 'Departments', icon: HiOutlineOfficeBuilding, path: '/admin/departments' },
      { label: 'Courses', icon: HiOutlineAcademicCap, path: '/admin/courses' },
      { section: 'Reports' },
      { label: 'Attendance Report', icon: HiOutlineDocumentReport, path: '/admin/reports/attendance' },
      { label: 'Performance Report', icon: HiOutlineChartBar, path: '/admin/reports/performance' },
      { section: 'Communication' },
      { label: 'Notifications', icon: HiOutlineBell, path: '/admin/notifications' },
    ]
  },
  placement_officer: {
    title: 'Placement Portal',
    items: [
      { label: 'Dashboard', icon: HiOutlineHome, path: '/placement' },
      { label: 'Job Postings', icon: HiOutlineBriefcase, path: '/placement/jobs' },
      { label: 'Applications', icon: HiOutlineClipboardList, path: '/placement/applications' },
      { label: 'Student Profiles', icon: HiOutlineUserGroup, path: '/placement/students' },
    ]
  }
}

export default function Sidebar({ isOpen, onClose }) {
  const { profile, logout } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()

  const role = profile?.role || 'student'
  const nav = navConfig[role] || navConfig.student

  const handleNav = (path) => {
    navigate(path)
    onClose?.()
  }

  const handleLogout = async () => {
    await logout()
    navigate('/login')
  }

  const isActive = (path) => {
    if (path === `/${role}` || path === `/${role === 'placement_officer' ? 'placement' : role}`) {
      return location.pathname === path
    }
    return location.pathname.startsWith(path)
  }

  return (
    <aside className={`sidebar ${isOpen ? 'open' : ''}`}>
      <div className="sidebar-brand">
        <div className="sidebar-brand-icon">CC</div>
        <div>
          <h1>CampusConnect</h1>
          <span>{nav.title}</span>
        </div>
      </div>

      <nav className="sidebar-nav">
        {nav.items.map((item, i) =>
          item.section ? (
            <div key={i} className="sidebar-section-title">{item.section}</div>
          ) : (
            <button
              key={item.path}
              className={`sidebar-link ${isActive(item.path) ? 'active' : ''}`}
              onClick={() => handleNav(item.path)}
            >
              <item.icon />
              {item.label}
            </button>
          )
        )}
      </nav>

      <div className="sidebar-footer">
        <div className="sidebar-user">
          <div className="sidebar-avatar">
            {profile?.name?.charAt(0)?.toUpperCase() || 'U'}
          </div>
          <div className="sidebar-user-info">
            <div className="sidebar-user-name">{profile?.name || 'User'}</div>
            <div className="sidebar-user-role">{role.replace('_', ' ')}</div>
          </div>
        </div>
        <button className="sidebar-link" onClick={handleLogout} style={{ marginTop: 8, color: 'var(--danger)' }}>
          <HiOutlineLogout />
          Sign Out
        </button>
      </div>
    </aside>
  )
}
