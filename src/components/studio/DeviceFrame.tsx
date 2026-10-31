
import { GripHorizontal, Monitor, Smartphone, Tablet, Trash2 } from 'lucide-react'
import type { DeviceItem } from '../../types/studio'
import { getDeviceLabel } from '../../types/studio'

type DeviceFrameProps = {
  device: DeviceItem
  websiteUrl: string
  selected: boolean
  onSelect: () => void
  onRemove: () => void
  onMoveStart: (event: React.PointerEvent<HTMLButtonElement>) => void
}

function DeviceFrame({
  device,
  websiteUrl,
  selected,
  onSelect,
  onRemove,
  onMoveStart,
}: DeviceFrameProps) {
  const isPhone = device.type === 'phone'
  const isTablet = device.type === 'tablet'
  const height = device.type === 'phone'
    ? device.width * 1.85
    : device.type === 'tablet'
      ? device.width * 0.76
      : device.width * 0.57

  const DeviceIcon = isPhone ? Smartphone : isTablet ? Tablet : Monitor

  return (
    <div
      className="absolute"
      style={{
        left: device.x,
        top: device.y,
        width: device.width,
        zIndex: selected ? 10 : 1,
      }}
      onClick={onSelect}
    >
      <button
        type="button"
        onPointerDown={onMoveStart}
        onClick={onSelect}
        aria-label={`Move ${getDeviceLabel(device.type)} ${device.id}`}
        title="Drag to move device"
        className={`mb-2 flex h-7 w-full touch-none items-center justify-between gap-2 rounded-md px-2 text-[10px] font-medium ${
          selected
            ? 'bg-[#E8A08B] text-[#24262B]'
            : 'bg-black/20 text-white/80 hover:bg-black/30'
        }`}
      >
        <span className="flex min-w-0 items-center gap-1.5">
          <GripHorizontal size={13} />
          <span className="truncate">
            {getDeviceLabel(device.type)} {device.id}
          </span>
        </span>
        <span className="shrink-0 opacity-70">{device.width}px</span>
      </button>

      <div
        className={`relative overflow-hidden bg-white ${
          isPhone
            ? 'rounded-[2rem] border-[5px] border-[#17181B] shadow-[0_18px_45px_rgba(0,0,0,0.28)]'
            : isTablet
              ? 'rounded-[1.4rem] border-[5px] border-[#17181B] shadow-[0_18px_45px_rgba(0,0,0,0.25)]'
              : 'rounded-lg border-[5px] border-[#17181B] shadow-[0_18px_45px_rgba(0,0,0,0.25)]'
        } ${selected ? 'ring-2 ring-[#E8A08B] ring-offset-2' : ''}`}
        style={{ height }}
      >
        {isPhone && (
          <div className="pointer-events-none absolute left-1/2 top-1 z-20 h-4 w-20 -translate-x-1/2 rounded-full bg-[#17181B]" />
        )}

        {websiteUrl ? (
          <iframe
            title={`${getDeviceLabel(device.type)} ${device.id} website preview`}
            src={websiteUrl}
            className="h-full w-full border-0 bg-white"
            style={{ pointerEvents: 'none' }}
            loading="lazy"
            sandbox="allow-same-origin allow-scripts allow-forms allow-popups"
            referrerPolicy="no-referrer"
          />
        ) : (
          <div className="flex h-full flex-col items-center justify-center bg-[#FAFAF8] px-5 text-center">
            <div className="flex size-10 items-center justify-center rounded-xl bg-[#F0F0EC] text-[#777971]">
              <DeviceIcon size={19} />
            </div>
            <p className="mt-3 text-xs font-semibold text-[#44453F]">
              Website preview
            </p>
            <p className="mt-1 max-w-48 text-[10px] leading-4 text-[#96978F]">
              Enter a website address in the top bar to preview it here.
            </p>
          </div>
        )}
      </div>

      {device.type === 'desktop' && (
        <div className="mx-auto flex h-4 w-2/5 items-start justify-center">
          <div className="h-3 w-full rounded-b-md bg-[#17181B]" />
        </div>
      )}

      {selected && (
        <div className="mt-2 flex items-center justify-between gap-2 rounded-lg bg-black/20 px-2 py-1.5 text-[10px] text-white/80">
          <span>
            {device.width} × {height}
          </span>
          <button
            type="button"
            onClick={(event) => {
              event.stopPropagation()
              onRemove()
            }}
            className="flex items-center gap-1 rounded px-1.5 py-1 text-white/70 hover:bg-white/10 hover:text-white"
          >
            <Trash2 size={11} />
            Remove
          </button>
        </div>
      )}
    </div>
  )
}

export default DeviceFrame
