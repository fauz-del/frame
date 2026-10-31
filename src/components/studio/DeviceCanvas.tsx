
import type { CSSProperties, MouseEvent as ReactMouseEvent, PointerEvent as ReactPointerEvent } from 'react'
import { GripHorizontal, Smartphone } from 'lucide-react'
import type { DeviceItem, TextItem } from '../../types/studio'
import DeviceFrame from './DeviceFrame'

type DeviceCanvasProps = {
  devices: DeviceItem[]
  texts: TextItem[]
  websiteUrl: string
  selectedDeviceId: number | null
  selectedTextId: number | null
  activeTool: 'select' | 'pan' | 'text'
  isPanning: boolean
  background: string
  backgroundImage: string
  onSelectDevice: (id: number | null) => void
  onSelectText: (id: number) => void
  onMoveText: (event: ReactPointerEvent<HTMLDivElement>, text: TextItem) => void
  onAddText: (event: ReactMouseEvent<HTMLDivElement>) => void
  onPanStart: (event: ReactPointerEvent<HTMLDivElement>) => void
  onPanMove: (event: ReactPointerEvent<HTMLDivElement>) => void
  onPanEnd: (event: ReactPointerEvent<HTMLDivElement>) => void
  onRemoveDevice: (id: number) => void
  onMoveDevice: (
    event: ReactPointerEvent<HTMLButtonElement>,
    device: DeviceItem,
  ) => void
  canvasRef: React.RefObject<HTMLDivElement | null>
  onAddDevice: () => void
}

function DeviceCanvas({
  devices,
  texts,
  websiteUrl,
  selectedDeviceId,
  selectedTextId,
  activeTool,
  isPanning,
  background,
  backgroundImage,
  onSelectDevice,
  onSelectText,
  onMoveText,
  onAddText,
  onPanStart,
  onPanMove,
  onPanEnd,
  onRemoveDevice,
  onMoveDevice,
  canvasRef,
  onAddDevice,
}: DeviceCanvasProps) {
  const canvasStyle: CSSProperties = backgroundImage
    ? {
        backgroundColor: background,
        backgroundImage: `url("${backgroundImage}")`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
      }
    : {
        backgroundColor: background,
        backgroundImage: ['#24262b', '#202124'].includes(background.toLowerCase())
          ? 'radial-gradient(rgba(255,255,255,0.12) 1px, transparent 1px)'
          : 'radial-gradient(rgba(0,0,0,0.09) 1px, transparent 1px)',
        backgroundSize: '20px 20px',
      }

  return (
    <div className="min-h-0 flex-1 overflow-auto p-3 sm:p-5">
      <div
        ref={canvasRef}
        onClick={onAddText}
        onPointerMove={onPanMove}
        onPointerUp={onPanEnd}
        onPointerCancel={onPanEnd}
        className={`relative min-h-[620px] min-w-[900px] overflow-hidden rounded-xl border border-black/5 shadow-inner ${activeTool === 'pan' ? `cursor-grab touch-none ${isPanning ? 'cursor-grabbing' : ''}` : activeTool === 'text' ? 'cursor-text' : ''}`}
        style={canvasStyle}
        onPointerDown={(event) => {
          onPanStart(event)
          if (event.target === event.currentTarget) {
            onSelectDevice(null)
          }
        }}
      >
        <div className="pointer-events-none absolute left-4 top-4 flex items-center gap-2 rounded-lg bg-black/15 px-3 py-2 text-[10px] text-white/70 backdrop-blur-sm">
          <GripHorizontal size={13} />
          Drag device labels to arrange your layout
        </div>

        {devices.length === 0 && texts.length === 0 && (
          <div className="absolute inset-0 flex items-center justify-center p-6">
            <div className="max-w-xs text-center">
              <div className="mx-auto flex size-12 items-center justify-center rounded-2xl bg-white/10 text-white">
                <Smartphone size={22} />
              </div>
              <h2 className="mt-4 text-sm font-semibold text-white">
                Your canvas is empty
              </h2>
              <p className="mt-2 text-xs leading-5 text-white/60">
                Add a device to start building your presentation.
              </p>
              <button
                type="button"
                onClick={onAddDevice}
                className="mt-4 rounded-lg bg-[#E8A08B] px-4 py-2 text-xs font-semibold text-[#24262B] hover:bg-[#F0B5A3]"
              >
                Add your first device
              </button>
            </div>
          </div>
        )}

        {devices.map((device) => (
          <DeviceFrame
            key={device.id}
            device={device}
            websiteUrl={websiteUrl}
            selected={device.id === selectedDeviceId}
            onSelect={() => {
              if (activeTool === 'select') onSelectDevice(device.id)
            }}
            onRemove={() => onRemoveDevice(device.id)}
            onMoveStart={(event) => {
              if (activeTool === 'select') onMoveDevice(event, device)
            }}
          />
        ))}

        {texts.map((text) => (
          <div
            key={text.id}
            data-text-item
            onPointerDown={(event) => {
              if (activeTool === 'select') onMoveText(event, text)
            }}
            onClick={(event) => {
              event.stopPropagation()
              if (activeTool !== 'pan') onSelectText(text.id)
            }}
            className={`absolute whitespace-pre-wrap rounded-sm px-1 ${activeTool === 'select' ? 'cursor-move' : activeTool === 'text' ? 'cursor-text' : ''} ${selectedTextId === text.id ? 'ring-1 ring-[#E8A08B]' : ''}`}
            style={{ left: text.x, top: text.y, fontSize: text.fontSize, color: text.color }}
          >
            {text.text}
          </div>
        ))}
      </div>
    </div>
  )
}

export default DeviceCanvas
