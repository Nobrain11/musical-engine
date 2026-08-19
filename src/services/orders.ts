import {
  Order,
  OrderType,
  TradeSide,
} from "../types";

const orders = new Map<
  number,
  Order[]
>();

export function createOrder(
  userId: number,
  data: {
    tokenAddress: string;
    symbol: string;
    type: OrderType;
    side: TradeSide;
    amount: string;
    triggerPrice?: string;
  },
): Order {
  const order: Order = {
    id: crypto.randomUUID(),

    tokenAddress:
      data.tokenAddress,

    symbol: data.symbol,

    type: data.type,

    side: data.side,

    amount: data.amount,

    triggerPrice:
      data.triggerPrice,

    status: "OPEN",

    createdAt: new Date(),
  };

  const current =
    orders.get(userId) ?? [];

  current.push(order);

  orders.set(userId, current);

  return order;
}

export function getOrders(
  userId: number,
): Order[] {
  return orders.get(userId) ?? [];
}

export function cancelOrder(
  userId: number,
  orderId: string,
): boolean {
  const current =
    orders.get(userId) ?? [];

  const order = current.find(
    (item) => item.id === orderId,
  );

  if (!order) return false;

  order.status = "CANCELLED";

  return true;
}

import crypto from "crypto";
