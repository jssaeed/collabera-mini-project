import { Dropdown, Menu } from 'antd'
import type { MenuProps } from 'antd'
import { Link, useLocation, useNavigate } from 'react-router'
import { useCurrentUser } from '../context/useCurrentUser'
import './Header.css'

const navItems: MenuProps['items'] = [
  { key: '/', label: <Link to="/">Home</Link> },
  { key: '/about', label: <Link to="/about">About</Link> },
  { key: '/contact', label: <Link to="/contact">Contact Us</Link> },
  { key: '/account', label: <Link to="/account">Account</Link> },
]

function Header() {
  const location = useLocation()
  const navigate = useNavigate()
  const { session, logout } = useCurrentUser()

  function handleSignOut() {
    logout()
    navigate('/')
  }

  return (
    <header className="site-header">
      <Link className="brand" to="/">
        Collabera Bank
      </Link>
      <Menu
        className="site-nav"
        mode="horizontal"
        selectedKeys={[location.pathname]}
        items={navItems}
        style={{ borderBottom: 'none', background: 'transparent' }}
      />
      {session ? (
        <Dropdown
          trigger={['click']}
          menu={{ items: [{ key: 'sign-out', label: 'Sign out', onClick: handleSignOut }] }}
        >
          <button type="button" className="btn btn-primary">
            {session.kind === 'admin' ? 'Admin' : session.email}
          </button>
        </Dropdown>
      ) : (
        <Link className="btn btn-primary" to="/login">
          Log in
        </Link>
      )}
    </header>
  )
}

export default Header
