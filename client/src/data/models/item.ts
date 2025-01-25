export type Item = {
  id: string;
  reference: string;
  groupKey: string;
  description?: string;
  createdAt: string;
  updatedAt: string;
}

export type ItemHistory = {
  user: string;
  email: string;
  location: string;
  date: Date;
}
