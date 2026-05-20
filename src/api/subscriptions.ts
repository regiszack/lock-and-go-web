import { api } from './client';

export type SubscriptionStatus = 'PENDING' | 'ACTIVE' | 'GRACE_PERIOD' | 'EXPIRED' | 'CANCELLED';

export interface Subscription {
  id: string;
  userId: string;
  lockerId: string;
  planName: string;
  planDurationMonths: number;
  startDate: string;
  endDate: string;
  graceDeadline?: string;
  status: SubscriptionStatus;
}

export interface CheckoutResponse {
  subscriptionId: string;
  paymentId: string;
  checkoutUrl: string;
}

export const subscriptionsApi = {
  getMySubscription: () =>
    api.get<Subscription>('/subscriptions/me'),

  checkout: (lockerId: string, planId: string) =>
    api.post<CheckoutResponse>('/subscriptions/checkout', { lockerId, planId }),

  setStudentPassword: (subscriptionId: string, password: string) =>
    api.post(`/subscriptions/${subscriptionId}/set-password`, { password }),
};
