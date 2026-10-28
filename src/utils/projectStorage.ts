export type SavedDevice = {
id: number
type: 'phone' | 'tablet' | 'desktop'
width: number
x: number
y: number
}

export type SavedProject = {
id: string
name: string
websiteUrl: string
devices: SavedDevice[]
selectedDeviceId: number | null
background: string
backgroundName: string
backgroundImage: string
updatedAt: number
}

const STORAGE_KEY = 'frame-saved-projects'

export function getSavedProjects(): SavedProject[] {
try {
const stored = localStorage.getItem(STORAGE_KEY)

if (!stored) return []

const projects: unknown = JSON.parse(stored)

return Array.isArray(projects) ? (projects as SavedProject[]) : []

} catch {
return []
}
}

export function saveProject(project: SavedProject): void {
const projects = getSavedProjects()
const existingIndex = projects.findIndex(
(item) => item.id === project.id,
)

const updatedProjects =
existingIndex >= 0
? projects.map((item) =>
item.id === project.id ? project : item,
)
: [project, ...projects]

localStorage.setItem(STORAGE_KEY, JSON.stringify(updatedProjects))
}

export function deleteSavedProject(id: string): void {
const projects = getSavedProjects().filter(
(project) => project.id !== id,
)

localStorage.setItem(STORAGE_KEY, JSON.stringify(projects))
}