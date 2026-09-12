import { Send, Paperclip, Calendar, MapPin, TrendingUp, Phone, Loader2, CheckCircle2, AlertCircle, X } from 'lucide-react';
import { useMemo, useState, useRef, useEffect, useCallback } from 'react';
import Button from './Button';
import Turnstile from './Turnstile';
import { getApiBaseUrl } from '../lib/api';

const initialValues = {
  name: '',
  phone: '',
  email: '',
  projectType: '',
  budget: '',
  timeline: '',
  message: '',
  website: '', // honeypot spam trap (Req 8.4) � must stay empty for real users
  // File uploads will be handled separately
};

const projectTypes = [
  { value: 'Residential Construction', label: 'Home/Villa/Apartment', icon: 'Home' },
  { value: 'Commercial Construction', label: 'Office/Retail/Showroom', icon: 'Building2' },
  { value: 'Industrial Sheds & Warehouses', label: 'Industrial Sheds, Warehouses & Storage', icon: 'Factory' },
  { value: 'Manufacturing Facilities', label: 'Manufacturing & Production Plants', icon: 'Monitor' },
  { value: 'Industrial Renovations', label: 'Industrial Space Renovations & Upgrades', icon: 'RefreshCw' },
  { value: 'Interior Design', label: 'Home/Office Interior', icon: 'Paintbrush' },
  { value: 'Renovation & Remodeling', label: 'Space Transformation', icon: 'RefreshCw' },
  { value: 'Turnkey Solution', label: 'End-to-End Delivery', icon: 'Settings' },
];

const budgetRanges = [
  { value: 'Below Rs. 10 Lakhs', label: 'Budget Friendly', max: 1000000 },
  { value: 'Rs. 10 - 25 Lakhs', label: 'Moderate Investment', max: 2500000 },
  { value: 'Rs. 25 - 50 Lakhs', label: 'Substantial Investment', max: 5000000 },
  { value: 'Rs. 50 Lakhs - 1 Crore', label: 'Premium Project', max: 10000000 },
  { value: 'Above Rs. 1 Crore', label: 'Luxury/VIP Project', max: Infinity },
];

