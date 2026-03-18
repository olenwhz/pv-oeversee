import React from 'react'
import { NavLink } from 'react-router-dom'

const styles = {
  sidebar: {
    width: 240,
    minHeight: '100vh',
    background: '#ffffff',
    borderRight: '1px solid #e8e8ed',
    padding: '24px 0',
    display: 'flex',
    flexDirection: 'column',
    position: 'sticky',
    top: 0,
    overflowY: 'auto',
  },
  logo: {
    padding: '0 20px 24px',
    borderBottom: '1px solid #e8e8ed',
    marginBottom: 8,
  },
  logoText: {
    fontSize: 13,
    fontWeight: 600,
    letterSpacing: '0.1em',
    color: '#1d1d1f',
    textTransform: 'uppercase',
  },
  logoSub: {
    fontSize: 11,
    color: '#86868b',
    marginTop: 2,
  },
  section: {
    padding: '8px 0',
    borderBottom: '1px solid #e8e8ed',
    marginBottom: 4,
  },
  sectionLabel: {
    fontSize: 11,
    fontWeight: 500,
    color: '#86868b',
    letterSpacing: '0.08em',
    textTransform: 'uppercase',
    padding: '4px 20px 8px',
  },
  userBar: {
    marginTop: 'auto',
    borderTop: '1px solid #e8e8ed',
    padding: '16px 20px',
  },
  userName: {
    fontSize: 12,
    fontWeight: 500,
    color: '#1d1d1f',
    marginBottom: 2,
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap',
  },
  userRole: {
    fontSize: 11,
    color: '#86868b',
    marginBottom: 10,
  },
  logoutBtn: {
    width: '100%',
    padding: '7px 0',
    background: 'transparent',
    border: '1px solid #d2d2d7',
    borderRadius: 6,
    fontSize: 12,
    color: '#86868b',
    cursor: 'pointer',
    transition: 'border-color 0.15s, color 0.15s',
  },
}

function NavItem({ to, label }) {
  return (
    <NavLink
      to={to}
      style={({ isActive }) => ({
        display: 'block',
        padding: '7px 20px',
        fontSize: 14,
        color: isActive ? '#0071e3' : '#1d1d1f',
        background: isActive ? '#f0f7ff' : 'transparent',
        borderRadius: 0,
        textDecoration: 'none',
        fontWeight: isActive ? 500 : 400,
        transition: 'background 0.15s, color 0.15s',
      })}
    >
      {label}
    </NavLink>
  )
}

export default function Sidebar({ user, onLogout }) {
  return (
    <nav style={styles.sidebar}>
      <div style={styles.logo}>
        <div style={styles.logoText}>☀ PV-Park</div>
        <div style={styles.logoSub}>Finanzrechner 10,7 MWp</div>
      </div>

      <div style={styles.section}>
        <NavItem to="/" label="Dashboard" />
        <NavItem to="/parameters" label="Parameter" />
        <NavItem to="/optimierungen" label="Optimierungen" />
      </div>

      <div style={styles.section}>
        <div style={styles.sectionLabel}>Handlungsmodelle</div>
        <NavItem to="/hm/hm1" label="HM1 Details" />
        <NavItem to="/hm/hm2" label="HM2 Details" />
        <NavItem to="/hm/hm3" label="HM3 Details" />
        <NavItem to="/hm/hm4" label="HM4 Details" />
        <NavItem to="/hm/hm5" label="HM5 Details" />
        <NavItem to="/hm/hm6" label="HM6 Details" />
      </div>

      <div style={styles.section}>
        <div style={styles.sectionLabel}>Datenblätter</div>
        <NavItem to="/zahlungsreihen" label="Zahlungsreihen" />
        <NavItem to="/ertraege" label="Erträge" />
        <NavItem to="/strompreise" label="Strompreise" />
        <NavItem to="/batterietabellen" label="Batterietabellen" />
        <NavItem to="/kennzahlen" label="Kennzahlen" />
      </div>

      <div style={styles.userBar}>
        <div style={styles.userName}>{user}</div>
        <div style={styles.userRole}>Admin</div>
        <button
          style={styles.logoutBtn}
          onClick={onLogout}
          onMouseEnter={e => { e.target.style.borderColor = '#0071e3'; e.target.style.color = '#0071e3' }}
          onMouseLeave={e => { e.target.style.borderColor = '#d2d2d7'; e.target.style.color = '#86868b' }}
        >
          Abmelden
        </button>
      </div>
    </nav>
  )
}
