import { useMemo, useState, type ReactNode } from 'react'
import { CurrentUserContext, type CurrentUserContextValue, type Session } from './session'

export function CurrentUserProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<Session | null>(null)

  const value = useMemo<CurrentUserContextValue>(
    () => ({
      session,
      login: setSession,
      logout: () => setSession(null),
    }),
    [session],
  )

  return <CurrentUserContext.Provider value={value}>{children}</CurrentUserContext.Provider>
}
