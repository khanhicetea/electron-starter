import '@/styles.css'

import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { createRouter, RouterProvider } from '@tanstack/react-router'
import { QueryClient } from '@tanstack/react-query'
import { QueryProvider } from '@/lib/QueryProvider'

// Import the generated route tree
import { routeTree } from '@/routes/routeTree.gen'

// Create a query client
const queryClient = new QueryClient()

// Create the router instance
const router = createRouter({
  routeTree,
  context: {
    queryClient,
  },
})

// Register the router for type safety
declare module '@tanstack/react-router' {
  interface Register {
    router: typeof router
  }
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <QueryProvider>
      <RouterProvider router={router} />
    </QueryProvider>
  </StrictMode>
)