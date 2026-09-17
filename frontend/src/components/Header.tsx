import { Avatar, Button, Dropdown, Menu, Space } from "antd";
import type { MenuProps } from "antd";
import { Link, useLocation, useNavigate } from "react-router";
import { useCurrentUser } from "../context/useCurrentUser";
import "./Header.css";

const navItems: MenuProps["items"] = [
  { key: "/", label: <Link to="/">Home</Link> },
  { key: "/about", label: <Link to="/about">About</Link> },
  { key: "/contact", label: <Link to="/contact">Contact Us</Link> },
  { key: "/account", label: <Link to="/account">Account</Link> },
];

function Header() {
  const location = useLocation();
  const navigate = useNavigate();
  const { session, logout } = useCurrentUser();

  function handleSignOut() {
    logout();
    navigate("/");
  }

  return (
    <header className="site-header">
      <div className="site-header-inner">
        <Link className="brand" to="/" aria-label="Collabera Bank home">
          <span className="brand-mark" aria-hidden="true">
            CB
          </span>
          <span>
            Collabera <span className="brand-secondary">Bank</span>
          </span>
        </Link>

        <nav className="site-navigation" aria-label="Main navigation">
          <Menu
            className="site-nav"
            mode="horizontal"
            selectedKeys={[location.pathname]}
            items={navItems}
          />
        </nav>

        <div className="header-actions">
          {session ? (
            <Dropdown
              trigger={["click"]}
              menu={{
                items: [
                  {
                    key: "account",
                    label: "Account overview",
                    onClick: () => navigate("/account"),
                  },
                  { type: "divider" },
                  {
                    key: "sign-out",
                    label: "Sign out",
                    onClick: handleSignOut,
                  },
                ],
              }}
            >
              <Button className="session-button" aria-label="Open profile menu">
                <Space size={8}>
                  <Avatar size={24} style={{ backgroundColor: "#0f766e" }}>
                    {session.kind === "admin"
                      ? "A"
                      : session.email.charAt(0).toUpperCase()}
                  </Avatar>
                  <span className="session-label">
                    {session.kind === "admin" ? "Admin" : session.email}
                  </span>
                  <span aria-hidden="true">▾</span>
                </Space>
              </Button>
            </Dropdown>
          ) : (
            <Button type="primary" onClick={() => navigate("/login")}>
              Log in
            </Button>
          )}
        </div>
      </div>
    </header>
  );
}

export default Header;
