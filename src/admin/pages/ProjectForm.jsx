import { useCallback, useEffect, useMemo, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import {
  ArrowLeft,
  Loader2,
  AlertTriangle,
  SearchX,
  Save,
  Plus,
} from 'lucide-react';
import { get, post, put, ApiError } from '../apiClient';

/**
 * Admin Projects create/edit form (Requirements 4.2, 4.3, 4.4).
 *
 * A single component that serves BOTH create and edit modes, detected via the
 * route param `:id` (present → edit). It renders controls for every field in
 * the backend's CreateIndustrialProjectRequest and performs:
 *
 *   - Client-side validation (Req 4.3): required fields, string-length caps
 *     matching the backend annotations, numeric/range checks. Inline field
 *     errors are shown and submit is blocked while invalid.
 *   - Submit (Req 4.2, 4.4): POST to create, PUT to update, then navigate back
 *     to the projects list on success.
 *   - Server-side validation display (Req 4.3): a 400 with a ValidationProblem
 *     `errors` map has its PascalCase field errors mapped (case-insensitively)
 *     back onto the matching form fields, plus a summary at the top. Other
 *     failures surface a general error banner.
 *
 * Design language mirrors the other admin screens: the ink/coal/brass/paper/
 * ivory palette, shadow-crisp cards, rounded controls, and accessible
 * label/input pairing with aria-invalid + aria-describedby on errored fields.
 */

// Status options (backend accepts any string <=50; these mirror the list view's
// known tokens). Kept union-safe on prefill so an unusual value is never lost.
const DEFAULT_STATUS_OPTIONS = ['Planning', 'In Progress', 'On Hold', 'Completed', 'Cancelled'];

// Field length caps matching the backend validation attributes.
const MAX = {
  projectName: 120,
  clientName: 120,
  location: 200,
  projectType: 100,
  status: 50,
  description: 500,
  scopeOfWork: 1000,
  projectManager: 200,
};

// The empty form shape (create mode defaults). All values are strings so the
// inputs stay controlled; numbers are converted at submit time.
const EMPTY_FORM = {
  projectName: '',
  clientName: '',
  location: '',
  startDate: '',
  estimatedCompletionDate: '',
  projectType: '',
  budgetAmount: '',
  actualCostToDate: '',
  status: 'Planning',
  progressPercentage: '0',
  description: '',
  scopeOfWork: '',
  projectManager: '',
};

/** Slice an ISO date/datetime string down to YYYY-MM-DD for <input type="date">. */
function toDateInput(value) {
  if (!value) return '';
  // Values come back as e.g. "2024-01-15T00:00:00" or "2024-01-15"; take the date part.
  const str = String(value);
  const match = str.match(/^\d{4}-\d{2}-\d{2}/);
  if (match) return match[0];
  const date = new Date(str);
  if (Number.isNaN(date.getTime())) return '';
  return date.toISOString().slice(0, 10);
}

/** Client-side validation. Returns a { field: message } map (empty when valid). */
function validate(form) {
  const errors = {};

  // Required text fields + length caps.
  const requiredText = [
    ['projectName', 'Project name'],
    ['clientName', 'Client name'],
    ['location', 'Location'],
    ['projectType', 'Project type'],
    ['status', 'Status'],
  ];
  for (const [key, label] of requiredText) {
    const value = form[key].trim();
    if (!value) {
      errors[key] = `${label} is required.`;
    } else if (value.length > MAX[key]) {
      errors[key] = `${label} must be ${MAX[key]} characters or fewer.`;
    }
  }

  // Optional text fields — length caps only.
  const optionalText = [
    ['description', 'Description'],
    ['scopeOfWork', 'Scope of work'],
    ['projectManager', 'Project manager'],
  ];
  for (const [key, label] of optionalText) {
    if (form[key] && form[key].length > MAX[key]) {
      errors[key] = `${label} must be ${MAX[key]} characters or fewer.`;
    }
  }

  // Required dates.
  if (!form.startDate) errors.startDate = 'Start date is required.';
  if (!form.estimatedCompletionDate) {
    errors.estimatedCompletionDate = 'Estimated completion date is required.';
  }

  // Numeric money fields — required, numeric, >= 0.
  const money = [
    ['budgetAmount', 'Budget amount'],
    ['actualCostToDate', 'Actual cost to date'],
  ];
  for (const [key, label] of money) {
    const raw = form[key];
    if (raw === '' || raw == null) {
      errors[key] = `${label} is required.`;
    } else {
      const num = Number(raw);
      if (!Number.isFinite(num)) errors[key] = `${label} must be a number.`;
      else if (num < 0) errors[key] = `${label} cannot be negative.`;
    }
  }

  // Progress — required integer 0..100.
  const rawProgress = form.progressPercentage;
  if (rawProgress === '' || rawProgress == null) {
    errors.progressPercentage = 'Progress percentage is required.';
  } else {
    const num = Number(rawProgress);
    if (!Number.isInteger(num)) errors.progressPercentage = 'Progress must be a whole number.';
    else if (num < 0 || num > 100) errors.progressPercentage = 'Progress must be between 0 and 100.';
  }

  return errors;
}

/** Build the CreateIndustrialProjectRequest payload from the form state. */
function toPayload(form) {
  return {
    projectName: form.projectName.trim(),
    clientName: form.clientName.trim(),
    location: form.location.trim(),
    startDate: form.startDate,
    estimatedCompletionDate: form.estimatedCompletionDate,
    projectType: form.projectType.trim(),
    budgetAmount: Number(form.budgetAmount),
    actualCostToDate: Number(form.actualCostToDate),
    status: form.status.trim(),
    progressPercentage: Number(form.progressPercentage),
    description: form.description.trim() || null,
    scopeOfWork: form.scopeOfWork.trim() || null,
    projectManager: form.projectManager.trim() || null,
  };
}

/**
 * Map a server ValidationProblemDetails `errors` object (PascalCase keys) onto
 * our camelCase form field names, case-insensitively. Unmatched keys are
 * dropped from the field map (still shown in the summary).
 */
function mapServerErrors(serverErrors) {
  const fieldNames = Object.keys(EMPTY_FORM);
  const lookup = new Map(fieldNames.map((name) => [name.toLowerCase(), name]));
  const mapped = {};
  for (const [key, messages] of Object.entries(serverErrors || {})) {
    const field = lookup.get(String(key).toLowerCase());
    if (!field) continue;
    const message = Array.isArray(messages) ? messages.filter(Boolean).join(' ') : String(messages);
    if (message) mapped[field] = message;
  }
  return mapped;
}

const BackLink = () => (
  <Link
    to="/admin/projects"
    className="inline-flex items-center gap-1.5 text-sm font-medium text-coal/70 transition-colors hover:text-brass focus:outline-none focus:ring-2 focus:ring-brass/20 rounded"
  >
    <ArrowLeft size={16} />
    Back to Projects
  </Link>
);

/** Shared input class; adds the errored ring when `invalid`. */
function fieldClass(invalid) {
  return [
    'w-full rounded-lg border bg-white px-4 py-2.5 text-sm text-ink shadow-sm transition-colors',
    'focus:outline-none focus:ring-2 disabled:opacity-60',
    invalid
      ? 'border-red-300 focus:border-red-400 focus:ring-red-200'
      : 'border-coal/15 focus:border-brass focus:ring-brass/20',
  ].join(' ');
}

/** A labelled field wrapper handling the label/error/aria wiring. */
function Field({ id, label, required, error, hint, children }) {
  const errorId = `${id}-error`;
  const hintId = hint ? `${id}-hint` : undefined;
  return (
    <div>
      <label htmlFor={id} className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-coal/60">
        {label}
        {required && <span className="ml-1 text-brass" aria-hidden="true">*</span>}
      </label>
      {children}
      {hint && (
        <p id={hintId} className="mt-1 text-xs text-coal/50">
          {hint}
        </p>
      )}
      {error && (
        <p id={errorId} className="mt-1 text-xs font-medium text-red-600" role="alert">
          {error}
        </p>
      )}
    </div>
  );
}

export default function ProjectForm() {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEdit = Boolean(id);

  const [form, setForm] = useState(EMPTY_FORM);
  // Load state only matters in edit mode: 'loading' | 'notfound' | 'error' | 'ready'.
  const [loadState, setLoadState] = useState(isEdit ? 'loading' : 'ready');
  const [loadError, setLoadError] = useState('');

  const [fieldErrors, setFieldErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState('');
  // Server-returned summary of validation messages, shown at the top of the form.
  const [serverSummary, setServerSummary] = useState([]);

  const fetchProject = useCallback(async () => {
    if (!isEdit) return;
    setLoadState('loading');
    setLoadError('');
    try {
      const result = await get(`/api/admin/industrial-projects/${id}`);
      if (!result) {
        setLoadState('notfound');
        return;
      }
      setForm({
        projectName: result.projectName ?? '',
        clientName: result.clientName ?? '',
        location: result.location ?? '',
        startDate: toDateInput(result.startDate),
        estimatedCompletionDate: toDateInput(result.estimatedCompletionDate),
        projectType: result.projectType ?? '',
        budgetAmount: result.budgetAmount != null ? String(result.budgetAmount) : '',
        actualCostToDate: result.actualCostToDate != null ? String(result.actualCostToDate) : '',
        status: result.status ?? 'Planning',
        progressPercentage:
          result.progressPercentage != null ? String(result.progressPercentage) : '0',
        description: result.description ?? '',
        scopeOfWork: result.scopeOfWork ?? '',
        projectManager: result.projectManager ?? '',
      });
      setLoadState('ready');
    } catch (err) {
      if (err instanceof ApiError && err.status === 404) {
        setLoadState('notfound');
        return;
      }
      const message =
        err instanceof ApiError
          ? err.message
          : 'Something went wrong while loading this project.';
      setLoadError(message);
      setLoadState('error');
    }
  }, [id, isEdit]);

  useEffect(() => {
    fetchProject();
  }, [fetchProject]);

  // Keep the status <select> union-safe: never drop a prefilled custom value.
  const statusOptions = useMemo(() => {
    const current = form.status ? [form.status] : [];
    return [...new Set([...DEFAULT_STATUS_OPTIONS, ...current])];
  }, [form.status]);

  const setField = (key) => (event) => {
    const { value } = event.target;
    setForm((prev) => ({ ...prev, [key]: value }));
    // Clear the field's error as the user edits it.
    setFieldErrors((prev) => {
      if (!prev[key]) return prev;
      const next = { ...prev };
      delete next[key];
      return next;
    });
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (submitting) return;

    setSubmitError('');
    setServerSummary([]);

    // Client-side validation (Req 4.3): block submit while invalid.
    const errors = validate(form);
    if (Object.keys(errors).length > 0) {
      setFieldErrors(errors);
      return;
    }
    setFieldErrors({});

    setSubmitting(true);
    try {
      const payload = toPayload(form);
      if (isEdit) {
        await put(`/api/admin/industrial-projects/${id}`, payload);
      } else {
        await post('/api/admin/industrial-projects', payload);
      }
      // Success (Req 4.2, 4.4): back to the list.
      navigate('/admin/projects');
    } catch (err) {
      if (err instanceof ApiError && err.status === 400 && err.body?.errors) {
        // Server-side validation (Req 4.3): map onto fields + summary.
        const mapped = mapServerErrors(err.body.errors);
        setFieldErrors(mapped);
        const summary = Object.values(err.body.errors)
          .flat()
          .filter(Boolean);
        setServerSummary(summary);
        setSubmitError('Please correct the highlighted fields and try again.');
      } else if (err instanceof ApiError && err.status === 404) {
        setSubmitError('This project no longer exists. It may have been deleted.');
      } else {
        const message =
          err instanceof ApiError
            ? err.message
            : 'Something went wrong while saving. Please try again.';
        setSubmitError(message);
      }
    } finally {
      setSubmitting(false);
    }
  };

  const describedBy = (key, hasHint) => {
    const ids = [];
    if (hasHint) ids.push(`${key}-hint`);
    if (fieldErrors[key]) ids.push(`${key}-error`);
    return ids.length ? ids.join(' ') : undefined;
  };

  // ---- Loading / not-found / error states (edit mode) --------------------

  if (loadState === 'loading') {
    return (
      <div>
        <div className="mb-6">
          <BackLink />
        </div>
        <div className="flex flex-col items-center justify-center py-16 text-coal/60">
          <Loader2 className="h-8 w-8 animate-spin text-brass" />
          <p className="mt-4 text-sm">Loading project…</p>
        </div>
      </div>
    );
  }

  if (loadState === 'notfound') {
    return (
      <div>
        <div className="mb-6">
          <BackLink />
        </div>
        <div className="mx-auto max-w-lg rounded-xl border border-dashed border-coal/20 bg-white px-6 py-12 text-center">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-coal/8 text-coal/50">
            <SearchX size={26} />
          </div>
          <p className="mt-5 font-display text-lg font-semibold text-ink">Project not found</p>
          <p className="mt-2 text-sm leading-7 text-coal/60">
            This project may have been removed or the link is incorrect.
          </p>
          <Link
            to="/admin/projects"
            className="mt-5 inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-brass hover:underline"
          >
            <ArrowLeft size={14} />
            Back to Projects
          </Link>
        </div>
      </div>
    );
  }

  if (loadState === 'error') {
    return (
      <div>
        <div className="mb-6">
          <BackLink />
        </div>
        <div className="mx-auto max-w-lg rounded-xl border border-red-200 bg-red-50 px-6 py-10 text-center">
          <AlertTriangle className="mx-auto h-8 w-8 text-red-500" />
          <p className="mt-4 font-semibold text-red-700">We couldn't load this project.</p>
          <p className="mt-1 text-sm text-red-600/80">{loadError}</p>
          <button
            type="button"
            onClick={fetchProject}
            className="mt-5 inline-flex items-center gap-2 rounded-full bg-brass px-6 py-2.5 text-sm font-semibold text-white shadow-md shadow-brass/25 transition-all hover:bg-brass/90 focus:outline-none focus:ring-2 focus:ring-brass/40"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  // ---- Form (create + edit) ----------------------------------------------

  return (
    <div>
      <div className="mb-6">
        <BackLink />
      </div>

      <div className="mb-6">
        <h2 className="font-display text-2xl font-semibold text-ink">
          {isEdit ? 'Edit Project' : 'New Project'}
        </h2>
        <p className="mt-1 text-sm text-coal/60">
          {isEdit
            ? 'Update the details for this industrial project.'
            : 'Add a new industrial project to the portfolio.'}
        </p>
      </div>

      {/* Top-level error banner + server validation summary. */}
      {(submitError || serverSummary.length > 0) && (
        <div
          className="mb-6 rounded-xl border border-red-200 bg-red-50 px-5 py-4"
          role="alert"
        >
          <div className="flex items-start gap-2">
            <AlertTriangle className="mt-0.5 h-5 w-5 shrink-0 text-red-500" />
            <div>
              <p className="font-semibold text-red-700">
                {submitError || 'Please correct the following:'}
              </p>
              {serverSummary.length > 0 && (
                <ul className="mt-2 list-disc space-y-1 pl-5 text-sm text-red-600/90">
                  {serverSummary.map((message, index) => (
                    <li key={`${message}-${index}`}>{message}</li>
                  ))}
                </ul>
              )}
            </div>
          </div>
        </div>
      )}

      <form onSubmit={handleSubmit} noValidate className="max-w-3xl">
        <div className="rounded-xl border border-coal/10 bg-white p-6 shadow-crisp">
          <div className="grid gap-5 sm:grid-cols-2">
            <Field id="projectName" label="Project Name" required error={fieldErrors.projectName}>
              <input
                id="projectName"
                type="text"
                maxLength={MAX.projectName}
                value={form.projectName}
                onChange={setField('projectName')}
                disabled={submitting}
                aria-invalid={fieldErrors.projectName ? 'true' : undefined}
                aria-describedby={describedBy('projectName')}
                className={fieldClass(Boolean(fieldErrors.projectName))}
              />
            </Field>

            <Field id="clientName" label="Client Name" required error={fieldErrors.clientName}>
              <input
                id="clientName"
                type="text"
                maxLength={MAX.clientName}
                value={form.clientName}
                onChange={setField('clientName')}
                disabled={submitting}
                aria-invalid={fieldErrors.clientName ? 'true' : undefined}
                aria-describedby={describedBy('clientName')}
                className={fieldClass(Boolean(fieldErrors.clientName))}
              />
            </Field>

            <Field id="location" label="Location" required error={fieldErrors.location}>
              <input
                id="location"
                type="text"
                maxLength={MAX.location}
                value={form.location}
                onChange={setField('location')}
                disabled={submitting}
                aria-invalid={fieldErrors.location ? 'true' : undefined}
                aria-describedby={describedBy('location')}
                className={fieldClass(Boolean(fieldErrors.location))}
              />
            </Field>

            <Field id="projectType" label="Project Type" required error={fieldErrors.projectType}>
              <input
                id="projectType"
                type="text"
                maxLength={MAX.projectType}
                value={form.projectType}
                onChange={setField('projectType')}
                disabled={submitting}
                aria-invalid={fieldErrors.projectType ? 'true' : undefined}
                aria-describedby={describedBy('projectType')}
                className={fieldClass(Boolean(fieldErrors.projectType))}
              />
            </Field>

            <Field id="startDate" label="Start Date" required error={fieldErrors.startDate}>
              <input
                id="startDate"
                type="date"
                value={form.startDate}
                onChange={setField('startDate')}
                disabled={submitting}
                aria-invalid={fieldErrors.startDate ? 'true' : undefined}
                aria-describedby={describedBy('startDate')}
                className={fieldClass(Boolean(fieldErrors.startDate))}
              />
            </Field>

            <Field
              id="estimatedCompletionDate"
              label="Estimated Completion"
              required
              error={fieldErrors.estimatedCompletionDate}
            >
              <input
                id="estimatedCompletionDate"
                type="date"
                value={form.estimatedCompletionDate}
                onChange={setField('estimatedCompletionDate')}
                disabled={submitting}
                aria-invalid={fieldErrors.estimatedCompletionDate ? 'true' : undefined}
                aria-describedby={describedBy('estimatedCompletionDate')}
                className={fieldClass(Boolean(fieldErrors.estimatedCompletionDate))}
              />
            </Field>

            <Field
              id="budgetAmount"
              label="Budget Amount"
              required
              error={fieldErrors.budgetAmount}
            >
              <input
                id="budgetAmount"
                type="number"
                min="0"
                step="any"
                value={form.budgetAmount}
                onChange={setField('budgetAmount')}
                disabled={submitting}
                aria-invalid={fieldErrors.budgetAmount ? 'true' : undefined}
                aria-describedby={describedBy('budgetAmount')}
                className={fieldClass(Boolean(fieldErrors.budgetAmount))}
              />
            </Field>

            <Field
              id="actualCostToDate"
              label="Actual Cost To Date"
              required
              error={fieldErrors.actualCostToDate}
            >
              <input
                id="actualCostToDate"
                type="number"
                min="0"
                step="any"
                value={form.actualCostToDate}
                onChange={setField('actualCostToDate')}
                disabled={submitting}
                aria-invalid={fieldErrors.actualCostToDate ? 'true' : undefined}
                aria-describedby={describedBy('actualCostToDate')}
                className={fieldClass(Boolean(fieldErrors.actualCostToDate))}
              />
            </Field>

            <Field id="status" label="Status" required error={fieldErrors.status}>
              <select
                id="status"
                value={form.status}
                onChange={setField('status')}
                disabled={submitting}
                aria-invalid={fieldErrors.status ? 'true' : undefined}
                aria-describedby={describedBy('status')}
                className={fieldClass(Boolean(fieldErrors.status))}
              >
                {statusOptions.map((option) => (
                  <option key={option} value={option}>
                    {option}
                  </option>
                ))}
              </select>
            </Field>

            <Field
              id="progressPercentage"
              label="Progress (%)"
              required
              error={fieldErrors.progressPercentage}
            >
              <input
                id="progressPercentage"
                type="number"
                min="0"
                max="100"
                step="1"
                value={form.progressPercentage}
                onChange={setField('progressPercentage')}
                disabled={submitting}
                aria-invalid={fieldErrors.progressPercentage ? 'true' : undefined}
                aria-describedby={describedBy('progressPercentage')}
                className={fieldClass(Boolean(fieldErrors.progressPercentage))}
              />
            </Field>

            <div className="sm:col-span-2">
              <Field
                id="projectManager"
                label="Project Manager"
                error={fieldErrors.projectManager}
                hint="Optional."
              >
                <input
                  id="projectManager"
                  type="text"
                  maxLength={MAX.projectManager}
                  value={form.projectManager}
                  onChange={setField('projectManager')}
                  disabled={submitting}
                  aria-invalid={fieldErrors.projectManager ? 'true' : undefined}
                  aria-describedby={describedBy('projectManager', true)}
                  className={fieldClass(Boolean(fieldErrors.projectManager))}
                />
              </Field>
            </div>

            <div className="sm:col-span-2">
              <Field
                id="description"
                label="Description"
                error={fieldErrors.description}
                hint={`Optional. ${form.description.length}/${MAX.description}`}
              >
                <textarea
                  id="description"
                  rows={3}
                  maxLength={MAX.description}
                  value={form.description}
                  onChange={setField('description')}
                  disabled={submitting}
                  aria-invalid={fieldErrors.description ? 'true' : undefined}
                  aria-describedby={describedBy('description', true)}
                  className={fieldClass(Boolean(fieldErrors.description))}
                />
              </Field>
            </div>

            <div className="sm:col-span-2">
              <Field
                id="scopeOfWork"
                label="Scope of Work"
                error={fieldErrors.scopeOfWork}
                hint={`Optional. ${form.scopeOfWork.length}/${MAX.scopeOfWork}`}
              >
                <textarea
                  id="scopeOfWork"
                  rows={4}
                  maxLength={MAX.scopeOfWork}
                  value={form.scopeOfWork}
                  onChange={setField('scopeOfWork')}
                  disabled={submitting}
                  aria-invalid={fieldErrors.scopeOfWork ? 'true' : undefined}
                  aria-describedby={describedBy('scopeOfWork', true)}
                  className={fieldClass(Boolean(fieldErrors.scopeOfWork))}
                />
              </Field>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="mt-6 flex items-center justify-end gap-3">
          <Link
            to="/admin/projects"
            className="inline-flex items-center gap-2 rounded-full border border-coal/15 bg-white px-6 py-2.5 text-sm font-semibold text-coal/70 shadow-sm transition-colors hover:border-coal/25 hover:text-ink focus:outline-none focus:ring-2 focus:ring-brass/20"
          >
            Cancel
          </Link>
          <button
            type="submit"
            disabled={submitting}
            className="inline-flex items-center gap-2 rounded-full bg-brass px-6 py-2.5 text-sm font-semibold text-white shadow-md shadow-brass/25 transition-all hover:bg-brass/90 disabled:cursor-not-allowed disabled:opacity-40 focus:outline-none focus:ring-2 focus:ring-brass/40"
          >
            {submitting ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Saving…
              </>
            ) : isEdit ? (
              <>
                <Save size={15} />
                Save Changes
              </>
            ) : (
              <>
                <Plus size={15} />
                Create Project
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
}
