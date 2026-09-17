import { useEffect, useState } from "react";
import {
  Alert,
  Button,
  Card,
  InputNumber,
  Modal,
  Select,
  Space,
  Spin,
  Statistic,
  Table,
  Typography,
} from "antd";
import type { TableColumnsType } from "antd";
import { isAxiosError } from "axios";
import { Link } from "react-router";
import {
  createAccount,
  deposit,
  listAccounts,
  withdraw,
  type Account,
} from "../api/accounts";
import { listAccountTransactions, type Transaction } from "../api/transactions";
import { useCurrentUser } from "../context/useCurrentUser";
import AdminPage from "./AdminPage";
import "./AccountPage.css";
import { App as AntApp, Empty, Tag } from "antd";
import { DeleteOutlined } from "@ant-design/icons";
import { deleteAccount } from "../api/accounts";

const { Title, Paragraph } = Typography;

type ActionModalState = {
  accountId: number;
  action: "deposit" | "withdraw";
} | null;
type HistoryModalState = { accountId: number; accountType: string } | null;

function capitalize(value: string) {
  return value.charAt(0).toUpperCase() + value.slice(1);
}

function formatDate(iso: string) {
  const date = new Date(iso);
  const datePart = new Intl.DateTimeFormat("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
  }).format(date);
  const timePart = new Intl.DateTimeFormat("en-US", {
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  })
    .format(date)
    .replace("AM", "am")
    .replace("PM", "pm");
  return `${datePart}, ${timePart}`;
}

const transactionColumns: TableColumnsType<Transaction> = [
  {
    title: "Type",
    dataIndex: "txn_type",
    key: "txn_type",
    sorter: (a, b) => a.txn_type.localeCompare(b.txn_type),
    render: (value: string) => capitalize(value),
  },
  {
    title: "Amount",
    dataIndex: "amount",
    key: "amount",
    render: (value: string) => `$${value}`,
  },
  {
    title: "Date",
    dataIndex: "created_at",
    key: "created_at",
    render: (value: string) => formatDate(value),
  },
];

function TransactionHistoryModalBody({
  accountId,
  accountType,
}: {
  accountId: number;
  accountType: string;
}) {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    listAccountTransactions(accountId)
      .then(setTransactions)
      .catch(() => setError("Could not load transaction history."))
      .finally(() => setLoading(false));
  }, [accountId]);

  return (
    <>
      <Paragraph>{capitalize(accountType)} account</Paragraph>
      {loading ? (
        <div className="page-loading" role="status">
          <Spin />
          <span>Loading transactions…</span>
        </div>
      ) : error ? (
        <Alert type="error" message={error} showIcon />
      ) : (
        <Table
          rowKey="txn_id"
          dataSource={transactions}
          columns={transactionColumns}
          scroll={{ x: 520 }}
          pagination={{ pageSize: 7, showSizeChanger: false }}
          locale={{ emptyText: "No transactions for this account yet." }}
        />
      )}
    </>
  );
}

function TransactionHistoryModal({
  state,
  onClose,
}: {
  state: HistoryModalState;
  onClose: () => void;
}) {
  return (
    <Modal
      title="Transaction history"
      open={state !== null}
      onCancel={onClose}
      footer={null}
      width={640}
    >
      {state && (
        <TransactionHistoryModalBody
          key={state.accountId}
          accountId={state.accountId}
          accountType={state.accountType}
        />
      )}
    </Modal>
  );
}

