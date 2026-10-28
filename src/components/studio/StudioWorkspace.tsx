
import { useRef, useState } from 'react'
import type { PointerEvent as ReactPointerEvent } from 'react'
import {
  Hand,
  Image,
  MousePointer2,
  Smartphone,
  Type,
} from 'lucide-react'

import type {
  DeviceItem,
  DeviceType,
  BackgroundPreset,
  StudioWorkspaceProps,
} from '../../types/studio'

import {
  initialDevices,
  getDeviceWidth,
} from '../../types/studio'

import {
  getSavedProjects,
  saveProject,
  deleteSavedProject,
  type SavedProject,
} from '../../utils/projectStorage'

import WorkspaceSidebar from './WorkspaceSidebar'
import StudioToolbar from './StudioToolbar'
import DeviceCanvas from './DeviceCanvas'
import PropertiesPanel from './PropertiesPanel'
import ProjectsModal from './ProjectsModal'

const tools = [
  { id: 'select', label: 'Select', icon: MousePointer2 },
  { id: 'hand', label: 'Hand', icon: Hand },
  { id: 'devices', label: 'Devices', icon: Smartphone },
  { id: 'text', label: 'Text', icon: Type },
  { id: 'image', label: 'Image', icon: Image },
] as const

type ToolId = (typeof tools)[number]['id']

