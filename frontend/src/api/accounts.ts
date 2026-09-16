import client from './client'

export type Account = {
  account_id: number
  user_id: number
  balance: string
  account_type: string
  created_at: string
}

export async function listAccounts(): Promise<Account[]> {
  const response = await client.get<{ accounts: Account[] }>('/accounts/')
  return response.data.accounts
}

export async function getAccount(accountId: number): Promise<Account> {
  const response = await client.get<Account>(`/accounts/${accountId}/`)
  return response.data
}

export async function deposit(accountId: number, amount: number): Promise<Account> {
  const response = await client.post<Account>(`/accounts/${accountId}/deposit/`, { amount })
  return response.data
}

export async function withdraw(accountId: number, amount: number): Promise<Account> {
  const response = await client.post<Account>(`/accounts/${accountId}/withdraw/`, { amount })
  return response.data
}

export async function createAccount(
  userId: number,
  accountType: string,
  initialDeposit: number,
): Promise<Account> {
  const response = await client.post<Account>(`/users/${userId}/accounts/`, {
    account_type: accountType,
    initial_deposit: initialDeposit,
  })
  return response.data
}
