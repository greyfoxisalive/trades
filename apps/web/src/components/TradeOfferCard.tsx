import { Card, CardContent, CardHeader, CardTitle, Button } from '@steam-trade/ui'
import type { TradeOffer, TradeOfferStatus } from '@steam-trade/shared'
import { SkinCard } from './SkinCard'

interface TradeOfferCardProps {
  tradeOffer: TradeOffer
  currentUserId: string
  onAccept?: () => void
  onDecline?: () => void
}

const statusLabels: Record<TradeOfferStatus, string> = {
  PENDING: 'Ожидает',
  ACCEPTED: 'Принят',
  DECLINED: 'Отклонен',
  CANCELLED: 'Отменен',
  EXPIRED: 'Истек',
}

const statusColors: Record<TradeOfferStatus, string> = {
  PENDING: 'text-yellow-400 bg-yellow-400/20',
  ACCEPTED: 'text-green-400 bg-green-400/20',
  DECLINED: 'text-red-400 bg-red-400/20',
  CANCELLED: 'text-gray-400 bg-gray-400/20',
  EXPIRED: 'text-gray-400 bg-gray-400/20',
}

export function TradeOfferCard({ tradeOffer, currentUserId, onAccept, onDecline }: TradeOfferCardProps) {
  const isIncoming = tradeOffer.toUserId === currentUserId
  const canInteract = isIncoming && tradeOffer.status === 'PENDING'
  
  return (
    <Card className="mb-4 shadow-purple fade-transition">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg font-semibold">
            {isIncoming ? 'Входящий обмен' : 'Исходящий обмен'}
          </CardTitle>
          <span className={`text-sm font-medium px-3 py-1 rounded-full ${statusColors[tradeOffer.status]}`}>
            {statusLabels[tradeOffer.status]}
          </span>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <h4 className="text-sm font-semibold mb-2">Ваши предметы:</h4>
          <div className="grid grid-cols-2 gap-2">
            {tradeOffer.itemsFrom.map((item, idx) => (
              <SkinCard
                key={idx}
                item={{
                  assetid: item.assetId,
                  classid: '',
                  instanceid: '',
                  amount: item.amount.toString(),
                  appid: item.appId,
                  contextid: item.contextId,
                }}
              />
            ))}
          </div>
        </div>
        
        <div>
          <h4 className="text-sm font-semibold mb-2">
            {isIncoming ? 'Предметы отправителя:' : 'Получаете:'}
          </h4>
          <div className="grid grid-cols-2 gap-2">
            {tradeOffer.itemsTo.map((item, idx) => (
              <SkinCard
                key={idx}
                item={{
                  assetid: item.assetId,
                  classid: '',
                  instanceid: '',
                  amount: item.amount.toString(),
                  appid: item.appId,
                  contextid: item.contextId,
                }}
              />
            ))}
          </div>
        </div>
        
        {canInteract && (
          <div className="flex gap-2 pt-2">
            <Button 
              onClick={onAccept}
              className="flex-1"
              variant="default"
            >
              Принять
            </Button>
            <Button 
              onClick={onDecline}
              className="flex-1"
              variant="destructive"
            >
              Отклонить
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
