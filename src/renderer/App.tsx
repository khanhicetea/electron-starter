import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useState } from 'react'
import { orpc } from '@/lib/orpc'
import { AppSidebar } from '@/components/ui/app-sidebar'
import {
  SidebarProvider,
  SidebarInset,
  SidebarTrigger,
} from '@/components/ui/sidebar'
import { Separator } from '@/components/ui/separator'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbList,
  BreadcrumbPage,
} from '@/components/ui/breadcrumb'
import { Loader2, Trash2, Send, Plus } from 'lucide-react'

function App(): React.JSX.Element {
  const [activeView, setActiveView] = useState('home')
  const [message, setMessage] = useState('')
  const [noteTitle, setNoteTitle] = useState('')
  const [noteContent, setNoteContent] = useState('')
  const queryClient = useQueryClient()

  // Query: Get system info from main process
  const { data: systemInfo, isLoading } = useQuery(orpc.demo.getSystemInfo.queryOptions({}))

  // Mutation: Echo message
  const echoMutation = useMutation(orpc.demo.echo.mutationOptions({}))

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

  const getPageTitle = () => {
    switch (activeView) {
      case 'home':
        return 'Dashboard'
      case 'notes':
        return 'Notes'
      case 'database':
        return 'Database'
      case 'settings':
        return 'Settings'
      default:
        return 'Dashboard'
    }
  }

  const renderHomeView = () => (
    <div className="space-y-6">
      <div className="grid gap-6 md:grid-cols-2">
        {/* System Info Card */}
        <Card>
          <CardHeader>
            <CardTitle>System Information</CardTitle>
            <CardDescription>Platform details from main process</CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="flex items-center justify-center py-4">
                <Loader2 className="h-6 w-6 animate-spin" />
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-2 text-sm">
                <span className="text-muted-foreground">Platform:</span>
                <span className="font-mono">{systemInfo?.platform}</span>
                <span className="text-muted-foreground">Architecture:</span>
                <span className="font-mono">{systemInfo?.arch}</span>
                <span className="text-muted-foreground">Node Version:</span>
                <span className="font-mono">{systemInfo?.nodeVersion}</span>
                <span className="text-muted-foreground">Electron:</span>
                <span className="font-mono">{systemInfo?.electronVersion}</span>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Echo Demo Card */}
        <Card>
          <CardHeader>
            <CardTitle>Echo Demo</CardTitle>
            <CardDescription>Test the RPC mutation</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex gap-2">
              <Input
                placeholder="Enter a message..."
                value={message}
                onChange={(e) => setMessage(e.target.value)}
              />
              <Button
                onClick={() => echoMutation.mutate({ message })}
                disabled={echoMutation.isPending || !message}
              >
                {echoMutation.isPending ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Send className="h-4 w-4" />
                )}
              </Button>
            </div>
            {echoMutation.data && (
              <div className="rounded-lg bg-muted p-3 text-sm">
                <p><strong>Response:</strong> {echoMutation.data.echoed}</p>
                <p className="text-muted-foreground text-xs mt-1">
                  {new Date(echoMutation.data.timestamp).toLocaleString()}
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )

  const renderNotesView = () => (
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

  const renderDatabaseView = () => (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Database Status</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground">Database Type</span>
              <span className="font-mono">SQLite (better-sqlite3)</span>
            </div>
            <Separator />
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground">Query Builder</span>
              <span className="font-mono">Kysely</span>
            </div>
            <Separator />
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground">Total Notes</span>
              <span className="font-mono">{notes?.length || 0}</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )

  const renderSettingsView = () => (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Appearance</CardTitle>
          <CardDescription>Customize the look and feel</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>Sidebar</Label>
              <p className="text-sm text-muted-foreground">Use Cmd+B to toggle sidebar</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )

  const renderContent = () => {
    switch (activeView) {
      case 'home':
        return renderHomeView()
      case 'notes':
        return renderNotesView()
      case 'database':
        return renderDatabaseView()
      case 'settings':
        return renderSettingsView()
      default:
        return renderHomeView()
    }
  }

  return (
    <SidebarProvider>
      <AppSidebar activeView={activeView} onViewChange={setActiveView} />
      <SidebarInset>
        <header className="flex h-14 shrink-0 items-center gap-2 border-b px-4">
          <SidebarTrigger className="-ml-1" />
          <Separator orientation="vertical" className="mr-2 h-4" />
          <Breadcrumb>
            <BreadcrumbList>
              <BreadcrumbItem>
                <BreadcrumbPage>{getPageTitle()}</BreadcrumbPage>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>
        </header>
        <div className="flex flex-1 flex-col gap-4 p-4">
          {renderContent()}
        </div>
      </SidebarInset>
    </SidebarProvider>
  )
}

export default App