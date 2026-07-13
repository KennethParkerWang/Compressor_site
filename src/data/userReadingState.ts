export type UserReadingStatus = 'unread' | 'reading' | 'finished' | 'paused';

export interface UserReadingState {
  literatureId: string;
  status: UserReadingStatus;
  progress: number;
  lastReadAt?: string;
  data?: Record<string, unknown>;
}
