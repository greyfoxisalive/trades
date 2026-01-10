import { Link, useLocation } from 'react-router-dom'
import { Button } from '@steam-trade/ui'
import { Home, Plus, List, User } from 'lucide-react'

export function NavBar() {
  const location = useLocation()
  
  const navItems = [
    { path: '/', icon: Home, label: 'Главная' },
    { path: '/trades', icon: List, label: 'Обмены' },
    { path: '/create', icon: Plus, label: 'Создать' },
    { path: '/profile', icon: User, label: 'Профиль' },
  ]
  
  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-card/80 backdrop-blur-md border-t border-border/50 shadow-purple-lg z-50">
      <div className="container mx-auto px-4">
        <div className="flex justify-around items-center h-16 gap-1">
          {navItems.map((item) => {
            const Icon = item.icon
            const isActive = location.pathname === item.path
            return (
              <Link key={item.path} to={item.path} className="flex-1">
                <Button
                  variant={isActive ? 'default' : 'ghost'}
                  className="flex flex-col items-center justify-center gap-1 h-auto py-3 w-full min-w-[60px] transition-all duration-300"
                >
                  <Icon className="h-5 w-5 transition-opacity duration-300" />
                  <span className="text-xs transition-opacity duration-300">{item.label}</span>
                </Button>
              </Link>
            )
          })}
        </div>
      </div>
    </nav>
  )
}
