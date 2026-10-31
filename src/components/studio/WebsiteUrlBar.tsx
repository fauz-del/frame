
import { useState, type FormEvent } from 'react'
import { Globe, ArrowRight, LoaderCircle } from 'lucide-react'

type WebsiteUrlBarProps = {
  onLoad: (url: string) => void
}

function WebsiteUrlBar({ onLoad }: WebsiteUrlBarProps) {
  const [url, setUrl] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setError('')

    const input = url.trim()

    if (!input) {
      setError('Enter a website address.')
      return
    }

    let parsedUrl: URL

    try {
      parsedUrl = new URL(
        /^https?:\/\//i.test(input) ? input : `https://${input}`,
      )
    } catch {
      setError('Enter a valid website address.')
      return
    }

    if (
      !['http:', 'https:'].includes(parsedUrl.protocol) ||
      !parsedUrl.hostname.includes('.')
    ) {
      setError('Enter a valid website address.')
      return
    }

    setLoading(true)
    onLoad(parsedUrl.href)
    setUrl(parsedUrl.href)
    setLoading(false)
  }

  return (
    <div className="min-w-0 flex-1">
      <form
        onSubmit={handleSubmit}
        className="flex h-9 min-w-0 items-center gap-2 rounded-lg border border-white/10 bg-[#1B1D21] px-2"
      >
        <Globe size={15} className="shrink-0 text-[#96989D]" />

        <input
          type="text"
          inputMode="url"
          value={url}
          onChange={(event) => setUrl(event.target.value)}
          placeholder="Enter website URL..."
          aria-label="Website URL"
          className="min-w-0 flex-1 bg-transparent text-xs text-white outline-none placeholder:text-[#777971]"
        />

        <button
          type="submit"
          disabled={loading}
          aria-label="Load website"
          title="Load website"
          className="flex size-7 shrink-0 items-center justify-center rounded-md bg-[#E8A08B] text-[#24262B] hover:bg-[#F0B5A3] disabled:opacity-60"
        >
          {loading ? (
            <LoaderCircle size={15} className="animate-spin" />
          ) : (
            <ArrowRight size={15} />
          )}
        </button>
      </form>

      {error && (
        <p role="alert" className="mt-1 text-xs text-red-400">
          {error}
        </p>
      )}
    </div>
  )
}

export default WebsiteUrlBar
