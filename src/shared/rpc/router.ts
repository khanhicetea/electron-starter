import { demoRouter } from './demo'
import { notesRouter } from './notes'

// ============ Router Definition ============

export const router = {
  demo: demoRouter,
  notes: notesRouter
}

export type AppRouter = typeof router