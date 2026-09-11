export default function ServiceCard({ service }) {
  const Icon = service.icon;

  return (
    <article className="group rounded-lg border border-coal/8 bg-white p-6 shadow-crisp transition-all duration-500 hover:-translate-y-2 hover:border-brass/40 hover:shadow-lg float-on-hover button-shine">
      <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-ink text-brass transition-all duration-500 group-hover:bg-burgundy group-hover:text-white hover:shadow-inner">
        <Icon size={24} className="transition-transform duration-500 group-hover:scale-110" />
      </div>
      <h3 className="mt-5 text-base font-bold text-ink transition-transform duration-500 group-hover:scale-105">{service.title}</h3>
      <p className="mt-3 text-sm leading-7 text-coal/60">{service.text}</p>
    </article>
  );
}
