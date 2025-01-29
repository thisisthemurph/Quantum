import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import { BrowserRouter } from 'react-router'
import { TooltipProvider } from './components/ui/tooltip.tsx'
import { Toaster } from 'sonner';
import {QueryClient, QueryClientProvider} from "@tanstack/react-query";
import AppRoutes from "@/routes.tsx";
import {SettingsProvider} from "@/stores/SettingsProvider.tsx";

const queryClient = new QueryClient();

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <SettingsProvider>
      <TooltipProvider>
        <QueryClientProvider client={queryClient}>
          <BrowserRouter>
            <AppRoutes />
          </BrowserRouter>
        </QueryClientProvider>
      </TooltipProvider>
      <Toaster />
    </SettingsProvider>
  </StrictMode>,
)
