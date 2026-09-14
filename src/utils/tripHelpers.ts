import type { Customer, Order, TripStop } from '@/types';
import { getPrimaryAddress } from '@/data/customers';
import { requiresRefrigeration } from '@/utils/productCompliance';

export function orderRequiresPrescription(order: Order): boolean {
  return order.items.some((item) => item.prescriptionRequired);
}

export function orderHasFridgeItem(order: Order): boolean {
  return order.items.some((item) => requiresRefrigeration(item.storageType));
}

export function resolveOrderLocation(
  order: Order,
  customer: Customer | undefined,
): { addressLine: string; area: string; lat: number; lng: number; fullAddress: string } {
  const deliveryLine = order.deliveryAddress ?? order.customerAddress;
  const deliveryArea = order.customerArea;

  if (customer?.addresses?.length) {
    const matched = customer.addresses.find(
      (a) =>
        a.addressLine === deliveryLine ||
        deliveryLine.includes(a.addressLine) ||
        a.addressLine.includes(deliveryLine),
    );
    const addr = matched ?? getPrimaryAddress(customer);
    return {
      addressLine: deliveryLine || addr.addressLine,
      area: deliveryArea || addr.area,
      lat: addr.lat,
      lng: addr.lng,
      fullAddress: `${deliveryLine || addr.addressLine}, ${deliveryArea || addr.area}`,
    };
  }

  return {
    addressLine: deliveryLine,
    area: deliveryArea,
    lat: 9.9312,
    lng: 76.2673,
    fullAddress: `${deliveryLine}, ${deliveryArea}`,
  };
}

export function buildTripStopFromOrder(order: Order, customer: Customer | undefined): TripStop {
  const location = resolveOrderLocation(order, customer);
  const billValue = order.billValue ?? order.total;
  const amountToCollect =
    order.paymentMethod === 'COD' && order.paymentStatus !== 'Paid'
      ? billValue - order.amountCollected
      : 0;

  return {
    orderId: order.id,
    customerId: order.customerId,
    customerName: order.customerName,
    customerPhone: order.customerPhone,
    address: location.fullAddress,
    addressLine: location.addressLine,
    area: location.area,
    lat: location.lat,
    lng: location.lng,
    billValue,
    amountToCollect,
    prescriptionRequired: orderRequiresPrescription(order),
    hasFridgeItem: orderHasFridgeItem(order),
    completed: false,
  };
}

export interface AgentLocation {
  addressLine: string;
  area: string;
  lat: number;
  lng: number;
  fetchedAt: string;
}

/** Demo: resolve delivery agent's current location (branch HQ or geolocation). */
export async function fetchAgentLocation(staffId: string, branchName = 'Kochi'): Promise<AgentLocation> {
  const fallback = {
    addressLine: `ALLMED ${branchName} Hub`,
    area: branchName,
    lat: 9.9312,
    lng: 76.2673,
    fetchedAt: new Date().toISOString(),
  };

  if (typeof navigator !== 'undefined' && navigator.geolocation) {
    try {
      const position = await new Promise<GeolocationPosition>((resolve, reject) => {
        navigator.geolocation.getCurrentPosition(resolve, reject, {
          timeout: 4000,
          maximumAge: 60_000,
        });
      });
      return {
        addressLine: 'Current agent location',
        area: branchName,
        lat: position.coords.latitude,
        lng: position.coords.longitude,
        fetchedAt: new Date().toISOString(),
      };
    } catch {
      // fall through to hub location
    }
  }

  void staffId;
  return fallback;
}
