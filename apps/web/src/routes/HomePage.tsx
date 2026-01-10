import { Button, Card, CardContent, CardHeader, CardTitle } from '@steam-trade/ui'
import { useAuth } from '../hooks/useAuth'

export function HomePage() {
  const { user, isAuthenticated, isLoading, login } = useAuth()
  
  return (
    <div className="min-h-screen pb-20 fade-transition fade-in">
      <div className="container mx-auto px-4 py-8">
        <div className="flex flex-col items-center mb-8">
          <h1 className="text-4xl font-bold mb-4 gradient-purple-text text-center">Steam Skins Trade</h1>
          <div className="relative w-64 h-64 mb-6 mx-auto">
            <div className="absolute inset-0 bg-gradient-to-br from-purple-500/20 to-pink-500/20 rounded-lg blur-xl animate-pulse"></div>
            <img 
              src="https://media.giphy.com/media/v1.Y2lkPTc5MGI3NjExZmltYWU0aTRkaDZiNDJvM3lndmF3b2lhMW5qcnQ4aTZhM2xwMzk1YiZlcD12MV9naWZzX3NlYXJjaCZjdD1n/8PZjEA5DEbgWqG4bxo/giphy.gif" 
              alt="Anime character"
              className="relative w-full h-full object-contain rounded-lg shadow-purple-lg glow-purple transition-transform duration-300 hover:scale-110"
            />
          </div>
        </div>
        
        {isLoading ? (
          <Card className="shadow-purple-lg fade-transition fade-in">
            <CardContent className="p-6">
              <p className="text-muted-foreground text-center">Загрузка...</p>
            </CardContent>
          </Card>
        ) : !isAuthenticated ? (
          <Card className="shadow-purple-lg fade-transition fade-in">
            <CardHeader>
              <CardTitle className="text-2xl">Вход через Steam</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground mb-6">
                Войдите через Steam, чтобы начать обмениваться скинами
              </p>
              <Button onClick={login} className="w-full text-base py-6">
                Войти через Steam
              </Button>
            </CardContent>
          </Card>
        ) : (
          <Card className="shadow-purple-lg fade-transition fade-in">
            <CardHeader>
              <CardTitle className="text-2xl">Добро пожаловать, {user?.username}!</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-4 mb-4">
                {user?.avatar && (
                  <img 
                    src={user.avatar} 
                    alt={user.username}
                    className="w-16 h-16 rounded-full fade-transition"
                  />
                )}
                <div>
                  <p className="font-semibold">{user?.username}</p>
                  <p className="text-sm text-muted-foreground">Steam ID: {user?.steamId}</p>
                </div>
              </div>
              <div className="space-y-2">
                <Button className="w-full" asChild>
                  <a href="/trades">Мои обмены</a>
                </Button>
                <Button className="w-full" variant="outline" asChild>
                  <a href="/create">Создать обмен</a>
                </Button>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}
