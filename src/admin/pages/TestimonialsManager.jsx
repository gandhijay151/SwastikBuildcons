import { useCallback, useEffect, useState } from 'react';
import {
  Plus,
  Pencil,
  Trash2,
  Eye,
  EyeOff,
  Loader2,
  AlertTriangle,
  MessageSquareQuote,
  Star,
  X,
} from 'lucide-react';
import { get, post, put, patch, del, ApiError } from '../apiClient';

/**
 * Admin Testimonials manager (Req 5.3).
 *
 * Lists all testimonials from GET /api/admin/testimonials, supports create/edit
 * via an inline modal form (POST / PUT), publish toggle (PATCH .../publish), and
 * delete with confirmation (DELETE). Mirrors the ProjectsManager patterns.
 */

const EMPTY_FORM = {
  clientName: '',
  company: '',
  quote: '',
  rating: '',
  isPublished: false,
};

export default function TestimonialsManager() {
  const [testimonials, setTestimonials] = useState([]);
  const [state, setState] = useState('loading'); // 'loading' | 'error' | 'ready'
  const [errorMessage, setErrorMessage] = useState('');

  const [rowPending, setRowPending] = useState({});
  const [rowError, setRowError] = useState({});
  const [deleteTarget, setDeleteTarget] = useState(null);

  // Editor modal state: null = closed, otherwise the testimonial being edited
  // (or a sentinel { id: null } for a new one).
  const [editing, setEditing] = useState(null);

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

  const fetchTestimonials = useCallback(async () => {
    setState('loading');
    setErrorMessage('');
    try {
      const result = await get('/api/admin/testimonials');
      setTestimonials(Array.isArray(result) ? result : []);
    } catch (err) {
      setErrorMessage(err instanceof ApiError ? err.message : 'Something went wrong while loading testimonials.');
      setState('error');
      return;
    }
    setState('ready');
  }, []);

  useEffect(() => {
    fetchTestimonials();
  }, [fetchTestimonials]);

  const togglePublish = useCallback(
    async (item) => {
      const { id } = item;
      const nextPublished = !item.isPublished;
      setRowErrorFor(id, '');
      setPending(id, 'publishing');
      setTestimonials((prev) => prev.map((t) => (t.id === id ? { ...t, isPublished: nextPublished } : t)));
      try {
        const updated = await patch(`/api/admin/testimonials/${id}/publish`, { isPublished: nextPublished });
        if (updated && typeof updated === 'object' && 'isPublished' in updated) {
          setTestimonials((prev) =>
            prev.map((t) => (t.id === id ? { ...t, isPublished: Boolean(updated.isPublished) } : t)),
          );
        }
      } catch (err) {
        setTestimonials((prev) => prev.map((t) => (t.id === id ? { ...t, isPublished: item.isPublished } : t)));
        setRowErrorFor(id, err instanceof ApiError ? err.message : 'Could not update publish status.');
      } finally {
        setPending(id, null);
      }
    },
    [setPending, setRowErrorFor],
  );

  const confirmDelete = useCallback(async () => {
    if (!deleteTarget) return;
    const { id } = deleteTarget;
    setRowErrorFor(id, '');
    setPending(id, 'deleting');
    try {
      await del(`/api/admin/testimonials/${id}`);
      setTestimonials((prev) => prev.filter((t) => t.id !== id));
      setDeleteTarget(null);
    } catch (err) {
      setRowErrorFor(id, err instanceof ApiError ? err.message : 'Could not delete the testimonial.');
      setDeleteTarget(null);
    } finally {
      setPending(id, null);
    }
  }, [deleteTarget, setPending, setRowErrorFor]);

  const handleSaved = useCallback((saved, isNew) => {
    setTestimonials((prev) =>
      isNew ? [saved, ...prev] : prev.map((t) => (t.id === saved.id ? saved : t)),
    );
    setEditing(null);
  }, []);

  return (
    <div>
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h2 className="font-display text-2xl font-semibold text-ink">Testimonials</h2>
          <p className="mt-1 text-sm text-coal/60">
            Manage client testimonials shown on the public site.
          </p>
        </div>
        <button
          type="button"
          onClick={() => setEditing({ id: null })}
          className="inline-flex items-center gap-2 rounded-full bg-brass px-5 py-2.5 text-sm font-semibold text-white shadow-md shadow-brass/25 transition-all hover:bg-brass/90 focus:outline-none focus:ring-2 focus:ring-brass/40"
        >
          <Plus size={16} />
          New Testimonial
        </button>
      </div>

      {state === 'loading' && (
        <div className="mt-10 flex flex-col items-center justify-center py-16 text-coal/60">
          <Loader2 className="h-8 w-8 animate-spin text-brass" />
          <p className="mt-4 text-sm">Loading testimonials…</p>
        </div>
      )}

      {state === 'error' && (
        <div className="mt-10 mx-auto max-w-lg rounded-xl border border-red-200 bg-red-50 px-6 py-10 text-center">
          <AlertTriangle className="mx-auto h-8 w-8 text-red-500" />
          <p className="mt-4 font-semibold text-red-700">We couldn't load the testimonials.</p>
          <p className="mt-1 text-sm text-red-600/80">{errorMessage}</p>
          <button
            type="button"
            onClick={fetchTestimonials}
            className="mt-5 inline-flex items-center gap-2 rounded-full bg-brass px-6 py-2.5 text-sm font-semibold text-white shadow-md shadow-brass/25 transition-all hover:bg-brass/90 focus:outline-none focus:ring-2 focus:ring-brass/40"
          >
            Retry
          </button>
        </div>
      )}

      {state === 'ready' && testimonials.length === 0 && (
        <div className="mt-10 mx-auto max-w-lg rounded-xl border border-dashed border-coal/20 bg-white px-6 py-12 text-center">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-brass/10 text-brass">
            <MessageSquareQuote size={26} />
          </div>
          <p className="mt-5 font-display text-lg font-semibold text-ink">No testimonials yet</p>
          <p className="mt-2 text-sm leading-7 text-coal/60">
            Add your first client testimonial to build trust on the public site.
          </p>
          <button
            type="button"
            onClick={() => setEditing({ id: null })}
            className="mt-5 inline-flex items-center gap-2 rounded-full bg-brass px-6 py-2.5 text-sm font-semibold text-white shadow-md shadow-brass/25 transition-all hover:bg-brass/90 focus:outline-none focus:ring-2 focus:ring-brass/40"
          >
            <Plus size={16} />
            New Testimonial
          </button>
        </div>
      )}

      {state === 'ready' && testimonials.length > 0 && (
        <div className="mt-8 overflow-hidden rounded-xl border border-coal/10 bg-white shadow-crisp">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-coal/10 text-left text-sm">
              <caption className="sr-only">
                List of testimonials with client, company, quote, rating, and publish status.
              </caption>
              <thead className="bg-ivory/60">
                <tr>
                  <th scope="col" className="px-5 py-3 font-semibold text-coal/70">Client</th>
                  <th scope="col" className="px-5 py-3 font-semibold text-coal/70">Company</th>
                  <th scope="col" className="px-5 py-3 font-semibold text-coal/70">Quote</th>
                  <th scope="col" className="px-5 py-3 font-semibold text-coal/70">Rating</th>
                  <th scope="col" className="px-5 py-3 font-semibold text-coal/70">Publish</th>
                  <th scope="col" className="px-5 py-3 text-right font-semibold text-coal/70">
                    <span className="sr-only">Actions</span>
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-coal/8">
                {testimonials.map((item) => {
                  const published = Boolean(item.isPublished);
                  const pending = rowPending[item.id];
                  const isPublishing = pending === 'publishing';
                  const isDeleting = pending === 'deleting';
                  const actionError = rowError[item.id];
                  return (
                    <tr key={item.id} className="transition-colors hover:bg-ivory/50 align-top">
                      <th scope="row" className="px-5 py-3 font-medium text-ink">
                        {item.clientName || '—'}
                      </th>
                      <td className="px-5 py-3 text-coal/80">{item.company || '—'}</td>
                      <td className="px-5 py-3 text-coal/70 max-w-md">
                        <span className="line-clamp-2">{item.quote}</span>
                      </td>
                      <td className="px-5 py-3 text-coal/80">
                        {item.rating ? (
                          <span className="inline-flex items-center gap-1">
                            <Star size={13} className="fill-brass text-brass" />
                            {item.rating}
                          </span>
                        ) : (
                          '—'
                        )}
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
                          <button
                            type="button"
                            onClick={() => togglePublish(item)}
                            disabled={isPublishing || isDeleting}
                            title={published ? 'Unpublish' : 'Publish'}
                            aria-label={published ? `Unpublish testimonial from ${item.clientName}` : `Publish testimonial from ${item.clientName}`}
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
                          <button
                            type="button"
                            onClick={() => setEditing(item)}
                            aria-label={`Edit testimonial from ${item.clientName}`}
                            className="inline-flex items-center justify-center rounded-lg border border-coal/15 bg-white p-2 text-coal/70 shadow-sm transition-colors hover:border-brass/40 hover:text-brass focus:outline-none focus:ring-2 focus:ring-brass/20"
                          >
                            <Pencil size={15} />
                          </button>
                          <button
                            type="button"
                            onClick={() => setDeleteTarget(item)}
                            disabled={isPublishing || isDeleting}
                            title="Delete"
                            aria-label={`Delete testimonial from ${item.clientName}`}
                            className="inline-flex items-center justify-center rounded-lg border border-coal/15 bg-white p-2 text-coal/70 shadow-sm transition-colors hover:border-red-300 hover:text-red-600 focus:outline-none focus:ring-2 focus:ring-red-200 disabled:cursor-not-allowed disabled:opacity-50"
                          >
                            {isDeleting ? <Loader2 size={15} className="animate-spin" /> : <Trash2 size={15} />}
                          </button>
                        </div>
                        {actionError && (
                          <p className="mt-1 text-right text-[11px] font-medium text-red-600">{actionError}</p>
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

      {state === 'ready' && testimonials.length > 0 && (
        <p className="mt-6 text-xs text-coal/60">
          {testimonials.length} testimonial{testimonials.length === 1 ? '' : 's'} total
        </p>
      )}

      {editing && (
        <TestimonialEditor
          testimonial={editing.id ? editing : null}
          onCancel={() => setEditing(null)}
          onSaved={handleSaved}
        />
      )}

      {deleteTarget && (
        <DeleteConfirmDialog
          testimonial={deleteTarget}
          pending={rowPending[deleteTarget.id] === 'deleting'}
          onCancel={() => setDeleteTarget(null)}
          onConfirm={confirmDelete}
        />
      )}
    </div>
  );
}

/** Create/edit modal form. Handles both client and server validation (Req 5.3). */
function TestimonialEditor({ testimonial, onCancel, onSaved }) {
  const isNew = !testimonial;
  const [form, setForm] = useState(() =>
    testimonial
      ? {
          clientName: testimonial.clientName || '',
          company: testimonial.company || '',
          quote: testimonial.quote || '',
          rating: testimonial.rating ? String(testimonial.rating) : '',
          isPublished: Boolean(testimonial.isPublished),
        }
      : { ...EMPTY_FORM },
  );
  const [errors, setErrors] = useState({});
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState('');

  useEffect(() => {
    function onKeyDown(e) {
      if (e.key === 'Escape' && !saving) onCancel();
    }
    document.addEventListener('keydown', onKeyDown);
    return () => document.removeEventListener('keydown', onKeyDown);
  }, [onCancel, saving]);

  function update(field, value) {
    setForm((prev) => ({ ...prev, [field]: value }));
  }

  function validate() {
    const next = {};
    if (!form.clientName.trim()) next.clientName = 'Client name is required.';
    else if (form.clientName.trim().length > 120) next.clientName = 'Client name must be 120 characters or fewer.';
    if (form.company && form.company.length > 160) next.company = 'Company must be 160 characters or fewer.';
    if (!form.quote.trim()) next.quote = 'Quote is required.';
    else if (form.quote.trim().length > 1000) next.quote = 'Quote must be 1000 characters or fewer.';
    if (form.rating !== '') {
      const r = Number(form.rating);
      if (!Number.isInteger(r) || r < 1 || r > 5) next.rating = 'Rating must be a whole number from 1 to 5.';
    }
    setErrors(next);
    return Object.keys(next).length === 0;
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setFormError('');
    if (!validate()) return;

    const payload = {
      clientName: form.clientName.trim(),
      company: form.company.trim() ? form.company.trim() : null,
      quote: form.quote.trim(),
      rating: form.rating === '' ? null : Number(form.rating),
      projectId: null,
      isPublished: form.isPublished,
    };

    setSaving(true);
    try {
      const saved = isNew
        ? await post('/api/admin/testimonials', payload)
        : await put(`/api/admin/testimonials/${testimonial.id}`, payload);
      onSaved(saved, isNew);
    } catch (err) {
      if (err instanceof ApiError && err.body && typeof err.body === 'object' && err.body.errors) {
        // Map ASP.NET ValidationProblemDetails field errors back to fields.
        const mapped = {};
        for (const [key, messages] of Object.entries(err.body.errors)) {
          const field = key.charAt(0).toLowerCase() + key.slice(1);
          mapped[field] = Array.isArray(messages) ? messages[0] : String(messages);
        }
        setErrors((prev) => ({ ...prev, ...mapped }));
        setFormError('Please correct the highlighted fields.');
      } else {
        setFormError(err instanceof ApiError ? err.message : 'Could not save the testimonial.');
      }
    } finally {
      setSaving(false);
    }
  }

  const titleId = 'testimonial-editor-title';

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby={titleId}
    >
      <button
        type="button"
        aria-label="Close dialog"
        tabIndex={-1}
        onClick={() => !saving && onCancel()}
        className="absolute inset-0 h-full w-full cursor-default bg-coal/40"
      />
      <div className="relative w-full max-w-lg rounded-2xl bg-white p-6 shadow-xl">
        <div className="flex items-start justify-between">
          <h3 id={titleId} className="font-display text-lg font-semibold text-ink">
            {isNew ? 'New testimonial' : 'Edit testimonial'}
          </h3>
          <button
            type="button"
            onClick={() => !saving && onCancel()}
            aria-label="Close"
            className="rounded-lg p-1 text-coal/50 transition-colors hover:text-coal"
          >
            <X size={18} />
          </button>
        </div>

        {formError && (
          <p className="mt-3 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
            {formError}
          </p>
        )}

        <form className="mt-4 space-y-4" onSubmit={handleSubmit} noValidate>
          <div>
            <label htmlFor="clientName" className="mb-1 block text-sm font-semibold text-coal/80">
              Client name <span className="text-red-500">*</span>
            </label>
            <input
              id="clientName"
              type="text"
              value={form.clientName}
              onChange={(e) => update('clientName', e.target.value)}
              aria-invalid={Boolean(errors.clientName)}
              className="w-full rounded-lg border border-coal/15 px-3 py-2.5 text-sm text-ink shadow-sm focus:border-brass focus:outline-none focus:ring-2 focus:ring-brass/20"
            />
            {errors.clientName && <p className="mt-1 text-xs text-red-600">{errors.clientName}</p>}
          </div>

          <div>
            <label htmlFor="company" className="mb-1 block text-sm font-semibold text-coal/80">
              Company
            </label>
            <input
              id="company"
              type="text"
              value={form.company}
              onChange={(e) => update('company', e.target.value)}
              aria-invalid={Boolean(errors.company)}
              className="w-full rounded-lg border border-coal/15 px-3 py-2.5 text-sm text-ink shadow-sm focus:border-brass focus:outline-none focus:ring-2 focus:ring-brass/20"
            />
            {errors.company && <p className="mt-1 text-xs text-red-600">{errors.company}</p>}
          </div>

          <div>
            <label htmlFor="quote" className="mb-1 block text-sm font-semibold text-coal/80">
              Quote <span className="text-red-500">*</span>
            </label>
            <textarea
              id="quote"
              rows={4}
              value={form.quote}
              onChange={(e) => update('quote', e.target.value)}
              aria-invalid={Boolean(errors.quote)}
              className="w-full rounded-lg border border-coal/15 px-3 py-2.5 text-sm text-ink shadow-sm focus:border-brass focus:outline-none focus:ring-2 focus:ring-brass/20"
            />
            {errors.quote && <p className="mt-1 text-xs text-red-600">{errors.quote}</p>}
          </div>

          <div>
            <label htmlFor="rating" className="mb-1 block text-sm font-semibold text-coal/80">
              Rating (1–5, optional)
            </label>
            <input
              id="rating"
              type="number"
              min={1}
              max={5}
              value={form.rating}
              onChange={(e) => update('rating', e.target.value)}
              aria-invalid={Boolean(errors.rating)}
              className="w-28 rounded-lg border border-coal/15 px-3 py-2.5 text-sm text-ink shadow-sm focus:border-brass focus:outline-none focus:ring-2 focus:ring-brass/20"
            />
            {errors.rating && <p className="mt-1 text-xs text-red-600">{errors.rating}</p>}
          </div>

          <label className="flex items-center gap-2 text-sm text-coal/80">
            <input
              type="checkbox"
              checked={form.isPublished}
              onChange={(e) => update('isPublished', e.target.checked)}
              className="h-4 w-4 rounded border-coal/30 text-brass focus:ring-brass/30"
            />
            Published (visible on the public site)
          </label>

          <div className="mt-6 flex justify-end gap-3">
            <button
              type="button"
              onClick={() => !saving && onCancel()}
              disabled={saving}
              className="inline-flex items-center gap-2 rounded-full border border-coal/15 bg-white px-5 py-2.5 text-sm font-semibold text-coal/70 transition-colors hover:bg-ivory/60 focus:outline-none focus:ring-2 focus:ring-brass/20 disabled:cursor-not-allowed disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={saving}
              className="inline-flex items-center gap-2 rounded-full bg-brass px-5 py-2.5 text-sm font-semibold text-white shadow-md shadow-brass/25 transition-colors hover:bg-brass/90 focus:outline-none focus:ring-2 focus:ring-brass/40 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {saving ? (
                <>
                  <Loader2 size={15} className="animate-spin" />
                  Saving…
                </>
              ) : (
                'Save testimonial'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

/** Delete confirmation dialog (Req 5.3). */
function DeleteConfirmDialog({ testimonial, pending, onCancel, onConfirm }) {
  const titleId = 'delete-testimonial-title';
  const descId = 'delete-testimonial-desc';

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
      <button
        type="button"
        aria-label="Close dialog"
        tabIndex={-1}
        onClick={() => !pending && onCancel()}
        className="absolute inset-0 h-full w-full cursor-default bg-coal/40"
      />
      <div className="relative w-full max-w-md rounded-2xl bg-white p-6 shadow-xl">
        <div className="flex items-start gap-3">
          <div className="flex h-10 w-10 flex-none items-center justify-center rounded-full bg-red-100 text-red-600">
            <AlertTriangle size={20} />
          </div>
          <div>
            <h3 id={titleId} className="font-display text-lg font-semibold text-ink">
              Delete this testimonial?
            </h3>
            <p id={descId} className="mt-1 text-sm leading-6 text-coal/70">
              This permanently removes the testimonial from{' '}
              <span className="font-semibold text-ink">{testimonial.clientName || 'this client'}</span>. This action
              cannot be undone.
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
                Delete testimonial
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
