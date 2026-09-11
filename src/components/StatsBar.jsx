import { Award, Briefcase, CheckCircle, Users } from 'lucide-react';
import { stats } from '../data/site';

const icons = { Award, Briefcase, CheckCircle, Users };

export default function StatsBar() {
  return (
    <section className="border-y border-white/8 bg-ink py-14">
      <div className="container-shell">
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {stats.map((stat) => {
            const Icon = icons[stat.icon] ?? CheckCircle;

            return (
              <div
                key={stat.label}
                className="group flex items-center gap-4 rounded-lg border border-white/8 bg-white/[0.03] p-5 transition-all duration-500 hover:border-brass/25 hover:bg-white/[0.06] hover:shadow-lg float-on-hover"
              >
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-lg bg-burgundy/15">
                  <Icon className="text-brass" size={22} />
                </div>
                <div>
                  <p className="font-display text-xl font-semibold text-white">{stat.value}</p>
                  <p className="mt-0.5 text-xs font-medium text-white/50">{stat.label}</p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
