
import { Plus, RotateCcw } from 'lucide-react'
import type { DeviceType } from '../../types/studio'

type StudioToolbarProps = {
  deviceCount: number
  deviceType: DeviceType
  onDeviceTypeChange: (type: DeviceType) => void
  onAddDevice: () => void
  onResetCanvas: () => void
}

function StudioToolbar({
  deviceCount,
  deviceType,
  onDeviceTypeChange,
  onAddDevice,
  onResetCanvas,
}: StudioToolbarProps) {
  return (
    <div className="flex min-h-12 flex-wrap items-center justify-between gap-2 border-b border-[#E5E5DF] bg-white px-3 py-2 sm:px-4">
      <div className="flex items-center gap-2">
        <span className="text-xs font-semibold text-[#44453F]">
          Presentation canvas
        </span>
        <span className="rounded-md bg-[#F0F0EC] px-2 py-1 text-[10px] text-[#777971]">
          {deviceCount} device{deviceCount === 1 ? '' : 's'}
        </span>
      </div>

      <div className="flex flex-wrap items-center gap-1.5">
        <select
          value={deviceType}
          onChange={(event) =>
            onDeviceTypeChange(event.target.value as DeviceType)
          }
          aria-label="Device type to add"
          className="h-8 max-w-28 rounded-lg border border-[#E5E5DF] bg-white px-2 text-xs text-[#44453F]"
        >
          <option value="phone">Phone</option>
          <option value="tablet">Tablet</option>
          <option value="desktop">Desktop</option>
        </select>

        <button
          type="button"
          onClick={onAddDevice}
          className="flex h-8 items-center gap-1.5 rounded-lg border border-[#E5E5DF] px-3 text-xs font-medium text-[#44453F] hover:bg-[#F5F5F1]"
        >
          <Plus size={14} />
          Add
        </button>

        <button
          type="button"
          onClick={onResetCanvas}
          title="Reset canvas"
          aria-label="Reset canvas"
          className="flex size-8 items-center justify-center rounded-lg border border-[#E5E5DF] text-[#777971] hover:bg-[#F5F5F1]"
        >
          <RotateCcw size={14} />
        </button>
      </div>
    </div>
  )
}

export default StudioToolbar
