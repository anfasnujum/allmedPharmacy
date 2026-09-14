import { useMemo } from 'react';
import type { Order, Trip } from '@/types';

export function useTripPickupState(trip: Trip | undefined, orders: Order[]) {
  return useMemo(() => {
    if (!trip) {
      return { pickedUpCount: 0, allPickedUp: false, canStart: false, pickupRemaining: 0 };
    }
    const stopOrders = trip.stops
      .map((s) => orders.find((o) => o.id === s.orderId))
      .filter((o): o is Order => Boolean(o));

    const pickedUpCount = stopOrders.filter((o) => o.status === 'Picked Up').length;
    const allPickedUp =
      trip.status === 'Scheduled' &&
      stopOrders.length === trip.stops.length &&
      stopOrders.every((o) => o.status === 'Picked Up');

    const canStart = allPickedUp;
    const pickupRemaining = trip.stops.length - pickedUpCount;

    return { pickedUpCount, allPickedUp, canStart, pickupRemaining };
  }, [trip, orders]);
}
