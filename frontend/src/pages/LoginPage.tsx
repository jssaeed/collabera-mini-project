import { useEffect, useState } from "react";
import { Alert, Button, Card, Form, Select, Spin, Typography } from "antd";
import { useNavigate } from "react-router";
import { listUsers, type User } from "../api/users";
import { useCurrentUser } from "../context/useCurrentUser";

const { Title, Paragraph } = Typography;

const ADMIN_VALUE = "admin";

function LoginPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selected, setSelected] = useState<string | undefined>(undefined);

  const { login } = useCurrentUser();
  const navigate = useNavigate();

  useEffect(() => {
    listUsers()
      .then(setUsers)
      .catch(() => setError("Could not load users. Is the backend running?"))
      .finally(() => setLoading(false));
  }, []);

  const options = [
    { value: ADMIN_VALUE, label: "Admin (view all users)" },
    ...users.map((user) => ({
      value: String(user.user_id),
      label: user.email,
    })),
  ];

  function handleLogIn() {
    if (!selected) return;

    if (selected === ADMIN_VALUE) {
      login({ kind: "admin" });
    } else {
      const user = users.find(
        (candidate) => String(candidate.user_id) === selected,
      );
      if (!user) return;
      login({ kind: "user", ...user });
    }

    navigate("/account");
  }

  return (
    <section className="static-page login-page">
      <Card className="login-card">
        <span className="page-eyebrow">Collabera Bank</span>
        <Title level={1}>Welcome back</Title>
        <Paragraph type="secondary">
          Choose a demo profile to explore the account dashboard.
        </Paragraph>

        <Alert
          className="login-notice"
          type="warning"
          showIcon
          message="Development access only"
          description="This demo has no password verification. User and admin selection are not secure authentication."
        />

        {error && (
          <Alert
            className="login-notice"
            type="error"
            message={error}
            showIcon
          />
        )}

        {loading ? (
          <div className="page-loading" role="status">
            <Spin />
            <span>Loading profiles…</span>
          </div>
        ) : (
          <Form layout="vertical" onFinish={handleLogIn} requiredMark={false}>
            <Form.Item label="Demo profile" htmlFor="demo-profile">
              <Select
                id="demo-profile"
                style={{ width: "100%" }}
                size="large"
                showSearch
                optionFilterProp="label"
                placeholder="Select a profile"
                options={options}
                value={selected}
                onChange={setSelected}
              />
            </Form.Item>
            <Button
              type="primary"
              size="large"
              htmlType="submit"
              block
              disabled={!selected}
            >
              Continue to dashboard
            </Button>
          </Form>
        )}
      </Card>
    </section>
  );
}

export default LoginPage;
