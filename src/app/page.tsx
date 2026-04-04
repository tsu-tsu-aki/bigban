import { LanguageProvider } from "@/hooks/useLanguage";
import HomeNavigation from "@/components/home/HomeNavigation";
import HomeHero from "@/components/home/HomeHero";
import HomeConcept from "@/components/home/HomeConcept";
import HomeFacility from "@/components/home/HomeFacility";
import HomeServices from "@/components/home/HomeServices";
import HomePricing from "@/components/home/HomePricing";
import HomeAbout from "@/components/home/HomeAbout";
import HomeAccess from "@/components/home/HomeAccess";
import HomeFooter from "@/components/home/HomeFooter";

export default function Home() {
  return (
    <LanguageProvider>
      <main>
        <HomeNavigation />
        <HomeHero />
        <HomeConcept />
        <HomeFacility />
        <HomeServices />
        <HomePricing />
        <HomeAbout />
        <HomeAccess />
        <HomeFooter />
      </main>
    </LanguageProvider>
  );
}
