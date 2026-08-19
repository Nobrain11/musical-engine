// src/services/orders.ts

import {
  randomUUID,
} from "crypto";

import {
  Order,
  OrderType,
  TradeSide,
  TradeStatus,
} from "../types";

const orders =
  new Map<
    number,
    Order[]
  >();

export function createOrder(
  userId: number,
  params: {
    tokenAddress: string;
    symbol: string;
    side: TradeSide;
    type: OrderType;
    amount: string;
    price?: string;
    stopPrice?: string;
  },
): Order {
  const now =
    new Date();

  const order: Order = {
    id: randomUUID(),

    userId,

    tokenAddress:
      params.tokenAddress,

    symbol:
      params.symbol,

    side:
      params.side,

    type:
      params.type,

    amount:
      params.amount,

    price:
      params.price,

    stopPrice:
      params.stopPrice,

    status:
      "OPEN",

    createdAt:
      now,

    updatedAt:
      now,
  };

  const userOrders =
    orders.get(userId) ?? [];

  userOrders.push(
    order,
  );

  orders.set(
    userId,
    userOrders,
  );

  return order;
}

export function getOrders(
  userId: number,
): Order[] {
  return [
    ...(orders.get(userId) ?? []),
  ];
}

export function getOrder(
  userId: number,
  orderId: string,
): Order | undefined {
  return (
    orders
      .get(userId)
      ?.find(
        (order) =>
          order.id ===
          orderId,
      )
  );
}

export function updateOrder(
  userId: number,
  orderId: string,
  updates: Partial<Order>,
): Order | undefined {
  const userOrders =
    orders.get(userId);

  if (!userOrders) {
    return undefined;
  }

  const order =
    userOrders.find(
      (item) =>
        item.id ===
        orderId,
    );

  if (!order) {
    return undefined;
  }

  Object.assign(
    order,
    updates,
    {
      updatedAt:
        new Date(),
    },
  );

  return order;
}

export function cancelOrder(
  userId: number,
  orderId: string,
): Order | undefined {
  return updateOrder(
    userId,
    orderId,
    {
      status:
        "CANCELLED",
    },
  );
}

export function markOrderPending(
  userId: number,
  orderId: string,
): Order | undefined {
  return updateOrder(
    userId,
    orderId,
    {
      status:
        "PENDING",
    },
  );
}

export function markOrderConfirmed(
  userId: number,
  orderId: string,
  txHash: string,
): Order | undefined {
  return updateOrder(
    userId,
    orderId,
    {
      status:
        "CONFIRMED",

      txHash,
    },
  );
}

export function markOrderFailed(
  userId: number,
  orderId: string,
): Order | undefined {
  return updateOrder(
    userId,
    orderId,
    {
      status:
        "FAILED",
    },
  );
}
