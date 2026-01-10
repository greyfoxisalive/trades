import { SkinCard } from './SkinCard'
import type { SteamInventoryItem } from '@steam-trade/shared'

interface InventoryGridProps {
  items: SteamInventoryItem[]
  selectedItems?: Set<string>
  onItemClick?: (item: SteamInventoryItem) => void
}

export function InventoryGrid({ items, selectedItems, onItemClick }: InventoryGridProps) {
  // Защита от не-массивов
  const safeItems = Array.isArray(items) ? items : []
  
  if (safeItems.length === 0) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        <p>Инвентарь пуст</p>
      </div>
    )
  }
  
  return (
    <div className="grid grid-cols-2 gap-3">
      {safeItems.map((item, index) => (
        <div key={item.assetid} className="fade-transition fade-in" style={{ animationDelay: `${index * 0.03}s` }}>
          <SkinCard
            item={item}
            selected={selectedItems?.has(item.assetid)}
            onClick={() => onItemClick?.(item)}
          />
        </div>
      ))}
    </div>
  )
}
