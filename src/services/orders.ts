import {
  randomUUID,
} from "crypto";

import {
  Order,
  OrderType,
  TradeSide,
} from "../types";

const orders =
  new Map<
    number,
    Order[]
  >();

function numberValue(
  value: string | number | undefined,
): number | undefined {
  if (
    value === undefined ||
    value === ""
  ) {
    return undefined;
  }

  const parsed =
    Number(value);

  return Number.isFinite(parsed)
    ? parsed
    : undefined;
}

export function createOrder(
  userId: number,
  params: {
    tokenAddress: string;
    symbol: string;
    side: TradeSide;
    type: OrderType;
    amount: string | number;
    price?: string | number;
    stopPrice?: string | number;
    limitPrice?: string | number;
    expiresAt?: number;
  },
): Order {
  const now =
    Date.now();

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

    amountEth:
      numberValue(
        params.amount,
      ),

    price:
      numberValue(
        params.price,
      ),

    stopPrice:
      numberValue(
        params.stopPrice,
      ),

    limitPrice:
      numberValue(
        params.limitPrice,
      ),

    status:
      "PENDING",

    createdAt: now,

    updatedAt: now,

    expiresAt:
      params.expiresAt,
  };

  const userOrders =
    orders.get(userId) ?? [];

  userOrders.push(order);

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
        Date.now(),
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

export function markOrderCompleted(
  userId: number,
  orderId: string,
  txHash?: string,
): Order | undefined {
  return updateOrder(
    userId,
    orderId,
    {
      status:
        "COMPLETED",

      ...(txHash
        ? { txHash }
        : {}),
    },
  );
}
