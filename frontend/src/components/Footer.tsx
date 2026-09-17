import { Space, Typography } from "antd";
import { Link } from "react-router";
import "./Footer.css";

function Footer() {
  return (
    <footer className="site-footer">
      <div className="site-footer-inner">
        <Space direction="vertical" size={4}>
          <Typography.Text strong>
            © {new Date().getFullYear()} Collabera Bank
          </Typography.Text>
          <Typography.Text type="secondary">
            Training application · Not a real banking service
          </Typography.Text>
        </Space>
        <nav aria-label="Footer navigation">
          <Space size="large">
            <Link to="/about">About</Link>
            <Link to="/contact">Contact</Link>
          </Space>
        </nav>
      </div>
    </footer>
  );
}

export default Footer;
