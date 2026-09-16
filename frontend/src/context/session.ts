import { createContext } from 'react'

export type Session = { kind: 'admin' } | { kind: 'user'; user_id: number; name: string; email: string }

export type CurrentUserContextValue = {
  session: Session | null
  login: (session: Session) => void
  logout: () => void
}

export const CurrentUserContext = createContext<CurrentUserContextValue | null>(null)
