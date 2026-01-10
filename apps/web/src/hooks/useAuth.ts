import { useQuery } from '@tanstack/react-query'
import { authApi } from '../lib/api'
import type { User } from '@steam-trade/shared'

export function useAuth() {
  const { data: user, isLoading, error } = useQuery<User>({
    queryKey: ['auth', 'me'],
    queryFn: authApi.me,
    retry: false,
  })
  
  return {
    user,
    isLoading,
    isAuthenticated: !!user && !error,
    login: authApi.login,
  }
}
