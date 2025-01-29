export interface TerminologySettings {
  item: string;
  items: string;
  location: string;
  locations: string;
}

export interface Settings {
  terminology: TerminologySettings;
}

export const DefaultSettings: Settings = {
  terminology: {
    item: "Item",
    items: "Items",
    location: "Location",
    locations: "Locations",
  },
}