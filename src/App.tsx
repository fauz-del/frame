import { useState } from 'react'
import StudioHeader from './components/layout/StudioHeader'
import StudioWorkspace from './components/studio/StudioWorkspace'

function App() {
  const [websiteUrl, setWebsiteUrl] = useState('')
  const [projectName, setProjectName] = useState('Untitled project')

  return (
    <div className="min-h-dvh bg-[#F5F5F1] text-[#202124]">
      <StudioHeader
        projectName={projectName}
        websiteUrl={websiteUrl}
        onLoadWebsite={setWebsiteUrl}
      />

      <StudioWorkspace
        websiteUrl={websiteUrl}
        onRestoreWebsite={setWebsiteUrl}
        onProjectNameChange={setProjectName}
      />
    </div>
  )
}

export default App