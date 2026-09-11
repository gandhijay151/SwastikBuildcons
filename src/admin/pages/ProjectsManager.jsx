import { useCallback, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Plus,
  Pencil,
  Trash2,
  Eye,
  EyeOff,
  Loader2,
  AlertTriangle,
  FolderPlus,
} from 'lucide-react';
import { get, patch, del, ApiError } from '../apiClient';

/**
 * Admin Projects manager — list view (Requirement 4.1).
 *
 * Fetches all projects from GET /api/admin/industrial-projects and renders them
 * in an accessible table showing key fields (project name, client, location,
 * type, status, progress) plus a publish-status badge (Published vs Draft,
 * derived from `isPublished`).
 *
 * Scope note: this task (5.1) is the list view only. The New / Edit / Delete /
 * Publish affordances are present so the page is complete to look at, but the
 * create/edit forms are task 5.2 and delete + publish toggle are task 5.3.
 * The New/Edit controls link to routes added in 5.2; Delete and Publish are
 * disabled placeholders here (no mutation logic lives in this file).
 */

// Map a project status token to a colored badge in the admin palette.
const STATUS_BADGE_STYLES = {
  planning: 'bg-blue-100 text-blue-700 border-blue-200',
  inprogress: 'bg-brass/15 text-brass border-brass/30',
  onhold: 'bg-amber-100 text-amber-700 border-amber-200',
  completed: 'bg-green-100 text-green-700 border-green-200',
  cancelled: 'bg-red-100 text-red-700 border-red-200',
};

function statusBadgeClass(status) {
  const key = String(status || '').toLowerCase().replace(/[^a-z]/g, '');
  return STATUS_BADGE_STYLES[key] || 'bg-coal/8 text-coal/70 border-coal/15';
}

function formatProgress(value) {
  const pct = Number(value);
  if (!Number.isFinite(pct)) return '—';
  return `${Math.max(0, Math.min(100, Math.round(pct)))}%`;
}

