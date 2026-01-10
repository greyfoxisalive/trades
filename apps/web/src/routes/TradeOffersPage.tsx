import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Card, CardContent } from '@steam-trade/ui'
import { useAuth } from '../hooks/useAuth'
import { tradeOffersApi } from '../lib/api'
import { TradeOfferCard } from '../components/TradeOfferCard'

export function TradeOffersPage() {
  const { user, isAuthenticated } = useAuth()
  const queryClient = useQueryClient()
  
  const { data: tradeOffers, isLoading } = useQuery({
    queryKey: ['trade-offers'],
    queryFn: tradeOffersApi.getAll,
    enabled: isAuthenticated,
  })
  
  const acceptMutation = useMutation({
    mutationFn: tradeOffersApi.accept,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['trade-offers'] })
    },
  })
  
  const declineMutation = useMutation({
    mutationFn: tradeOffersApi.decline,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['trade-offers'] })
    },
  })
  
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen pb-20 fade-transition fade-in">
        <div className="container mx-auto px-4 py-8">
          <Card>
            <CardContent className="p-6">
              <p className="text-muted-foreground text-center">
                Войдите, чтобы просмотреть обмены
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    )
  }
  
  if (isLoading) {
    return (
      <div className="min-h-screen pb-20 fade-transition fade-in">
        <div className="container mx-auto px-4 py-8">
          <p className="text-muted-foreground">Загрузка...</p>
        </div>
      </div>
    )
  }
  
  return (
    <div className="min-h-screen pb-20 fade-transition fade-in">
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-6 gradient-purple-text">Мои обмены</h1>
        
        {!tradeOffers || !Array.isArray(tradeOffers) || tradeOffers.length === 0 ? (
          <Card className="fade-transition fade-in">
            <CardContent className="p-6">
              <p className="text-muted-foreground text-center">
                У вас пока нет обменов
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="fade-transition">
            {tradeOffers.map((tradeOffer, index) => (
              <div key={tradeOffer.id} className="fade-transition fade-in" style={{ animationDelay: `${index * 0.1}s` }}>
                <TradeOfferCard
                  tradeOffer={tradeOffer}
                  currentUserId={user?.id || ''}
                  onAccept={() => acceptMutation.mutate(tradeOffer.id)}
                  onDecline={() => declineMutation.mutate(tradeOffer.id)}
                />
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
