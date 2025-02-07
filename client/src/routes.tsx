import {Route, Routes} from "react-router";
import RootLayout from "@/layouts/root-layout.tsx";
import HomePage from "@/pages/home";
import ItemListingPage from "@/pages/item-listing";
import CreateItemPage from "@/pages/item-create";
import ItemDetailsPage from "@/pages/item-details";
import LocationListingPage from "@/pages/location-listing";
import SettingsPage from "@/pages/settings";
import LocationDetailsPage from "@/pages/location-details";
import ItemGroupListingPage from "@/pages/item-group-listing";
import AuthenticationLayout from "@/layouts/authentication-layout.tsx";
import {LogInPage} from "@/pages/auth";
import ManageUserPage from "@/pages/settings/user-management/ManageUserPage.tsx";
import CreateUserPage from "@/pages/user-create";

export default function AppRoutes() {
  return (
    <Routes>
      <Route element={<AuthenticationLayout />}>
        <Route path="/login" element={<LogInPage />} />
      </Route>
      <Route element={<RootLayout />}>
        <Route index element={<HomePage />} />
        <Route path="/items" element={<ItemListingPage />} />
        <Route path="/items/group/:groupKey" element={<ItemGroupListingPage />} />
        <Route path="/items/create" element={<CreateItemPage />} />
        <Route path="/items/:itemId" element={<ItemDetailsPage />} />
        <Route path="/locations" element={<LocationListingPage />} />
        <Route path="/locations/:locationId" element={<LocationDetailsPage />} />
        <Route path="/settings" element={<SettingsPage />} />
        <Route path="/user/create" element={<CreateUserPage />} />
        <Route path="/user/:userId" element={<ManageUserPage />} />
      </Route>
    </Routes>
  )
}
