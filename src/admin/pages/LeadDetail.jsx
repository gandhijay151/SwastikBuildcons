import { useCallback, useEffect, useMemo, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import {
  ArrowLeft,
  Loader2,
  AlertTriangle,
  SearchX,
  Phone,
  Mail,
  Building2,
  IndianRupee,
  CalendarClock,
  CalendarDays,
  MessageSquare,
  CheckCircle2,
  Save,
  Sparkles,
} from 'lucide-react';
import { get, patch, ApiError } from '../apiClient';

/**
 * Admin Lead detail view + status-update control (Requirements 3.3, 3.4).
 *
 * Fetches a single lead by id (GET /api/admin/leads/{id}) and renders its full
 * details (Req 3.3). A status <select> + Save button PATCHes
 * /api/admin/leads/{id}/status; on success the displayed status is updated and
 * a confirmation is shown, and the persisted status is reflected in the view
 * (Req 3.4). On failure the prior status is kept and an error is surfaced.
 *
 * Design language mirrors LeadsDashboard: the ink/coal/brass/paper/ivory
 * palette, shadow-crisp cards, and the same status-badge/date helpers.
 */

// Baseline statuses (backend doesn't enforce an enum). Unioned with the lead's
// current status so the select never drops the value the record already holds.
const DEFAULT_STATUS_OPTIONS = ['New', 'Contacted', 'Qualified', 'Won', 'Lost'];

const STATUS_BADGE_STYLES = {
  new: 'bg-blue-100 text-blue-700 border-blue-200',
  contacted: 'bg-brass/15 text-brass border-brass/30',
  qualified: 'bg-violet-100 text-violet-700 border-violet-200',
  won: 'bg-green-100 text-green-700 border-green-200',
  lost: 'bg-red-100 text-red-700 border-red-200',
};

function statusBadgeClass(status) {
  const key = String(status || '').toLowerCase().replace(/[^a-z]/g, '');
  return STATUS_BADGE_STYLES[key] || 'bg-coal/8 text-coal/70 border-coal/15';
}

const PRIORITY_BADGE_STYLES = {
  hot: 'bg-red-100 text-red-700 border-red-200',
  warm: 'bg-amber-100 text-amber-700 border-amber-200',
  cold: 'bg-sky-100 text-sky-700 border-sky-200',
};

function priorityBadgeClass(priority) {
  const key = String(priority || '').toLowerCase().replace(/[^a-z]/g, '');
  return PRIORITY_BADGE_STYLES[key] || 'bg-coal/8 text-coal/50 border-coal/15';
}

function formatDateTime(value) {
  if (!value) return '—';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '—';
  return date.toLocaleString(undefined, {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  });
}

/** A single label/value row inside the details card. */
function DetailRow({ icon: Icon, label, children }) {
  return (
    <div className="flex gap-3 px-5 py-4">
      <Icon className="mt-0.5 h-4 w-4 shrink-0 text-coal/40" aria-hidden="true" />
      <div className="min-w-0">
        <dt className="text-xs font-semibold uppercase tracking-wider text-coal/50">
          {label}
        </dt>
        <dd className="mt-1 break-words text-sm text-ink">{children}</dd>
      </div>
    </div>
  );
}

const BackLink = () => (
  <Link
    to="/admin/leads"
    className="inline-flex items-center gap-1.5 text-sm font-medium text-coal/70 transition-colors hover:text-brass focus:outline-none focus:ring-2 focus:ring-brass/20 rounded"
  >
    <ArrowLeft size={16} />
    Back to Leads
  </Link>
);

export default function LeadDetail() {
  const { id } = useParams();

  const [lead, setLead] = useState(null);
  const [state, setState] = useState('loading'); // 'loading' | 'notfound' | 'error' | 'ready'
  const [errorMessage, setErrorMessage] = useState('');

  // Status-update control state.
  const [selectedStatus, setSelectedStatus] = useState('');
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState('');
  const [saveSuccess, setSaveSuccess] = useState(false);

  const fetchLead = useCallback(async () => {
    setState('loading');
    setErrorMessage('');
    try {
      const result = await get(`/api/admin/leads/${id}`);
      setLead(result);
      setSelectedStatus(result?.status || '');
      setState('ready');
    } catch (err) {
      if (err instanceof ApiError && err.status === 404) {
        setState('notfound');
        return;
      }
      const message =
        err instanceof ApiError
          ? err.message
          : 'Something went wrong while loading this lead.';
      setErrorMessage(message);
      setState('error');
    }
  }, [id]);

  useEffect(() => {
    fetchLead();
  }, [fetchLead]);

  const statusOptions = useMemo(() => {
    const current = lead?.status ? [lead.status] : [];
    return [...new Set([...DEFAULT_STATUS_OPTIONS, ...current])];
  }, [lead]);

  const isDirty = Boolean(lead) && selectedStatus !== lead.status;

  const handleSave = async () => {
    if (!isDirty || saving) return;
    setSaving(true);
    setSaveError('');
    setSaveSuccess(false);
    try {
      const updated = await patch(`/api/admin/leads/${id}/status`, {
        status: selectedStatus,
      });
      // Reflect the persisted status in the view (Req 3.4). Prefer the server's
      // returned record; fall back to the value we sent.
      const nextStatus = updated?.status ?? selectedStatus;
      setLead((prev) => (prev ? { ...prev, ...updated, status: nextStatus } : prev));
      setSelectedStatus(nextStatus);
      setSaveSuccess(true);
    } catch (err) {
      // Keep the prior status: reset the select back to the lead's value.
      setSelectedStatus(lead.status);
      const message =
        err instanceof ApiError
          ? err.message
          : 'Something went wrong while updating the status.';
      setSaveError(message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div>
      <div className="mb-6">
        <BackLink />
      </div>

      {/* Loading */}
      {state === 'loading' && (
        <div className="flex flex-col items-center justify-center py-16 text-coal/60">
          <Loader2 className="h-8 w-8 animate-spin text-brass" />
          <p className="mt-4 text-sm">Loading lead…</p>
        </div>
      )}

      {/* Not found (Req 3.3 — friendly message) */}
      {state === 'notfound' && (
        <div className="mx-auto max-w-lg rounded-xl border border-dashed border-coal/20 bg-white px-6 py-12 text-center">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-coal/8 text-coal/50">
            <SearchX size={26} />
          </div>
          <p className="mt-5 font-display text-lg font-semibold text-ink">
            Lead not found
          </p>
          <p className="mt-2 text-sm leading-7 text-coal/60">
            This lead may have been removed or the link is incorrect.
          </p>
          <Link
            to="/admin/leads"
            className="mt-5 inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-brass hover:underline"
          >
            <ArrowLeft size={14} />
            Back to Leads
          </Link>
        </div>
      )}

      {/* Error */}
      {state === 'error' && (
        <div className="mx-auto max-w-lg rounded-xl border border-red-200 bg-red-50 px-6 py-10 text-center">
          <AlertTriangle className="mx-auto h-8 w-8 text-red-500" />
          <p className="mt-4 font-semibold text-red-700">We couldn't load this lead.</p>
          <p className="mt-1 text-sm text-red-600/80">{errorMessage}</p>
          <button
            type="button"
            onClick={fetchLead}
            className="mt-5 inline-flex items-center gap-2 rounded-full bg-brass px-6 py-2.5 text-sm font-semibold text-white shadow-md shadow-brass/25 transition-all hover:bg-brass/90 focus:outline-none focus:ring-2 focus:ring-brass/40"
          >
            Retry
          </button>
        </div>
      )}

      {/* Ready (Req 3.3, 3.4) */}
      {state === 'ready' && lead && (
        <div className="grid gap-6 lg:grid-cols-[1fr_20rem]">
          {/* Full details (Req 3.3) */}
          <section className="overflow-hidden rounded-xl border border-coal/10 bg-white shadow-crisp">
            <header className="flex flex-wrap items-center justify-between gap-3 border-b border-coal/10 bg-ivory/60 px-5 py-4">
              <div>
                <h2 className="font-display text-xl font-semibold text-ink">
                  {lead.name || 'Lead'}
                </h2>
                <p className="mt-0.5 text-xs text-coal/50">Lead #{lead.id}</p>
              </div>
              <span
                className={`inline-block rounded-full border px-3 py-1 text-[11px] font-semibold ${statusBadgeClass(
                  lead.status,
                )}`}
              >
                {lead.status || 'Unknown'}
              </span>
            </header>

            {/* AI triage insight (summary + priority). Only shown once the lead
                has been analyzed; hidden when AI is disabled or not yet run. */}
            {(lead.aiSummary || lead.aiPriority) && (
              <div className="flex gap-3 border-b border-coal/10 bg-brass/5 px-5 py-4">
                <Sparkles className="mt-0.5 h-4 w-4 shrink-0 text-brass" aria-hidden="true" />
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-semibold uppercase tracking-wider text-coal/50">
                      AI Triage
                    </span>
                    {lead.aiPriority && (
                      <span
                        className={`inline-block rounded-full border px-2.5 py-0.5 text-[11px] font-semibold ${priorityBadgeClass(
                          lead.aiPriority,
                        )}`}
                      >
                        {lead.aiPriority}
                      </span>
                    )}
                  </div>
                  {lead.aiSummary && (
                    <p className="mt-1.5 text-sm leading-6 text-ink">{lead.aiSummary}</p>
                  )}
                </div>
              </div>
            )}

            <dl className="divide-y divide-coal/8">
              <DetailRow icon={Phone} label="Phone">
                {lead.phone ? (
                  <a
                    href={`tel:${lead.phone}`}
                    className="text-brass hover:underline"
                  >
                    {lead.phone}
                  </a>
                ) : (
                  '—'
                )}
              </DetailRow>

              <DetailRow icon={Mail} label="Email">
                {lead.email ? (
                  <a
                    href={`mailto:${lead.email}`}
                    className="text-brass hover:underline"
                  >
                    {lead.email}
                  </a>
                ) : (
                  '—'
                )}
              </DetailRow>

              <DetailRow icon={Building2} label="Project Type">
                {lead.projectType || '—'}
              </DetailRow>

              <DetailRow icon={IndianRupee} label="Budget">
                {lead.budget || '—'}
              </DetailRow>

              <DetailRow icon={CalendarClock} label="Timeline">
                {lead.timeline || '—'}
              </DetailRow>

              <DetailRow icon={MessageSquare} label="Message">
                {lead.message ? (
                  <span className="whitespace-pre-wrap leading-6">{lead.message}</span>
                ) : (
                  '—'
                )}
              </DetailRow>

              <DetailRow icon={CalendarDays} label="Submitted">
                {formatDateTime(lead.createdAtUtc)}
              </DetailRow>
            </dl>
          </section>

          {/* Status-update control (Req 3.4) */}
          <aside className="h-fit rounded-xl border border-coal/10 bg-white p-5 shadow-crisp">
            <h3 className="font-display text-base font-semibold text-ink">
              Update Status
            </h3>
            <p className="mt-1 text-xs leading-5 text-coal/60">
              Change the lead status and save to persist it.
            </p>

            <label htmlFor="lead-status" className="mt-4 block text-left">
              <span className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-coal/60">
                Status
              </span>
              <select
                id="lead-status"
                value={selectedStatus}
                onChange={(e) => {
                  setSelectedStatus(e.target.value);
                  setSaveError('');
                  setSaveSuccess(false);
                }}
                disabled={saving}
                className="w-full rounded-lg border border-coal/15 bg-white px-4 py-2.5 text-sm text-ink shadow-sm transition-colors focus:border-brass focus:outline-none focus:ring-2 focus:ring-brass/20 disabled:opacity-60"
              >
                {statusOptions.map((option) => (
                  <option key={option} value={option}>
                    {option}
                  </option>
                ))}
              </select>
            </label>

            <button
              type="button"
              onClick={handleSave}
              disabled={!isDirty || saving}
              className="mt-4 inline-flex w-full items-center justify-center gap-2 rounded-full bg-brass px-6 py-2.5 text-sm font-semibold text-white shadow-md shadow-brass/25 transition-all hover:bg-brass/90 disabled:cursor-not-allowed disabled:opacity-40 focus:outline-none focus:ring-2 focus:ring-brass/40"
            >
              {saving ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Saving…
                </>
              ) : (
                <>
                  <Save size={15} />
                  Save Status
                </>
              )}
            </button>

            {/* Success confirmation (Req 3.4) */}
            {saveSuccess && (
              <p
                className="mt-3 inline-flex items-center gap-1.5 text-sm font-medium text-green-700"
                role="status"
              >
                <CheckCircle2 size={16} />
                Status updated.
              </p>
            )}

            {/* Failure — prior status kept */}
            {saveError && (
              <p
                className="mt-3 inline-flex items-start gap-1.5 text-sm text-red-600"
                role="alert"
              >
                <AlertTriangle size={16} className="mt-0.5 shrink-0" />
                {saveError}
              </p>
            )}
          </aside>
        </div>
      )}
    </div>
  );
}
