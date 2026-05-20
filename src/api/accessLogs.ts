import { api } from './client';

export interface AccessLog {
  id: string;
  lockerId: string;
  userId: string;
  action: 'OPEN' | 'CLOSE';
  timestamp: string;
  durationSeconds?: number;
}

export interface Page<T> {
  content: T[];
  totalElements: number;
  totalPages: number;
  number: number;
  size: number;
}

export const accessLogsApi = {
  myLogs: (page = 0, size = 20) =>
    api.get<Page<AccessLog>>('/access-logs/me', { params: { page, size } }),
};
