"use client";

import BookingList from "@/components/dashboard/BookingList";
import {
  EventRegistrations,
  PoolTickets,
  WaitingList,
} from "@/components/dashboard/OtherActivity";
import { Card, PageHeading } from "@/components/dashboard/common";

export default function AktivitasPage() {
  return (
    <div className="space-y-6">
      <PageHeading
        title="Aktivitas Lain"
        desc="Padel, tiket kolam, event, dan antrean slot."
      />

      <Card title="Booking Padel">
        <BookingList
          filters={{ court_type: "paddle" }}
          emptyText="Belum ada booking padel."
          ctaHref="/booking/padel"
          ctaLabel="Booking Lapangan Padel"
        />
      </Card>

      <Card title="Tiket Kolam">
        <PoolTickets />
      </Card>

      <Card title="Event">
        <EventRegistrations />
      </Card>

      <Card title="Antrean Slot">
        <WaitingList />
      </Card>
    </div>
  );
}
