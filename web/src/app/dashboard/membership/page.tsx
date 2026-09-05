"use client";

import Link from "next/link";
import { ActiveMemberCard, MembershipHistory } from "@/components/dashboard/MembershipPanel";
import { Card, PageHeading } from "@/components/dashboard/common";

export default function MembershipDashboardPage() {
  return (
    <div className="space-y-6">
      <PageHeading
        title="Membership Kolam"
        desc="Kartu member, masa berlaku, dan riwayat langgananmu."
        action={
          <Link
            href="/membership/daftar"
            className="shrink-0 rounded-full border border-ink-900/15 bg-white px-5 py-2.5 text-sm font-semibold text-ink-900 transition-colors hover:bg-ink-900/5"
          >
            Perpanjang / Daftar
          </Link>
        }
      />

      <Card title="Kartu Member">
        <ActiveMemberCard />
      </Card>

      <Card title="Riwayat Membership">
        <MembershipHistory />
      </Card>
    </div>
  );
}
