"use client";

import AbonemenPackagesCard from "@/components/dashboard/AbonemenPackages";
import {
  AbonemenHistoryCard,
  AbonemenStatusBanner,
} from "@/components/dashboard/AbonemenStatus";
import BookingList from "@/components/dashboard/BookingList";
import { Card, PageHeading } from "@/components/dashboard/common";

export default function AbonemenDashboardPage() {
  return (
    <div className="space-y-6">
      <PageHeading
        title="Abonemen Tenis"
        desc="Status keanggotaan dan jadwal tenis yang kamu pakai dengan tarif abonemen."
      />

      <Card title="Status Keanggotaan">
        <AbonemenStatusBanner />
      </Card>

      <Card title="Jadwal dengan Tarif Abonemen">
        <BookingList
          filters={{ court_type: "tennis", booking_type: "abonemen" }}
          hideType
          emptyText="Belum ada booking tenis dengan tarif abonemen."
          ctaHref="/booking/tennis"
          ctaLabel="Booking Lapangan Tenis"
        />
      </Card>

      {/* Dua kartu di bawah menyembunyikan diri saat datanya kosong. */}
      <AbonemenPackagesCard />
      <AbonemenHistoryCard />
    </div>
  );
}
