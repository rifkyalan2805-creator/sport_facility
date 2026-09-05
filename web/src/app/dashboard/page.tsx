"use client";

import Link from "next/link";
import BookingList from "@/components/dashboard/BookingList";
import AbonemenPackagesCard from "@/components/dashboard/AbonemenPackages";
import { AbonemenStatusBanner } from "@/components/dashboard/AbonemenStatus";
import { ActiveMemberCard } from "@/components/dashboard/MembershipPanel";
import { Card, PageHeading } from "@/components/dashboard/common";
import { useAuth } from "@/lib/auth-context";
import { displayName } from "@/lib/user";

function LihatSemua({ href }: { href: string }) {
  return (
    <Link
      href={href}
      className="text-sm font-medium text-neon-purple transition-colors hover:text-neon-pink"
    >
      Lihat semua →
    </Link>
  );
}

export default function DashboardPage() {
  const { user } = useAuth();
  const nama = displayName(user);

  return (
    <div className="space-y-6">
      <PageHeading
        title={`Halo, ${nama}`}
        desc="Ringkasan keanggotaan dan jadwal terdekatmu."
        action={
          <Link
            href="/booking/padel"
            className="shrink-0 rounded-full bg-ink-900 px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-neon-pink"
          >
            + Booking baru
          </Link>
        }
      />

      <Card title="Membership Kolam" action={<LihatSemua href="/dashboard/membership" />}>
        <ActiveMemberCard />
      </Card>

      <Card title="Abonemen Tenis" action={<LihatSemua href="/dashboard/abonemen" />}>
        <AbonemenStatusBanner />
      </Card>

      {/* Menyembunyikan diri kalau tidak ada paket prabayar. */}
      <AbonemenPackagesCard limit={2} />

      <Card title="Booking Terdekat" action={<LihatSemua href="/dashboard/aktivitas" />}>
        <BookingList
          limit={5}
          emptyText="Belum ada booking."
          ctaHref="/booking/padel"
          ctaLabel="Booking Lapangan"
        />
      </Card>
    </div>
  );
}
