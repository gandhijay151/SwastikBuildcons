export default function ProjectCard({ project }) {
  return (
    <article className="group overflow-hidden rounded-lg border border-coal/8 bg-white shadow-crisp transition duration-300 hover:-translate-y-1 hover:shadow-soft">
      {project.image && (
        <div className="relative aspect-[4/3] overflow-hidden bg-ink">
          <img
            src={project.image}
            alt={project.title}
            className="h-full w-full object-cover transition duration-700 group-hover:scale-105"
            loading="lazy"
            decoding="async"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-ink/50 via-transparent to-transparent" />
          <span className="absolute left-4 top-4 rounded-md bg-burgundy px-3 py-1 text-[11px] font-bold uppercase tracking-wider text-white">
            {project.category}
          </span>
        </div>
      )}
      <div className="p-5">
        <h3 className="font-display text-lg font-semibold text-ink">{project.title}</h3>
        <p className="mt-2 text-sm leading-6 text-coal/60">{project.note}</p>
      </div>
    </article>
  );
}
