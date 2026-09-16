import { useEffect, useState } from 'react'
import { Alert, Button, Select, Spin, Typography } from 'antd'
import { useNavigate } from 'react-router'
import { listUsers, type User } from '../api/users'
import { useCurrentUser } from '../context/useCurrentUser'

const { Title, Paragraph } = Typography

const ADMIN_VALUE = 'admin'

function LoginPage() {
  const [users, setUsers] = useState<User[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [selected, setSelected] = useState<string | undefined>(undefined)

  const { login } = useCurrentUser()
  const navigate = useNavigate()

  useEffect(() => {
    listUsers()
      .then(setUsers)
      .catch(() => setError('Could not load users. Is the backend running?'))
      .finally(() => setLoading(false))
  }, [])

  const options = [
    { value: ADMIN_VALUE, label: 'Admin (view all users)' },
    ...users.map((user) => ({ value: String(user.user_id), label: user.email })),
  ]

  function handleLogIn() {
    if (!selected) return

    if (selected === ADMIN_VALUE) {
      login({ kind: 'admin' })
    } else {
      const user = users.find((candidate) => String(candidate.user_id) === selected)
      if (!user) return
      login({ kind: 'user', ...user })
    }

    navigate('/account')
  }

  return (
    <section className="static-page">
      <Title level={1}>Log in</Title>
      <Paragraph>
        This is a placeholder login for development — pick a user to "sign in" as. No password
        required.
      </Paragraph>

      {error && <Alert type="error" message={error} showIcon style={{ marginBottom: 24 }} />}

      {loading ? (
        <Spin />
      ) : (
        <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
          <Select
            style={{ minWidth: 280 }}
            placeholder="Select an email"
            options={options}
            value={selected}
            onChange={setSelected}
          />
          <Button type="primary" onClick={handleLogIn} disabled={!selected}>
            Log in
          </Button>
        </div>
      )}
    </section>
  )
}

export default LoginPage
