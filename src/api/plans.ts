import { api } from './client';

export interface Plan {
  id: string;
  name: string;
  durationMonths: number;
  price: number;
  active: boolean;
}

export const plansApi = {
  findAll: () => api.get<Plan[]>('/plans'),
};