function StudioWorkspace({
  websiteUrl,
  onRestoreWebsite,
  onProjectNameChange,
}: StudioWorkspaceProps) {
  const [devices, setDevices] = useState<DeviceItem[]>(initialDevices)
  const [selectedDeviceId, setSelectedDeviceId] = useState<number | null>(1)
  const [nextId, setNextId] = useState(2)
  const [newDeviceType, setNewDeviceType] = useState<DeviceType>('phone')
  const [activeTool, setActiveTool] = useState<ToolId>('select')

  const [activeBackground, setActiveBackground] = useState('#24262B')
  const [customColor, setCustomColor] = useState('#24262B')
  const [backgroundName, setBackgroundName] = useState('Studio')
  const [backgroundImage, setBackgroundImage] = useState('')

  const [projectId, setProjectId] = useState(() => String(Date.now()))
  const [projectName, setProjectName] = useState('Untitled project')
  const [showProjects, setShowProjects] = useState(false)
  const [savedProjects, setSavedProjects] = useState<SavedProject[]>([])

  const canvasRef = useRef<HTMLDivElement>(null)

  const selectedDevice =
    devices.find((device) => device.id === selectedDeviceId) ?? null

  function updateProjectName(name: string) {
    setProjectName(name)
    onProjectNameChange(name)
  }

  function addDevice() {
    const id = nextId
    const width = getDeviceWidth(newDeviceType)
    const canvasWidth = canvasRef.current?.clientWidth ?? 1000

    const device: DeviceItem = {
      id,
      type: newDeviceType,
      width,
      x: Math.max(20, Math.round(canvasWidth / 2 - width / 2)),
      y: 100 + devices.length * 30,
    }

    setDevices((current) => [...current, device])
    setSelectedDeviceId(id)
    setNextId((current) => current + 1)
    setActiveTool('select')
  }

  function updateDeviceWidth(width: number) {
    if (selectedDeviceId === null) return

    setDevices((current) =>
      current.map((device) =>
        device.id === selectedDeviceId ? { ...device, width } : device,
      ),
    )
  }

  function changeDeviceType(type: DeviceType) {
    setNewDeviceType(type)

    if (selectedDeviceId === null) return

    setDevices((current) =>
      current.map((device) =>
        device.id === selectedDeviceId
          ? { ...device, type, width: getDeviceWidth(type) }
          : device,
      ),
    )
  }

  function removeDevice(id: number) {
    setDevices((current) => current.filter((device) => device.id !== id))

    if (selectedDeviceId === id) {
      const remaining = devices.filter((device) => device.id !== id)
      setSelectedDeviceId(remaining[0]?.id ?? null)
    }
  }

  function moveDevice(
    event: ReactPointerEvent<HTMLButtonElement>,
    device: DeviceItem,
  ) {
    if (activeTool !== 'select' && activeTool !== 'hand') return

    event.preventDefault()
    event.stopPropagation()
    setSelectedDeviceId(device.id)

    const startX = event.clientX
    const startY = event.clientY
    const originalX = device.x
    const originalY = device.y
    const target = event.currentTarget

    target.setPointerCapture(event.pointerId)

    function handleMove(moveEvent: PointerEvent) {
      setDevices((current) =>
        current.map((item) =>
          item.id === device.id
            ? {
                ...item,
                x: Math.max(0, originalX + moveEvent.clientX - startX),
                y: Math.max(0, originalY + moveEvent.clientY - startY),
              }
            : item,
        ),
      )
    }

    function handleUp() {
      target.removeEventListener('pointermove', handleMove)
      target.removeEventListener('pointerup', handleUp)
      target.removeEventListener('pointercancel', handleUp)
    }

    target.addEventListener('pointermove', handleMove)
    target.addEventListener('pointerup', handleUp)
    target.addEventListener('pointercancel', handleUp)
  }

  function chooseBackground(preset: BackgroundPreset) {
    setActiveBackground(preset.value)
    setCustomColor(preset.value)
    setBackgroundName(preset.name)
    setBackgroundImage('')
  }

  function chooseColor(color: string) {
    setActiveBackground(color)
    setCustomColor(color)
    setBackgroundName('Custom')
    setBackgroundImage('')
  }

  function chooseBackgroundImage(file: File) {
    if (!file.type.startsWith('image/')) {
      window.alert('Please choose an image file.')
      return
    }

    const reader = new FileReader()

    reader.onload = () => {
      if (typeof reader.result === 'string') {
        setBackgroundImage(reader.result)
        setBackgroundName(file.name)
      }
    }

    reader.onerror = () => {
      window.alert('Could not load that image.')
    }

    reader.readAsDataURL(file)
  }

  function resetCanvas() {
    setDevices(initialDevices)
    setSelectedDeviceId(1)
    setNextId(2)
    setActiveBackground('#24262B')
    setCustomColor('#24262B')
    setBackgroundName('Studio')
    setBackgroundImage('')
    setNewDeviceType('phone')
    setActiveTool('select')
  }

  function saveCurrentProject() {
    let name = projectName

    if (name === 'Untitled project') {
      const entered = window.prompt(
        'Name your project:',
        'My FRAME project',
      )

      if (!entered?.trim()) return

      name = entered.trim()
      updateProjectName(name)
    }

    const project: SavedProject = {
      id: projectId,
      name,
      websiteUrl,
      devices,
      selectedDeviceId,
      background: activeBackground,
      backgroundName,
      backgroundImage,
      updatedAt: Date.now(),
    }

    try {
      saveProject(project)
      setSavedProjects(getSavedProjects())
      window.alert(`Project "${name}" saved successfully.`)
    } catch {
      window.alert(
        'Could not save this project. Try using a smaller background image.',
      )
    }
  }

  function openProjects() {
    setSavedProjects(getSavedProjects())
    setShowProjects(true)
  }

  function loadSavedProject(project: SavedProject) {
    setProjectId(project.id)
    updateProjectName(project.name)
    setDevices(project.devices)
    setSelectedDeviceId(project.selectedDeviceId)
    setNextId(
      Math.max(0, ...project.devices.map((device) => device.id)) + 1,
    )
    setActiveBackground(project.background)
    setCustomColor(project.background)
    setBackgroundName(project.backgroundName)
    setBackgroundImage(project.backgroundImage)
    setNewDeviceType('phone')
    setActiveTool('select')
    onRestoreWebsite(project.websiteUrl)
    setShowProjects(false)
  }

  function handleDeleteProject(project: SavedProject) {
    const confirmed = window.confirm(
      `Delete "${project.name}"? This cannot be undone.`,
    )

    if (!confirmed) return

    deleteSavedProject(project.id)
    setSavedProjects((current) =>
      current.filter((item) => item.id !== project.id),
    )
  }

  function createNewProject() {
    const confirmed = window.confirm(
      'Start a new project? Save your current work first if you want to keep it.',
    )

    if (!confirmed) return

    setProjectId(String(Date.now()))
    updateProjectName('Untitled project')
    resetCanvas()
    onRestoreWebsite('')
    setShowProjects(false)
  }

  return (
    <main className="flex min-h-[calc(100dvh-64px)] flex-col overflow-hidden lg:flex-row">
      {/* Tool rail */}
      <aside className="flex shrink-0 items-center gap-1 border-b border-[#E5E5DF] bg-white px-2 py-2 lg:w-[58px] lg:flex-col lg:border-r lg:border-b-0 lg:px-0 lg:py-4">
        {tools.map((tool) => {
          const Icon = tool.icon
          const active = activeTool === tool.id

          return (
            <button
              key={tool.id}
              type="button"
              title={tool.label}
              aria-label={tool.label}
              onClick={() => {
                setActiveTool(tool.id)

                if (tool.id === 'devices') addDevice()

                if (tool.id === 'image') {
                  window.alert(
                    'Use the Background upload control to add a background image.',
                  )
                }

                if (tool.id === 'text') {
                  window.alert('Text layers are not implemented yet.')
                }
              }}
              className={`flex size-10 shrink-0 items-center justify-center rounded-xl transition-colors ${
                active
                  ? 'bg-[#F8E6DF] text-[#9C5845]'
                  : 'text-[#777971] hover:bg-[#F5F5F1] hover:text-[#202124]'
              }`}
            >
              <Icon size={18} strokeWidth={1.8} />
            </button>
          )
        })}
      </aside>

      <WorkspaceSidebar
        devices={devices}
        selectedDeviceId={selectedDeviceId}
        background={activeBackground}
        customColor={customColor}
        backgroundName={backgroundName}
        backgroundImage={backgroundImage}
        onSelectDevice={setSelectedDeviceId}
        onRemoveDevice={removeDevice}
        onAddDevice={addDevice}
        onChooseBackground={chooseBackground}
        onChooseColor={chooseColor}
        onChooseImage={chooseBackgroundImage}
      />

      <section className="flex min-h-[520px] min-w-0 flex-1 flex-col bg-[#F5F5F1]">
        <StudioToolbar
          deviceCount={devices.length}
          deviceType={newDeviceType}
          onDeviceTypeChange={setNewDeviceType}
          onAddDevice={addDevice}
          onOpenProjects={openProjects}
          onNewProject={createNewProject}
          onSaveProject={saveCurrentProject}
          onResetCanvas={resetCanvas}
        />

        <DeviceCanvas
          devices={devices}
          websiteUrl={websiteUrl}
          selectedDeviceId={selectedDeviceId}
          background={activeBackground}
          backgroundImage={backgroundImage}
          onSelectDevice={setSelectedDeviceId}
          onRemoveDevice={removeDevice}
          onMoveDevice={moveDevice}
          canvasRef={canvasRef}
          onAddDevice={addDevice}
        />

        <div className="flex min-h-9 items-center justify-between gap-3 border-t border-[#E5E5DF] bg-white px-4 text-[10px] text-[#777971]">
          <span className="truncate">
            {projectName} · {backgroundName} background
          </span>
          <span className="shrink-0">
            {selectedDevice ? `${selectedDevice.type} selected` : 'No device selected'}
          </span>
        </div>
      </section>

      <PropertiesPanel
        device={selectedDevice}
        onChangeType={changeDeviceType}
        onChangeWidth={updateDeviceWidth}
        onRemove={() => {
          if (selectedDevice) removeDevice(selectedDevice.id)
        }}
        websiteUrl={websiteUrl}
      />

      <ProjectsModal
        open={showProjects}
        projects={savedProjects}
        onClose={() => setShowProjects(false)}
        onOpenProject={loadSavedProject}
        onDeleteProject={handleDeleteProject}
        onNewProject={createNewProject}
      />
    </main>
  )
}

export default StudioWorkspace
