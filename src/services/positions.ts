import { Position } from "../types";

const positions = new Map<
  number,
  Position[]
>();

export function getPositions(
  userId: number,
): Position[] {
  return positions.get(userId) ?? [];
}

export function addPosition(
  userId: number,
  position: Position,
) {
  const current =
    positions.get(userId) ?? [];

  current.push(position);

  positions.set(userId, current);
}

export function removePosition(
  userId: number,
  positionId: string,
) {
  const current =
    positions.get(userId) ?? [];

  positions.set(
    userId,
    current.filter(
      (position) =>
        position.id !== positionId,
    ),
  );
}

export function calculatePnL(
  position: Position,
): number {
  return (
    Number(position.currentValueEth) -
    Number(position.investedEth)
  );
}
