
import { Layers, Smartphone, Trash2 } from 'lucide-react'
import type { SavedProject } from '../../utils/projectStorage'

type ProjectsModalProps = {
  open: boolean
  projects: SavedProject[]
  onClose: () => void
  onOpenProject: (project: SavedProject) => void
  onDeleteProject: (project: SavedProject) => void
  onNewProject: () => void
}

function ProjectsModal({
  open,
  projects,
  onClose,
  onOpenProject,
  onDeleteProject,
  onNewProject,
}: ProjectsModalProps) {
  if (!open) return null

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4 backdrop-blur-sm"
      onClick={onClose}
    >
      <section
        role="dialog"
        aria-modal="true"
        aria-labelledby="saved-projects-title"
        onClick={(event) => event.stopPropagation()}
        className="flex max-h-[85dvh] w-full max-w-2xl flex-col overflow-hidden rounded-2xl border border-[#E5E5DF] bg-white shadow-2xl"
      >
        <header className="flex items-center justify-between border-b border-[#E5E5DF] px-5 py-4">
          <div>
            <h2
              id="saved-projects-title"
              className="text-base font-bold text-[#202124]"
            >
              My Projects
            </h2>
            <p className="mt-1 text-xs text-[#777971]">
              Your saved FRAME presentations
            </p>
          </div>

          <button
            type="button"
            onClick={onClose}
            aria-label="Close projects"
            className="flex size-9 items-center justify-center rounded-lg text-xl text-[#777971] hover:bg-[#F5F5F1]"
          >
            ×
          </button>
        </header>

        <div className="min-h-0 flex-1 space-y-2 overflow-y-auto p-4">
          {projects.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <div className="flex size-12 items-center justify-center rounded-xl bg-[#F5F5F1]">
                <Layers size={22} className="text-[#777971]" />
              </div>
              <h3 className="mt-4 text-sm font-semibold text-[#44453F]">
                No saved projects yet
              </h3>
              <p className="mt-2 max-w-xs text-xs leading-5 text-[#777971]">
                Save a presentation and it will appear here.
              </p>
              <button
                type="button"
                onClick={onClose}
                className="mt-4 rounded-lg bg-[#24262B] px-4 py-2 text-xs font-medium text-white hover:bg-[#383A40]"
              >
                Back to workspace
              </button>
            </div>
          ) : (
            projects.map((project) => (
              <article
                key={project.id}
                className="flex items-center gap-3 rounded-xl border border-[#E5E5DF] p-3 hover:bg-[#FAFAF8]"
              >
                <div
                  className="flex size-14 shrink-0 items-center justify-center overflow-hidden rounded-lg border border-black/5"
                  style={{
                    backgroundColor: project.background || '#24262B',
                    backgroundImage: project.backgroundImage
                      ? `url("${project.backgroundImage}")`
                      : undefined,
                    backgroundPosition: 'center',
                    backgroundSize: 'cover',
                  }}
                >
                  <Smartphone size={22} className="text-white drop-shadow" />
                </div>

                <div className="min-w-0 flex-1">
                  <h3 className="truncate text-sm font-semibold text-[#202124]">
                    {project.name}
                  </h3>
                  <p className="mt-1 truncate text-xs text-[#777971]">
                    {project.websiteUrl || 'No website loaded'}
                  </p>
                  <p className="mt-1 text-[10px] text-[#96978F]">
                    {project.devices.length} device
                    {project.devices.length === 1 ? '' : 's'}
                    {' · '}
                    {new Date(project.updatedAt).toLocaleDateString()}
                  </p>
                </div>

                <div className="flex shrink-0 items-center gap-1">
                  <button
                    type="button"
                    onClick={() => onOpenProject(project)}
                    className="rounded-lg bg-[#E8A08B] px-3 py-2 text-xs font-semibold text-[#24262B] hover:bg-[#F0B5A3]"
                  >
                    Open
                  </button>
                  <button
                    type="button"
                    onClick={() => onDeleteProject(project)}
                    aria-label={`Delete ${project.name}`}
                    title="Delete project"
                    className="flex size-9 items-center justify-center rounded-lg text-[#96978F] hover:bg-red-50 hover:text-red-500"
                  >
                    <Trash2 size={15} />
                  </button>
                </div>
              </article>
            ))
          )}
        </div>

        <footer className="flex items-center justify-between border-t border-[#E5E5DF] px-5 py-3">
          <span className="text-xs text-[#777971]">
            {projects.length} saved project{projects.length === 1 ? '' : 's'}
          </span>
          <button
            type="button"
            onClick={onNewProject}
            className="rounded-lg border border-[#E5E5DF] px-3 py-2 text-xs font-medium text-[#44453F] hover:bg-[#F5F5F1]"
          >
            New project
          </button>
        </footer>
      </section>
    </div>
  )
}

export default ProjectsModal