function UserAccountsView({ userId, name }: { userId: number; name: string }) {
  const { message } = AntApp.useApp();
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [actionModal, setActionModal] = useState<ActionModalState>(null);
  const [historyModal, setHistoryModal] = useState<HistoryModalState>(null);
  const [amount, setAmount] = useState<number | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [accountToDelete, setAccountToDelete] = useState<Account | null>(null);
  const [deletingAccount, setDeletingAccount] = useState(false);

  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [newAccountType, setNewAccountType] = useState("checking");
  const [newInitialDeposit, setNewInitialDeposit] = useState<number | null>(
    null,
  );
  const [creatingAccount, setCreatingAccount] = useState(false);

  useEffect(() => {
    listAccounts()
      .then((allAccounts) =>
        setAccounts(allAccounts.filter((a) => a.user_id === userId)),
      )
      .catch(() => setError("Could not load your accounts."))
      .finally(() => setLoading(false));
  }, [userId]);

  function closeActionModal() {
    setActionModal(null);
    setAmount(null);
  }

  async function handleConfirm() {
    if (!actionModal || !amount || amount <= 0) return;

    setSubmitting(true);
    try {
      const action = actionModal.action === "deposit" ? deposit : withdraw;
      const updated = await action(actionModal.accountId, amount);
      setAccounts((prev) =>
        prev.map((a) => (a.account_id === updated.account_id ? updated : a)),
      );
      message.success(
        actionModal.action === "deposit"
          ? "Deposit successful."
          : "Withdrawal successful.",
      );
      closeActionModal();
    } catch (err) {
      const serverError = isAxiosError<{ error?: string }>(err)
        ? err.response?.data?.error
        : null;
      message.error(serverError ?? "Something went wrong. Please try again.");
    } finally {
      setSubmitting(false);
    }
  }

  function closeCreateModal() {
    setCreateModalOpen(false);
    setNewAccountType("checking");
    setNewInitialDeposit(null);
  }

  async function handleCreateAccount() {
    setCreatingAccount(true);
    try {
      const created = await createAccount(
        userId,
        newAccountType,
        newInitialDeposit ?? 0,
      );
      setAccounts((prev) => [...prev, created]);
      message.success("Account created.");
      closeCreateModal();
    } catch (err) {
      const serverError = isAxiosError<{ error?: string }>(err)
        ? err.response?.data?.error
        : null;
      message.error(serverError ?? "Something went wrong. Please try again.");
    } finally {
      setCreatingAccount(false);
    }
  }

  async function handleDeleteAccount() {
    if (!accountToDelete || deletingAccount) return;

    const accountId = accountToDelete.account_id;
    setDeletingAccount(true);

    try {
      await deleteAccount(accountId);
      setAccounts((previous) =>
        previous.filter((account) => account.account_id !== accountId),
      );
      setHistoryModal((previous) =>
        previous?.accountId === accountId ? null : previous,
      );
      setAccountToDelete(null);
      message.success("Bank account deleted.");
    } catch (err) {
      const serverError = isAxiosError<{ error?: string }>(err)
        ? err.response?.data?.error
        : null;
      message.error(
        serverError ?? "Could not delete the account. Please try again.",
      );
    } finally {
      setDeletingAccount(false);
    }
  }

  if (loading) {
    return (
      <div className="page-loading" role="status">
        <Spin />
        <span>Loading your accounts…</span>
      </div>
    );
  }
  if (error) return <Alert type="error" message={error} showIcon />;

  return (
    <>
      <div className="account-page-header">
        <div>
          <span className="page-eyebrow">Account overview</span>
          <Title level={1}>Welcome, {name}</Title>
          <Paragraph type="secondary">
            A clear view of your balances and everyday activity.
          </Paragraph>
        </div>
        <Button type="primary" onClick={() => setCreateModalOpen(true)}>
          Create account
        </Button>
      </div>

      <Card className="balance-overview">
        <div className="balance-overview-inner">
          <Statistic
            title="Total balance"
            value={accounts.reduce(
              (total, account) => total + Number(account.balance),
              0,
            )}
            precision={2}
            prefix="$"
          />
          <Statistic title="Accounts" value={accounts.length} />
          <Tag color="cyan">Demo banking</Tag>
        </div>
      </Card>

      <Title level={2} className="accounts-heading">
        Your accounts
      </Title>

      {accounts.length === 0 ? (
        <Card>
          <Empty
            image={Empty.PRESENTED_IMAGE_SIMPLE}
            description="Create your first account to get started."
          >
            <Button type="primary" onClick={() => setCreateModalOpen(true)}>
              Create account
            </Button>
          </Empty>
        </Card>
      ) : (
        <div className="account-cards">
          {accounts.map((account) => (
            <Card
              key={account.account_id}
              className="account-card"
              title={`${capitalize(account.account_type)} account`}
              extra={
                <Button
                  type="text"
                  danger
                  icon={<DeleteOutlined />}
                  title="Delete bank account"
                  aria-label={`Delete ${account.account_type} account`}
                  onClick={() => setAccountToDelete(account)}
                />
              }
            >
              <Statistic
                title="Current balance"
                value={Number(account.balance)}
                precision={2}
                prefix="$"
              />
              <Space wrap>
                <Button
                  type="primary"
                  onClick={() =>
                    setActionModal({
                      accountId: account.account_id,
                      action: "deposit",
                    })
                  }
                >
                  Deposit
                </Button>
                <Button
                  onClick={() =>
                    setActionModal({
                      accountId: account.account_id,
                      action: "withdraw",
                    })
                  }
                >
                  Withdraw
                </Button>
              </Space>
              <Button
                className="history-button"
                type="link"
                onClick={() =>
                  setHistoryModal({
                    accountId: account.account_id,
                    accountType: account.account_type,
                  })
                }
              >
                View transactions →
              </Button>
            </Card>
          ))}
        </div>
      )}

      <Modal
        title={actionModal?.action === "deposit" ? "Deposit" : "Withdraw"}
        open={actionModal !== null}
        onCancel={closeActionModal}
        onOk={handleConfirm}
        closable={!submitting}
        maskClosable={!submitting}
        keyboard={!submitting}
        cancelButtonProps={{ disabled: submitting }}
        okButtonProps={{
          disabled: !amount || amount <= 0,
          loading: submitting,
        }}
      >
        <label className="field-label" htmlFor="transaction-amount">
          Amount
        </label>
        <InputNumber
          id="transaction-amount"
          autoFocus
          style={{ width: "100%" }}
          min={0.01}
          precision={2}
          prefix="$"
          placeholder="0.00"
          value={amount}
          onChange={setAmount}
          disabled={submitting}
        />
      </Modal>

      <TransactionHistoryModal
        state={historyModal}
        onClose={() => setHistoryModal(null)}
      />

      <Modal
        title="Create account"
        open={createModalOpen}
        onCancel={closeCreateModal}
        onOk={handleCreateAccount}
        closable={!creatingAccount}
        maskClosable={!creatingAccount}
        keyboard={!creatingAccount}
        cancelButtonProps={{ disabled: creatingAccount }}
        okButtonProps={{ loading: creatingAccount }}
      >
        <Space direction="vertical" style={{ width: "100%" }} size="middle">
          <div>
            <label className="field-label" htmlFor="new-account-type">
              Account type
            </label>
            <Select
              id="new-account-type"
              style={{ width: "100%" }}
              value={newAccountType}
              onChange={setNewAccountType}
              disabled={creatingAccount}
              options={[
                { value: "checking", label: "Checking" },
                { value: "savings", label: "Savings" },
                { value: "other", label: "Other" },
              ]}
            />
          </div>
          <div>
            <label className="field-label" htmlFor="initial-deposit">
              Initial deposit
            </label>
            <InputNumber
              id="initial-deposit"
              style={{ width: "100%" }}
              min={0}
              precision={2}
              prefix="$"
              placeholder="0.00"
              value={newInitialDeposit}
              onChange={setNewInitialDeposit}
              disabled={creatingAccount}
            />
          </div>
        </Space>
      </Modal>

      <Modal
        title="Delete bank account?"
        open={accountToDelete !== null}
        onCancel={() => {
          if (!deletingAccount) setAccountToDelete(null);
        }}
        onOk={handleDeleteAccount}
        okText="Delete account"
        cancelText="Keep account"
        okButtonProps={{ danger: true, loading: deletingAccount }}
        cancelButtonProps={{ disabled: deletingAccount }}
        closable={!deletingAccount}
        maskClosable={!deletingAccount}
        keyboard={!deletingAccount}
      >
        {accountToDelete && (
          <>
            <Paragraph>
              Delete this {accountToDelete.account_type} account with a balance
              of{" "}
              <strong>
                {new Intl.NumberFormat("en-US", {
                  style: "currency",
                  currency: "USD",
                }).format(Number(accountToDelete.balance))}
              </strong>
              ?
            </Paragraph>
            <Alert
              type="warning"
              showIcon
              message="This cannot be undone"
              description="The account, its remaining test balance, and its transaction history will be permanently deleted. Your user profile and other accounts will remain."
            />
          </>
        )}
      </Modal>
    </>
  );
}

function AccountPage() {
  const { session } = useCurrentUser();

  if (!session) {
    return (
      <section className="static-page account-page-tight">
        <Title level={1}>Account</Title>
        <Paragraph>
          <Link to="/login">Log in</Link> to view your balance and transaction
          history.
        </Paragraph>
      </section>
    );
  }

  if (session.kind === "admin") {
    return <AdminPage />;
  }

  return (
    <section className="static-page account-page account-page-tight">
      <UserAccountsView
        key={session.user_id}
        userId={session.user_id}
        name={session.name}
      />
    </section>
  );
}

export default AccountPage;
