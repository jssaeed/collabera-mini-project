import client from './client'

export type Transaction = {
  txn_id: number
  account_id: number
  txn_type: string
  amount: string
  created_at: string
}

export async function listTransactions(): Promise<Transaction[]> {
  const response = await client.get<{ transactions: Transaction[] }>('/transactions/')
  return response.data.transactions
}

export async function listAccountTransactions(accountId: number): Promise<Transaction[]> {
  const response = await client.get<{ transactions: Transaction[] }>(
    `/accounts/${accountId}/transactions/`,
  )
  return response.data.transactions
}
