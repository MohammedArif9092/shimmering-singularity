export default function StatsCard({ icon: Icon, label, value, color = 'purple', change }) {
  return (
    <div className={`stat-card ${color}`}>
      <div className={`stat-icon ${color}`}>
        <Icon />
      </div>
      <div className="stat-info">
        <h3>{value}</h3>
        <p>{label}</p>
        {change && (
          <div className={`stat-change ${change > 0 ? 'up' : 'down'}`}>
            {change > 0 ? '↑' : '↓'} {Math.abs(change)}%
          </div>
        )}
      </div>
    </div>
  )
}
