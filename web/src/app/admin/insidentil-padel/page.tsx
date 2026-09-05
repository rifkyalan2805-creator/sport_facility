"use client";

import InsidentilList from "@/components/admin/InsidentilList";

export default function AdminInsidentilPadelPage() {
  return (
    <InsidentilList
      // Enum court_type di DB memakai ejaan "paddle".
      courtType="paddle"
      title="Insidentil Padel"
      description="Booking padel sekali main (non-abonemen), terbaru di atas."
    />
  );
}
