import { useQuery } from '@tanstack/react-query'
import { authApi } from '../lib/api'
import type { User } from '@steam-trade/shared'

export function useAuth() {
  const { data: user, isLoading, error, isError } = useQuery<User>({
    queryKey: ['auth', 'me'],
    queryFn: authApi.me,
    retry: false,
    // Не кешировать ошибки авторизации
    staleTime: 0,
    gcTime: 0,
    // При ошибке не использовать кешированные данные
    refetchOnWindowFocus: true,
  })
  
  // Пользователь авторизован только если есть user и нет ошибки
  // Если ошибка 401 или любая другая - пользователь не авторизован
  const isAuthenticated = !isLoading && !isError && !!user
  
  return {
    user: isError ? undefined : user,
    isLoading,
    isAuthenticated,
    login: authApi.login,
  }
}
