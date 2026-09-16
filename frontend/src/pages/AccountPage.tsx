import { useEffect, useState } from 'react'
import {
  Alert,
  Button,
  Card,
  InputNumber,
  message,
  Modal,
  Select,
  Space,
  Spin,
  Statistic,
  Table,
  Typography,
} from 'antd'
import type { TableColumnsType } from 'antd'
import { isAxiosError } from 'axios'
import { Link } from 'react-router'
import { createAccount, deposit, listAccounts, withdraw, type Account } from '../api/accounts'
import { listAccountTransactions, type Transaction } from '../api/transactions'
import { useCurrentUser } from '../context/useCurrentUser'
import AdminPage from './AdminPage'
import './AccountPage.css'

const { Title, Paragraph } = Typography

type ActionModalState = { accountId: number; action: 'deposit' | 'withdraw' } | null
type HistoryModalState = { accountId: number; accountType: string } | null

function capitalize(value: string) {
  return value.charAt(0).toUpperCase() + value.slice(1)
}

function formatDate(iso: string) {
  const date = new Date(iso)
  const datePart = new Intl.DateTimeFormat('en-US', {
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  }).format(date)
  const timePart = new Intl.DateTimeFormat('en-US', {
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
  })
    .format(date)
    .replace('AM', 'am')
    .replace('PM', 'pm')
  return `${datePart}, ${timePart}`
}

const transactionColumns: TableColumnsType<Transaction> = [
  {
    title: 'Type',
    dataIndex: 'txn_type',
    key: 'txn_type',
    sorter: (a, b) => a.txn_type.localeCompare(b.txn_type),
    render: (value: string) => capitalize(value),
  },
  {
    title: 'Amount',
    dataIndex: 'amount',
    key: 'amount',
    render: (value: string) => `$${value}`,
  },
  {
    title: 'Date',
    dataIndex: 'created_at',
    key: 'created_at',
    render: (value: string) => formatDate(value),
  },
]

function TransactionHistoryModalBody({ accountId, accountType }: { accountId: number; accountType: string }) {
  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    listAccountTransactions(accountId)
      .then(setTransactions)
      .catch(() => setError('Could not load transaction history.'))
      .finally(() => setLoading(false))
  }, [accountId])

  return (
    <>
      <Paragraph>{capitalize(accountType)} account</Paragraph>
      {loading ? (
        <Spin />
      ) : error ? (
        <Alert type="error" message={error} showIcon />
      ) : (
        <Table
          rowKey="txn_id"
          dataSource={transactions}
          columns={transactionColumns}
          pagination={{ pageSize: 7 }}
        />
      )}
    </>
  )
}

function TransactionHistoryModal({
  state,
  onClose,
}: {
  state: HistoryModalState
  onClose: () => void
}) {
  return (
    <Modal
      title="Transaction history"
      open={state !== null}
      onCancel={onClose}
      footer={null}
      width={640}
    >
      {state && <TransactionHistoryModalBody key={state.accountId} accountId={state.accountId} accountType={state.accountType} />}
    </Modal>
  )
}

