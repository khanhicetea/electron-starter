import type { Generated, Insertable, Selectable, Updateable } from 'kysely'

// ============ Notes Table ============

export interface NotesTable {
  id: Generated<number>
  title: string
  content: string
  created_at: Generated<string>
  updated_at: Generated<string>
}

export type Note = Selectable<NotesTable>
export type NewNote = Insertable<NotesTable>
export type NoteUpdate = Updateable<NotesTable>

// ============ Database Schema ============

export interface Database {
  notes: NotesTable
}
