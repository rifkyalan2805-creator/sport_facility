import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import PageNav from "@/components/PageNav";
import MembershipWizard from "@/components/membership/MembershipWizard";

export default function MembershipDaftarPage() {
  return (
    <>
      <Navbar />
      <main className="mx-auto max-w-5xl px-6 pb-24 pt-28">
        <PageNav variant="cta" className="mb-6" />
        <MembershipWizard />
      </main>
      <Footer />
    </>
  );
}
