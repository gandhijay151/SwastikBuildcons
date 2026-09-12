import { useCallback, useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Search,
  X,
  Loader2,
  AlertTriangle,
  Inbox,
  ArrowLeft,
  ArrowRight,
  ChevronRight,
  Download,
} from 'lucide-react';
import { get, adminFetchRaw, ApiError } from '../apiClient';

/**
 * Admin Leads dashboard (Requirements 3.1, 3.2, 3.5).
 *
 * Lists leads in an accessible table with Name, Phone, Project Type, Status
 * (colored badge), and Submission Date columns (Req 3.1). Provides a text
 * search (name/phone/type) and a status-filter dropdown (Req 3.2), plus
 * Prev/Next pagination driven by the backend's paged envelope
 * ({ items, total, page, pageSize }) (Req 3.5).
 *
 * Search/filter approach: the backend paginates but does not (yet) accept
 * text/status query params, so search and status filtering are applied
 * CLIENT-SIDE over the currently fetched page. Pagination continues to use the
 * server envelope. This keeps the scope limited to the existing endpoint (no
 * new backend filter params) while satisfying Req 3.2 for the visible page.
 */

const PAGE_SIZE = 20;

// A sensible baseline of lead statuses. The backend does not enforce an enum
// (default is "New"), so we union these defaults with whatever statuses appear
// in the fetched data — the dropdown never loses options the data contains.
const DEFAULT_STATUS_OPTIONS = ['New', 'Contacted', 'Qualified', 'Won', 'Lost'];

// Map a status token to a colored badge in the admin palette.
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

// AI priority tag colors (Hot/Warm/Cold). Falls back to a neutral dash when the
// lead has not been analyzed (AI disabled or analysis still pending/failed).
const PRIORITY_BADGE_STYLES = {
  hot: 'bg-red-100 text-red-700 border-red-200',
  warm: 'bg-amber-100 text-amber-700 border-amber-200',
  cold: 'bg-sky-100 text-sky-700 border-sky-200',
};

function priorityBadgeClass(priority) {
  const key = String(priority || '').toLowerCase().replace(/[^a-z]/g, '');
  return PRIORITY_BADGE_STYLES[key] || 'bg-coal/8 text-coal/50 border-coal/15';
}

