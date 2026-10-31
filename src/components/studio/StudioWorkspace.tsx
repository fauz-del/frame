
import { useCallback, useEffect, useRef, useState } from 'react'
import type { CSSProperties, MouseEvent as ReactMouseEvent, PointerEvent as ReactPointerEvent } from 'react'
import {
  Hand,
  Image,
  MousePointer2,
  Smartphone,
  Type,
  Plus,
  Monitor,
  Tablet,
} from 'lucide-react'
import WorkspaceSidebar from './WorkspaceSidebar'
import StudioToolbar from './StudioToolbar'
import DeviceCanvas from './DeviceCanvas'
import PropertiesPanel from './PropertiesPanel'
import { initialDevices } from '../../types/studio'
import type { BackgroundPreset, DeviceItem, DeviceType, TextItem } from '../../types/studio'

type StudioWorkspaceProps = {
  projectId: string
  projectName: string
  websiteUrl: string
  isPreviewing: boolean
  onClosePreview: () => void
  onRegisterExport: (handler: () => void) => void
  onRegisterHistory: (controls: { canUndo: boolean; canRedo: boolean; undo: () => void; redo: () => void }) => void
}

function escapeHtml(value: string) {
  return value.replace(/[&<>"']/g, (character) => ({
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#39;',
  })[character] ?? character)
}

function workspaceStorageKey(projectId: string) {
  return `frame.workspace.v1:${projectId}`
}

type SavedWorkspace = {
  devices: DeviceItem[]
  texts: TextItem[]
  selectedDeviceId: number | null
  selectedTextId: number | null
  nextId: number
  nextTextId: number
  activeBackground: string
  customColor: string
  backgroundImage: string
  backgroundName: string
}

type CanvasSnapshot = Pick<SavedWorkspace,
  'devices' | 'texts' | 'nextId' | 'nextTextId' | 'activeBackground' | 'customColor' | 'backgroundImage' | 'backgroundName'
>

function readSavedWorkspace(projectId: string): SavedWorkspace | null {
  try {
    const saved = localStorage.getItem(workspaceStorageKey(projectId))
    if (!saved) return null

    const workspace = JSON.parse(saved) as Partial<SavedWorkspace>
    if (!Array.isArray(workspace.devices)) return null

    return {
      devices: workspace.devices,
      texts: workspace.texts ?? [],
      selectedDeviceId: workspace.selectedDeviceId ?? null,
      selectedTextId: workspace.selectedTextId ?? null,
      nextId: workspace.nextId ?? 2,
      nextTextId: workspace.nextTextId ?? 1,
      activeBackground: workspace.activeBackground ?? '#24262B',
      customColor: workspace.customColor ?? '#24262B',
      backgroundImage: workspace.backgroundImage ?? '',
      backgroundName: workspace.backgroundName ?? 'Studio',
    }
  } catch {
    return null
  }
}

