
import { useCallback, useEffect, useRef, useState } from 'react'
import StudioHeader from './components/layout/StudioHeader'
import StudioWorkspace from './components/studio/StudioWorkspace'

type Project = {
  id: string
  name: string
  websiteUrl: string
  updatedAt: number
}

type ProjectState = {
  projects: Project[]
  activeProjectId: string
}

type HistoryControls = {
  canUndo: boolean
  canRedo: boolean
  undo: () => void
  redo: () => void
}

const projectsStorageKey = 'frame.projects.v1'
const legacyProjectsMigrationKey = 'frame.legacy-projects-migrated.v1'

function createProject(name = 'Untitled project'): Project {
  return {
    id: crypto.randomUUID(),
    name,
    websiteUrl: '',
    updatedAt: Date.now(),
  }
}

function readProjectState(): ProjectState {
  try {
    const stored = localStorage.getItem(projectsStorageKey)
    if (stored) {
      const state = JSON.parse(stored) as Partial<ProjectState>
      const projects = Array.isArray(state.projects) ? state.projects : []
      if (projects.length > 0) {
        const migratedProjects = migrateLegacyProjects(projects)
        const activeProjectId = migratedProjects.some((project) => project.id === state.activeProjectId)
          ? state.activeProjectId!
          : migratedProjects[0].id
        return { projects: migratedProjects, activeProjectId }
      }
    }

    const migratedProjects = migrateLegacyProjects([])
    if (migratedProjects.length > 0) {
      return { projects: migratedProjects, activeProjectId: migratedProjects[0].id }
    }

    const project = createProject()
    const legacyWorkspace = localStorage.getItem('frame.workspace.v1')
    if (legacyWorkspace) {
      localStorage.setItem(`frame.workspace.v1:${project.id}`, legacyWorkspace)
    }
    return {
      projects: [{
        ...project,
        websiteUrl: localStorage.getItem('frame.websiteUrl.v1') ?? '',
      }],
      activeProjectId: project.id,
    }
  } catch {
    const project = createProject()
    return { projects: [project], activeProjectId: project.id }
  }
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value)
}

function isLegacySavedProject(value: unknown): value is Record<string, unknown> {
  if (!isRecord(value) || typeof value.id !== 'string' || typeof value.name !== 'string'
    || typeof value.websiteUrl !== 'string' || !Array.isArray(value.devices)) return false
  return value.devices.every((device) => isRecord(device)
    && typeof device.id === 'number'
    && ['phone', 'tablet', 'desktop'].includes(String(device.type))
    && ['width', 'x', 'y'].every((key) => typeof device[key] === 'number' && Number.isFinite(device[key])))
}

function migrateLegacyProjects(projects: Project[]): Project[] {
  if (localStorage.getItem(legacyProjectsMigrationKey)) return projects
  const storedLegacyProjects = localStorage.getItem('frame-saved-projects')
  if (!storedLegacyProjects) {
    localStorage.setItem(legacyProjectsMigrationKey, 'true')
    return projects
  }

  const legacyData: unknown = JSON.parse(storedLegacyProjects)
  if (!Array.isArray(legacyData)) {
    localStorage.setItem(legacyProjectsMigrationKey, 'true')
    return projects
  }

  const migrated: Project[] = []
  for (const legacy of legacyData) {
    if (!isLegacySavedProject(legacy) || projects.some((project) => project.id === legacy.id)) continue
    const devices = legacy.devices as { id: number }[]
    const project: Project = {
      id: legacy.id as string,
      name: legacy.name as string,
      websiteUrl: legacy.websiteUrl as string,
      updatedAt: typeof legacy.updatedAt === 'number' ? legacy.updatedAt : Date.now(),
    }
    const background = typeof legacy.background === 'string' ? legacy.background : '#24262B'
    const workspace = {
      devices,
      texts: [],
      selectedDeviceId: typeof legacy.selectedDeviceId === 'number' ? legacy.selectedDeviceId : null,
      selectedTextId: null,
      nextId: Math.max(0, ...devices.map((device) => device.id)) + 1,
      nextTextId: 1,
      activeBackground: background,
      customColor: background,
      backgroundImage: typeof legacy.backgroundImage === 'string' ? legacy.backgroundImage : '',
      backgroundName: typeof legacy.backgroundName === 'string' ? legacy.backgroundName : 'Studio',
    }
    localStorage.setItem(`frame.workspace.v1:${project.id}`, JSON.stringify(workspace))
    migrated.push(project)
  }

  localStorage.setItem(legacyProjectsMigrationKey, 'true')
  return [...migrated, ...projects]
}

function isValidWorkspace(value: unknown): value is Record<string, unknown> {
  if (!isRecord(value) || !Array.isArray(value.devices)) return false
  const validDevices = value.devices.every((device) => isRecord(device)
    && typeof device.id === 'number'
    && ['phone', 'tablet', 'desktop'].includes(String(device.type))
    && ['width', 'x', 'y'].every((key) => typeof device[key] === 'number' && Number.isFinite(device[key])))
  const validTexts = value.texts === undefined || (Array.isArray(value.texts) && value.texts.every((item) => isRecord(item)
    && typeof item.id === 'number'
    && typeof item.text === 'string'
    && ['x', 'y', 'fontSize'].every((key) => typeof item[key] === 'number' && Number.isFinite(item[key]))
    && typeof item.color === 'string'))
  const validStrings = ['activeBackground', 'customColor', 'backgroundImage', 'backgroundName']
    .every((key) => value[key] === undefined || typeof value[key] === 'string')
  return validDevices && validTexts && validStrings
}

