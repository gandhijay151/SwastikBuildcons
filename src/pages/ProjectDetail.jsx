import { useState, useEffect, useCallback } from 'react';
import { Link, useParams } from 'react-router-dom';
import {
  ArrowLeft,
  Loader2,
  AlertTriangle,
  Building2,
  MapPin,
  User,
  CalendarClock,
  CalendarCheck,
  CalendarDays,
  ClipboardList,
  FileText,
} from 'lucide-react';
import { getApiBaseUrl } from '../lib/api';
import Seo from '../components/Seo';

// Format a status/type token like "InProgress" into "In Progress" for display.
function humanize(value) {
  if (!value) return '';
  return String(value)
    .replace(/[_-]+/g, ' ')
    .replace(/([a-z0-9])([A-Z])/g, '$1 $2')
    .trim();
}

const STATUS_BADGE_STYLES = {
  completed: 'bg-green-100 text-green-700 border-green-200',
  inprogress: 'bg-brass/15 text-brass border-brass/30',
  planning: 'bg-blue-100 text-blue-700 border-blue-200',
  onhold: 'bg-amber-100 text-amber-700 border-amber-200',
};

function statusBadgeClass(status) {
  const key = String(status || '').toLowerCase().replace(/[^a-z]/g, '');
  return STATUS_BADGE_STYLES[key] || 'bg-coal/8 text-coal/70 border-coal/15';
}