function StudioWorkspace({
  projectId,
  projectName,
  websiteUrl,
  isPreviewing,
  onClosePreview,
  onRegisterExport,
  onRegisterHistory,
}: StudioWorkspaceProps) {
  const [savedWorkspace] = useState(() => readSavedWorkspace(projectId))
  const [devices, setDevices] = useState<DeviceItem[]>(savedWorkspace?.devices ?? initialDevices)
  const [texts, setTexts] = useState<TextItem[]>(savedWorkspace?.texts ?? [])
  const [selectedDeviceId, setSelectedDeviceId] = useState<number | null>(savedWorkspace?.selectedDeviceId ?? 1)
  const [selectedTextId, setSelectedTextId] = useState<number | null>(savedWorkspace?.selectedTextId ?? null)
  const [nextId, setNextId] = useState(savedWorkspace?.nextId ?? 2)
  const [nextTextId, setNextTextId] = useState(savedWorkspace?.nextTextId ?? 1)
  const [newDeviceType, setNewDeviceType] = useState<DeviceType>('tablet')

  const [activeTool, setActiveTool] = useState<'select' | 'pan' | 'text'>('select')
  const [activeBackground, setActiveBackground] = useState(savedWorkspace?.activeBackground ?? '#24262B')
  const [customColor, setCustomColor] = useState(savedWorkspace?.customColor ?? '#24262B')
  const [backgroundImage, setBackgroundImage] = useState(savedWorkspace?.backgroundImage ?? '')
  const [backgroundName, setBackgroundName] = useState(savedWorkspace?.backgroundName ?? 'Studio')
  const [saveStatus, setSaveStatus] = useState<'saved' | 'error'>('saved')
  const [canUndo, setCanUndo] = useState(false)
  const [canRedo, setCanRedo] = useState(false)
  const [isPanning, setIsPanning] = useState(false)
  const [previewLayout, setPreviewLayout] = useState({ width: 900, height: 620, scale: 1 })

  const canvasRef = useRef<HTMLDivElement>(null)
  const previewViewportRef = useRef<HTMLDivElement>(null)
  const panStartRef = useRef<{
    pointerId: number
    startX: number
    startY: number
    scrollLeft: number
    scrollTop: number
  } | null>(null)
  const historyRef = useRef<{ past: CanvasSnapshot[]; future: CanvasSnapshot[] }>({ past: [], future: [] })
  const currentSnapshotRef = useRef<CanvasSnapshot | null>(null)
  const historyChangeTimeRef = useRef(0)
  const historyActionsRef = useRef<{ undo: () => void; redo: () => void }>({ undo: () => {}, redo: () => {} })

  useEffect(() => {
    const timeout = window.setTimeout(() => {
      try {
        localStorage.setItem(
          workspaceStorageKey(projectId),
          JSON.stringify({
            devices,
            texts,
            selectedDeviceId,
            selectedTextId,
            nextId,
            nextTextId,
            activeBackground,
            customColor,
            backgroundImage,
            backgroundName,
          } satisfies SavedWorkspace),
        )
        setSaveStatus('saved')
      } catch {
        setSaveStatus('error')
      }
    }, 300)

    return () => window.clearTimeout(timeout)
  }, [projectId, devices, texts, selectedDeviceId, selectedTextId, nextId, nextTextId, activeBackground, customColor, backgroundImage, backgroundName])

  useEffect(() => {
    const snapshot: CanvasSnapshot = {
      devices,
      texts,
      nextId,
      nextTextId,
      activeBackground,
      customColor,
      backgroundImage,
      backgroundName,
    }
    const previous = currentSnapshotRef.current
    if (!previous) {
      currentSnapshotRef.current = snapshot
      return
    }
    if (JSON.stringify(previous) === JSON.stringify(snapshot)) return

    const now = Date.now()
    if (now - historyChangeTimeRef.current > 500) {
      historyRef.current.past.push(previous)
      if (historyRef.current.past.length > 100) historyRef.current.past.shift()
    }
    historyRef.current.future = []
    currentSnapshotRef.current = snapshot
    historyChangeTimeRef.current = now
    setCanUndo(historyRef.current.past.length > 0)
    setCanRedo(false)
  }, [devices, texts, nextId, nextTextId, activeBackground, customColor, backgroundImage, backgroundName])

  useEffect(() => {
    if (isPreviewing) return

    function handleHistoryShortcut(event: KeyboardEvent) {
      if (!event.ctrlKey || event.altKey) return
      const target = event.target
      if (target instanceof HTMLElement && (target.isContentEditable || target.closest('input, textarea, select'))) return

      const key = event.key.toLowerCase()
      if (key === 'z') {
        event.preventDefault()
        if (event.shiftKey) historyActionsRef.current.redo()
        else historyActionsRef.current.undo()
      } else if (key === 'y') {
        event.preventDefault()
        historyActionsRef.current.redo()
      }
    }

    window.addEventListener('keydown', handleHistoryShortcut)
    return () => window.removeEventListener('keydown', handleHistoryShortcut)
  }, [isPreviewing])

  useEffect(() => {
    if (!isPreviewing) return

    function closeOnEscape(event: KeyboardEvent) {
      if (event.key === 'Escape') onClosePreview()
    }

    window.addEventListener('keydown', closeOnEscape)
    return () => window.removeEventListener('keydown', closeOnEscape)
  }, [isPreviewing, onClosePreview])

  useEffect(() => {
    if (!isPreviewing) return

    if (!canvasRef.current || !previewViewportRef.current) return
    const canvas = canvasRef.current
    const viewport = previewViewportRef.current

    function updatePreviewLayout() {
      const canvasRect = canvas.getBoundingClientRect()
      const viewportStyle = window.getComputedStyle(viewport)
      const availableWidth = viewport.clientWidth
        - parseFloat(viewportStyle.paddingLeft)
        - parseFloat(viewportStyle.paddingRight)
      const availableHeight = viewport.clientHeight
        - parseFloat(viewportStyle.paddingTop)
        - parseFloat(viewportStyle.paddingBottom)
      const width = canvasRect.width || 900
      const height = canvasRect.height || 620
      const scale = Math.min(1, availableWidth / width, availableHeight / height)

      setPreviewLayout((current) =>
        current.width === width && current.height === height && current.scale === scale
          ? current
          : { width, height, scale },
      )
    }

    const observer = new ResizeObserver(updatePreviewLayout)
    observer.observe(canvas)
    observer.observe(viewport)
    updatePreviewLayout()

    return () => observer.disconnect()
  }, [isPreviewing])

  const selectedDevice =
    devices.find((device) => device.id === selectedDeviceId) ?? null
  const selectedText = texts.find((item) => item.id === selectedTextId) ?? null

  function addDevice() {
    const width =
      newDeviceType === 'phone'
        ? 220
        : newDeviceType === 'tablet'
          ? 300
          : 400

    const device: DeviceItem = {
      id: nextId,
      type: newDeviceType,
      width,
      x: 100 + ((devices.length * 65) % 480),
      y: 90 + ((devices.length * 55) % 300),
    }

    setDevices((current) => [...current, device])
    setSelectedDeviceId(device.id)
    setSelectedTextId(null)
    setActiveTool('select')
    setNextId((current) => current + 1)
  }

  function updateDeviceWidth(id: number, width: number) {
    setDevices((current) =>
      current.map((device) =>
        device.id === id ? { ...device, width } : device,
      ),
    )
  }

  function changeDeviceType(id: number, type: DeviceType) {
    const width =
      type === 'phone' ? 220 : type === 'tablet' ? 300 : 400

    setDevices((current) =>
      current.map((device) =>
        device.id === id ? { ...device, type, width } : device,
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

  function removeText(id: number) {
    setTexts((current) => current.filter((item) => item.id !== id))
    if (selectedTextId === id) setSelectedTextId(null)
  }

  function applyCanvasSnapshot(snapshot: CanvasSnapshot) {
    setDevices(snapshot.devices)
    setTexts(snapshot.texts)
    setNextId(snapshot.nextId)
    setNextTextId(snapshot.nextTextId)
    setActiveBackground(snapshot.activeBackground)
    setCustomColor(snapshot.customColor)
    setBackgroundImage(snapshot.backgroundImage)
    setBackgroundName(snapshot.backgroundName)
    setSelectedDeviceId((current) => snapshot.devices.some((device) => device.id === current)
      ? current
      : snapshot.devices[0]?.id ?? null)
    setSelectedTextId((current) => snapshot.texts.some((item) => item.id === current) ? current : null)
    historyChangeTimeRef.current = 0
  }

  function undoCanvas() {
    const snapshot = historyRef.current.past.pop()
    if (!snapshot) return
    const current = currentSnapshotRef.current
    if (current) historyRef.current.future.push(current)
    currentSnapshotRef.current = snapshot
    applyCanvasSnapshot(snapshot)
    setCanUndo(historyRef.current.past.length > 0)
    setCanRedo(historyRef.current.future.length > 0)
  }

  function redoCanvas() {
    const snapshot = historyRef.current.future.pop()
    if (!snapshot) return
    const current = currentSnapshotRef.current
    if (current) historyRef.current.past.push(current)
    currentSnapshotRef.current = snapshot
    applyCanvasSnapshot(snapshot)
    setCanUndo(historyRef.current.past.length > 0)
    setCanRedo(historyRef.current.future.length > 0)
  }

  function addTextAt(event: ReactMouseEvent<HTMLDivElement>) {
    if (activeTool !== 'text') return
    if ((event.target as HTMLElement).closest('button, input, textarea, select, [data-text-item]')) return
    const bounds = event.currentTarget.getBoundingClientRect()
    const text: TextItem = {
      id: nextTextId,
      text: 'Your text',
      x: Math.max(0, event.clientX - bounds.left),
      y: Math.max(0, event.clientY - bounds.top),
      fontSize: 24,
      color: ['#24262b', '#202124'].includes(activeBackground.toLowerCase()) ? '#FFFFFF' : '#202124',
    }
    setTexts((current) => [...current, text])
    setNextTextId((current) => current + 1)
    setSelectedTextId(text.id)
    setSelectedDeviceId(null)
  }

  function updateText(id: number, updates: Partial<TextItem>) {
    setTexts((current) => current.map((item) => item.id === id ? { ...item, ...updates } : item))
  }

  function moveText(
    id: number,
    startX: number,
    startY: number,
    originX: number,
    originY: number,
    event: ReactPointerEvent<HTMLDivElement>,
  ) {
    event.preventDefault()
    event.stopPropagation()
    event.currentTarget.setPointerCapture(event.pointerId)
    setSelectedTextId(id)
    setSelectedDeviceId(null)

    const handle = event.currentTarget
    function onMove(moveEvent: PointerEvent) {
      setTexts((current) => current.map((item) => item.id === id
        ? { ...item, x: Math.max(0, originX + moveEvent.clientX - startX), y: Math.max(0, originY + moveEvent.clientY - startY) }
        : item))
    }
    function onUp() {
      handle.removeEventListener('pointermove', onMove)
      handle.removeEventListener('pointerup', onUp)
      handle.removeEventListener('pointercancel', onUp)
    }
    handle.addEventListener('pointermove', onMove)
    handle.addEventListener('pointerup', onUp)
    handle.addEventListener('pointercancel', onUp)
  }

  function moveDevice(
    id: number,
    startX: number,
    startY: number,
    originX: number,
    originY: number,
    event: ReactPointerEvent<HTMLButtonElement>,
  ) {
    event.preventDefault()
    event.currentTarget.setPointerCapture(event.pointerId)
    setSelectedDeviceId(id)
    setSelectedTextId(null)

    const handle = event.currentTarget

    function onMove(moveEvent: PointerEvent) {
      setDevices((current) =>
        current.map((device) => {
          if (device.id !== id) return device

          return {
            ...device,
            x: Math.max(0, originX + moveEvent.clientX - startX),
            y: Math.max(0, originY + moveEvent.clientY - startY),
          }
        }),
      )
    }

    function onUp() {
      handle.removeEventListener('pointermove', onMove)
      handle.removeEventListener('pointerup', onUp)
      handle.removeEventListener('pointercancel', onUp)
    }

    handle.addEventListener('pointermove', onMove)
    handle.addEventListener('pointerup', onUp)
    handle.addEventListener('pointercancel', onUp)
  }

  function chooseBackground(preset: BackgroundPreset) {
    setActiveBackground(preset.value)
    setCustomColor(preset.color)
    setBackgroundImage('')
    setBackgroundName(preset.name)
  }

  function chooseCustomColor(color: string) {
    setCustomColor(color)
    setActiveBackground(color)
    setBackgroundImage('')
    setBackgroundName('Custom color')
  }

  function handleBackgroundImage(file: File) {
    if (!file.type.startsWith('image/')) return

    const reader = new FileReader()

    reader.onload = () => {
      if (typeof reader.result === 'string') {
        setBackgroundImage(reader.result)
        setBackgroundName(file.name)
      }
    }

    reader.readAsDataURL(file)
  }

  function resetCanvas() {
    setDevices(initialDevices)
    setTexts([])
    setSelectedDeviceId(1)
    setSelectedTextId(null)
    setNextId(2)
    setNextTextId(1)
  }

  function startCanvasPan(event: ReactPointerEvent<HTMLDivElement>) {
    if (activeTool !== 'pan' || !event.isPrimary || event.button !== 0) return
    const scrollContainer = event.currentTarget.parentElement
    if (!scrollContainer) return

    event.preventDefault()
    event.currentTarget.setPointerCapture(event.pointerId)
    panStartRef.current = {
      pointerId: event.pointerId,
      startX: event.clientX,
      startY: event.clientY,
      scrollLeft: scrollContainer.scrollLeft,
      scrollTop: scrollContainer.scrollTop,
    }
    setIsPanning(true)
  }

  function moveCanvasPan(event: ReactPointerEvent<HTMLDivElement>) {
    const pan = panStartRef.current
    if (!pan || pan.pointerId !== event.pointerId) return
    const scrollContainer = event.currentTarget.parentElement
    if (!scrollContainer) return

    scrollContainer.scrollLeft = pan.scrollLeft + pan.startX - event.clientX
    scrollContainer.scrollTop = pan.scrollTop + pan.startY - event.clientY
  }

  function finishCanvasPan(event: ReactPointerEvent<HTMLDivElement>) {
    if (panStartRef.current?.pointerId !== event.pointerId) return
    panStartRef.current = null
    setIsPanning(false)
  }

  const exportPresentation = useCallback(() => {
    const canvas = canvasRef.current
    const width = canvas?.clientWidth ?? 900
    const height = canvas?.clientHeight ?? 620
    const escapedName = escapeHtml(projectName)
    const backgroundDot = ['#24262b', '#202124'].includes(activeBackground.toLowerCase())
      ? 'rgba(255,255,255,.12)'
      : 'rgba(0,0,0,.09)'
    const stageBackground = backgroundImage
      ? `background-color:${activeBackground};background-image:url("${backgroundImage}");background-position:center;background-size:cover;`
      : `background-color:${activeBackground};background-image:radial-gradient(circle,${backgroundDot} 1px,transparent 1px);background-size:20px 20px;`

    const deviceMarkup = devices.map((device, index) => {
      const screenHeight = device.type === 'phone'
        ? device.width * 1.85
        : device.type === 'tablet'
          ? device.width * 0.76
          : device.width * 0.57
      const frameClass = device.type === 'phone' ? 'phone' : device.type === 'tablet' ? 'tablet' : 'desktop'
      const preview = websiteUrl
        ? `<iframe title="${device.type} preview ${index + 1}" src="${escapeHtml(websiteUrl)}" sandbox="allow-scripts allow-forms allow-same-origin allow-popups" referrerpolicy="strict-origin-when-cross-origin"></iframe>`
        : `<div class="placeholder">Add a website URL in FRAME to show it here.</div>`
      return `<div class="device" style="left:${device.x}px;top:${device.y}px;width:${device.width}px"><div class="frame ${frameClass}"><div class="screen" style="height:${screenHeight}px">${preview}</div></div>${device.type === 'desktop' ? '<div class="stand"></div><div class="base"></div>' : ''}</div>`
    }).join('\n')

    const textMarkup = texts.map((item) =>
      `<div class="text-layer" style="left:${item.x}px;top:${item.y}px;font-size:${item.fontSize}px;color:${escapeHtml(item.color)}">${escapeHtml(item.text).replace(/\n/g, '<br>')}</div>`,
    ).join('\n')

    const html = `<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width,initial-scale=1">
  <title>${escapedName} · FRAME presentation</title>
  <style>
    *{box-sizing:border-box}body{margin:0;min-height:100vh;padding:32px;background:#f5f5f1;color:#202124;font-family:Inter,Arial,sans-serif}.heading{max-width:1200px;margin:0 auto 20px}.heading h1{margin:0;font-size:18px}.heading p{margin:5px 0 0;color:#777971;font-size:12px}.stage-wrap{width:100%;overflow:auto}.stage{position:relative;margin:0 auto;width:${width}px;height:${height}px;overflow:hidden;border:1px solid rgba(0,0,0,.08);border-radius:12px;box-shadow:0 8px 30px rgba(0,0,0,.12);${stageBackground}}.device{position:absolute}.frame{overflow:hidden;border:5px solid #151619;background:#151619;padding:5px;box-shadow:0 18px 36px rgba(0,0,0,.28)}.phone{border-radius:32px}.tablet{border:6px solid #151619;border-radius:22px;padding:5px}.desktop{border-radius:12px 12px 0 0;border-bottom:0}.screen{overflow:hidden;background:#fff;border-radius:12px}.phone .screen{border-radius:23px}.tablet .screen{border-radius:12px}.desktop .screen{border-radius:5px 5px 0 0}.screen iframe{display:block;width:100%;height:100%;border:0}.placeholder{display:grid;height:100%;place-items:center;padding:16px;background:#fafaf8;color:#777971;text-align:center;font-size:12px}.stand{width:18%;height:16px;margin:auto;background:#151619}.base{width:32%;height:6px;margin:auto;border-radius:0 0 8px 8px;background:#77797e}.text-layer{position:absolute;white-space:pre-wrap;padding:0 4px}.note{max-width:1200px;margin:12px auto;color:#777971;font-size:11px}@media(max-width:${width + 80}px){body{padding:16px}.stage{margin-left:0;margin-right:0}}
  </style>
</head>
<body>
  <header class="heading"><h1>${escapedName}</h1><p>FRAME presentation · exported locally</p></header>
  <main class="stage-wrap"><section class="stage" aria-label="${escapedName} canvas">${deviceMarkup}${textMarkup}</section></main>
  <p class="note">Website previews load from their original URLs. Some sites block embedded previews.</p>
</body>
</html>`

    const blob = new Blob([html], { type: 'text/html;charset=utf-8' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = `${projectName.trim().replace(/[^a-z0-9-_]+/gi, '-').replace(/^-|-$/g, '') || 'frame-project'}.html`
    document.body.appendChild(link)
    link.click()
    link.remove()
    window.setTimeout(() => URL.revokeObjectURL(url), 1000)
  }, [projectName, devices, texts, websiteUrl, activeBackground, backgroundImage])

  useEffect(() => {
    onRegisterExport(exportPresentation)
  }, [onRegisterExport, exportPresentation])

  const canvasStyle: CSSProperties = backgroundImage
    ? {
        backgroundColor: activeBackground,
        backgroundImage: `url("${backgroundImage}")`,
        backgroundPosition: 'center',
        backgroundSize: 'cover',
      }
    : {
        backgroundColor: activeBackground,
        backgroundImage:
          activeBackground === '#24262B'
            ? 'radial-gradient(circle, rgba(255,255,255,0.12) 1px, transparent 1px)'
            : 'radial-gradient(circle, rgba(0,0,0,0.09) 1px, transparent 1px)',
        backgroundSize: '20px 20px',
      }

  useEffect(() => {
    historyActionsRef.current = { undo: undoCanvas, redo: redoCanvas }
    onRegisterHistory({
      canUndo,
      canRedo,
      undo: () => historyActionsRef.current.undo(),
      redo: () => historyActionsRef.current.redo(),
    })
  }, [canUndo, canRedo, onRegisterHistory])

  return (
    <div className="flex min-h-[calc(100dvh-64px)] bg-[#F5F5F1]">
      {/* Tool rail */}
      <aside className="hidden w-14 shrink-0 flex-col items-center gap-2 border-r border-[#E5E5DF] bg-white py-4 sm:flex">
        <button
          type="button"
          title="Select and move"
          onClick={() => setActiveTool('select')}
          className={`flex size-10 items-center justify-center rounded-xl ${
            activeTool === 'select'
              ? 'bg-[#F8E5DE] text-[#A75E48]'
              : 'text-[#777971] hover:bg-[#F5F5F1]'
          }`}
        >
          <MousePointer2 size={18} />
        </button>

        <button
          type="button"
          title="Pan canvas"
          onClick={() => setActiveTool('pan')}
          className={`flex size-10 items-center justify-center rounded-xl ${
            activeTool === 'pan'
              ? 'bg-[#F8E5DE] text-[#A75E48]'
              : 'text-[#777971] hover:bg-[#F5F5F1]'
          }`}
        >
          <Hand size={18} />
        </button>

        <div className="my-1 h-px w-7 bg-[#E5E5DF]" />

        <button
          type="button"
          title="Add device"
          onClick={addDevice}
          className="flex size-10 items-center justify-center rounded-xl text-[#777971] hover:bg-[#F5F5F1]"
        >
          <Plus size={19} />
        </button>

        <button
          type="button"
          title="Add text"
          onClick={() => setActiveTool('text')}
          className={`flex size-10 items-center justify-center rounded-xl ${activeTool === 'text' ? 'bg-[#F8E5DE] text-[#A75E48]' : 'text-[#777971] hover:bg-[#F5F5F1]'}`}
        >
          <Type size={18} />
        </button>

        <button
          type="button"
          title="Background settings"
          onClick={() =>
            document
              .getElementById('background-settings')
              ?.scrollIntoView({ behavior: 'smooth', block: 'nearest' })
          }
          className="flex size-10 items-center justify-center rounded-xl text-[#777971] hover:bg-[#F5F5F1]"
        >
          <Image size={18} />
        </button>
      </aside>

      <WorkspaceSidebar
        devices={devices}
        texts={texts}
        selectedDeviceId={selectedDeviceId}
        selectedTextId={selectedTextId}
        background={activeBackground}
        customColor={customColor}
        backgroundName={backgroundName}
        backgroundImage={backgroundImage}
        onSelectDevice={(id) => { setSelectedDeviceId(id); setSelectedTextId(null) }}
        onSelectText={(id) => { setSelectedTextId(id); setSelectedDeviceId(null) }}
        onRemoveDevice={removeDevice}
        onAddDevice={addDevice}
        onChooseBackground={chooseBackground}
        onChooseColor={chooseCustomColor}
        onChooseImage={handleBackgroundImage}
      />
      {/* Main canvas area */}
      <main className="flex min-w-0 flex-1 flex-col">
        <StudioToolbar
          deviceCount={devices.length}
          deviceType={newDeviceType}
          onDeviceTypeChange={setNewDeviceType}
          onAddDevice={addDevice}
          onResetCanvas={resetCanvas}
        />
        <DeviceCanvas
          devices={devices}
          texts={texts}
          websiteUrl={websiteUrl}
          selectedDeviceId={selectedDeviceId}
          selectedTextId={selectedTextId}
          activeTool={activeTool}
          isPanning={isPanning}
          background={activeBackground}
          backgroundImage={backgroundImage}
          onSelectDevice={(id) => { setSelectedDeviceId(id); setSelectedTextId(null) }}
          onSelectText={(id) => { setSelectedTextId(id); setSelectedDeviceId(null) }}
          onRemoveDevice={removeDevice}
          onMoveDevice={(event, device) => moveDevice(device.id, event.clientX, event.clientY, device.x, device.y, event)}
          onMoveText={(event, text) => moveText(text.id, event.clientX, event.clientY, text.x, text.y, event)}
          onAddText={addTextAt}
          onPanStart={startCanvasPan}
          onPanMove={moveCanvasPan}
          onPanEnd={finishCanvasPan}
          canvasRef={canvasRef}
          onAddDevice={addDevice}
        />        <footer className="flex min-h-9 items-center justify-between gap-3 border-t border-[#E5E5DF] bg-white px-4 text-[10px] text-[#777971]">
          <span>
            {activeTool === 'select'
              ? 'Drag a device by its top handle to reposition it'
              : activeTool === 'pan'
                ? 'Drag the canvas to pan around'
                : 'Click the canvas to add a text label'}
          </span>
          <span className="hidden sm:inline">
            {saveStatus === 'saved' ? 'Saved on this device' : 'Could not save this workspace'} · {backgroundName}
          </span>
        </footer>
      </main>

      <PropertiesPanel
        device={selectedDevice}
        text={selectedText}
        onUpdateText={(updates) => { if (selectedText) updateText(selectedText.id, updates) }}
        onRemoveText={() => { if (selectedText) removeText(selectedText.id) }}
        onChangeType={(type) => { if (selectedDevice) changeDeviceType(selectedDevice.id, type) }}
        onChangeWidth={(width) => { if (selectedDevice) updateDeviceWidth(selectedDevice.id, width) }}
        onRemove={() => { if (selectedDevice) removeDevice(selectedDevice.id) }}
        websiteUrl={websiteUrl}
      />
      {isPreviewing && (
        <div className="fixed inset-0 z-[100] flex flex-col bg-[#F5F5F1]">
          <div className="flex h-14 shrink-0 items-center justify-between border-b border-[#E5E5DF] bg-white px-4 sm:px-6">
            <div className="min-w-0">
              <p className="truncate text-sm font-semibold text-[#202124]">{projectName}</p>
              <p className="text-[10px] text-[#777971]">Preview · press Esc to return</p>
            </div>
            <button
              type="button"
              onClick={onClosePreview}
              className="rounded-lg bg-[#24262B] px-3 py-2 text-xs font-medium text-white hover:bg-[#383A40]"
            >
              Back to editor
            </button>
          </div>
          <div ref={previewViewportRef} className="flex min-h-0 flex-1 items-center justify-center overflow-auto p-4 sm:p-8">
            <div
              className="relative shrink-0"
              style={{
                width: previewLayout.width * previewLayout.scale,
                height: previewLayout.height * previewLayout.scale,
              }}
            >
              <div
                className="absolute left-0 top-0 min-w-0 overflow-hidden rounded-xl border border-black/5 shadow-sm"
                style={{
                  ...canvasStyle,
                  width: previewLayout.width,
                  height: previewLayout.height,
                  transform: `scale(${previewLayout.scale})`,
                  transformOrigin: 'top left',
                }}
              >
              {devices.length === 0 && texts.length === 0 ? (
                <div className="absolute inset-0 flex items-center justify-center text-sm text-[#777971]">
                  This project has no items on its canvas.
                </div>
              ) : devices.map((device, index) => {
                const screenHeight = device.type === 'phone'
                  ? device.width * 1.85
                  : device.type === 'tablet'
                    ? device.width * 0.76
                    : device.width * 0.57

                return (
                  <div
                    key={device.id}
                    className="absolute"
                    style={{ left: device.x, top: device.y, width: device.width }}
                  >
                    <div className={`overflow-hidden border-[5px] border-[#151619] bg-[#151619] p-[5px] shadow-2xl ${device.type === 'phone' ? 'rounded-[32px]' : device.type === 'tablet' ? 'rounded-[22px]' : 'rounded-t-xl border-b-0'}`}>
                      <div
                        className={`${device.type === 'phone' ? 'rounded-[23px]' : device.type === 'tablet' ? 'rounded-[13px]' : 'rounded-t-md'} overflow-hidden bg-white`}
                        style={{ height: screenHeight }}
                      >
                        {websiteUrl ? (
                          <iframe
                            title={`${device.type} preview ${index + 1}`}
                            src={websiteUrl}
                            sandbox="allow-scripts allow-forms allow-same-origin allow-popups"
                            referrerPolicy="strict-origin-when-cross-origin"
                            loading="lazy"
                            className="h-full w-full border-0"
                          />
                        ) : <DevicePlaceholder type={device.type} />}
                      </div>
                    </div>
                    {device.type === 'desktop' && <div className="mx-auto h-4 w-[18%] rounded-b-sm bg-[#151619]" />}
                    {device.type === 'desktop' && <div className="mx-auto h-1.5 w-[32%] rounded-b-md bg-[#77797E]" />}
                  </div>
                )
              })}
              {texts.map((item) => (
                <div
                  key={`preview-text-${item.id}`}
                  className="absolute whitespace-pre-wrap px-1"
                  style={{ left: item.x, top: item.y, fontSize: item.fontSize, color: item.color }}
                >
                  {item.text}
                </div>
              ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

function DevicePlaceholder({ type }: { type: DeviceType }) {
  return (
    <div className="flex h-full flex-col items-center justify-center bg-[#FAFAF8] px-4 text-center">
      <div className="mb-3 flex size-11 items-center justify-center rounded-xl bg-[#F0F0EC] text-[#777971]">
        {type === 'phone' ? (
          <Smartphone size={21} />
        ) : type === 'tablet' ? (
          <Tablet size={21} />
        ) : (
          <Monitor size={21} />
        )}
      </div>

      <p className="text-xs font-semibold text-[#44453F]">
        Your website goes here
      </p>
      <p className="mt-1 text-[10px] leading-4 text-[#92938D]">
        Enter a URL in the top bar to preview your site.
      </p>
    </div>
  )
}

export default StudioWorkspace
