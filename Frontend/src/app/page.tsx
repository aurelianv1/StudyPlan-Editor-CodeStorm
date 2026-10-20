import { AiEditingSection, DocEditingSection, SupportSection } from "@/components/home/FeatureSections";
import { HeroSection } from "@/components/home/HeroSection";
import { Navbar } from "@/components/home/Navbar";
import { Divider, PageFooter } from "@/components/layout";

export default function HomePage() {
  return (
    <div className="bg-[#0a0a0a] text-white font-sans">
      <Navbar />
      <HeroSection />
      <Divider />
      <AiEditingSection />
      <Divider />
      <DocEditingSection />
      <Divider />
      <SupportSection />
      <PageFooter />
    </div>
  );
}
