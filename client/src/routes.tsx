import {Route, Routes} from "react-router";
import RootLayout from "@/layouts/root-layout.tsx";
import HomePage from "@/pages/home";
import ItemListingPage from "@/pages/item-listing";
import CreateItemPage from "@/pages/item-create";
import ItemDetailsPage from "@/pages/item-details";
import LocationListingPage from "@/pages/location-listing";
import SettingsPage from "@/pages/settings";
import LocationDetailsPage from "@/pages/location-details";

export default function AppRoutes() {
  return (
    <Routes>
      <Route element={<RootLayout />}>
        <Route index element={<HomePage />} />
        <Route path="/items" element={<ItemListingPage />} />
        <Route path="/items/create" element={<CreateItemPage />} />
        <Route path="/items/:itemId" element={<ItemDetailsPage />} />
        <Route path="/locations" element={<LocationListingPage />} />
        <Route path="/locations/:locationId" element={<LocationDetailsPage />} />
        <Route path="/settings" element={<SettingsPage />} />
      </Route>
    </Routes>
  )
}
