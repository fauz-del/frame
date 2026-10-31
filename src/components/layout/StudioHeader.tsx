
import { useRef, useState } from 'react'
import type { FormEvent } from 'react'
import {
  Clapperboard,
  CloudCheck,
  ChevronDown,
  Check,
  Eye,
  FolderPlus,
  Pencil,
  Redo2,
  Undo2,
  Download,
  Trash2,
  Upload,
  X,
} from 'lucide-react'
import WebsiteUrlBar from '../studio/WebsiteUrlBar'

type StudioHeaderProps = {
  projects: { id: string; name: string }[]
  activeProjectId: string
  onSwitchProject: (id: string) => void
  onCreateProject: (name: string) => void
  onRenameProject: (id: string, name: string) => void
  onDeleteProject: (id: string) => void
  canUndo: boolean
  canRedo: boolean
  onUndo: () => void
  onRedo: () => void
  onPreview?: () => void
  onExport?: () => void
  onCreateBackup: () => void
  onRestoreBackup: (file: File) => Promise<string>
  onLoadWebsite: (url: string) => void
}

function StudioHeader({
  projects,
  activeProjectId,
  onSwitchProject,
  onCreateProject,
  onRenameProject,
  onDeleteProject,
  canUndo,
  canRedo,
  onUndo,
  onRedo,
  onPreview,
  onExport,
  onCreateBackup,
  onRestoreBackup,
  onLoadWebsite,
}: StudioHeaderProps) {
  const [creating, setCreating] = useState(false)
  const [newName, setNewName] = useState('')
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editName, setEditName] = useState('')
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null)
  const [backupMessage, setBackupMessage] = useState('')
  const backupInputRef = useRef<HTMLInputElement>(null)
  const activeProject = projects.find((project) => project.id === activeProjectId) ?? projects[0]

  function submitNewProject(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const name = newName.trim()
    if (!name) return
    onCreateProject(name)
    setNewName('')
    setCreating(false)
    if (document.activeElement instanceof HTMLElement) document.activeElement.blur()
  }

  function submitRename(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const name = editName.trim()
    if (!name || !editingId) return
    onRenameProject(editingId, name)
    setEditingId(null)
  }

  async function handleBackupFile(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0]
    if (!file) return
    try {
      setBackupMessage(await onRestoreBackup(file))
    } catch (error) {
      setBackupMessage(error instanceof Error ? error.message : 'Could not restore this backup.')
    } finally {
      event.target.value = ''
    }
  }

  return (
    <header className="flex min-h-16 items-center justify-between gap-3 border-b border-[#E5E5DF] bg-white px-3 sm:px-6">
      {/* Brand and project information */}
      <div className="flex min-w-0 shrink-0 items-center gap-3">
        <div className="flex size-9 shrink-0 items-center justify-center rounded-xl bg-[#24262B] text-white">
          <Clapperboard size={19} strokeWidth={1.8} />
        </div>

        <div className="hidden sm:block">
          <h1 className="font-[Manrope] text-sm font-extrabold tracking-tight text-[#202124]">
            FRAME
          </h1>
          <p className="text-[9px] font-semibold tracking-[0.16em] text-[#777971]">
            WEBSITE STUDIO
          </p>
        </div>

        <div className="mx-1 hidden h-7 w-px bg-[#E5E5DF] lg:block" />

        <details className="group relative">
          <summary className="flex max-w-44 list-none cursor-pointer items-center gap-1 rounded-lg px-2 py-1.5 text-sm font-medium text-[#44453F] hover:bg-[#F5F5F1] [&::-webkit-details-marker]:hidden">
            <span className="max-w-32 truncate">{activeProject.name}</span>
            <ChevronDown size={14} className="shrink-0 text-[#777971]" />
          </summary>
          <div className="absolute left-0 top-full z-50 mt-2 w-72 rounded-xl border border-[#E5E5DF] bg-white p-2 shadow-xl">
            <div className="flex items-center justify-between px-2 py-1.5">
              <span className="text-[11px] font-bold uppercase tracking-wider text-[#777971]">Your projects</span>
              <button
                type="button"
                onClick={() => { setCreating(true); setEditingId(null); setConfirmDeleteId(null) }}
                className="flex items-center gap-1 rounded-md px-2 py-1 text-xs font-medium text-[#A75E48] hover:bg-[#F8E5DE]"
              >
                <FolderPlus size={14} /> New
              </button>
            </div>

            {creating && (
              <form onSubmit={submitNewProject} className="mb-2 flex gap-1.5 rounded-lg bg-[#F5F5F1] p-2">
                <input
                  autoFocus
                  value={newName}
                  onChange={(event) => setNewName(event.target.value)}
                  placeholder="Project name"
                  aria-label="New project name"
                  maxLength={60}
                  className="h-8 min-w-0 flex-1 rounded-md border border-[#E5E5DF] bg-white px-2 text-xs"
                />
                <button type="submit" disabled={!newName.trim()} aria-label="Create project" className="flex size-8 items-center justify-center rounded-md bg-[#24262B] text-white disabled:opacity-40"><Check size={15} /></button>
                <button type="button" onClick={() => { setCreating(false); setNewName('') }} aria-label="Cancel" className="flex size-8 items-center justify-center rounded-md text-[#777971] hover:bg-white"><X size={15} /></button>
              </form>
            )}

            <div className="max-h-64 space-y-1 overflow-y-auto">
              {projects.map((project) => (
                <div key={project.id} className={`rounded-lg ${project.id === activeProjectId ? 'bg-[#F8E5DE]' : 'hover:bg-[#F5F5F1]'}`}>
                  {editingId === project.id ? (
                    <form onSubmit={submitRename} className="flex gap-1 p-1.5">
                      <input autoFocus value={editName} onChange={(event) => setEditName(event.target.value)} aria-label="Rename project" maxLength={60} className="h-8 min-w-0 flex-1 rounded-md border border-[#E5E5DF] bg-white px-2 text-xs" />
                      <button type="submit" disabled={!editName.trim()} aria-label="Save project name" className="flex size-8 items-center justify-center rounded-md bg-[#24262B] text-white disabled:opacity-40"><Check size={15} /></button>
                      <button type="button" onClick={() => setEditingId(null)} aria-label="Cancel rename" className="flex size-8 items-center justify-center rounded-md text-[#777971]"><X size={15} /></button>
                    </form>
                  ) : confirmDeleteId === project.id ? (
                    <div className="flex items-center justify-between gap-2 p-2">
                      <span className="text-xs text-[#44453F]">Delete “{project.name}”?</span>
                      <div className="flex gap-1">
                        <button type="button" onClick={() => setConfirmDeleteId(null)} className="rounded-md px-2 py-1 text-xs text-[#777971] hover:bg-white">Cancel</button>
                        <button type="button" onClick={() => { onDeleteProject(project.id); setConfirmDeleteId(null) }} className="rounded-md bg-red-600 px-2 py-1 text-xs font-medium text-white">Delete</button>
                      </div>
                    </div>
                  ) : (
                    <div className="flex items-center gap-1">
                      <button
                        type="button"
                        onClick={(event) => { onSwitchProject(project.id); event.currentTarget.closest('details')?.removeAttribute('open') }}
                        className="min-w-0 flex-1 truncate px-2.5 py-2 text-left text-sm text-[#44453F]"
                      >
                        {project.name}
                        {project.id === activeProjectId && <span className="ml-2 text-[10px] text-[#A75E48]">Open</span>}
                      </button>
                      <button type="button" onClick={() => { setEditingId(project.id); setEditName(project.name); setConfirmDeleteId(null); setCreating(false) }} aria-label={`Rename ${project.name}`} title="Rename" className="flex size-8 items-center justify-center rounded-md text-[#777971] hover:bg-white"><Pencil size={14} /></button>
                      <button type="button" onClick={() => { setConfirmDeleteId(project.id); setEditingId(null); setCreating(false) }} aria-label={`Delete ${project.name}`} title="Delete" className="mr-1 flex size-8 items-center justify-center rounded-md text-[#777971] hover:bg-red-50 hover:text-red-600"><Trash2 size={14} /></button>
                    </div>
                  )}
                </div>
              ))}
            </div>
            <div className="mt-2 flex gap-2 border-t border-[#E5E5DF] pt-2">
              <button type="button" onClick={() => { setBackupMessage(''); onCreateBackup() }} className="flex flex-1 items-center justify-center gap-1.5 rounded-lg border border-[#E5E5DF] px-2 py-2 text-xs font-medium text-[#44453F] hover:bg-[#F5F5F1]">
                <Download size={14} /> Back up
              </button>
              <button type="button" onClick={() => { setBackupMessage(''); backupInputRef.current?.click() }} className="flex flex-1 items-center justify-center gap-1.5 rounded-lg border border-[#E5E5DF] px-2 py-2 text-xs font-medium text-[#44453F] hover:bg-[#F5F5F1]">
                <Upload size={14} /> Restore
              </button>
              <input ref={backupInputRef} type="file" accept=".json,application/json" onChange={handleBackupFile} className="hidden" />
            </div>
            {backupMessage && <p className="px-2 pt-1 text-[11px] text-[#777971]">{backupMessage}</p>}
            <p className="mt-2 border-t border-[#E5E5DF] px-2 pt-2 text-[10px] text-[#92938D]">Projects are saved in this browser on this device.</p>
          </div>
        </details>

        <span
          className="hidden items-center gap-1.5 text-xs text-[#777971] xl:flex"
          title="Your project is saved locally in this browser"
        >
          <CloudCheck size={15} />
          <span>Saved locally</span>
        </span>
      </div>

      {/* Website URL input */}
      <div className="min-w-0 flex-1">
        <WebsiteUrlBar onLoad={onLoadWebsite} />
      </div>

      {/* Editor actions */}
      <div className="flex shrink-0 items-center gap-1.5">
        <div className="mr-1 hidden items-center gap-1 sm:flex">
          <button
            type="button"
            disabled={!canUndo}
            onClick={onUndo}
            aria-label="Undo"
            title="Undo (Ctrl+Z)"
            className="flex size-9 items-center justify-center rounded-lg text-[#A1A29C] hover:bg-[#F5F5F1] disabled:cursor-not-allowed"
          >
            <Undo2 size={17} />
          </button>

          <button
            type="button"
            disabled={!canRedo}
            onClick={onRedo}
            aria-label="Redo"
            title="Redo (Ctrl+Shift+Z or Ctrl+Y)"
            className="flex size-9 items-center justify-center rounded-lg text-[#A1A29C] hover:bg-[#F5F5F1] disabled:cursor-not-allowed"
          >
            <Redo2 size={17} />
          </button>
        </div>

        <button
          type="button"
          onClick={onPreview}
          aria-label="Preview"
          className="flex size-9 shrink-0 items-center justify-center rounded-lg border border-[#E5E5DF] text-[#44453F] transition-colors hover:bg-[#F5F5F1] sm:w-auto sm:px-3"
        >
          <Eye size={16} />
          <span className="hidden sm:ml-2 sm:inline text-sm font-medium">
            Preview
          </span>
        </button>

        <button
          type="button"
          onClick={onExport}
          className="flex h-9 shrink-0 items-center gap-2 rounded-lg bg-[#24262B] px-3 text-sm font-medium text-white transition-colors hover:bg-[#383A40]"
        >
          <Download size={16} />
          <span>Export</span>
        </button>
      </div>
    </header>
  )
}

export default StudioHeader
