
import { useRef, useState } from 'react'
import type { CSSProperties, PointerEvent as ReactPointerEvent } from 'react'
import {
  Hand,
  Image,
  MousePointer2,
  Smartphone,
  Type,
  Layers,
  Plus,
  Monitor,
  Tablet,
  Settings2,
  Globe,
  ExternalLink,
  Trash2,
  Palette,
  Upload,
  RotateCcw,
  GripHorizontal,
} from 'lucide-react'

type DeviceType = 'phone' | 'tablet' | 'desktop'

type DeviceItem = {
  id: number
  type: DeviceType
  width: number
  x: number
  y: number
}

type StudioWorkspaceProps = {
  websiteUrl: string
}

type BackgroundPreset = {
  name: string
  value: string
  color: string
}

const backgrounds: BackgroundPreset[] = [
  {
    name: 'Studio',
    value: '#24262B',
    color: '#24262B',
  },
  {
    name: 'Soft light',
    value: '#E9E8E2',
    color: '#E9E8E2',
  },
  {
    name: 'Warm',
    value: '#E9D5C8',
    color: '#E9D5C8',
  },
  {
    name: 'Sage',
    value: '#BFCDBB',
    color: '#BFCDBB',
  },
  {
    name: 'Lavender',
    value: '#D5CDE6',
    color: '#D5CDE6',
  },
  {
    name: 'Ocean',
    value: '#AFCBD7',
    color: '#AFCBD7',
  },
]

const initialDevices: DeviceItem[] = [
  {
    id: 1,
    type: 'phone',
    width: 220,
    x: 330,
    y: 90,
  },
]

