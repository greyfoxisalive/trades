import { TradeOffer } from '../../domain/entities/TradeOffer.js'
import { TradeOfferId } from '../../domain/valueObjects/TradeOfferId.js'
import { UserId } from '../../domain/valueObjects/UserId.js'
import { TradeOfferStatus } from '../../domain/valueObjects/TradeOfferStatus.js'
import { TradeOfferItem } from '../../domain/valueObjects/TradeOfferItem.js'
import { ITradeOfferRepository } from '../../domain/repositories/ITradeOfferRepository.js'
import { prisma } from '../../lib/prisma.js'

export class TradeOfferRepository implements ITradeOfferRepository {
  async findById(id: TradeOfferId): Promise<TradeOffer | null> {
    const tradeOffer = await prisma.tradeOffer.findUnique({
      where: { id: id.getValue() },
      include: {
        items: true,
      },
    })

    if (!tradeOffer) {
      return null
    }

    return this.mapToDomain(tradeOffer)
  }

  async findByUserId(userId: UserId): Promise<TradeOffer[]> {
    const tradeOffers = await prisma.tradeOffer.findMany({
      where: {
        OR: [
          { fromUserId: userId.getValue() },
          { toUserId: userId.getValue() },
        ],
      },
      include: {
        items: true,
      },
      orderBy: {
        createdAt: 'desc',
      },
    })

    return tradeOffers.map(to => this.mapToDomain(to))
  }

  async save(tradeOffer: TradeOffer): Promise<TradeOffer> {
    const existing = await prisma.tradeOffer.findUnique({
      where: { id: tradeOffer.getId().getValue() },
    })

    if (existing) {
      await prisma.tradeOffer.update({
        where: { id: tradeOffer.getId().getValue() },
        data: {
          status: tradeOffer.getStatus().toString(),
          updatedAt: tradeOffer.getUpdatedAt(),
        },
      })
    } else {
      await prisma.tradeOffer.create({
        data: {
          id: tradeOffer.getId().getValue(),
          fromUserId: tradeOffer.getFromUserId().getValue(),
          toUserId: tradeOffer.getToUserId().getValue(),
          status: tradeOffer.getStatus().toString(),
          createdAt: tradeOffer.getCreatedAt(),
          updatedAt: tradeOffer.getUpdatedAt(),
          items: {
            create: [
              ...tradeOffer.getItemsFrom().map(item => ({
                assetId: item.getAssetId(),
                appId: item.getAppId(),
                contextId: item.getContextId(),
                amount: item.getAmount(),
                isFrom: true,
              })),
              ...tradeOffer.getItemsTo().map(item => ({
                assetId: item.getAssetId(),
                appId: item.getAppId(),
                contextId: item.getContextId(),
                amount: item.getAmount(),
                isFrom: false,
              })),
            ],
          },
        },
      })
    }

    return this.findById(tradeOffer.getId()) as Promise<TradeOffer>
  }

  async delete(id: TradeOfferId): Promise<void> {
    await prisma.tradeOffer.delete({
      where: { id: id.getValue() },
    })
  }

  private mapToDomain(tradeOffer: any): TradeOffer {
    const itemsFrom = tradeOffer.items
      .filter((item: any) => item.isFrom)
      .map((item: any) =>
        TradeOfferItem.create(
          item.assetId,
          item.appId,
          item.contextId,
          item.amount
        )
      )

    const itemsTo = tradeOffer.items
      .filter((item: any) => !item.isFrom)
      .map((item: any) =>
        TradeOfferItem.create(
          item.assetId,
          item.appId,
          item.contextId,
          item.amount
        )
      )

    return TradeOffer.reconstitute(
      TradeOfferId.create(tradeOffer.id),
      UserId.create(tradeOffer.fromUserId),
      UserId.create(tradeOffer.toUserId),
      TradeOfferStatus.fromString(tradeOffer.status),
      itemsFrom,
      itemsTo,
      tradeOffer.createdAt,
      tradeOffer.updatedAt
    )
  }
}
