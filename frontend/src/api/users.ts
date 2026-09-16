import client from './client'

export type User = {
  user_id: number
  name: string
  email: string
  created_at: string
}

export async function listUsers(): Promise<User[]> {
  const response = await client.get<{ users: User[] }>('/users/')
  return response.data.users
}