export default function ProjectsManager() {
  const [projects, setProjects] = useState([]);
  const [state, setState] = useState('loading'); // 'loading' | 'error' | 'ready'
  const [errorMessage, setErrorMessage] = useState('');

  // Per-row pending flags keyed by project id: { [id]: 'publishing' | 'deleting' }.
  const [rowPending, setRowPending] = useState({});
  // Per-row inline action error keyed by project id.
  const [rowError, setRowError] = useState({});
  // The project currently queued for delete confirmation (null when the dialog is closed).
  const [deleteTarget, setDeleteTarget] = useState(null);

  const setPending = useCallback((id, value) => {
    setRowPending((prev) => {
      const next = { ...prev };
      if (value) next[id] = value;
      else delete next[id];
      return next;
    });
  }, []);

  const setRowErrorFor = useCallback((id, message) => {
    setRowError((prev) => {
      const next = { ...prev };
      if (message) next[id] = message;
      else delete next[id];
      return next;
    });
  }, []);

  const fetchProjects = useCallback(async () => {
    setState('loading');
    setErrorMessage('');
    try {
      const result = await get('/api/admin/industrial-projects');
      setProjects(Array.isArray(result) ? result : []);
    } catch (err) {
      // A 401 already redirected to login inside the API client; anything else
      // is surfaced as an inline error state.
      const message =
        err instanceof ApiError
          ? err.message
          : 'Something went wrong while loading projects.';
      setErrorMessage(message);
      setState('error');
      return;
    }
    setState('ready');
  }, []);

  useEffect(() => {
    fetchProjects();
  }, [fetchProjects]);

  // Publish toggle (Req 4.6): optimistically flip the row, PATCH the server, then
  // reconcile with the response. On failure, revert and surface an inline error.
  const togglePublish = useCallback(
    async (project) => {
      const { id } = project;
      const nextPublished = !project.isPublished;

      setRowErrorFor(id, '');
      setPending(id, 'publishing');
      // Optimistic update.
      setProjects((prev) =>
        prev.map((p) => (p.id === id ? { ...p, isPublished: nextPublished } : p)),
      );

      try {
        const updated = await patch(
          `/api/admin/industrial-projects/${id}/publish`,
          { isPublished: nextPublished },
        );
        // Reconcile from the server response when it comes back.
        if (updated && typeof updated === 'object' && 'isPublished' in updated) {
          setProjects((prev) =>
            prev.map((p) =>
              p.id === id ? { ...p, isPublished: Boolean(updated.isPublished) } : p,
            ),
          );
        }
      } catch (err) {
        // Revert the optimistic change.
        setProjects((prev) =>
          prev.map((p) => (p.id === id ? { ...p, isPublished: project.isPublished } : p)),
        );
        const message =
          err instanceof ApiError
            ? err.message
            : 'Could not update publish status. Please try again.';
        setRowErrorFor(id, message);
      } finally {
        setPending(id, null);
      }
    },
    [patch, setPending, setRowErrorFor],
  );

  // Delete (Req 4.5): only runs after explicit confirmation via the dialog.
  const confirmDelete = useCallback(async () => {
    if (!deleteTarget) return;
    const { id } = deleteTarget;

    setRowErrorFor(id, '');
    setPending(id, 'deleting');

    try {
      await del(`/api/admin/industrial-projects/${id}`);
      setProjects((prev) => prev.filter((p) => p.id !== id));
      setDeleteTarget(null);
    } catch (err) {
      const message =
        err instanceof ApiError
          ? err.message
          : 'Could not delete the project. Please try again.';
      setRowErrorFor(id, message);
      setDeleteTarget(null);
    } finally {
      setPending(id, null);
    }
  }, [deleteTarget, setPending, setRowErrorFor]);

  return (
    <div>
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h2 className="font-display text-2xl font-semibold text-ink">Projects</h2>
          <p className="mt-1 text-sm text-coal/60">
            Manage the industrial projects shown in the public portfolio.
          </p>
        </div>

        {/* New Project (route defined in task 5.2). */}
        <Link
          to="/admin/projects/new"
          className="inline-flex items-center gap-2 rounded-full bg-brass px-5 py-2.5 text-sm font-semibold text-white shadow-md shadow-brass/25 transition-all hover:bg-brass/90 focus:outline-none focus:ring-2 focus:ring-brass/40"
        >
          <Plus size={16} />
          New Project
        </Link>
      </div>

      {/* Loading state */}
      {state === 'loading' && (
        <div className="mt-10 flex flex-col items-center justify-center py-16 text-coal/60">
          <Loader2 className="h-8 w-8 animate-spin text-brass" />
          <p className="mt-4 text-sm">Loading projects…</p>
        </div>
      )}

      {/* Error state */}
      {state === 'error' && (
        <div className="mt-10 mx-auto max-w-lg rounded-xl border border-red-200 bg-red-50 px-6 py-10 text-center">
          <AlertTriangle className="mx-auto h-8 w-8 text-red-500" />
          <p className="mt-4 font-semibold text-red-700">We couldn't load the projects.</p>
          <p className="mt-1 text-sm text-red-600/80">{errorMessage}</p>
          <button
            type="button"
            onClick={fetchProjects}
            className="mt-5 inline-flex items-center gap-2 rounded-full bg-brass px-6 py-2.5 text-sm font-semibold text-white shadow-md shadow-brass/25 transition-all hover:bg-brass/90 focus:outline-none focus:ring-2 focus:ring-brass/40"
          >
            Retry
          </button>
        </div>
      )}

      {/* Empty state */}
      {state === 'ready' && projects.length === 0 && (
        <div className="mt-10 mx-auto max-w-lg rounded-xl border border-dashed border-coal/20 bg-white px-6 py-12 text-center">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-brass/10 text-brass">
            <FolderPlus size={26} />
          </div>
          <p className="mt-5 font-display text-lg font-semibold text-ink">No projects yet</p>
          <p className="mt-2 text-sm leading-7 text-coal/60">
            Create your first project to start building the public portfolio.
          </p>
          <Link
            to="/admin/projects/new"
            className="mt-5 inline-flex items-center gap-2 rounded-full bg-brass px-6 py-2.5 text-sm font-semibold text-white shadow-md shadow-brass/25 transition-all hover:bg-brass/90 focus:outline-none focus:ring-2 focus:ring-brass/40"
          >
            <Plus size={16} />
            New Project
          </Link>
        </div>
      )}

      {/* Projects table (Req 4.1) */}
      {state === 'ready' && projects.length > 0 && (
        <div className="mt-8 overflow-hidden rounded-xl border border-coal/10 bg-white shadow-crisp">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-coal/10 text-left text-sm">
              <caption className="sr-only">
                List of industrial projects with name, client, location, type,
                status, progress, and publish status.
              </caption>
              <thead className="bg-ivory/60">
                <tr>
                  <th scope="col" className="px-5 py-3 font-semibold text-coal/70">
                    Project
                  </th>
                  <th scope="col" className="px-5 py-3 font-semibold text-coal/70">
                    Client
                  </th>
                  <th scope="col" className="px-5 py-3 font-semibold text-coal/70">
                    Location
                  </th>
                  <th scope="col" className="px-5 py-3 font-semibold text-coal/70">
                    Type
                  </th>
                  <th scope="col" className="px-5 py-3 font-semibold text-coal/70">
                    Status
                  </th>
                  <th scope="col" className="px-5 py-3 font-semibold text-coal/70">
                    Progress
                  </th>
                  <th scope="col" className="px-5 py-3 font-semibold text-coal/70">
                    Publish
                  </th>
                  <th scope="col" className="px-5 py-3 text-right font-semibold text-coal/70">
                    <span className="sr-only">Actions</span>
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-coal/8">
                {projects.map((project) => {
                  const published = Boolean(project.isPublished);
                  const pending = rowPending[project.id];
                  const isPublishing = pending === 'publishing';
                  const isDeleting = pending === 'deleting';
                  const actionError = rowError[project.id];
                  return (
                    <tr key={project.id} className="transition-colors hover:bg-ivory/50">
                      <th scope="row" className="px-5 py-3 font-medium text-ink">
                        {project.projectName || '—'}
                      </th>
                      <td className="px-5 py-3 text-coal/80">{project.clientName || '—'}</td>
                      <td className="px-5 py-3 text-coal/80">{project.location || '—'}</td>
                      <td className="px-5 py-3 text-coal/80">{project.projectType || '—'}</td>
                      <td className="px-5 py-3">
                        <span
                          className={`inline-block rounded-full border px-3 py-1 text-[11px] font-semibold ${statusBadgeClass(
                            project.status,
                          )}`}
                        >
                          {project.status || 'Unknown'}
                        </span>
                      </td>
                      <td className="px-5 py-3 text-coal/80">
                        {formatProgress(project.progressPercentage)}
                      </td>
                      <td className="px-5 py-3">
                        <span
                          className={`inline-block rounded-full border px-3 py-1 text-[11px] font-semibold ${
                            published
                              ? 'bg-green-100 text-green-700 border-green-200'
                              : 'bg-coal/8 text-coal/70 border-coal/15'
                          }`}
                        >
                          {published ? 'Published' : 'Draft'}
                        </span>
                      </td>
                      <td className="px-5 py-3">
                        <div className="flex items-center justify-end gap-1">
                          {/* Publish toggle (Req 4.6). */}
                          <button
                            type="button"
                            onClick={() => togglePublish(project)}
                            disabled={isPublishing || isDeleting}
                            title={published ? 'Unpublish' : 'Publish'}
                            aria-label={
                              published
                                ? `Unpublish ${project.projectName || 'project'}`
                                : `Publish ${project.projectName || 'project'}`
                            }
                            className="inline-flex items-center justify-center rounded-lg border border-coal/15 bg-white p-2 text-coal/70 shadow-sm transition-colors hover:border-brass/40 hover:text-brass focus:outline-none focus:ring-2 focus:ring-brass/20 disabled:cursor-not-allowed disabled:opacity-50"
                          >
                            {isPublishing ? (
                              <Loader2 size={15} className="animate-spin" />
                            ) : published ? (
                              <EyeOff size={15} />
                            ) : (
                              <Eye size={15} />
                            )}
                          </button>

                          {/* Edit — route defined in task 5.2. */}
                          <Link
                            to={`/admin/projects/${project.id}/edit`}
                            aria-label={`Edit ${project.projectName || 'project'}`}
                            className="inline-flex items-center justify-center rounded-lg border border-coal/15 bg-white p-2 text-coal/70 shadow-sm transition-colors hover:border-brass/40 hover:text-brass focus:outline-none focus:ring-2 focus:ring-brass/20"
                          >
                            <Pencil size={15} />
                          </Link>

                          {/* Delete (Req 4.5) — opens a confirmation dialog first. */}
                          <button
                            type="button"
                            onClick={() => setDeleteTarget(project)}
                            disabled={isPublishing || isDeleting}
                            title="Delete"
                            aria-label={`Delete ${project.projectName || 'project'}`}
                            className="inline-flex items-center justify-center rounded-lg border border-coal/15 bg-white p-2 text-coal/70 shadow-sm transition-colors hover:border-red-300 hover:text-red-600 focus:outline-none focus:ring-2 focus:ring-red-200 disabled:cursor-not-allowed disabled:opacity-50"
                          >
                            {isDeleting ? (
                              <Loader2 size={15} className="animate-spin" />
                            ) : (
                              <Trash2 size={15} />
                            )}
                          </button>
                        </div>
                        {actionError && (
                          <p className="mt-1 text-right text-[11px] font-medium text-red-600">
                            {actionError}
                          </p>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Total count */}
      {state === 'ready' && projects.length > 0 && (
        <p className="mt-6 text-xs text-coal/60">
          {projects.length} project{projects.length === 1 ? '' : 's'} total
        </p>
      )}

      {/* Delete confirmation dialog (Req 4.5) — explicit confirmation before deleting. */}
      {deleteTarget && (
        <DeleteConfirmDialog
          project={deleteTarget}
          pending={rowPending[deleteTarget.id] === 'deleting'}
          onCancel={() => setDeleteTarget(null)}
          onConfirm={confirmDelete}
        />
      )}
    </div>
  );
}

/**
 * Accessible confirmation dialog for deleting a project (Req 4.5).
 *
 * Rendered as a modal overlay with role="dialog" + aria-modal. Escape and the
 * backdrop cancel; the destructive action requires clicking "Delete project".
 */
function DeleteConfirmDialog({ project, pending, onCancel, onConfirm }) {
  const titleId = 'delete-project-title';
  const descId = 'delete-project-desc';

  useEffect(() => {
    function onKeyDown(e) {
      if (e.key === 'Escape' && !pending) onCancel();
    }
    document.addEventListener('keydown', onKeyDown);
    return () => document.removeEventListener('keydown', onKeyDown);
  }, [onCancel, pending]);

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby={titleId}
      aria-describedby={descId}
    >
      {/* Backdrop */}
      <button
        type="button"
        aria-label="Close dialog"
        tabIndex={-1}
        onClick={() => !pending && onCancel()}
        className="absolute inset-0 h-full w-full cursor-default bg-coal/40"
      />

      {/* Panel */}
      <div className="relative w-full max-w-md rounded-2xl bg-white p-6 shadow-xl">
        <div className="flex items-start gap-3">
          <div className="flex h-10 w-10 flex-none items-center justify-center rounded-full bg-red-100 text-red-600">
            <AlertTriangle size={20} />
          </div>
          <div>
            <h3 id={titleId} className="font-display text-lg font-semibold text-ink">
              Delete this project?
            </h3>
            <p id={descId} className="mt-1 text-sm leading-6 text-coal/70">
              This permanently removes{' '}
              <span className="font-semibold text-ink">
                {project.projectName || 'this project'}
              </span>{' '}
              and its details. This action cannot be undone.
            </p>
          </div>
        </div>

        <div className="mt-6 flex justify-end gap-3">
          <button
            type="button"
            onClick={onCancel}
            disabled={pending}
            className="inline-flex items-center gap-2 rounded-full border border-coal/15 bg-white px-5 py-2.5 text-sm font-semibold text-coal/70 transition-colors hover:bg-ivory/60 focus:outline-none focus:ring-2 focus:ring-brass/20 disabled:cursor-not-allowed disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={onConfirm}
            disabled={pending}
            className="inline-flex items-center gap-2 rounded-full bg-red-600 px-5 py-2.5 text-sm font-semibold text-white shadow-md shadow-red-600/25 transition-colors hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-300 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {pending ? (
              <>
                <Loader2 size={15} className="animate-spin" />
                Deleting…
              </>
            ) : (
              <>
                <Trash2 size={15} />
                Delete project
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
