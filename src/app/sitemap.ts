import { MetadataRoute } from "next";
import { SAMPLE_HOTELS } from "@/lib/sample-data";

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = "https://terraa-hotels.netlify.app";

  const staticRoutes: MetadataRoute.Sitemap = [
    {
      url: `${baseUrl}`,
      lastModified: new Date(),
      changeFrequency: "daily",
      priority: 1.0,
    },
    {
      url: `${baseUrl}/hotels`,
      lastModified: new Date(),
      changeFrequency: "daily",
      priority: 0.9,
    },
  ];

  const hotelRoutes: MetadataRoute.Sitemap = SAMPLE_HOTELS.map((h) => ({
    url: `${baseUrl}/hotels/${h.slug}`,
    lastModified: new Date(),
    changeFrequency: "weekly",
    priority: 0.8,
  }));

  return [...staticRoutes, ...hotelRoutes];
}