// Format an ISO/DateTimeOffset string into a readable submission date.
function formatDate(value) {
  if (!value) return '—';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '—';
  return date.toLocaleDateString(undefined, {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
}

export default function LeadsDashboard() {
  const [leads, setLeads] = useState([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [state, setState] = useState('loading'); // 'loading' | 'error' | 'ready'
  const [errorMessage, setErrorMessage] = useState('');

  // Client-side filter controls (Req 3.2).
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('');

  // CSV export state (Req 3.6).
  const [exporting, setExporting] = useState(false);
  const [exportError, setExportError] = useState('');

  // Download all leads as a CSV file. Uses adminFetchRaw so the binary/text
  // response can be read as a blob and streamed to a browser download.
  const handleExport = useCallback(async () => {
    setExporting(true);
    setExportError('');
    try {
      const response = await adminFetchRaw('/api/admin/leads/export');
      const blob = await response.blob();

      // Derive a filename from the Content-Disposition header, falling back to
      // a dated default when the header is absent.
      const disposition = response.headers.get('content-disposition') || '';
      const match = disposition.match(/filename\*?=(?:UTF-8'')?"?([^";]+)"?/i);
      const filename =
        (match && decodeURIComponent(match[1])) ||
        `leads-export-${new Date().toISOString().slice(0, 10).replace(/-/g, '')}.csv`;

      const url = URL.createObjectURL(blob);
      const anchor = document.createElement('a');
      anchor.href = url;
      anchor.download = filename;
      document.body.appendChild(anchor);
      anchor.click();
      anchor.remove();
      URL.revokeObjectURL(url);
    } catch (err) {
      const message =
        err instanceof ApiError
          ? err.message
          : 'Something went wrong while exporting leads.';
      setExportError(message);
    } finally {
      setExporting(false);
    }
  }, []);

  const fetchLeads = useCallback(async (targetPage) => {
    setState('loading');
    setErrorMessage('');
    try {
      const result = await get(
        `/api/admin/leads?page=${targetPage}&pageSize=${PAGE_SIZE}`,
      );
      const items = Array.isArray(result?.items) ? result.items : [];
      setLeads(items);
      setTotal(Number.isFinite(result?.total) ? result.total : items.length);
    } catch (err) {
      // A 401 already redirected to login inside the API client; anything else
      // is surfaced as an inline error state.
      const message =
        err instanceof ApiError
          ? err.message
          : 'Something went wrong while loading leads.';
      setErrorMessage(message);
      setState('error');
      return;
    }
    setState('ready');
  }, []);

  useEffect(() => {
    fetchLeads(page);
  }, [fetchLeads, page]);

  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));

  // Status options: union of defaults + statuses seen on the current page.
  const statusOptions = useMemo(() => {
    const seen = leads.map((l) => l.status).filter(Boolean);
    return [...new Set([...DEFAULT_STATUS_OPTIONS, ...seen])];
  }, [leads]);

  // Client-side search + status filter over the current page (Req 3.2).
  const visibleLeads = useMemo(() => {
    const term = searchTerm.trim().toLowerCase();
    return leads.filter((lead) => {
      const matchesStatus = !statusFilter || lead.status === statusFilter;
      const matchesSearch =
        !term ||
        [lead.name, lead.phone, lead.projectType]
          .filter(Boolean)
          .some((field) => String(field).toLowerCase().includes(term));
      return matchesStatus && matchesSearch;
    });
  }, [leads, searchTerm, statusFilter]);

  const hasActiveFilters = Boolean(searchTerm.trim() || statusFilter);

  const clearFilters = () => {
    setSearchTerm('');
    setStatusFilter('');
  };

  return (
    <div>
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h2 className="font-display text-2xl font-semibold text-ink">Leads</h2>
          <p className="mt-1 text-sm text-coal/60">
            Inquiries submitted through the public contact form.
          </p>
        </div>

        {/* Export CSV (Req 3.6) */}
        <button
          type="button"
          onClick={handleExport}
          disabled={exporting}
          aria-label="Export all leads as a CSV file"
          className="inline-flex items-center gap-2 rounded-full bg-brass px-5 py-2.5 text-sm font-semibold text-white shadow-md shadow-brass/25 transition-all hover:bg-brass/90 disabled:cursor-not-allowed disabled:opacity-60 focus:outline-none focus:ring-2 focus:ring-brass/40"
        >
          {exporting ? (
            <Loader2 size={16} className="animate-spin" />
          ) : (
            <Download size={16} />
          )}
          {exporting ? 'Exporting…' : 'Export CSV'}
        </button>
      </div>

      {/* Export error (Req 3.6) */}
      {exportError && (
        <div
          role="alert"
          className="mt-4 flex items-center gap-2 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700"
        >
          <AlertTriangle size={16} className="shrink-0" />
          {exportError}
        </div>
      )}

      {/* Search + status filter (Req 3.2) */}
      <div className="mt-6 flex flex-wrap items-end gap-4">
        <label className="flex flex-1 flex-col text-left" style={{ minWidth: '220px' }}>
          <span className="mb-1.5 text-xs font-semibold uppercase tracking-wider text-coal/60">
            Search
          </span>
          <div className="relative">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-coal/40" />
            <input
              type="search"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Name, phone, or project type"
              aria-label="Search leads by name, phone, or project type"
              className="w-full rounded-lg border border-coal/15 bg-white py-2.5 pl-9 pr-3 text-sm text-ink shadow-sm transition-colors focus:border-brass focus:outline-none focus:ring-2 focus:ring-brass/20"
            />
          </div>
        </label>

        <label className="flex flex-col text-left">
          <span className="mb-1.5 text-xs font-semibold uppercase tracking-wider text-coal/60">
            Status
          </span>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            aria-label="Filter leads by status"
            className="min-w-[180px] rounded-lg border border-coal/15 bg-white px-4 py-2.5 text-sm text-ink shadow-sm transition-colors focus:border-brass focus:outline-none focus:ring-2 focus:ring-brass/20"
          >
            <option value="">All Statuses</option>
            {statusOptions.map((option) => (
              <option key={option} value={option}>
                {option}
              </option>
            ))}
          </select>
        </label>

        {hasActiveFilters && (
          <button
            type="button"
            onClick={clearFilters}
            className="inline-flex items-center gap-1.5 rounded-lg border border-coal/15 bg-white px-4 py-2.5 text-sm font-medium text-coal/70 shadow-sm transition-colors hover:border-brass/40 hover:text-brass focus:outline-none focus:ring-2 focus:ring-brass/20"
          >
            <X size={15} />
            Clear
          </button>
        )}
      </div>

      {/* Loading state */}
      {state === 'loading' && (
        <div className="mt-10 flex flex-col items-center justify-center py-16 text-coal/60">
          <Loader2 className="h-8 w-8 animate-spin text-brass" />
          <p className="mt-4 text-sm">Loading leads…</p>
        </div>
      )}

      {/* Error state */}
      {state === 'error' && (
        <div className="mt-10 mx-auto max-w-lg rounded-xl border border-red-200 bg-red-50 px-6 py-10 text-center">
          <AlertTriangle className="mx-auto h-8 w-8 text-red-500" />
          <p className="mt-4 font-semibold text-red-700">We couldn't load the leads.</p>
          <p className="mt-1 text-sm text-red-600/80">{errorMessage}</p>
          <button
            type="button"
            onClick={() => fetchLeads(page)}
            className="mt-5 inline-flex items-center gap-2 rounded-full bg-brass px-6 py-2.5 text-sm font-semibold text-white shadow-md shadow-brass/25 transition-all hover:bg-brass/90 focus:outline-none focus:ring-2 focus:ring-brass/40"
          >
            Retry
          </button>
        </div>
      )}

      {/* Empty state */}
      {state === 'ready' && visibleLeads.length === 0 && (
        <div className="mt-10 mx-auto max-w-lg rounded-xl border border-dashed border-coal/20 bg-white px-6 py-12 text-center">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-brass/10 text-brass">
            <Inbox size={26} />
          </div>
          <p className="mt-5 font-display text-lg font-semibold text-ink">
            {hasActiveFilters ? 'No leads match your filters' : 'No leads yet'}
          </p>
          <p className="mt-2 text-sm leading-7 text-coal/60">
            {hasActiveFilters
              ? 'Try adjusting or clearing the search and status filters.'
              : 'New inquiries from the contact form will appear here.'}
          </p>
          {hasActiveFilters && (
            <button
              type="button"
              onClick={clearFilters}
              className="mt-5 inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-brass hover:underline"
            >
              Clear filters
            </button>
          )}
        </div>
      )}

      {/* Leads table (Req 3.1) */}
      {state === 'ready' && visibleLeads.length > 0 && (
        <div className="mt-8 overflow-hidden rounded-xl border border-coal/10 bg-white shadow-crisp">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-coal/10 text-left text-sm">
              <caption className="sr-only">
                List of submitted leads with name, phone, project type, status,
                and submission date.
              </caption>
              <thead className="bg-ivory/60">
                <tr>
                  <th scope="col" className="px-5 py-3 font-semibold text-coal/70">
                    Name
                  </th>
                  <th scope="col" className="px-5 py-3 font-semibold text-coal/70">
                    Phone
                  </th>
                  <th scope="col" className="px-5 py-3 font-semibold text-coal/70">
                    Project Type
                  </th>
                  <th scope="col" className="px-5 py-3 font-semibold text-coal/70">
                    Status
                  </th>
                  <th scope="col" className="px-5 py-3 font-semibold text-coal/70">
                    AI Priority
                  </th>
                  <th scope="col" className="px-5 py-3 font-semibold text-coal/70">
                    Submitted
                  </th>
                  <th scope="col" className="px-5 py-3 text-right font-semibold text-coal/70">
                    <span className="sr-only">Actions</span>
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-coal/8">
                {visibleLeads.map((lead) => (
                  <tr key={lead.id} className="transition-colors hover:bg-ivory/50">
                    <th scope="row" className="px-5 py-3 font-medium text-ink">
                      {lead.name || '—'}
                    </th>
                    <td className="px-5 py-3 text-coal/80">
                      {lead.phone ? (
                        <a
                          href={`tel:${lead.phone}`}
                          className="hover:text-brass hover:underline"
                        >
                          {lead.phone}
                        </a>
                      ) : (
                        '—'
                      )}
                    </td>
                    <td className="px-5 py-3 text-coal/80">{lead.projectType || '—'}</td>
                    <td className="px-5 py-3">
                      <span
                        className={`inline-block rounded-full border px-3 py-1 text-[11px] font-semibold ${statusBadgeClass(
                          lead.status,
                        )}`}
                      >
                        {lead.status || 'Unknown'}
                      </span>
                    </td>
                    <td className="px-5 py-3">
                      <span
                        title={lead.aiSummary || undefined}
                        className={`inline-block rounded-full border px-3 py-1 text-[11px] font-semibold ${priorityBadgeClass(
                          lead.aiPriority,
                        )}`}
                      >
                        {lead.aiPriority || '—'}
                      </span>
                    </td>
                    <td className="px-5 py-3 text-coal/70">{formatDate(lead.createdAtUtc)}</td>
                    <td className="px-5 py-3 text-right">
                      <Link
                        to={`/admin/leads/${lead.id}`}
                        className="inline-flex items-center gap-1 text-xs font-bold uppercase tracking-wider text-brass hover:underline focus:outline-none focus:ring-2 focus:ring-brass/40"
                        aria-label={`View details for ${lead.name || 'lead'}`}
                      >
                        View
                        <ChevronRight size={14} />
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Pagination controls (Req 3.5) */}
      {state === 'ready' && total > 0 && (
        <div className="mt-6 flex flex-wrap items-center justify-between gap-3">
          <p className="text-xs text-coal/60">
            {hasActiveFilters
              ? `Showing ${visibleLeads.length} of ${leads.length} on this page`
              : `${total} lead${total === 1 ? '' : 's'} total`}
          </p>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page <= 1}
              className="inline-flex items-center gap-1.5 rounded-lg border border-coal/15 bg-white px-4 py-2 text-sm font-medium text-coal/80 shadow-sm transition-colors hover:border-brass/40 hover:text-brass disabled:cursor-not-allowed disabled:opacity-40 focus:outline-none focus:ring-2 focus:ring-brass/20"
            >
              <ArrowLeft size={15} />
              Prev
            </button>
            <span className="px-2 text-sm text-coal/70" aria-live="polite">
              Page {page} of {totalPages}
            </span>
            <button
              type="button"
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              disabled={page >= totalPages}
              className="inline-flex items-center gap-1.5 rounded-lg border border-coal/15 bg-white px-4 py-2 text-sm font-medium text-coal/80 shadow-sm transition-colors hover:border-brass/40 hover:text-brass disabled:cursor-not-allowed disabled:opacity-40 focus:outline-none focus:ring-2 focus:ring-brass/20"
            >
              Next
              <ArrowRight size={15} />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
