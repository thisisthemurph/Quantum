export type Location = {
  id: string;
  name: string;
  description?: string;
  createdAt: string;
  updatedAt: string;
}

export type CreateLocationRequest = {
  name: string;
  description?: string;
}

export interface TrackableLocation extends Location {
  isUser: boolean;
}