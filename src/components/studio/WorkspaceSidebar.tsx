
import { useRef } from 'react'
import {
  Image,
  Layers,
  Monitor,
  Palette,
  Plus,
  Smartphone,
  Tablet,
  Trash2,
  Upload,
} from 'lucide-react'
import {
  backgrounds,
  getDeviceLabel,
  type BackgroundPreset,
  type DeviceItem,
} from '../../types/studio'

type WorkspaceSidebarProps = {
  devices: DeviceItem[]
  selectedDeviceId: number | null
  background: string
  customColor: string
  backgroundName: string
  backgroundImage: string
  onSelectDevice: (id: number) => void
  onRemoveDevice: (id: number) => void
  onAddDevice: () => void
  onChooseBackground: (preset: BackgroundPreset) => void
  onChooseColor: (color: string) => void
  onChooseImage: (file: File) => void
}

function WorkspaceSidebar({
  devices,
  selectedDeviceId,
  background,
  customColor,
  backgroundName,
  backgroundImage,
  onSelectDevice,
  onRemoveDevice,
  onAddDevice,
  onChooseBackground,
  onChooseColor,
  onChooseImage,
}: WorkspaceSidebarProps) {
  const imageInputRef = useRef<HTMLInputElement>(null)

  function handleImageChange(
    event: React.ChangeEvent<HTMLInputElement>,
  ) {
    const file = event.target.files?.[0]
    if (file) onChooseImage(file)
    event.target.value = ''
  }

  return (
    <aside className="flex w-full shrink-0 flex-col border-b border-[#E5E5DF] bg-white lg:w-[230px] lg:border-r lg:border-b-0">
      <div className="flex h-12 items-center justify-between border-b border-[#E5E5DF] px-4">
        <span className="text-xs font-semibold tracking-wide text-[#44453F]">
          WORKSPACE
        </span>
        <Layers size={15} className="text-[#777971]" />
      </div>

      <section className="p-3">
        <div className="mb-3 flex items-center justify-between">
          <span className="flex items-center gap-2 text-xs font-semibold text-[#44453F]">
            <Smartphone size={14} />
            Devices
            <span className="rounded-md bg-[#F0F0EC] px-1.5 py-0.5 text-[10px] text-[#777971]">
              {devices.length}
            </span>
          </span>
          <button
            type="button"
            onClick={onAddDevice}
            title="Add device"
            aria-label="Add device"
            className="flex size-7 items-center justify-center rounded-md text-[#777971] hover:bg-[#F5F5F1]"
          >
            <Plus size={15} />
          </button>
        </div>

        <div className="space-y-1">
          {devices.length === 0 && (
            <p className="px-2 py-3 text-xs text-[#777971]">
              No devices yet.
            </p>
          )}

          {devices.map((device) => {
            const selected = device.id === selectedDeviceId
            const Icon =
              device.type === 'phone'
                ? Smartphone
                : device.type === 'tablet'
                  ? Tablet
                  : Monitor

            return (
              <div
                key={device.id}
                className={`flex items-center gap-1 rounded-lg ${
                  selected ? 'bg-[#F8E6DF]' : 'hover:bg-[#F5F5F1]'
                }`}
              >
                <button
                  type="button"
                  onClick={() => onSelectDevice(device.id)}
                  className={`flex min-w-0 flex-1 items-center gap-2 rounded-lg px-2 py-2 text-left text-xs ${
                    selected
                      ? 'font-medium text-[#9C5845]'
                      : 'text-[#666760]'
                  }`}
                >
                  <Icon size={14} />
                  <span className="truncate">
                    {getDeviceLabel(device.type)} {device.id}
                  </span>
                </button>

                <button
                  type="button"
                  onClick={() => onRemoveDevice(device.id)}
                  title="Delete device"
                  aria-label={`Delete device ${device.id}`}
                  className="mr-1 flex size-7 shrink-0 items-center justify-center rounded-md text-[#96978F] hover:bg-white hover:text-red-500"
                >
                  <Trash2 size={13} />
                </button>
              </div>
            )
          })}
        </div>
      </section>

      <div className="border-t border-[#E5E5DF]" />

      <section className="p-3">
        <div className="mb-3 flex items-center gap-2 text-xs font-semibold text-[#44453F]">
          <Palette size={14} />
          Background
        </div>

        <div className="grid grid-cols-3 gap-2">
          {backgrounds.map((preset) => (
            <button
              key={preset.name}
              type="button"
              title={preset.name}
              aria-label={`${preset.name} background`}
              onClick={() => onChooseBackground(preset)}
              className={`aspect-square rounded-lg border-2 transition-transform hover:scale-105 ${
                background === preset.value && !backgroundImage
                  ? 'border-[#E8A08B] ring-2 ring-[#F8E6DF]'
                  : 'border-[#E5E5DF]'
              }`}
              style={{ backgroundColor: preset.color }}
            />
          ))}
        </div>

        <div className="mt-3 flex items-center gap-2">
          <label className="flex min-w-0 flex-1 items-center gap-2 rounded-lg border border-[#E5E5DF] px-2 py-2">
            <input
              type="color"
              aria-label="Custom background color"
              value={customColor}
              onChange={(event) => onChooseColor(event.target.value)}
              className="size-5 shrink-0 cursor-pointer border-0 bg-transparent p-0"
            />
            <span className="truncate text-[11px] text-[#777971]">
              Custom color
            </span>
          </label>

          <button
            type="button"
            onClick={() => imageInputRef.current?.click()}
            title="Upload background image"
            aria-label="Upload background image"
            className="flex size-9 shrink-0 items-center justify-center rounded-lg border border-[#E5E5DF] text-[#777971] hover:bg-[#F5F5F1]"
          >
            <Upload size={15} />
          </button>

          <input
            ref={imageInputRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={handleImageChange}
          />
        </div>

        <div className="mt-2 flex items-center gap-2">
          {backgroundImage && <Image size={12} className="text-[#777971]" />}
          <p className="truncate text-[10px] text-[#96978F]">
            {backgroundName}
          </p>
        </div>
      </section>

      <div className="mt-auto hidden border-t border-[#E5E5DF] p-3 lg:block">
        <div className="rounded-lg bg-[#F5F5F1] p-3">
          <p className="text-xs font-medium text-[#44453F]">Canvas setup</p>
          <p className="mt-1 text-[10px] text-[#777971]">
            {devices.length} device{devices.length === 1 ? '' : 's'} · {backgroundName}
          </p>
        </div>
      </div>
    </aside>
  )
}

export default WorkspaceSidebar
