import GamerBhiduNavbar from "@/components/sections/gamerbhidu-navbar";
import FAQ from "@/components/sections/faq";
import Footer from "@/components/sections/footer";

export const metadata = {
  title: "FAQ | Gamer Bhidu",
  description: "Frequently Asked Questions about purchasing original Steam games files, activation, and delivery.",
};

export default function FAQPage() {
  return (
    <main className="min-h-screen bg-background flex flex-col justify-between">
      <div>
        <GamerBhiduNavbar />
        <div className="py-6 md:py-10">
          <FAQ />
        </div>
      </div>
      <Footer />
    </main>
  );
}
