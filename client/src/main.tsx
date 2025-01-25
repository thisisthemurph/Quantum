import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import { BrowserRouter, Route, Routes } from 'react-router'
import HomePage from './pages/home/index.tsx'
import ItemListingPage from './pages/item-listing/index.tsx'
import RootLayout from './layouts/root-layout.tsx'
import LocationListingPage from './pages/location-listing/index.tsx'
import ItemDetailsPage from './pages/item-details/index.tsx'
import SettingsPage from './pages/settings/index.tsx'
import { TooltipProvider } from './components/ui/tooltip.tsx'
import CreateItemPage from './pages/item-create/index.tsx'
import { Toaster } from 'sonner';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <TooltipProvider>
      <BrowserRouter>
        <Routes>
          <Route element={<RootLayout />}>
            <Route index element={<HomePage />} />
            <Route path="/items" element={<ItemListingPage />} />
            <Route path="/items/create" element={<CreateItemPage />} />
            <Route path="/items/:itemId" element={<ItemDetailsPage />} />
            <Route path="/locations" element={<LocationListingPage />} />
            <Route path="/settings" element={<SettingsPage />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
    <Toaster />
  </StrictMode>,
)
