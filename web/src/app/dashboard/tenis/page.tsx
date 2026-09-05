"use client";

import Link from "next/link";
import BookingList from "@/components/dashboard/BookingList";
import { Card, PageHeading } from "@/components/dashboard/common";

export default function InsidentilTenisPage() {
  return (
    <div className="space-y-6">
      <PageHeading
        title="Insidentil Tenis"
        desc="Booking lapangan tenis sekali jalan — di luar paket abonemen."
        action={
          <Link
            href="/booking/tennis"
            className="shrink-0 rounded-full bg-ink-900 px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-neon-pink"
          >
            + Booking Tenis
          </Link>
        }
      />

      <Card title="Booking Saya">
        <BookingList
          filters={{ court_type: "tennis", booking_type: "insidentil" }}
          hideType
          emptyText="Belum ada booking tenis insidentil."
          ctaHref="/booking/tennis"
          ctaLabel="Booking Lapangan Tenis"
        />
      </Card>
    </div>
  );
}
