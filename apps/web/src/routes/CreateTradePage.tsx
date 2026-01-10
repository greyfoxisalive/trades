import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useNavigate } from 'react-router-dom'
import { Button, Card, CardContent, CardHeader, CardTitle, Input, Label, Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@steam-trade/ui'
import { useAuth } from '../hooks/useAuth'
import { inventoryApi, tradeOffersApi, usersApi } from '../lib/api'
import { InventoryGrid } from '../components/InventoryGrid'
import { SkinCard } from '../components/SkinCard'
import type { SteamInventoryItem } from '@steam-trade/shared'

export function CreateTradePage() {
  const { user, isAuthenticated } = useAuth()
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const [selectedFromItems, setSelectedFromItems] = useState<Set<string>>(new Set())
  const [selectedToItems, setSelectedToItems] = useState<Set<string>>(new Set())
  const [showUserDialog, setShowUserDialog] = useState(false)
  const [targetSteamId, setTargetSteamId] = useState('')
  
  const { data: myInventory } = useQuery({
    queryKey: ['inventory', user?.steamId],
    queryFn: () => inventoryApi.getInventory(user?.steamId || ''),
    enabled: !!user?.steamId && isAuthenticated,
  })
  
  const { data: targetInventory } = useQuery({
    queryKey: ['inventory', targetSteamId],
    queryFn: () => inventoryApi.getInventory(targetSteamId),
    enabled: !!targetSteamId && showUserDialog,
  })
  
  const createMutation = useMutation({
    mutationFn: tradeOffersApi.create,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['trade-offers'] })
      navigate('/trades')
    },
  })
  
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen pb-20 fade-transition fade-in">
        <div className="container mx-auto px-4 py-8">
          <Card>
            <CardContent className="p-6">
              <p className="text-muted-foreground text-center">
                Войдите, чтобы создать обмен
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    )
  }
  
  const handleFromItemClick = (item: SteamInventoryItem) => {
    const newSet = new Set(selectedFromItems)
    if (newSet.has(item.assetid)) {
      newSet.delete(item.assetid)
    } else {
      newSet.add(item.assetid)
    }
    setSelectedFromItems(newSet)
  }
  
  const handleToItemClick = (item: SteamInventoryItem) => {
    const newSet = new Set(selectedToItems)
    if (newSet.has(item.assetid)) {
      newSet.delete(item.assetid)
    } else {
      newSet.add(item.assetid)
    }
    setSelectedToItems(newSet)
  }
  
  const handleCreate = async () => {
    if (!user || !targetSteamId || selectedFromItems.size === 0 || selectedToItems.size === 0) {
      return
    }
    
    // Find user by steamId
    let targetUser
    try {
      targetUser = await usersApi.getBySteamId(targetSteamId)
    } catch (error) {
      alert('Пользователь не найден. Убедитесь, что пользователь уже заходил в приложение.')
      return
    }
    
    const itemsFrom = Array.from(selectedFromItems)
      .map(assetId => {
        const item = myInventory?.find(i => i.assetid === assetId)
        return item ? {
          assetId: item.assetid,
          appId: item.appid,
          contextId: item.contextid,
          amount: parseInt(item.amount) || 1,
        } : null
      })
      .filter(Boolean) as any[]
    
    const itemsTo = Array.from(selectedToItems)
      .map(assetId => {
        const item = targetInventory?.find(i => i.assetid === assetId)
        return item ? {
          assetId: item.assetid,
          appId: item.appid,
          contextId: item.contextid,
          amount: parseInt(item.amount) || 1,
        } : null
      })
      .filter(Boolean) as any[]
    
    createMutation.mutate({
      toUserId: targetUser.id,
      itemsFrom,
      itemsTo,
    })
  }
  
  return (
    <div className="min-h-screen pb-20 fade-transition fade-in">
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-6 gradient-purple-text">Создать обмен</h1>
        
        <Card className="mb-4 fade-transition fade-in">
          <CardHeader>
            <CardTitle>Получатель</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="steamId">Steam ID получателя</Label>
              <Input
                id="steamId"
                value={targetSteamId}
                onChange={(e) => setTargetSteamId(e.target.value)}
                placeholder="Введите Steam ID"
                className="mt-2"
              />
            </div>
            <Button 
              onClick={() => {
                if (targetSteamId) {
                  setShowUserDialog(true)
                }
              }}
              disabled={!targetSteamId}
            >
              Загрузить инвентарь получателя
            </Button>
          </CardContent>
        </Card>
        
        <div className="space-y-4 mb-4">
          <div>
            <h2 className="text-lg font-semibold mb-2">Ваши предметы ({selectedFromItems.size})</h2>
            {myInventory ? (
              <InventoryGrid
                items={myInventory}
                selectedItems={selectedFromItems}
                onItemClick={handleFromItemClick}
              />
            ) : (
              <p className="text-muted-foreground fade-transition fade-in">Загрузка инвентаря...</p>
            )}
          </div>
          
          {showUserDialog && targetInventory && (
            <div className="fade-transition fade-in">
              <h2 className="text-lg font-semibold mb-2">
                Предметы получателя ({selectedToItems.size})
              </h2>
              <InventoryGrid
                items={targetInventory}
                selectedItems={selectedToItems}
                onItemClick={handleToItemClick}
              />
            </div>
          )}
        </div>
        
        <Button
          onClick={handleCreate}
          disabled={!targetSteamId || selectedFromItems.size === 0 || selectedToItems.size === 0 || createMutation.isPending}
          className="w-full fade-transition fade-in"
        >
          {createMutation.isPending ? 'Создание...' : 'Создать обмен'}
        </Button>
        
        <Dialog open={showUserDialog} onOpenChange={setShowUserDialog}>
          <DialogContent className="max-h-[80vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Инвентарь получателя</DialogTitle>
              <DialogDescription>
                Выберите предметы, которые хотите получить
              </DialogDescription>
            </DialogHeader>
            {targetInventory && (
              <div className="grid grid-cols-2 gap-2">
                {targetInventory.map((item, index) => (
                  <div key={item.assetid} className="fade-transition fade-in" style={{ animationDelay: `${index * 0.05}s` }}>
                    <SkinCard
                      item={item}
                      selected={selectedToItems.has(item.assetid)}
                      onClick={() => handleToItemClick(item)}
                    />
                  </div>
                ))}
              </div>
            )}
            <div className="flex gap-2 mt-4">
              <Button
                onClick={() => {
                  setShowUserDialog(false)
                }}
                className="flex-1"
              >
                Готово
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  )
}
