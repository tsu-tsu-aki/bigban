import Navigation from "@/components/Navigation";
import FacilityHero from "@/components/facility/FacilityHero";
import FacilityStory from "@/components/facility/FacilityStory";
import CourtDetails from "@/components/facility/CourtDetails";
import Amenities from "@/components/facility/Amenities";
import FounderDetail from "@/components/facility/FounderDetail";
import CompanyInfo from "@/components/facility/CompanyInfo";
import Footer from "@/components/Footer";

export default function FacilityPage() {
  return (
    <main>
      <Navigation />
      <FacilityHero />
      <FacilityStory />
      <CourtDetails />
      <Amenities />
      <FounderDetail />
      <CompanyInfo />
      <Footer />
    </main>
  );
}
