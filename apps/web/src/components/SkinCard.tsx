import { Card, CardContent } from '@steam-trade/ui'
import type { SteamInventoryItem } from '@steam-trade/shared'

interface SkinCardProps {
  item: SteamInventoryItem
  onClick?: () => void
  selected?: boolean
}

export function SkinCard({ item, onClick, selected }: SkinCardProps) {
  const imageUrl = item.icon_url_large || item.icon_url || ''
  
  return (
    <Card 
      className={`cursor-pointer transition-all duration-200 hover:shadow-purple-lg hover:scale-105 fade-transition ${selected ? 'ring-2 ring-primary glow-purple' : ''}`}
      onClick={onClick}
    >
      <CardContent className="p-3">
        <div className="flex items-center gap-3">
          {imageUrl && (
            <img 
              src={`https://steamcommunity-a.akamaihd.net/economy/image/${imageUrl}`}
              alt={item.name || 'Skin'}
              className="w-16 h-16 object-contain"
            />
          )}
          <div className="flex-1 min-w-0">
            <h3 className="font-semibold text-sm truncate">
              {item.name || item.market_hash_name || 'Unknown Item'}
            </h3>
            {item.market_hash_name && item.name !== item.market_hash_name && (
              <p className="text-xs text-muted-foreground truncate">
                {item.market_hash_name}
              </p>
            )}
            {item.amount && parseInt(item.amount) > 1 && (
              <p className="text-xs text-muted-foreground mt-1">
                x{item.amount}
              </p>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
