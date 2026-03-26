import Navigation from "@/components/Navigation";
import ServicesHero from "@/components/services/ServicesHero";
import ServicesList from "@/components/services/ServicesList";
import BottomCTA from "@/components/services/BottomCTA";
import Footer from "@/components/Footer";

export default function ServicesPage() {
  return (
    <main>
      <Navigation />
      <ServicesHero />
      <ServicesList />
      <BottomCTA />
      <Footer />
    </main>
  );
}
