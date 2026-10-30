import { Metadata } from "next";
import { notFound } from "next/navigation";
import { SAMPLE_HOTELS } from "@/lib/sample-data";
import { HotelDetailClient } from "@/components/hotel/HotelDetailClient";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const hotel = SAMPLE_HOTELS.find((h) => h.slug === slug || h.id === slug);
  if (!hotel) return { title: "Hotel Not Found | Terraa Hotels" };

  return {
    title: `${hotel.name} · ${hotel.city} | Terraa Hotels`,
    description: hotel.blurb,
    openGraph: {
      title: `${hotel.name} · ${hotel.city} | Terraa Hotels`,
      description: hotel.blurb,
      images: [{ url: hotel.images[0]?.url || "/img/hero-palace.jpg", width: 1200, height: 630 }],
    },
  };
}

export function generateStaticParams() {
  return SAMPLE_HOTELS.map((h) => ({
    slug: h.slug,
  }));
}

export default async function HotelPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const hotel = SAMPLE_HOTELS.find((h) => h.slug === slug || h.id === slug);

  if (!hotel) {
    notFound();
  }

  // JSON-LD Structured Data
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Hotel",
    name: hotel.name,
    description: hotel.blurb,
    image: hotel.images.map((img) => `https://terraa-hotels.netlify.app${img.url}`),
    address: {
      "@type": "PostalAddress",
      streetAddress: hotel.address,
      addressLocality: hotel.city,
      addressRegion: hotel.state,
      addressCountry: "IN",
    },
    priceRange: `INR ${hotel.basePrice / 100}`,
    aggregateRating: {
      "@type": "AggregateRating",
      ratingValue: hotel.rating,
      reviewCount: hotel.reviewsCount.replace(",", ""),
    },
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <HotelDetailClient hotel={hotel} />
    </>
  );
}