function UserAccountsView({ userId, name }: { userId: number; name: string }) {
  const [accounts, setAccounts] = useState<Account[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [actionModal, setActionModal] = useState<ActionModalState>(null)
  const [historyModal, setHistoryModal] = useState<HistoryModalState>(null)
  const [amount, setAmount] = useState<number | null>(null)
  const [submitting, setSubmitting] = useState(false)

  const [createModalOpen, setCreateModalOpen] = useState(false)
  const [newAccountType, setNewAccountType] = useState('checking')
  const [newInitialDeposit, setNewInitialDeposit] = useState<number | null>(null)
  const [creatingAccount, setCreatingAccount] = useState(false)

  useEffect(() => {
    listAccounts()
      .then((allAccounts) => setAccounts(allAccounts.filter((a) => a.user_id === userId)))
      .catch(() => setError('Could not load your accounts.'))
      .finally(() => setLoading(false))
  }, [userId])

  function closeActionModal() {
    setActionModal(null)
    setAmount(null)
  }

  async function handleConfirm() {
    if (!actionModal || !amount || amount <= 0) return

    setSubmitting(true)
    try {
      const action = actionModal.action === 'deposit' ? deposit : withdraw
      const updated = await action(actionModal.accountId, amount)
      setAccounts((prev) => prev.map((a) => (a.account_id === updated.account_id ? updated : a)))
      message.success(actionModal.action === 'deposit' ? 'Deposit successful.' : 'Withdrawal successful.')
      closeActionModal()
    } catch (err) {
      const serverError = isAxiosError<{ error?: string }>(err) ? err.response?.data?.error : null
      message.error(serverError ?? 'Something went wrong. Please try again.')
    } finally {
      setSubmitting(false)
    }
  }

  function closeCreateModal() {
    setCreateModalOpen(false)
    setNewAccountType('checking')
    setNewInitialDeposit(null)
  }

  async function handleCreateAccount() {
    setCreatingAccount(true)
    try {
      const created = await createAccount(userId, newAccountType, newInitialDeposit ?? 0)
      setAccounts((prev) => [...prev, created])
      message.success('Account created.')
      closeCreateModal()
    } catch (err) {
      const serverError = isAxiosError<{ error?: string }>(err) ? err.response?.data?.error : null
      message.error(serverError ?? 'Something went wrong. Please try again.')
    } finally {
      setCreatingAccount(false)
    }
  }

  if (loading) return <Spin />
  if (error) return <Alert type="error" message={error} showIcon />

  return (
    <>
      <div className="account-page-header">
        <Title level={1}>Welcome, {name}</Title>
        <Button onClick={() => setCreateModalOpen(true)}>Create account</Button>
      </div>

      {accounts.length === 0 ? (
        <Paragraph>You don't have any accounts yet.</Paragraph>
      ) : (
        <div className="account-cards">
          {accounts.map((account) => (
            <Card
              key={account.account_id}
              className="account-card"
              title={
                <button
                  type="button"
                  className="account-card-title"
                  onClick={() =>
                    setHistoryModal({ accountId: account.account_id, accountType: account.account_type })
                  }
                >
                  <span>{capitalize(account.account_type)} account</span>
                  <span className="account-card-arrow">&rsaquo;</span>
                </button>
              }
            >
              <Statistic
                title="Balance"
                value={Number(account.balance)}
                precision={2}
                prefix="$"
                valueStyle={{ fontSize: 40, fontWeight: 600 }}
              />
              <Space>
                <Button
                  type="primary"
                  onClick={() => setActionModal({ accountId: account.account_id, action: 'deposit' })}
                >
                  Deposit
                </Button>
                <Button onClick={() => setActionModal({ accountId: account.account_id, action: 'withdraw' })}>
                  Withdraw
                </Button>
              </Space>
            </Card>
          ))}
        </div>
      )}

      <Modal
        title={actionModal?.action === 'deposit' ? 'Deposit' : 'Withdraw'}
        open={actionModal !== null}
        onCancel={closeActionModal}
        onOk={handleConfirm}
        okButtonProps={{ disabled: !amount || amount <= 0, loading: submitting }}
      >
        <InputNumber
          autoFocus
          style={{ width: '100%' }}
          min={0.01}
          precision={2}
          prefix="$"
          placeholder="Amount"
          value={amount}
          onChange={setAmount}
        />
      </Modal>

      <TransactionHistoryModal state={historyModal} onClose={() => setHistoryModal(null)} />

      <Modal
        title="Create account"
        open={createModalOpen}
        onCancel={closeCreateModal}
        onOk={handleCreateAccount}
        okButtonProps={{ loading: creatingAccount }}
      >
        <Space direction="vertical" style={{ width: '100%' }} size="middle">
          <div>
            <Paragraph strong>Account type</Paragraph>
            <Select
              style={{ width: '100%' }}
              value={newAccountType}
              onChange={setNewAccountType}
              options={[
                { value: 'checking', label: 'Checking' },
                { value: 'savings', label: 'Savings' },
                { value: 'other', label: 'Other' },
              ]}
            />
          </div>
          <div>
            <Paragraph strong>Initial deposit</Paragraph>
            <InputNumber
              style={{ width: '100%' }}
              min={0}
              precision={2}
              prefix="$"
              placeholder="0.00"
              value={newInitialDeposit}
              onChange={setNewInitialDeposit}
            />
          </div>
        </Space>
      </Modal>
    </>
  )
}

function AccountPage() {
  const { session } = useCurrentUser()

  if (!session) {
    return (
      <section className="static-page account-page-tight">
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
    <section className="static-page account-page account-page-tight">
      <UserAccountsView userId={session.user_id} name={session.name} />
    </section>
  )
}

export default AccountPage
