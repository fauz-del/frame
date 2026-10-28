
export type DeviceType = 'phone' | 'tablet' | 'desktop'

export type DeviceItem = {
  id: number
  type: DeviceType
  width: number
  x: number
  y: number
}

export type BackgroundPreset = {
  name: string
  value: string
  color: string
}

export type StudioWorkspaceProps = {
  websiteUrl: string
  onRestoreWebsite: (url: string) => void
  onProjectNameChange: (name: string) => void
}

export const backgrounds: BackgroundPreset[] = [
  { name: 'Studio', value: '#24262B', color: '#24262B' },
  { name: 'Soft light', value: '#E9E8E2', color: '#E9E8E2' },
  { name: 'Warm', value: '#E9D5C8', color: '#E9D5C8' },
  { name: 'Sage', value: '#BFCDBB', color: '#BFCDBB' },
  { name: 'Lavender', value: '#D5CDE6', color: '#D5CDE6' },
  { name: 'Ocean', value: '#AFCBD7', color: '#AFCBD7' },
]

export const initialDevices: DeviceItem[] = [
  { id: 1, type: 'phone', width: 220, x: 330, y: 90 },
]

export function getDeviceHeight(type: DeviceType): number {
  if (type === 'phone') return 430
  if (type === 'tablet') return 300
  return 350
}

export function getDeviceWidth(type: DeviceType): number {
  if (type === 'phone') return 220
  if (type === 'tablet') return 420
  return 600
}

export function getDeviceLabel(type: DeviceType): string {
  if (type === 'phone') return 'iPhone'
  if (type === 'tablet') return 'Tablet'
  return 'Desktop'
}
