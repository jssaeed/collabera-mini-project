import { Button, Card, Col, Row, Space, Tag, Typography } from "antd";
import { useNavigate } from "react-router";
import { useCurrentUser } from "../context/useCurrentUser";
import { HeroIllustration } from "./illustrations";
import "./HomePage.css";

const { Title, Paragraph, Text } = Typography;

const features = [
  {
    title: "Your accounts, together",
    description:
      "View checking and savings accounts from one organized dashboard.",
  },
  {
    title: "A clearer transaction history",
    description:
      "Review deposits and withdrawals for each account in a straightforward table.",
  },
  {
    title: "Everyday account management",
    description:
      "Create accounts and try deposit and withdrawal workflows in this training app.",
  },
];

function HomePage() {
  const navigate = useNavigate();
  const { session } = useCurrentUser();

  return (
    <div className="home-page">
      <section className="hero" aria-labelledby="hero-title">
        <div className="hero-text">
          <Tag color="cyan">A fresh perspective on banking</Tag>
          <Title id="hero-title" level={1}>
            Less complexity.
            <br />
            More clarity.
          </Title>
          <Paragraph className="hero-subtitle">
            Your balances, accounts, and activity — brought together in one
            simple place.
          </Paragraph>
          <Space size="middle" wrap>
            <Button
              type="primary"
              size="large"
              onClick={() => navigate(session ? "/account" : "/login")}
            >
              {session ? "View my accounts" : "Explore the demo"}
            </Button>
            <Button size="large" onClick={() => navigate("/about")}>
              About the project
            </Button>
          </Space>
          <Text type="secondary" className="hero-note">
            Built for learning. No real money or banking services.
          </Text>
        </div>
        <div className="hero-illustration">
          <HeroIllustration />
        </div>
      </section>

      <section className="feature-section" aria-labelledby="features-title">
        <div className="feature-section-header">
          <span className="page-eyebrow">Designed around your day</span>
          <Title id="features-title" level={2}>
            Everything in a clearer view
          </Title>
          <Paragraph type="secondary">
            Familiar banking tasks, without the clutter.
          </Paragraph>
        </div>
        <Row gutter={[24, 24]}>
          {features.map((feature, index) => (
            <Col xs={24} md={8} key={feature.title}>
              <Card className="feature-card">
                <span className="feature-number" aria-hidden="true">
                  {String(index + 1).padStart(2, "0")}
                </span>
                <Title level={3}>{feature.title}</Title>
                <Paragraph type="secondary">{feature.description}</Paragraph>
              </Card>
            </Col>
          ))}
        </Row>
      </section>
    </div>
  );
}

export default HomePage;
