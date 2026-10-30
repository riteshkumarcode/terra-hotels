import React from "react";
import { HeroSlider } from "@/components/home/HeroSlider";
import { PerksMarquee } from "@/components/home/PerksMarquee";
import { IntroSection } from "@/components/home/IntroSection";
import { DestinationsSlider } from "@/components/home/DestinationsSlider";
import { FeaturedHotel } from "@/components/home/FeaturedHotel";
import { RoomsSlider } from "@/components/home/RoomsSlider";
import { ExperiencesMosaic } from "@/components/home/ExperiencesMosaic";
import { OffersSection } from "@/components/home/OffersSection";
import { WeddingsBand } from "@/components/home/WeddingsBand";
import { JournalSection } from "@/components/home/JournalSection";
import { CircleSection } from "@/components/home/CircleSection";

export default function HomePage() {
  return (
    <>
      <HeroSlider />
      <PerksMarquee />
      <IntroSection />
      <DestinationsSlider />
      <FeaturedHotel />
      <RoomsSlider />
      <ExperiencesMosaic />
      <OffersSection />
      <WeddingsBand />
      <JournalSection />
      <CircleSection />
    </>
  );
}
