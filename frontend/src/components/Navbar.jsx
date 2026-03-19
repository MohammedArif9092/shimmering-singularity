import { HiOutlineMenu, HiOutlineBell } from 'react-icons/hi'
import { useAuth } from '../context/AuthContext'

export default function Navbar({ title, onMenuClick }) {
  const { profile } = useAuth()

  return (
    <header className="navbar">
      <div className="navbar-left">
        <button className="mobile-menu-btn" onClick={onMenuClick}>
          <HiOutlineMenu />
        </button>
        <h2 className="navbar-title">{title}</h2>
      </div>
      <div className="navbar-right">
        <button className="btn btn-secondary btn-sm" style={{ borderRadius: '50%', padding: '8px' }}>
          <HiOutlineBell style={{ fontSize: 18 }} />
        </button>
        <div className="sidebar-avatar" style={{ width: 32, height: 32, fontSize: 13 }}>
          {profile?.name?.charAt(0)?.toUpperCase() || 'U'}
        </div>
      </div>
    </header>
  )
}
