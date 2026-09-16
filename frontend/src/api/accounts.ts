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