export default function ContactForm() {
  const [values, setValues] = useState(initialValues);
  const [submitted, setSubmitted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [status, setStatus] = useState({ type: '', message: '' });
  const [uploadedFiles, setUploadedFiles] = useState([]);
  const [turnstileToken, setTurnstileToken] = useState('');
  const formRef = useRef(null);

  const handleTurnstileVerify = useCallback((token) => setTurnstileToken(token), []);

  // Auto-dismiss the toast after a few seconds so it behaves like a toast, not a
  // permanent banner (Req 8.2, 8.3).
  useEffect(() => {
    if (!status.message) return undefined;
    const timer = setTimeout(() => setStatus({ type: '', message: '' }), 6000);
    return () => clearTimeout(timer);
  }, [status]);

  const errors = useMemo(() => {
    const result = {};
    if (!values.name.trim()) result.name = 'Name is required';
    if (!/^[0-9+\-\s]{8,15}$/.test(values.phone.trim()))
      result.phone = 'Enter a valid phone number';
    if (
      values.email.trim() &&
      !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(values.email.trim())
    ) {
      result.email = 'Enter a valid email address';
    }
    if (!values.projectType) result.projectType = 'Select a project type';
    if (!values.budget) result.budget = 'Select a budget range';
    if (!values.timeline) result.timeline = 'When would you like to start?';
    return result;
  }, [values]);

  const handleChange = (event) => {
    const { name, value } = event.target;
    setValues((current) => ({ ...current, [name]: value }));
  };

  const handleFileChange = (event) => {
    const files = Array.from(event.target.files);
    // Validate files (size, type)
    const validFiles = files.filter(file =>
      file.size <= 5 * 1024 * 1024 && // 5MB max per file
      (file.type.startsWith('image/') ||
       file.type === 'application/pdf' ||
       file.type.startsWith('video/'))
    );

    if (validFiles.length !== files.length) {
      setStatus({
        type: 'error',
        message: 'Some files were invalid. Please upload only images, PDFs, or videos (max 5MB each).'
      });
    }

    setUploadedFiles(prev => [...prev, ...validFiles.map(f => ({
      name: f.name,
      size: f.size,
      type: f.type,
      preview: URL.createObjectURL(f)
    }))]);

    // Reset file input
    event.target.value = '';
  };

  const removeFile = (index) => {
    setUploadedFiles(prev => {
      const newFiles = [...prev];
      URL.revokeObjectURL(newFiles[index].preview);
      newFiles.splice(index, 1);
      return newFiles;
    });
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setSubmitted(true);
    setStatus({ type: '', message: '' });

    // Validate files
    if (uploadedFiles.some(f => f.size > 5 * 1024 * 1024)) {
      setStatus({
        type: 'error',
        message: 'Files must be smaller than 5MB each.'
      });
      return;
    }

    if (Object.keys(errors).length === 0) {
      const apiBaseUrl = getApiBaseUrl();
      setIsSubmitting(true);

      try {
        // In a real implementation, we would upload files first and then submit lead with file references
        // For now, we'll submit the lead data and mention file uploads in the message
        const enhancedMessage = `
${values.message || ''}

${uploadedFiles.length > 0 ? `Attachments: ${uploadedFiles.map(f => f.name).join(', ')}` : ''}
Timeline: ${values.timeline}
        `.trim();

        const leadData = {
          ...values,
          message: enhancedMessage,
          turnstileToken,
        };

        const response = await fetch(`${apiBaseUrl}/api/leads`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(leadData),
        });

        if (!response.ok) throw new Error('Submission failed');

        // Clean up file previews
        uploadedFiles.forEach(f => URL.revokeObjectURL(f.preview));
        setUploadedFiles([]);

        setValues(initialValues);
        setSubmitted(false);
        setStatus({
          type: 'success',
          message: 'Thank you! Your inquiry has been submitted. Our team will review your details and connect within 24 hours. If you uploaded files, we\'ll review those too.',
        });
      } catch (err) {
        console.error('Submission error:', err);
        // Fallback: offer WhatsApp with enhanced message
        const msg = encodeURIComponent(`Hi Swastik Buildcons,

New Project Inquiry:
Name: ${values.name}
Phone: ${values.phone}
Email: ${values.email || 'Not provided'}
Project Type: ${values.projectType}
Budget: ${values.budget}
Timeline: ${values.timeline}
Message: ${values.message || 'No additional details'}
${uploadedFiles.length > 0 ? `Attachments: ${uploadedFiles.map(f => f.name).join(', ')}` : ''}

Please review and respond at your earliest convenience.`);

        window.open(`https://wa.me/918511003888?text=${msg}`, '_blank');
        setValues(initialValues);
        setSubmitted(false);
        setStatus({
          type: 'success',
          message: 'Redirected to WhatsApp for immediate contact. Your inquiry details are ready to send.',
        });
      } finally {
        setIsSubmitting(false);
      }
    }
  };

  const errorFor = (field) => submitted && errors[field];

  const inputClass =
    'w-full rounded-md border border-coal/12 bg-white px-4 py-3 text-sm outline-none transition focus:border-brass focus:ring-2 focus:ring-brass/15';

  const selectClass =
    'w-full rounded-md border border-coal/12 bg-white px-4 py-3 text-sm outline-none transition focus:border-brass focus:ring-2 focus:ring-brass/15';

  return (
    <>
      {/* Toast notification (Req 8.2, 8.3) */}
      {status.message && (
        <div
          className="fixed inset-x-0 top-4 z-50 flex justify-center px-4"
          role={status.type === 'error' ? 'alert' : 'status'}
          aria-live={status.type === 'error' ? 'assertive' : 'polite'}
        >
          <div
            className={`flex max-w-md items-start gap-3 rounded-xl border px-4 py-3 shadow-lg ${
              status.type === 'success'
                ? 'border-green-200 bg-green-50 text-green-800'
                : 'border-red-200 bg-red-50 text-red-800'
            }`}
          >
            {status.type === 'success' ? (
              <CheckCircle2 size={18} className="mt-0.5 shrink-0 text-green-600" />
            ) : (
              <AlertCircle size={18} className="mt-0.5 shrink-0 text-red-600" />
            )}
            <p className="text-sm font-medium">{status.message}</p>
            <button
              type="button"
              onClick={() => setStatus({ type: '', message: '' })}
              aria-label="Dismiss notification"
              className="ml-2 shrink-0 rounded p-0.5 opacity-60 transition hover:opacity-100"
            >
              <X size={16} />
            </button>
          </div>
        </div>
      )}
      {/* Enhanced Header with Trust Signals */}
      <div className="mb-8">
        <div className="text-center">
          <div className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-brass/20 text-brass">
            <TrendingUp className="mr-2" /> Free Consultation
          </div>
          <h2 className="mt-4 font-display text-3xl font-bold text-ink">
            Let's Build Something Amazing Together
          </h2>
          <p className="mt-2 text-sm text-coal/60 max-w-xl mx-auto">
            Share your project vision and we\'ll provide expert guidance, transparent pricing, and a clear roadmap to bring your dream space to life.
          </p>
        </div>

        {/* Trust Badges */}
        <div className="mt-6 flex flex-wrap justify-center gap-4">
          <div className="flex items-center px-4 py-2 rounded-md border border-coal/8 bg-white/50 text-xs text-coal/60">
            <MapPin className="mr-2 h-4 w-4" /> PAN India Service
          </div>
          <div className="flex items-center px-4 py-2 rounded-md border border-coal/8 bg-white/50 text-xs text-coal/60">
            <Calendar className="mr-2 h-4 w-4" /> 24-Hour Response
          </div>
          <div className="flex items-center px-4 py-2 rounded-md border border-coal/8 bg-white/50 text-xs text-coal/60">
            <Paperclip className="mr-2 h-4 w-4" /> File Uploads
          </div>
        </div>
      </div>

      <form
        onSubmit={handleSubmit}
        ref={formRef}
        className="overflow-hidden rounded-xl border border-coal/8 bg-white shadow-lg"
      >
        {/* Header */}
        <div className="border-b border-coal/8 bg-ink/90 px-6 py-6 md:px-8">
          <p className="text-xs font-bold uppercase tracking-[0.18em] text-brass">
            Project Inquiry
          </p>
          <h3 className="mt-2 font-display text-xl font-semibold text-white">
            Tell us about your project
          </h3>
          <p className="mt-1 text-sm text-white/60">
            The more details you provide, the better we can serve you.
          </p>
        </div>

        {/* Honeypot field (Req 8.4): hidden from real users, off-screen and
            aria-hidden, with autocomplete off. Bots that auto-fill inputs will
            populate it and get silently rejected by the API. */}
        <div aria-hidden="true" className="absolute left-[-9999px] top-[-9999px] h-0 w-0 overflow-hidden" style={{ position: 'absolute' }}>
          <label htmlFor="website">Website (leave this field empty)</label>
          <input
            type="text"
            id="website"
            name="website"
            tabIndex={-1}
            autoComplete="off"
            value={values.website}
            onChange={handleChange}
          />
        </div>
        {/* Fields */}
        <div className="grid gap-6 p-6 md:grid-cols-2 md:p-8">
          {/* Name */}
          <label className="grid gap-2">
            <span className="text-sm font-semibold text-ink flex items-center gap-2">
              Full Name
              <span className="text-burgundy">*</span>
            </span>
            <input
              name="name"
              value={values.name}
              onChange={handleChange}
              className={inputClass}
              placeholder="Your full name"
              autoComplete="name"
            />
            {errorFor('name') && (
              <span className="text-xs text-red-600">{errors.name}</span>
            )}
          </label>

          {/* Phone */}
          <label className="grid gap-2">
            <span className="text-sm font-semibold text-ink flex items-center gap-2">
              Phone
              <span className="text-burgundy">*</span>
            </span>
            <input
              name="phone"
              value={values.phone}
              onChange={handleChange}
              className={inputClass}
              placeholder="+91 00000 00000"
              autoComplete="tel"
              inputMode="tel"
            />
            {errorFor('phone') && (
              <span className="text-xs text-red-600">{errors.phone}</span>
            )}
          </label>

          {/* Email */}
          <label className="grid gap-2">
            <span className="text-sm font-semibold text-ink flex items-center gap-2">
              Email
            </span>
            <input
              name="email"
              value={values.email}
              onChange={handleChange}
              className={inputClass}
              placeholder="you@example.com"
              autoComplete="email"
            />
            {errorFor('email') && (
              <span className="text-xs text-red-600">{errors.email}</span>
            )}
          </label>

          {/* Project Type with Icons */}
          <label className="grid gap-2">
            <span className="text-sm font-semibold text-ink flex items-center gap-2">
              Project Type
              <span className="text-burgundy">*</span>
            </span>
            <select
              name="projectType"
              value={values.projectType}
              onChange={handleChange}
              className={selectClass}
            >
              <option value="">Select project type</option>
              {projectTypes.map(({ value, label, icon }) => (
                <option key={value} value={value}>
                  {label}
                </option>
              ))}
            </select>
            {errorFor('projectType') && (
              <span className="text-xs text-red-600">{errors.projectType}</span>
            )}
          </label>

          {/* Budget Range */}
          <label className="grid gap-2">
            <span className="text-sm font-semibold text-ink flex items-center gap-2">
              Budget Range
              <span className="text-burgundy">*</span>
            </span>
            <select
              name="budget"
              value={values.budget}
              onChange={handleChange}
              className={selectClass}
            >
              <option value="">Select budget range</option>
              {budgetRanges.map(({ value, label }) => (
                <option key={value} value={value}>
                  {label}
                </option>
              ))}
            </select>
            {errorFor('budget') && (
              <span className="text-xs text-red-600">{errors.budget}</span>
            )}
          </label>

          {/* Timeline */}
          <label className="grid gap-2">
            <span className="text-sm font-semibold text-ink flex items-center gap-2">
              Preferred Start Date
            </span>
            <input
              name="timeline"
              value={values.timeline}
              onChange={handleChange}
              className={inputClass}
              placeholder='e.g., "Next month", "ASAP", "Q3 2024"'
            />
            {errorFor('timeline') && (
              <span className="text-xs text-red-600">{errors.timeline}</span>
            )}
          </label>

          {/* Message */}
          <label className="grid gap-2 md:col-span-2">
            <span className="text-sm font-semibold text-ink flex items-center gap-2">
              Project Details
            </span>
            <textarea
              name="message"
              value={values.message}
              onChange={handleChange}
              rows="5"
              className={`${inputClass} resize-none`}
              placeholder="Describe your project: location, size, specific requirements, design preferences, timeline concerns..."
            />
          </label>

          {/* File Upload */}
          <label className="grid gap-2 md:col-span-2">
            <div className="flex items-start gap-3">
              <div className="flex-shrink-0">
                <Paperclip className="h-5 w-5 text-burgundy mt-1" />
              </div>
              <div>
                <span className="text-sm font-semibold text-ink flex items-center gap-2">
                  Upload Reference Files
                </span>
                <p className="mt-1 text-xs text-coal/60">
                  Upload images, PDFs, or videos to help us better understand your project.
                </p>
              </div>
            </div>

            <div className="mt-3">
              <input
                type="file"
                multiple
                accept="image/*,.pdf,video/*"
                onChange={handleFileChange}
                className="mb-2"
              />
              {uploadedFiles.length > 0 && (
                <div className="mt-3">
                  <p className="text-sm font-medium text-ink mb-2">Uploaded Files:</p>
                  <div className="grid gap-3">
                    {uploadedFiles.map((file, index) => (
                      <div
                        key={index}
                        className="border border-coal/8 rounded-lg p-3 flex items-center gap-3 hover:border-brass/30 transition-all duration-200"
                      >
                        {file.type.startsWith('image/') && (
                          <img
                            src={file.preview}
                            alt={file.name}
                            className="h-12 w-12 object-cover rounded"
                            loading="lazy"
                          />
                        )}
                        {!file.type.startsWith('image/') && (
                          <div className="flex-shrink-0 h-12 w-12 flex items-center justify-center border border-coal/8 rounded-lg bg-coal/5">
                            {file.type === 'application/pdf' && (
                              <svg className="h-6 w-6 text-coal" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z" />
                                <polyline strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} points="14 2 14 8 20 8" />
                                <line strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} x1="16" y1="4" x2="16" y2="20" />
                              </svg>
                            )}
                            {file.type.startsWith('video/') && (
                              <svg className="h-6 w-6 text-coal" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <polygon points="5 3 19 12 5 21 5 3" />
                              </svg>
                            )}
                          </div>
                        )}
                        <div className="flex-1">
                          <p className="text-sm font-medium">{file.name}</p>
                          <p className="text-xs text-coal/60">
                            {Math.round(file.size / 1024)} KB • {file.type.split('/')[1].toUpperCase()}
                          </p>
                        </div>
                        <button
                          onClick={() => removeFile(index)}
                          className="p-1 rounded-md hover:bg-coal/100 hover:text-burgundy transition-colors duration-200"
                          title="Remove file"
                        >
                          <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                          </svg>
                        </button>
                      </div>
                    ))}
                  </div>
                  {uploadedFiles.length >= 5 && (
                    <p className="mt-2 text-xs text-coal/60 text-center">
                      Maximum 5 files reached. Remove some to add more.
                    </p>
                  )}
                </div>
              )}
            </div>
          </label>
        </div>

        {/* Status */}
        {status.message && (
          <div className="px-6 md:px-8">
            <p
              className={`rounded-md px-4 py-3 text-sm font-semibold ${
                status.type === 'success'
                  ? 'bg-green-50 text-green-700'
                  : 'bg-red-50 text-red-700'
              }`}
            >
              {status.message}
            </p>
          </div>
        )}

        {/* Submit */}
        <div className="px-6 pb-8 pt-4 md:px-8 md:pb-8">
          {/* Cloudflare Turnstile (renders only when VITE_TURNSTILE_SITE_KEY is set) */}
          <Turnstile onVerify={handleTurnstileVerify} />
          <div className="mt-4 flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
            <Button
              className="w-full sm:w-auto gap-2 disabled:cursor-not-allowed disabled:opacity-60"
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <>
                  Submitting... <Loader2 size={15} className="animate-spin" />
                </>
              ) : (
                <>
                  Submit Inquiry <Send size={15} />
                </>
              )}
            </Button>

            {/* Alternative contact options */}
            <div className="flex sm:hidden w-full justify-center">
              <a
                href={company.phoneHref}
                className="flex items-center gap-2 rounded-md bg-white px-3 py-2 text-sm font-semibold text-ink transition hover:bg-brass/50"
              >
                <Phone size={16} /> Call Now
              </a>
              <a
                href={company.whatsapp}
                target="_blank"
                rel="noreferrer"
                className="flex items-center gap-2 rounded-md border border-white/20 px-3 py-2 text-sm font-semibold text-white transition hover:border-brass hover:text-brass"
              >
                WhatsApp
              </a>
            </div>
          </div>

          {/* Privacy notice */}
          <div className="mt-4 text-center text-xs text-coal/50">
            We respect your privacy. Your information is secure and will only be used to contact you about your project inquiry.
          </div>
        </div>
      </form>

      {/* Success Animation (shows after successful submission) */}
      {status.type === 'success' && !isSubmitting && !submitted && (
        <div className="mt-6 text-center">
          <div className="inline-flex items-center justify-center h-12 w-12 rounded-full bg-green-50 text-green-600 mx-auto mb-3">
            <Send className="h-6 w-6" />
          </div>
          <p className="font-medium text-green-700">Your inquiry has been sent successfully!</p>
        </div>
      )}
    </>
  );
}

// Define company details for contact links
const company = {
  phoneHref: `tel:${import.meta.env.VITE_COMPANY_PHONE || '918511003888'}`,
  whatsapp: import.meta.env.VITE_COMPANY_WHATSAPP || 'https://wa.me/918511003888'
};






