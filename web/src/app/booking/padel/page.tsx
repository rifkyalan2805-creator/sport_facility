import type { Metadata } from "next";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import PadelBooking from "@/components/booking/PadelBooking";

export const metadata: Metadata = {
  title: "Booking Lapangan Padel — SportHub",
  description: "Pilih lapangan padel, tanggal, dan slot waktu. Harga off-peak lebih hemat.",
};

export default function BookingPadelPage() {
  return (
    <>
      <Navbar />
      <main>
        <PadelBooking />
      </main>
      <Footer />
    </>
  );
}
