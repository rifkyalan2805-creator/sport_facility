"use client";

import Link from "next/link";
import { formatRupiah, formatDateID } from "@/lib/format";
import type { EventItem } from "@/lib/queries";

export default function EventCard({ event }: { event: EventItem }) {
  const free = Number(event.price) <= 0;
  const remaining = Math.max(0, event.quota - event.registered_count);
  const full = remaining === 0;
  const color = event.event_categories?.color ?? "#6366f1";

  return (
    <Link
      href={`/events/${event.slug}`}
      className="group flex flex-col overflow-hidden rounded-3xl border border-ink-900/10 bg-white outline-none transition-colors duration-200 hover:border-ink-900/25 focus-visible:ring-4 focus-visible:ring-neon-purple/30"
    >
      <div className="relative aspect-[16/10] overflow-hidden bg-ink-900/5">
        {event.banner_url ? (
          /* eslint-disable-next-line @next/next/no-img-element */
          <img
            src={encodeURI(event.banner_url)}
            alt={event.title}
            loading="lazy"
            className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
          />
        ) : null}
        {event.event_categories && (
          <span
            className="absolute left-3 top-3 rounded-full px-2.5 py-1 text-xs font-semibold text-white"
            style={{ backgroundColor: color }}
          >
            {event.event_categories.name}
          </span>
        )}
        <span
          className={`absolute right-3 top-3 rounded-full px-2.5 py-1 text-xs font-semibold ${
            free ? "bg-green-500 text-white" : "bg-white/90 text-ink-900"
          }`}
        >
          {free ? "Gratis" : formatRupiah(event.price)}
        </span>
      </div>

      <div className="flex flex-1 flex-col p-5">
        <h3 className="text-lg font-semibold leading-snug text-ink-900">{event.title}</h3>
        <p className="mt-2 text-sm text-ink-500">
          {formatDateID(event.event_date)}
          {event.location ? ` · ${event.location}` : ""}
        </p>
        <div className="mt-4 flex items-center justify-between">
          <span className={`text-sm font-medium ${full ? "text-red-500" : "text-ink-600"}`}>
            {full ? "Kuota penuh" : `${remaining} kursi tersisa`}
          </span>
          <span className="text-sm font-semibold text-neon-purple transition-colors group-hover:text-neon-pink">
            Detail →
          </span>
        </div>
      </div>
    </Link>
  );
}