function App() {
  const [projectState, setProjectState] = useState(readProjectState)
  const [isPreviewing, setIsPreviewing] = useState(false)
  const exportAction = useRef<() => void>(() => {})
  const [historyControls, setHistoryControls] = useState<HistoryControls>({
    canUndo: false,
    canRedo: false,
    undo: () => {},
    redo: () => {},
  })
  const registerExportAction = useCallback((handler: () => void) => {
    exportAction.current = handler
  }, [])
  const registerHistoryControls = useCallback((controls: HistoryControls) => {
    setHistoryControls(controls)
  }, [])
  const activeProject = projectState.projects.find(
    (project) => project.id === projectState.activeProjectId,
  ) ?? projectState.projects[0]

  useEffect(() => {
    try {
      localStorage.setItem(projectsStorageKey, JSON.stringify(projectState))
    } catch {
      // Keep the editor usable when browser storage is unavailable.
    }
  }, [projectState])

  function updateActiveProject(updates: Partial<Project>) {
    setProjectState((current) => ({
      ...current,
      projects: current.projects.map((project) =>
        project.id === current.activeProjectId
          ? { ...project, ...updates, updatedAt: Date.now() }
          : project,
      ),
    }))
  }

  function createNewProject(name: string) {
    const project = createProject(name)
    setProjectState((current) => ({
      projects: [...current.projects, project],
      activeProjectId: project.id,
    }))
  }

  function renameProject(id: string, name: string) {
    setProjectState((current) => ({
      ...current,
      projects: current.projects.map((project) =>
        project.id === id ? { ...project, name, updatedAt: Date.now() } : project,
      ),
    }))
  }

  function deleteProject(id: string) {
    setProjectState((current) => {
      const projects = current.projects.filter((project) => project.id !== id)
      const remaining = projects.length > 0 ? projects : [createProject()]
      return {
        projects: remaining,
        activeProjectId: current.activeProjectId === id
          ? remaining[0].id
          : current.activeProjectId,
      }
    })
    try {
      localStorage.removeItem(`frame.workspace.v1:${id}`)
    } catch {
      // Workspace cleanup is best effort.
    }
  }

  function createBackup() {
    const backup = {
      format: 'frame-project-backup',
      version: 1,
      exportedAt: new Date().toISOString(),
      activeProjectId: projectState.activeProjectId,
      projects: projectState.projects.map((project) => ({
        ...project,
        workspace: JSON.parse(localStorage.getItem(`frame.workspace.v1:${project.id}`) ?? 'null'),
      })),
    }
    const blob = new Blob([JSON.stringify(backup, null, 2)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = `FRAME-backup-${new Date().toISOString().slice(0, 10)}.json`
    document.body.appendChild(link)
    link.click()
    link.remove()
    window.setTimeout(() => URL.revokeObjectURL(url), 1000)
  }

  async function restoreBackup(file: File) {
    const data: unknown = JSON.parse(await file.text())
    if (!isRecord(data) || data.format !== 'frame-project-backup' || data.version !== 1 || !Array.isArray(data.projects)) {
      throw new Error('That file is not a supported FRAME backup.')
    }

    const backupProjects = data.projects
    if (backupProjects.length === 0 || !backupProjects.every((project) => isRecord(project)
      && typeof project.name === 'string'
      && typeof project.websiteUrl === 'string'
      && (project.workspace === null || isValidWorkspace(project.workspace)))) {
      throw new Error('The backup file contains incomplete or invalid project data.')
    }

    const restored = backupProjects.map((project) => ({
      sourceId: typeof project.id === 'string' ? project.id : '',
      project: createProject(project.name as string),
      workspace: project.workspace,
      websiteUrl: project.websiteUrl as string,
    }))
    const writtenKeys: string[] = []
    try {
      for (const entry of restored) {
        if (entry.workspace) {
          const key = `frame.workspace.v1:${entry.project.id}`
          localStorage.setItem(key, JSON.stringify(entry.workspace))
          writtenKeys.push(key)
        }
      }
    } catch {
      writtenKeys.forEach((key) => localStorage.removeItem(key))
      throw new Error('There is not enough browser storage space to restore this backup.')
    }

    const activeRestored = restored.find((entry) => entry.sourceId === data.activeProjectId) ?? restored[0]
    const projects = restored.map(({ project, websiteUrl }) => ({ ...project, websiteUrl }))
    setProjectState((current) => ({
      projects: [...current.projects, ...projects],
      activeProjectId: activeRestored.project.id,
    }))
    return `Restored ${projects.length} project${projects.length === 1 ? '' : 's'}.`
  }

  return (
    <div className="min-h-dvh bg-[#F5F5F1] text-[#202124]">
      <StudioHeader
        projects={projectState.projects}
        activeProjectId={activeProject.id}
        onSwitchProject={(id) => setProjectState((current) => ({ ...current, activeProjectId: id }))}
        onCreateProject={createNewProject}
        onRenameProject={renameProject}
        onDeleteProject={deleteProject}
        canUndo={historyControls.canUndo}
        canRedo={historyControls.canRedo}
        onUndo={historyControls.undo}
        onRedo={historyControls.redo}
        onPreview={() => setIsPreviewing(true)}
        onExport={() => exportAction.current()}
        onCreateBackup={createBackup}
        onRestoreBackup={restoreBackup}
        onLoadWebsite={(websiteUrl) => updateActiveProject({ websiteUrl })}
      />

      <StudioWorkspace
        key={activeProject.id}
        projectId={activeProject.id}
        projectName={activeProject.name}
        websiteUrl={activeProject.websiteUrl}
        isPreviewing={isPreviewing}
        onClosePreview={() => setIsPreviewing(false)}
        onRegisterExport={registerExportAction}
        onRegisterHistory={registerHistoryControls}
      />
    </div>
  )
}

export default App
