export default function SectionHeading({ eyebrow, title, text, align = 'left', light = false }) {
  const centered = align === 'center';

  return (
    <div className={`${centered ? 'mx-auto text-center' : ''} max-w-2xl`}>
      {eyebrow && (
        <p className={`text-xs font-bold uppercase tracking-[0.18em] ${light ? 'text-brass' : 'text-brass'}`}>
          {eyebrow}
        </p>
      )}
      <h2
        className={`mt-3 font-display text-3xl font-semibold leading-tight md:text-4xl ${
          light ? 'text-white' : 'text-ink'
        }`}
      >
        {title}
      </h2>
      {text && (
        <p className={`mt-4 text-sm leading-7 ${light ? 'text-white/65' : 'text-coal/65'}`}>
          {text}
        </p>
      )}
      <div className={`gold-line mt-5 ${centered ? 'mx-auto' : ''}`} />
    </div>
  );
}
