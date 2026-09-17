import { useState } from "react";
import { Alert, Button, Card, Form, Input, Typography } from "antd";
import { isAxiosError } from "axios";
import { useNavigate } from "react-router";
import { createUser } from "../api/auth";
import { useCurrentUser } from "../context/useCurrentUser";

const { Title, Paragraph } = Typography;

function SignupPage() {
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const { login } = useCurrentUser();
  const navigate = useNavigate();

  async function handleSignUp(values: {
    name: string;
    email: string;
    password: string;
  }) {
    setSubmitting(true);
    setError(null);
    try {
      await createUser(values.name, values.email, values.password);
      await login(values.email, values.password);
      navigate("/account");
    } catch (err) {
      const status = isAxiosError(err) ? err.response?.status : null;
      setError(
        status === 409
          ? "An account with that email already exists."
          : status === 400
            ? "Please check your details and try again."
            : "Could not create account. Please try again.",
      );
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <section className="static-page login-page">
      <Card className="login-card">
        <span className="page-eyebrow">Collabera Bank</span>
        <Title level={1}>Create your account</Title>
        <Paragraph type="secondary">
          Sign up to start banking with us.
        </Paragraph>

        {error && (
          <Alert className="login-notice" type="error" message={error} showIcon />
        )}

        <Form layout="vertical" onFinish={handleSignUp} requiredMark={false}>
          <Form.Item
            name="name"
            label="Full name"
            rules={[{ required: true, message: "Name is required." }]}
          >
            <Input size="large" autoComplete="name" autoFocus />
          </Form.Item>
          <Form.Item
            name="email"
            label="Email"
            rules={[{ required: true, message: "Email is required." }]}
          >
            <Input size="large" type="email" autoComplete="email" />
          </Form.Item>
          <Form.Item
            name="password"
            label="Password"
            rules={[{ required: true, message: "Password is required." }]}
          >
            <Input.Password size="large" autoComplete="new-password" />
          </Form.Item>
          <Button
            type="primary"
            size="large"
            htmlType="submit"
            block
            loading={submitting}
          >
            Create account
          </Button>
        </Form>
      </Card>
    </section>
  );
}

export default SignupPage;