function StudioWorkspace({ websiteUrl }: StudioWorkspaceProps) {
  const [devices, setDevices] = useState<DeviceItem[]>(initialDevices)
  const [selectedDeviceId, setSelectedDeviceId] = useState<number | null>(1)
  const [nextId, setNextId] = useState(2)
  const [newDeviceType, setNewDeviceType] = useState<DeviceType>('tablet')

  const [activeTool, setActiveTool] = useState<'select' | 'pan'>('select')
  const [activeBackground, setActiveBackground] = useState('#24262B')
  const [customColor, setCustomColor] = useState('#24262B')
  const [backgroundImage, setBackgroundImage] = useState('')
  const [backgroundName, setBackgroundName] = useState('Studio')

  const canvasRef = useRef<HTMLDivElement>(null)
  const imageInputRef = useRef<HTMLInputElement>(null)

  const selectedDevice =
    devices.find((device) => device.id === selectedDeviceId) ?? null

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

  function handleBackgroundImage(
    event: React.ChangeEvent<HTMLInputElement>,
  ) {
    const file = event.target.files?.[0]
    if (!file) return

    if (!file.type.startsWith('image/')) return

    const reader = new FileReader()

    reader.onload = () => {
      if (typeof reader.result === 'string') {
        setBackgroundImage(reader.result)
        setBackgroundName(file.name)
      }
    }

    reader.readAsDataURL(file)
    event.target.value = ''
  }

  function resetCanvas() {
    setDevices(initialDevices)
    setSelectedDeviceId(1)
    setNextId(2)
  }

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

  const canvasIsDark =
    activeBackground.toLowerCase() === '#24262b' ||
    activeBackground.toLowerCase() === '#202124'

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
          title="Pan canvas — coming later"
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
          title="Text — coming later"
          className="flex size-10 items-center justify-center rounded-xl text-[#777971] hover:bg-[#F5F5F1]"
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

      {/* Layers and background panel */}
      <aside className="hidden w-[230px] shrink-0 flex-col border-r border-[#E5E5DF] bg-white lg:flex">
        <div className="flex h-12 items-center justify-between border-b border-[#E5E5DF] px-4">
          <div className="flex items-center gap-2 text-sm font-semibold">
            <Layers size={16} />
            Workspace
          </div>

          <button
            type="button"
            title="Reset canvas layout"
            onClick={resetCanvas}
            className="flex size-7 items-center justify-center rounded-md text-[#777971] hover:bg-[#F5F5F1]"
          >
            <RotateCcw size={14} />
          </button>
        </div>

        <div className="border-b border-[#E5E5DF] p-3">
          <div className="mb-3 flex items-center justify-between">
            <span className="text-[11px] font-bold uppercase tracking-wider text-[#777971]">
              Layers
            </span>

            <button
              type="button"
              onClick={addDevice}
              title="Add device"
              className="flex size-7 items-center justify-center rounded-md hover:bg-[#F5F5F1]"
            >
              <Plus size={15} />
            </button>
          </div>

          {devices.length === 0 ? (
            <p className="py-3 text-xs text-[#777971]">
              No devices yet. Add one to start.
            </p>
          ) : (
            <div className="space-y-1">
              {devices.map((device, index) => {
                const DeviceIcon =
                  device.type === 'phone'
                    ? Smartphone
                    : device.type === 'tablet'
                      ? Tablet
                      : Monitor

                return (
                  <button
                    type="button"
                    key={device.id}
                    onClick={() => setSelectedDeviceId(device.id)}
                    className={`flex w-full items-center gap-2 rounded-lg px-2.5 py-2 text-left text-xs ${
                      selectedDeviceId === device.id
                        ? 'bg-[#F8E5DE] text-[#8F503E]'
                        : 'text-[#55564F] hover:bg-[#F5F5F1]'
                    }`}
                  >
                    <DeviceIcon size={15} />
                    <span className="min-w-0 flex-1 truncate">
                      {device.type === 'phone'
                        ? 'Phone'
                        : device.type === 'tablet'
                          ? 'Tablet'
                          : 'Desktop'}{' '}
                      {index + 1}
                    </span>
                    <span className="text-[10px] opacity-60">
                      {device.width}px
                    </span>
                  </button>
                )
              })}
            </div>
          )}
        </div>

        <div id="background-settings" className="p-3">
          <div className="mb-3 flex items-center gap-2">
            <Palette size={15} className="text-[#777971]" />
            <span className="text-[11px] font-bold uppercase tracking-wider text-[#777971]">
              Canvas background
            </span>
          </div>

          <p className="mb-2 truncate text-xs text-[#777971]" title={backgroundName}>
            {backgroundName}
          </p>

          <div className="grid grid-cols-3 gap-2">
            {backgrounds.map((preset) => (
              <button
                type="button"
                key={preset.name}
                onClick={() => chooseBackground(preset)}
                title={preset.name}
                aria-label={`Use ${preset.name} background`}
                className={`group rounded-lg border p-1 ${
                  !backgroundImage && activeBackground === preset.value
                    ? 'border-[#D98C74] ring-1 ring-[#D98C74]'
                    : 'border-[#E5E5DF]'
                }`}
              >
                <span
                  className="block h-8 rounded-md"
                  style={{ backgroundColor: preset.color }}
                />
                <span className="mt-1 block truncate text-[10px] text-[#55564F]">
                  {preset.name}
                </span>
              </button>
            ))}
          </div>

          <div className="mt-4 border-t border-[#E5E5DF] pt-3">
            <label className="mb-2 block text-xs font-medium text-[#55564F]">
              Custom color
            </label>

            <div className="flex items-center gap-2 rounded-lg border border-[#E5E5DF] p-2">
              <input
                type="color"
                value={customColor}
                onChange={(event) => chooseCustomColor(event.target.value)}
                aria-label="Choose canvas background color"
                className="h-7 w-8 cursor-pointer rounded border-0 bg-transparent p-0"
              />
              <span className="text-xs uppercase text-[#55564F]">
                {customColor}
              </span>
            </div>
          </div>

          <div className="mt-4">
            <input
              ref={imageInputRef}
              type="file"
              accept="image/*"
              onChange={handleBackgroundImage}
              className="hidden"
            />

            <button
              type="button"
              onClick={() => imageInputRef.current?.click()}
              className="flex w-full items-center justify-center gap-2 rounded-lg border border-[#E5E5DF] px-3 py-2.5 text-xs font-medium text-[#44453F] transition-colors hover:bg-[#F5F5F1]"
            >
              <Upload size={14} />
              Upload background
            </button>

            {backgroundImage && (
              <button
                type="button"
                onClick={() => {
                  setBackgroundImage('')
                  setActiveBackground(customColor)
                  setBackgroundName('Custom color')
                }}
                className="mt-2 w-full text-xs text-[#777971] hover:text-[#202124]"
              >
                Remove image
              </button>
            )}
          </div>

          <p className="mt-3 text-[10px] leading-4 text-[#92938D]">
            Background images are held in memory for now. Saving projects will
            be added separately.
          </p>
        </div>

        <div className="mt-auto border-t border-[#E5E5DF] p-3">
          <div className="flex items-center gap-2 text-xs text-[#777971]">
            <Globe size={14} />
            <span>{websiteUrl ? 'Website entered' : 'No website loaded'}</span>
          </div>
        </div>
      </aside>

      {/* Main canvas area */}
      <main className="flex min-w-0 flex-1 flex-col">
        <div className="flex min-h-12 flex-wrap items-center justify-between gap-2 border-b border-[#E5E5DF] bg-[#F9F9F6] px-3 py-2 sm:px-4">
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold text-[#44453F]">
              Presentation canvas
            </span>
            <span className="rounded-md bg-[#EAEAE4] px-2 py-1 text-[10px] text-[#777971]">
              {devices.length} {devices.length === 1 ? 'device' : 'devices'}
            </span>
          </div>

          <div className="flex items-center gap-2">
            <select
              value={newDeviceType}
              onChange={(event) =>
                setNewDeviceType(event.target.value as DeviceType)
              }
              aria-label="Device type to add"
              className="h-8 rounded-lg border border-[#E5E5DF] bg-white px-2 text-xs text-[#44453F]"
            >
              <option value="phone">Phone</option>
              <option value="tablet">Tablet</option>
              <option value="desktop">Desktop</option>
            </select>

            <button
              type="button"
              onClick={addDevice}
              className="flex h-8 items-center gap-1.5 rounded-lg bg-[#24262B] px-3 text-xs font-medium text-white transition-colors hover:bg-[#383A40]"
            >
              <Plus size={14} />
              Add device
            </button>
          </div>
        </div>

        <div className="min-h-0 flex-1 overflow-auto p-3 sm:p-5">
          <div
            ref={canvasRef}
            className="relative min-h-[620px] min-w-[900px] overflow-hidden rounded-xl border border-black/5 shadow-sm"
            style={canvasStyle}
          >
            {devices.length === 0 && (
              <div className="absolute inset-0 flex items-center justify-center p-6">
                <div className="max-w-xs text-center">
                  <div className={`mx-auto mb-4 flex size-14 items-center justify-center rounded-2xl ${
                    canvasIsDark ? 'bg-white/10 text-white' : 'bg-black/5 text-[#44453F]'
                  }`}>
                    <Smartphone size={24} />
                  </div>
                  <h2 className={`text-base font-semibold ${
                    canvasIsDark ? 'text-white' : 'text-[#202124]'
                  }`}>
                    Your canvas is empty
                  </h2>
                  <p className={`mt-2 text-sm ${
                    canvasIsDark ? 'text-white/60' : 'text-[#777971]'
                  }`}>
                    Add a device to begin your presentation.
                  </p>
                  <button
                    type="button"
                    onClick={addDevice}
                    className="mt-4 rounded-lg bg-[#E8A08B] px-4 py-2 text-sm font-medium text-[#24262B]"
                  >
                    Add your first device
                  </button>
                </div>
              </div>
            )}

            {devices.map((device, index) => {
              const isSelected = selectedDeviceId === device.id
              const isPhone = device.type === 'phone'
              const isTablet = device.type === 'tablet'

              const screenHeight = isPhone
                ? device.width * 1.85
                : isTablet
                  ? device.width * 0.76
                  : device.width * 0.57

              return (
                <div
                  key={device.id}
                  className="absolute"
                  style={{
                    left: device.x,
                    top: device.y,
                    width: device.width,
                  }}
                >
                  {/* Device drag handle */}
                  <button
                    type="button"
                    onPointerDown={(event) => {
                      if (activeTool === 'pan') return

                      moveDevice(
                        device.id,
                        event.clientX,
                        event.clientY,
                        device.x,
                        device.y,
                        event,
                      )
                    }}
                    onClick={() => setSelectedDeviceId(device.id)}
                    title="Drag to move device"
                    className={`mb-2 flex h-7 w-full touch-none items-center justify-center gap-1.5 rounded-md border text-[10px] font-medium ${
                      isSelected
                        ? 'border-[#E8A08B] bg-[#E8A08B] text-[#24262B]'
                        : canvasIsDark
                          ? 'border-white/20 bg-black/20 text-white/80 hover:bg-black/35'
                          : 'border-black/10 bg-white/80 text-[#44453F] hover:bg-white'
                    }`}
                  >
                    <GripHorizontal size={13} />
                    {device.type === 'phone'
                      ? `Phone ${index + 1}`
                      : device.type === 'tablet'
                        ? `Tablet ${index + 1}`
                        : `Desktop ${index + 1}`}
                    <span className="ml-auto mr-2 opacity-70">
                      {device.width}px
                    </span>
                  </button>

                  <div
                    onClick={() => setSelectedDeviceId(device.id)}
                    className={`relative ${
                      isSelected
                        ? 'ring-2 ring-[#E8A08B] ring-offset-4 ring-offset-transparent'
                        : ''
                    }`}
                  >
                    {isPhone ? (
                      <div
                        className="relative rounded-[32px] border-[5px] border-[#151619] bg-[#151619] p-[5px] shadow-2xl"
                        style={{ height: screenHeight + 10 }}
                      >
                        <div className="relative h-full overflow-hidden rounded-[23px] bg-white">
                          <div className="absolute left-1/2 top-0 z-10 h-[14px] w-[76px] -translate-x-1/2 rounded-b-xl bg-[#151619]" />

                          {websiteUrl ? (
                            <iframe
                              title={`Phone preview ${index + 1}`}
                              src={websiteUrl}
                              sandbox="allow-scripts allow-forms allow-same-origin allow-popups"
                              referrerPolicy="strict-origin-when-cross-origin"
                              loading="lazy"
                              className="h-full w-full border-0"
                              style={{ pointerEvents: 'none' }}
                            />
                          ) : (
                            <DevicePlaceholder type="phone" />
                          )}
                        </div>
                      </div>
                    ) : isTablet ? (
                      <div
                        className="rounded-[22px] border-[6px] border-[#151619] bg-[#151619] p-[5px] shadow-2xl"
                        style={{ height: screenHeight + 12 }}
                      >
                        <div className="h-full overflow-hidden rounded-[12px] bg-white">
                          {websiteUrl ? (
                            <iframe
                              title={`Tablet preview ${index + 1}`}
                              src={websiteUrl}
                              sandbox="allow-scripts allow-forms allow-same-origin allow-popups"
                              referrerPolicy="strict-origin-when-cross-origin"
                              loading="lazy"
                              className="h-full w-full border-0"
                              style={{ pointerEvents: 'none' }}
                            />
                          ) : (
                            <DevicePlaceholder type="tablet" />
                          )}
                        </div>
                      </div>
                    ) : (
                      <div className="rounded-t-xl border-[5px] border-b-0 border-[#151619] bg-[#151619] p-[5px] shadow-2xl">
                        <div
                          className="overflow-hidden rounded-t-md bg-white"
                          style={{ height: screenHeight }}
                        >
                          {websiteUrl ? (
                            <iframe
                              title={`Desktop preview ${index + 1}`}
                              src={websiteUrl}
                              sandbox="allow-scripts allow-forms allow-same-origin allow-popups"
                              referrerPolicy="strict-origin-when-cross-origin"
                              loading="lazy"
                              className="h-full w-full border-0"
                              style={{ pointerEvents: 'none' }}
                            />
                          ) : (
                            <DevicePlaceholder type="desktop" />
                          )}
                        </div>
                      </div>
                    )}

                    {device.type === 'desktop' && (
                      <div className="mx-auto h-4 w-[18%] rounded-b-sm bg-[#151619]" />
                    )}
                    {device.type === 'desktop' && (
                      <div className="mx-auto h-1.5 w-[32%] rounded-b-md bg-[#77797E]" />
                    )}
                  </div>
                </div>
              )
            })}
          </div>
        </div>

        <footer className="flex min-h-9 items-center justify-between gap-3 border-t border-[#E5E5DF] bg-white px-4 text-[10px] text-[#777971]">
          <span>
            {activeTool === 'select'
              ? 'Drag a device by its top handle to reposition it'
              : 'Pan tool is reserved for a future update'}
          </span>
          <span className="hidden sm:inline">Canvas · {backgroundName}</span>
        </footer>
      </main>

      {/* Properties panel */}
      <aside className="hidden w-[240px] shrink-0 flex-col border-l border-[#E5E5DF] bg-white xl:flex">
        <div className="flex h-12 items-center gap-2 border-b border-[#E5E5DF] px-4">
          <Settings2 size={16} />
          <span className="text-sm font-semibold">Properties</span>
        </div>

        {selectedDevice ? (
          <div className="space-y-5 p-4">
            <div>
              <span className="mb-2 block text-[11px] font-bold uppercase tracking-wider text-[#777971]">
                Selected layer
              </span>
              <div className="flex items-center gap-2 rounded-lg border border-[#E5E5DF] p-3">
                {selectedDevice.type === 'phone' ? (
                  <Smartphone size={17} />
                ) : selectedDevice.type === 'tablet' ? (
                  <Tablet size={17} />
                ) : (
                  <Monitor size={17} />
                )}
                <span className="text-sm font-medium capitalize">
                  {selectedDevice.type}
                </span>
              </div>
            </div>

            <div>
              <label
                htmlFor="device-type"
                className="mb-2 block text-xs font-medium text-[#55564F]"
              >
                Device type
              </label>
              <select
                id="device-type"
                value={selectedDevice.type}
                onChange={(event) =>
                  changeDeviceType(
                    selectedDevice.id,
                    event.target.value as DeviceType,
                  )
                }
                className="h-10 w-full rounded-lg border border-[#E5E5DF] bg-white px-3 text-sm"
              >
                <option value="phone">Phone</option>
                <option value="tablet">Tablet</option>
                <option value="desktop">Desktop</option>
              </select>
            </div>

            <div>
              <div className="mb-2 flex items-center justify-between">
                <label
                  htmlFor="device-width"
                  className="text-xs font-medium text-[#55564F]"
                >
                  Width
                </label>
                <span className="text-xs tabular-nums text-[#777971]">
                  {selectedDevice.width}px
                </span>
              </div>
              <input
                id="device-width"
                type="range"
                min="160"
                max="440"
                step="10"
                value={selectedDevice.width}
                onChange={(event) =>
                  updateDeviceWidth(
                    selectedDevice.id,
                    Number(event.target.value),
                  )
                }
                className="w-full accent-[#E8A08B]"
              />
              <div className="mt-1 flex justify-between text-[10px] text-[#92938D]">
                <span>160px</span>
                <span>440px</span>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div className="rounded-lg bg-[#F5F5F1] p-3">
                <span className="block text-[10px] text-[#777971]">X position</span>
                <span className="mt-1 block text-sm font-semibold tabular-nums">
                  {Math.round(selectedDevice.x)}px
                </span>
              </div>
              <div className="rounded-lg bg-[#F5F5F1] p-3">
                <span className="block text-[10px] text-[#777971]">Y position</span>
                <span className="mt-1 block text-sm font-semibold tabular-nums">
                  {Math.round(selectedDevice.y)}px
                </span>
              </div>
            </div>

            <button
              type="button"
              onClick={() => removeDevice(selectedDevice.id)}
              className="flex w-full items-center justify-center gap-2 rounded-lg border border-red-200 px-3 py-2.5 text-sm font-medium text-red-600 transition-colors hover:bg-red-50"
            >
              <Trash2 size={15} />
              Remove device
            </button>
          </div>
        ) : (
          <div className="p-5 text-center">
            <Settings2 size={22} className="mx-auto mb-3 text-[#A1A29C]" />
            <p className="text-sm font-medium text-[#44453F]">
              Nothing selected
            </p>
            <p className="mt-1 text-xs leading-5 text-[#777971]">
              Select a device on the canvas or from Layers to edit its
              properties.
            </p>
          </div>
        )}

        <div className="mt-auto border-t border-[#E5E5DF] p-4">
          <p className="text-[10px] leading-4 text-[#92938D]">
            FRAME is still in development. Preview embedding and export
            features will improve as the project grows.
          </p>
        </div>
      </aside>
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
