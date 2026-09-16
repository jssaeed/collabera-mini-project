import { Descriptions, Typography } from 'antd'
import { Link } from 'react-router'
import { useCurrentUser } from '../context/useCurrentUser'
import AdminPage from './AdminPage'

const { Title, Paragraph } = Typography

function AccountPage() {
  const { session } = useCurrentUser()

  if (!session) {
    return (
      <section className="static-page">
        <Title level={1}>Account</Title>
        <Paragraph>
          <Link to="/login">Log in</Link> to view your balance and transaction history.
        </Paragraph>
      </section>
    )
  }

  if (session.kind === 'admin') {
    return <AdminPage />
  }

  return (
    <section className="static-page">
      <Title level={1}>Account</Title>
      <Descriptions bordered column={1}>
        <Descriptions.Item label="Name">{session.name}</Descriptions.Item>
        <Descriptions.Item label="Email">{session.email}</Descriptions.Item>
      </Descriptions>
    </section>
  )
}

export default AccountPage
