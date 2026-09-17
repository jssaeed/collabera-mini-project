import { useEffect, useMemo, useState } from "react";
import {
  Alert,
  Card,
  Col,
  Row,
  Spin,
  Statistic,
  Table,
  Tabs,
  Typography,
} from "antd";
import type { TableColumnsType } from "antd";
import { listAccounts, type Account } from "../api/accounts";
import { listTransactions, type Transaction } from "../api/transactions";
import { listUsers, type User } from "../api/users";
import "./AdminPage.css";

const { Title } = Typography;

function uniqueFilters<T, K extends keyof T>(rows: T[], key: K) {
  const values = Array.from(new Set(rows.map((row) => row[key])));
  values.sort((a, b) => (a < b ? -1 : a > b ? 1 : 0));
  return values.map((value) => ({ text: String(value), value }));
}

function AdminPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    Promise.all([listUsers(), listAccounts(), listTransactions()])
      .then(([usersData, accountsData, transactionsData]) => {
        setUsers(usersData);
        setAccounts(accountsData);
        setTransactions(transactionsData);
      })
      .catch(() => setError("Could not load the database tables."))
      .finally(() => setLoading(false));
  }, []);

  const userColumns: TableColumnsType<User> = useMemo(
    () => [
      {
        title: "user_id (PK)",
        dataIndex: "user_id",
        key: "user_id",
        filters: uniqueFilters(users, "user_id"),
        onFilter: (value, record) => record.user_id === value,
      },
      { title: "name", dataIndex: "name", key: "name" },
      { title: "email", dataIndex: "email", key: "email" },
      { title: "created_at", dataIndex: "created_at", key: "created_at" },
    ],
    [users],
  );

  const accountColumns: TableColumnsType<Account> = useMemo(
    () => [
      {
        title: "account_id (PK)",
        dataIndex: "account_id",
        key: "account_id",
        filters: uniqueFilters(accounts, "account_id"),
        onFilter: (value, record) => record.account_id === value,
      },
      {
        title: "user_id (FK)",
        dataIndex: "user_id",
        key: "user_id",
        filters: uniqueFilters(accounts, "user_id"),
        onFilter: (value, record) => record.user_id === value,
      },
      { title: "balance", dataIndex: "balance", key: "balance" },
      {
        title: "account_type",
        dataIndex: "account_type",
        key: "account_type",
        filters: uniqueFilters(accounts, "account_type"),
        onFilter: (value, record) => record.account_type === value,
      },
      { title: "created_at", dataIndex: "created_at", key: "created_at" },
    ],
    [accounts],
  );

  const transactionColumns: TableColumnsType<Transaction> = useMemo(
    () => [
      {
        title: "txn_id (PK)",
        dataIndex: "txn_id",
        key: "txn_id",
        filters: uniqueFilters(transactions, "txn_id"),
        onFilter: (value, record) => record.txn_id === value,
      },
      {
        title: "account_id (FK)",
        dataIndex: "account_id",
        key: "account_id",
        filters: uniqueFilters(transactions, "account_id"),
        onFilter: (value, record) => record.account_id === value,
      },
      {
        title: "txn_type",
        dataIndex: "txn_type",
        key: "txn_type",
        filters: uniqueFilters(transactions, "txn_type"),
        onFilter: (value, record) => record.txn_type === value,
      },
      { title: "amount", dataIndex: "amount", key: "amount" },
      { title: "created_at", dataIndex: "created_at", key: "created_at" },
    ],
    [transactions],
  );

  if (loading) {
    return (
      <div className="page-loading" role="status">
        <Spin />
        <span>Loading administration dashboard…</span>
      </div>
    );
  }
  if (error) {
    return (
      <section className="static-page admin-page">
        <Alert type="error" message={error} showIcon />
      </section>
    );
  }

  return (
    <section className="static-page admin-page account-page account-page-tight">
      <span className="page-eyebrow">Administration</span>
      <Title level={1}>Banking overview</Title>
      <Typography.Paragraph type="secondary">
        Review users, accounts, and transaction records.
      </Typography.Paragraph>

      <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
        {[
          { title: "Users", value: users.length },
          { title: "Accounts", value: accounts.length },
          { title: "Transactions", value: transactions.length },
        ].map(({ title, value }) => (
          <Col xs={24} sm={8} key={title}>
            <Card>
              <Statistic title={title} value={value} />
            </Card>
          </Col>
        ))}
      </Row>

      <Card>
        <Tabs
          items={[
            {
              key: "users",
              label: `Users (${users.length})`,
              children: (
                <Table
                  rowKey="user_id"
                  dataSource={users}
                  columns={userColumns}
                  scroll={{ x: 720 }}
                  pagination={{ pageSize: 7, showSizeChanger: false }}
                />
              ),
            },
            {
              key: "accounts",
              label: `Accounts (${accounts.length})`,
              children: (
                <Table
                  rowKey="account_id"
                  dataSource={accounts}
                  columns={accountColumns}
                  scroll={{ x: 800 }}
                  pagination={{ pageSize: 7, showSizeChanger: false }}
                />
              ),
            },
            {
              key: "transactions",
              label: `Transactions (${transactions.length})`,
              children: (
                <Table
                  rowKey="txn_id"
                  dataSource={transactions}
                  columns={transactionColumns}
                  scroll={{ x: 800 }}
                  pagination={{ pageSize: 7, showSizeChanger: false }}
                />
              ),
            },
          ]}
        />
      </Card>
    </section>
  );
}

export default AdminPage;
