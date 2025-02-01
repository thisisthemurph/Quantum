import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import { BrowserRouter } from 'react-router'
import { TooltipProvider } from './components/ui/tooltip.tsx'
import { Toaster } from 'sonner';
import {QueryClient, QueryClientProvider} from "@tanstack/react-query";
import AppRoutes from "@/routes.tsx";
import {SettingsProvider} from "@/stores/SettingsProvider.tsx";
import {ThemeProvider} from "@/layouts/theme-provider.tsx";
import { UserProvider } from './stores/UserProvider.tsx'

const queryClient = new QueryClient();

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <UserProvider>
      <SettingsProvider>
        <TooltipProvider>
          <QueryClientProvider client={queryClient}>
            <BrowserRouter>
              <ThemeProvider defaultTheme="system" storageKey="vite-ui-theme">
                <AppRoutes />
              </ThemeProvider>
            </BrowserRouter>
          </QueryClientProvider>
        </TooltipProvider>
        <Toaster />
      </SettingsProvider>
    </UserProvider>
  </StrictMode>,
)
