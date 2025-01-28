export type Item = {
  id: string;
  reference: string;
  groupKey: string;
  description?: string;
  currentLocation: {
    id: string;
    name: string;
  };
  createdAt: string;
  updatedAt: string;
}

export interface baseItemHistory {
  created: string;
  userId: string;
  userName: string;
  date: string;
}

export interface ItemCreatedEvent extends baseItemHistory {
  type: "created";
  data: {
    reference: string;
    groupKey: string;
    description?: string;
    locationId: string;
    locationName: string;
  }
}

export interface ItemTrackedEvent extends baseItemHistory {
  type: "tracked";
  data: {
    locationId: string;
    locationName: string;
  }
}

interface ItemCurrentLocation {
  id: string;
  name: string;
  description: string;
  trackedAt: string;
}

export interface ItemWithCurrentLocation extends Item{
  currentLocation: ItemCurrentLocation;
}

export type ItemHistoryEvent = ItemCreatedEvent | ItemTrackedEvent;
