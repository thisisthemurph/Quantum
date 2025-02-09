export type Item = {
  id: string;
  identifier: string;
  reference: string;
  groupKey: string;
  description?: string;
  currentLocation: ItemCurrentLocation;
  deleted: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface ItemCurrentLocation {
  id: string;
  name: string;
  description: string;
  trackedAt: string;
  trackedToUser: boolean;
}

export interface ItemWithCurrentLocation extends Item{
  currentLocation: ItemCurrentLocation;
}

export interface baseItemHistory {
  created: string;
  userId: string;
  userName: string;
  userUsername: string;
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

export interface ItemTrackedToUserEvent extends baseItemHistory {
  type: "tracked-user";
  data: {
    userId: string;
    userName: string;
    userUsername: string;
  }
}

export interface ItemDeletedEvent extends baseItemHistory {
  type: "deleted";
  data: undefined; // Actually an empty objet, but we don't need to represent that here.
}

export type ItemHistoryEvent = ItemCreatedEvent | ItemTrackedEvent | ItemDeletedEvent | ItemTrackedToUserEvent;
