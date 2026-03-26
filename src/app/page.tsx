import Navigation from "@/components/Navigation";
import Hero from "@/components/Hero";
import Introduction from "@/components/Introduction";
import KeyNumbers from "@/components/KeyNumbers";
import Concept from "@/components/Concept";
import Services from "@/components/Services";
import Founder from "@/components/Founder";
import Footer from "@/components/Footer";

export default function Home() {
  return (
    <main>
      <Navigation />
      <Hero />
      <Introduction />
      <KeyNumbers />
      <Concept />
      <Services />
      <Founder />
      <Footer />
    </main>
  );
}
