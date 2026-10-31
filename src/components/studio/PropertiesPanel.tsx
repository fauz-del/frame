
import { Monitor, Settings2, Smartphone, Tablet, Trash2, Type } from 'lucide-react'
import type { DeviceItem, DeviceType, TextItem } from '../../types/studio'
import { getDeviceLabel } from '../../types/studio'

type PropertiesPanelProps = {
  device: DeviceItem | null
  text: TextItem | null
  onUpdateText: (updates: Partial<TextItem>) => void
  onRemoveText: () => void
  onChangeType: (type: DeviceType) => void
  onChangeWidth: (width: number) => void
  onRemove: () => void
  websiteUrl: string
}

function PropertiesPanel({
  device,
  text,
  onUpdateText,
  onRemoveText,
  onChangeType,
  onChangeWidth,
  onRemove,
  websiteUrl,
}: PropertiesPanelProps) {
  return (
    <aside className="flex w-full shrink-0 flex-col border-t border-[#E5E5DF] bg-white lg:w-[200px] lg:border-t-0 lg:border-l">
      <div className="flex h-12 items-center justify-between border-b border-[#E5E5DF] px-4">
        <span className="text-xs font-semibold tracking-wide text-[#44453F]">
          PROPERTIES
        </span>
        <Settings2 size={15} className="text-[#777971]" />
      </div>

      {text ? (
        <div className="space-y-5 p-4">
          <div className="flex items-center gap-2 rounded-lg border border-[#E5E5DF] p-3">
            <Type size={16} />
            <span className="text-sm font-medium">Text layer</span>
          </div>
          <section>
            <label htmlFor="text-content" className="mb-2 block text-[11px] font-medium text-[#777971]">Content</label>
            <textarea id="text-content" value={text.text} onChange={(event) => onUpdateText({ text: event.target.value })} rows={3} className="w-full resize-y rounded-lg border border-[#E5E5DF] p-2 text-sm" />
          </section>
          <section>
            <div className="mb-2 flex items-center justify-between">
              <label htmlFor="text-size" className="text-[11px] font-medium text-[#777971]">Font size</label>
              <span className="text-xs font-semibold tabular-nums text-[#44453F]">{text.fontSize}px</span>
            </div>
            <input id="text-size" type="range" min="12" max="72" value={text.fontSize} onChange={(event) => onUpdateText({ fontSize: Number(event.target.value) })} className="w-full accent-[#E8A08B]" />
          </section>
          <section>
            <label htmlFor="text-color" className="mb-2 block text-[11px] font-medium text-[#777971]">Text color</label>
            <input id="text-color" type="color" value={text.color} onChange={(event) => onUpdateText({ color: event.target.value })} className="h-9 w-full rounded-lg border border-[#E5E5DF] bg-white p-1" />
          </section>
          <button type="button" onClick={onRemoveText} className="flex h-9 w-full items-center justify-center gap-2 rounded-lg border border-red-200 text-xs font-medium text-red-500 hover:bg-red-50">
            <Trash2 size={14} /> Remove text
          </button>
        </div>
      ) : device ? (
        <div className="space-y-5 p-4">
          <section>
            <label
              htmlFor="device-type"
              className="mb-2 block text-[11px] font-medium text-[#777971]"
            >
              Device type
            </label>
            <select
              id="device-type"
              value={device.type}
              onChange={(event) =>
                onChangeType(event.target.value as DeviceType)
              }
              className="h-9 w-full rounded-lg border border-[#E5E5DF] bg-white px-2 text-xs text-[#44453F]"
            >
              <option value="phone">Phone</option>
              <option value="tablet">Tablet</option>
              <option value="desktop">Desktop</option>
            </select>
          </section>

          <section>
            <div className="mb-2 flex items-center justify-between gap-2">
              <label
                htmlFor="device-width"
                className="text-[11px] font-medium text-[#777971]"
              >
                Width
              </label>
              <span className="text-xs font-semibold tabular-nums text-[#44453F]">
                {device.width}px
              </span>
            </div>

            <input
              id="device-width"
              type="range"
              min={device.type === 'phone' ? 160 : 260}
              max={
                device.type === 'phone'
                  ? 320
                  : device.type === 'tablet'
                    ? 600
                    : 900
              }
              step={10}
              value={device.width}
              onChange={(event) =>
                onChangeWidth(Number(event.target.value))
              }
              className="w-full accent-[#E8A08B]"
            />

            <div className="mt-1 flex justify-between text-[9px] text-[#96978F]">
              <span>Small</span>
              <span>Large</span>
            </div>
          </section>

          <section>
            <p className="mb-2 text-[11px] font-medium text-[#777971]">
              Position
            </p>
            <div className="grid grid-cols-2 gap-2">
              <div className="rounded-lg border border-[#E5E5DF] p-2">
                <span className="block text-[9px] text-[#96978F]">X</span>
                <span className="mt-1 block text-xs font-medium tabular-nums text-[#44453F]">
                  {Math.round(device.x)} px
                </span>
              </div>
              <div className="rounded-lg border border-[#E5E5DF] p-2">
                <span className="block text-[9px] text-[#96978F]">Y</span>
                <span className="mt-1 block text-xs font-medium tabular-nums text-[#44453F]">
                  {Math.round(device.y)} px
                </span>
              </div>
            </div>
          </section>

          <section className="space-y-2 rounded-lg bg-[#F5F5F1] p-3">
            <div className="flex items-center justify-between gap-2">
              <span className="text-[10px] text-[#777971]">Device</span>
              <span className="text-[10px] font-medium text-[#44453F]">
                {getDeviceLabel(device.type)}
              </span>
            </div>
            <div className="flex items-center justify-between gap-2">
              <span className="text-[10px] text-[#777971]">Height</span>
              <span className="text-[10px] font-medium text-[#44453F]">
                {Math.round(device.type === 'phone' ? device.width * 1.85 : device.type === 'tablet' ? device.width * 0.76 : device.width * 0.57)} px
              </span>
            </div>
            <div className="flex items-center justify-between gap-2">
              <span className="text-[10px] text-[#777971]">ID</span>
              <span className="text-[10px] font-medium text-[#44453F]">
                #{device.id}
              </span>
            </div>
          </section>

          <button
            type="button"
            onClick={onRemove}
            className="flex h-9 w-full items-center justify-center gap-2 rounded-lg border border-red-200 text-xs font-medium text-red-500 hover:bg-red-50"
          >
            <Trash2 size={14} />
            Remove device
          </button>
        </div>
      ) : (
        <div className="flex flex-1 flex-col items-center justify-center px-5 py-8 text-center">
          <div className="flex size-10 items-center justify-center rounded-xl bg-[#F5F5F1] text-[#96978F]">
            <Settings2 size={18} />
          </div>
          <p className="mt-3 text-xs font-medium text-[#44453F]">
            Nothing selected
          </p>
          <p className="mt-1 text-[10px] leading-4 text-[#96978F]">
            Select a device on the canvas to edit its properties.
          </p>
        </div>
      )}

      <div className="mt-auto border-t border-[#E5E5DF] p-3">
        <button
          type="button"
          onClick={() => {
            if (websiteUrl) {
              window.open(websiteUrl, '_blank', 'noopener,noreferrer')
            } else {
              window.alert('Load a website first.')
            }
          }}
          className="flex h-9 w-full items-center justify-center gap-2 rounded-lg border border-[#E5E5DF] text-xs font-medium text-[#55564F] hover:bg-[#F5F5F1]"
        >
          {device?.type === 'desktop' ? (
            <Monitor size={14} />
          ) : device?.type === 'tablet' ? (
            <Tablet size={14} />
          ) : (
            <Smartphone size={14} />
          )}
          Open website
        </button>
      </div>
    </aside>
  )
}

export default PropertiesPanel
