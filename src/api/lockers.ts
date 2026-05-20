import { api } from './client';

export type LockerStatus = 'AVAILABLE' | 'OCCUPIED' | 'MAINTENANCE';

export interface Locker {
  id: string;
  number: number;
  location: string;
  address?: string;
  status: LockerStatus;
  tuyaDeviceId?: string;
}

export const lockersApi = {
  findAll: (status?: LockerStatus) =>
    api.get<Locker[]>('/lockers', { params: status ? { status } : undefined }),

  findById: (id: string) =>
    api.get<Locker>(`/lockers/${id}`),

  unlock: (id: string) =>
    api.post(`/lockers/${id}/unlock`),
};
