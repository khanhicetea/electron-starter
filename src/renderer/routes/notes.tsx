import { createFileRoute } from '@tanstack/react-router'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { orpc } from '@/lib/orpc'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Loader2, Trash2, Plus } from 'lucide-react'
import { useState } from 'react'

export const Route = createFileRoute('/notes')({
  component: NotesComponent,
})

function NotesComponent() {
  const [noteTitle, setNoteTitle] = useState('')
  const [noteContent, setNoteContent] = useState('')
  const queryClient = useQueryClient()

  // Query: Get all notes
  const { data: notes, isLoading: notesLoading } = useQuery(orpc.notes.getAll.queryOptions({}))

  // Mutation: Create note
  const createNoteMutation = useMutation({
    ...orpc.notes.create.mutationOptions({}),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: orpc.notes.getAll.queryKey({})
      })
      setNoteTitle('')
      setNoteContent('')
    }
  })

  // Mutation: Delete note
  const deleteNoteMutation = useMutation({
    ...orpc.notes.delete.mutationOptions({}),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: orpc.notes.getAll.queryKey({})
      })
    }
  })

  const handleCreateNote = () => {
    if (noteTitle && noteContent) {
      createNoteMutation.mutate({ title: noteTitle, content: noteContent })
    }
  }

  return (
    <div className="space-y-6">
      <div className="grid gap-6 lg:grid-cols-3">
        {/* Create Note Form */}
        <Card className="lg:col-span-1">
          <CardHeader>
            <CardTitle>Create Note</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="title">Title</Label>
              <Input
                id="title"
                placeholder="Note title..."
                value={noteTitle}
                onChange={(e) => setNoteTitle(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="content">Content</Label>
              <Textarea
                id="content"
                placeholder="Note content..."
                value={noteContent}
                onChange={(e) => setNoteContent(e.target.value)}
                rows={4}
              />
            </div>
            <Button
              className="w-full"
              onClick={handleCreateNote}
              disabled={createNoteMutation.isPending || !noteTitle || !noteContent}
            >
              {createNoteMutation.isPending ? (
                <Loader2 className="h-4 w-4 animate-spin mr-2" />
              ) : (
                <Plus className="h-4 w-4 mr-2" />
              )}
              Create Note
            </Button>
          </CardContent>
        </Card>

        {/* Notes List */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>All Notes</CardTitle>
            <CardDescription>{notes?.length || 0} notes</CardDescription>
          </CardHeader>
          <CardContent>
            {notesLoading ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="h-6 w-6 animate-spin" />
              </div>
            ) : notes && notes.length > 0 ? (
              <div className="space-y-3">
                {notes.map((note) => (
                  <div
                    key={note.id}
                    className="flex items-start justify-between rounded-lg border p-4"
                  >
                    <div className="space-y-1">
                      <h4 className="font-medium">{note.title}</h4>
                      <p className="text-sm text-muted-foreground">{note.content}</p>
                      <p className="text-xs text-muted-foreground">
                        Created: {new Date(note.created_at).toLocaleString()}
                      </p>
                    </div>
                    <Button
                      variant="destructive"
                      size="icon-xs"
                      onClick={() => deleteNoteMutation.mutate({ id: note.id })}
                      disabled={deleteNoteMutation.isPending}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                No notes yet. Create one to get started!
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}