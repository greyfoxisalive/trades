import { useQuery } from '@tanstack/react-query'
import { Card, CardContent, CardHeader, CardTitle, Button } from '@steam-trade/ui'
import { useAuth } from '../hooks/useAuth'
import { inventoryApi } from '../lib/api'
import { InventoryGrid } from '../components/InventoryGrid'

export function ProfilePage() {
  const { user, isAuthenticated, login } = useAuth()
  
  const { data: inventory, error: inventoryError, isLoading: isLoadingInventory } = useQuery({
    queryKey: ['inventory', user?.steamId],
    queryFn: () => inventoryApi.getInventory(user?.steamId || ''),
    enabled: !!user?.steamId && isAuthenticated,
  })
  
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen pb-20 fade-transition fade-in">
        <div className="container mx-auto px-4 py-8">
          <Card>
            <CardContent className="p-6">
              <p className="text-muted-foreground text-center mb-4">
                Войдите, чтобы просмотреть профиль
              </p>
              <Button onClick={login} className="w-full">
                Войти через Steam
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    )
  }
  
  return (
    <div className="min-h-screen pb-20 fade-transition fade-in">
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-6 gradient-purple-text">Профиль</h1>
        
        <Card className="mb-4">
          <CardHeader>
            <CardTitle>Информация</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-4">
              {user?.avatar && (
                <img 
                  src={user.avatar} 
                  alt={user.username}
                  className="w-20 h-20 rounded-full"
                />
              )}
              <div>
                <p className="font-semibold text-lg">{user?.username}</p>
                <p className="text-sm text-muted-foreground">Steam ID: {user?.steamId}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle>Мой инвентарь ({inventory?.length || 0} предметов)</CardTitle>
          </CardHeader>
          <CardContent>
            {isLoadingInventory ? (
              <p className="text-muted-foreground">Загрузка инвентаря...</p>
            ) : inventoryError ? (
              <div className="p-4 border border-red-500 rounded-lg">
                <p className="text-red-500 text-sm">
                  {inventoryError instanceof Error ? inventoryError.message : 'Ошибка загрузки инвентаря'}
                </p>
              </div>
            ) : inventory ? (
              <InventoryGrid items={inventory} />
            ) : (
              <p className="text-muted-foreground">Инвентарь пуст</p>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
