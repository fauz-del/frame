
import { useState } from 'react'
import StudioHeader from './components/layout/StudioHeader'
import StudioWorkspace from './components/studio/StudioWorkspace'

function App() {
  const [websiteUrl, setWebsiteUrl] = useState('')

  return (
    <div className="min-h-dvh bg-[#F5F5F1] text-[#202124]">
      <StudioHeader onLoadWebsite={setWebsiteUrl} />

      <StudioWorkspace websiteUrl={websiteUrl} />
    </div>
  )
}

export default App