function formatDate(value) {
  if (!value) return null;
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return null;
  return date.toLocaleDateString(undefined, {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
}

function DetailRow({ icon: Icon, label, value }) {
  if (value == null || value === '') return null;
  return (
    <div className="flex items-start gap-3">
      <span className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-brass/10 text-brass">
        <Icon size={17} />
      </span>
      <div>
        <dt className="text-[11px] font-semibold uppercase tracking-wider text-coal/50">{label}</dt>
        <dd className="mt-0.5 text-sm text-ink">{value}</dd>
      </div>
    </div>
  );
}

function BackLink() {
  return (
    <Link
      to="/projects"
      className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-brass hover:underline"
    >
      <ArrowLeft size={14} /> Back to projects
    </Link>
  );
}

export default function ProjectDetail() {
  const { id } = useParams();

  const [project, setProject] = useState(null);
  // 'loading' | 'ready' | 'notfound' | 'error'
  const [state, setState] = useState('loading');

  const fetchProject = useCallback(async () => {
    setState('loading');
    try {
      const url = `${getApiBaseUrl()}/api/projects/${encodeURIComponent(id)}`;
      const response = await fetch(url, { headers: { Accept: 'application/json' } });

      if (response.status === 404) {
        setState('notfound');
        return;
      }
      if (!response.ok) throw new Error(`Request failed with status ${response.status}`);

      const data = await response.json();
      setProject(data);
      setState('ready');
    } catch (err) {
      console.error('Failed to load project:', err);
      setState('error');
    }
  }, [id]);

  useEffect(() => {
    fetchProject();
  }, [fetchProject]);

  // --- Loading state ---------------------------------------------------------
  if (state === 'loading') {
    return (
      <section className="bg-paper section-pad pt-28">
        <div className="container-shell">
          <BackLink />
          <div className="mt-16 flex flex-col items-center justify-center py-16 text-coal/60">
            <Loader2 className="h-8 w-8 animate-spin text-brass" />
            <p className="mt-4 text-sm">Loading project…</p>
          </div>
        </div>
      </section>
    );
  }

  // --- Not found state (unpublished or missing project) ----------------------
  if (state === 'notfound') {
    return (
      <section className="bg-paper section-pad pt-28">
        <div className="container-shell">
          <BackLink />
          <div className="mt-12 mx-auto max-w-lg rounded-xl border border-dashed border-coal/20 bg-white px-6 py-12 text-center">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-brass/10 text-brass">
              <Building2 size={26} />
            </div>
            <h1 className="mt-5 font-display text-2xl font-bold text-ink">Project not found</h1>
            <p className="mt-2 text-sm leading-7 text-coal/60">
              The project you're looking for doesn't exist or isn't available right now.
              It may have been unpublished.
            </p>
            <div className="mt-6">
              <Link
                to="/projects"
                className="inline-flex items-center gap-2 rounded-full bg-brass px-6 py-2.5 text-sm font-semibold text-white shadow-md shadow-brass/25 transition-all hover:bg-brass/90"
              >
                <ArrowLeft size={16} /> Browse all projects
              </Link>
            </div>
          </div>
        </div>
      </section>
    );
  }

  // --- Generic error state ---------------------------------------------------
  if (state === 'error') {
    return (
      <section className="bg-paper section-pad pt-28">
        <div className="container-shell">
          <BackLink />
          <div className="mt-12 mx-auto max-w-lg rounded-xl border border-red-200 bg-red-50 px-6 py-10 text-center">
            <AlertTriangle className="mx-auto h-8 w-8 text-red-500" />
            <p className="mt-4 font-semibold text-red-700">We couldn't load this project.</p>
            <p className="mt-1 text-sm text-red-600/80">
              Something went wrong while fetching the details. Please try again.
            </p>
            <button
              onClick={fetchProject}
              className="mt-5 inline-flex items-center gap-2 rounded-full bg-brass px-6 py-2.5 text-sm font-semibold text-white shadow-md shadow-brass/25 transition-all hover:bg-brass/90"
            >
              Retry
            </button>
          </div>
        </div>
      </section>
    );
  }

  // --- Ready state -----------------------------------------------------------
  const {
    projectName,
    clientName,
    location,
    projectType,
    status,
    progressPercentage,
    description,
    scopeOfWork,
    startDate,
    estimatedCompletionDate,
    actualCompletionDate,
  } = project || {};

  const hasProgress = typeof progressPercentage === 'number';
  const clampedProgress = hasProgress
    ? Math.min(Math.max(progressPercentage, 0), 100)
    : 0;

  const start = formatDate(startDate);
  const estimated = formatDate(estimatedCompletionDate);
  const actual = formatDate(actualCompletionDate);
  const hasTimeline = Boolean(start || estimated || actual);

  const detailDescription = description
    ? String(description).slice(0, 160)
    : [projectName, humanize(projectType), location].filter(Boolean).join(' — ');

  return (
    <section className="bg-paper section-pad pt-28">
      <Seo
        title={projectName || 'Project'}
        description={detailDescription}
        path={`/projects/${id}`}
        type="article"
      />
      {/* Project structured data (Req 7.4, 8.3) */}
      <script type="application/ld+json">
        {JSON.stringify({
          '@context': 'https://schema.org',
          '@type': 'Project',
          name: projectName,
          description: description || undefined,
          location: location || undefined,
        })}
      </script>
      <div className="container-shell">
        <BackLink />

        {/* Header */}
        <header className="mt-6">
          <div className="flex flex-wrap items-center gap-3">
            {status && (
              <span
                className={`rounded-full border px-3 py-1 text-[11px] font-semibold ${statusBadgeClass(status)}`}
              >
                {humanize(status)}
              </span>
            )}
            {projectType && (
              <span className="inline-flex items-center gap-1.5 rounded-full border border-coal/15 bg-white px-3 py-1 text-[11px] font-semibold text-coal/70">
                <Building2 size={13} className="text-brass/70" />
                {humanize(projectType)}
              </span>
            )}
          </div>

          <h1 className="mt-4 font-display text-3xl font-bold text-ink md:text-4xl">
            {projectName || 'Untitled Project'}
          </h1>

          {location && (
            <p className="mt-3 flex items-center gap-2 text-sm text-coal/70">
              <MapPin className="h-4 w-4 shrink-0 text-brass/70" />
              <span>{location}</span>
            </p>
          )}
        </header>

        <div className="mt-10 grid gap-8 lg:grid-cols-3">
          {/* Main content column */}
          <div className="space-y-8 lg:col-span-2">
            {/* Progress */}
            {hasProgress && (
              <div className="rounded-xl border border-coal/8 bg-white p-6 shadow-sm">
                <div className="flex items-center justify-between text-sm text-coal/60">
                  <span className="font-semibold uppercase tracking-wider text-coal/50">
                    Progress
                  </span>
                  <span className="font-semibold text-ink">{clampedProgress}%</span>
                </div>
                <div
                  className="mt-3 h-2.5 w-full overflow-hidden rounded-full bg-coal/10"
                  role="progressbar"
                  aria-valuenow={clampedProgress}
                  aria-valuemin={0}
                  aria-valuemax={100}
                  aria-label="Project completion progress"
                >
                  <div
                    className="h-full rounded-full bg-brass transition-all duration-500"
                    style={{ width: `${clampedProgress}%` }}
                  />
                </div>
              </div>
            )}

            {/* Scope of work */}
            {scopeOfWork && (
              <section className="rounded-xl border border-coal/8 bg-white p-6 shadow-sm">
                <h2 className="flex items-center gap-2 font-display text-xl font-semibold text-ink">
                  <ClipboardList className="h-5 w-5 text-brass" />
                  Scope of Work
                </h2>
                <p className="mt-4 whitespace-pre-line text-sm leading-7 text-coal/70">
                  {scopeOfWork}
                </p>
              </section>
            )}

            {/* Description */}
            {description && (
              <section className="rounded-xl border border-coal/8 bg-white p-6 shadow-sm">
                <h2 className="flex items-center gap-2 font-display text-xl font-semibold text-ink">
                  <FileText className="h-5 w-5 text-brass" />
                  About This Project
                </h2>
                <p className="mt-4 whitespace-pre-line text-sm leading-7 text-coal/70">
                  {description}
                </p>
              </section>
            )}
          </div>

          {/* Sidebar: key facts + timeline */}
          <aside className="space-y-8">
            <section className="rounded-xl border border-coal/8 bg-white p-6 shadow-sm">
              <h2 className="font-display text-lg font-semibold text-ink">Project Details</h2>
              <dl className="mt-5 space-y-4">
                <DetailRow icon={Building2} label="Type" value={humanize(projectType)} />
                <DetailRow icon={MapPin} label="Location" value={location} />
                <DetailRow icon={User} label="Client" value={clientName} />
                <DetailRow icon={ClipboardList} label="Status" value={humanize(status)} />
              </dl>
            </section>

            {hasTimeline && (
              <section className="rounded-xl border border-coal/8 bg-white p-6 shadow-sm">
                <h2 className="flex items-center gap-2 font-display text-lg font-semibold text-ink">
                  <CalendarDays className="h-5 w-5 text-brass" />
                  Timeline
                </h2>
                <dl className="mt-5 space-y-4">
                  <DetailRow icon={CalendarClock} label="Start Date" value={start} />
                  <DetailRow
                    icon={CalendarDays}
                    label="Estimated Completion"
                    value={estimated}
                  />
                  <DetailRow
                    icon={CalendarCheck}
                    label="Actual Completion"
                    value={actual}
                  />
                </dl>
              </section>
            )}
          </aside>
        </div>
      </div>
    </section>
  );
}
