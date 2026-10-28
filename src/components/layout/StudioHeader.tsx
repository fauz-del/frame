
import {
  Clapperboard,
  CloudCheck,
  Eye,
  Redo2,
  Undo2,
  Download,
} from 'lucide-react'
import WebsiteUrlBar from '../studio/WebsiteUrlBar'

type StudioHeaderProps = {
  projectName?: string
  websiteUrl: string
  onPreview?: () => void
  onExport?: () => void
  onLoadWebsite: (url: string) => void
}

function StudioHeader({
  projectName = 'Untitled project',
  websiteUrl,
  onPreview,
  onExport,
  onLoadWebsite,
}: StudioHeaderProps) {
  return (
    <header className="flex min-h-16 items-center justify-between gap-3 border-b border-[#E5E5DF] bg-white px-3 sm:px-6">
      <div className="flex min-w-0 shrink-0 items-center gap-3">
        <div className="flex size-9 shrink-0 items-center justify-center rounded-xl bg-[#24262B] text-white">
          <Clapperboard size={19} strokeWidth={1.8} />
        </div>

        <div className="hidden sm:block">
          <h1 className="font-[Manrope] text-sm font-extrabold tracking-tight text-[#202124]">
            FRAME
          </h1>
          <p className="text-[9px] font-semibold tracking-[0.16em] text-[#777971]">
            WEBSITE STUDIO
          </p>
        </div>

        <div className="mx-1 hidden h-7 w-px bg-[#E5E5DF] lg:block" />

        <span className="hidden max-w-36 truncate text-sm font-medium text-[#44453F] md:block">
          {projectName}
        </span>

        <span
          className="hidden items-center gap-1.5 text-xs text-[#777971] xl:flex"
          title="Project saving is stored in this browser"
        >
          <CloudCheck size={15} />
          <span>Local draft</span>
        </span>
      </div>

      <div className="min-w-0 flex-1">
        <WebsiteUrlBar
          websiteUrl={websiteUrl}
          onLoad={onLoadWebsite}
        />
      </div>

      <div className="flex shrink-0 items-center gap-1.5">
        <div className="mr-1 hidden items-center gap-1 sm:flex">
          <button
            type="button"
            disabled
            aria-label="Undo"
            title="Undo — coming later"
            className="flex size-9 items-center justify-center rounded-lg text-[#A1A29C] hover:bg-[#F5F5F1] disabled:cursor-not-allowed"
          >
            <Undo2 size={17} />
          </button>

          <button
            type="button"
            disabled
            aria-label="Redo"
            title="Redo — coming later"
            className="flex size-9 items-center justify-center rounded-lg text-[#A1A29C] hover:bg-[#F5F5F1] disabled:cursor-not-allowed"
          >
            <Redo2 size={17} />
          </button>
        </div>

        <button
          type="button"
          onClick={onPreview}
          aria-label="Preview"
          className="flex size-9 shrink-0 items-center justify-center rounded-lg border border-[#E5E5DF] text-[#44453F] transition-colors hover:bg-[#F5F5F1] sm:w-auto sm:px-3"
        >
          <Eye size={16} />
          <span className="hidden text-sm font-medium sm:ml-2 sm:inline">
            Preview
          </span>
        </button>

        <button
          type="button"
          onClick={onExport}
          className="flex h-9 shrink-0 items-center gap-2 rounded-lg bg-[#24262B] px-3 text-sm font-medium text-white transition-colors hover:bg-[#383A40]"
        >
          <Download size={16} />
          <span>Export</span>
        </button>
      </div>
    </header>
  )
}

export default StudioHeader
