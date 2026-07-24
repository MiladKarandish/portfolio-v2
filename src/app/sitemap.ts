import type { MetadataRoute } from "next";
import { person } from "@/data/profile";

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? person.site;

export default function sitemap(): MetadataRoute.Sitemap {
  const lastModified = new Date();

  return [
    { url: siteUrl, lastModified, priority: 1 },
    { url: `${siteUrl}/experience`, lastModified, priority: 0.9 },
    { url: `${siteUrl}/projects`, lastModified, priority: 0.9 },
    { url: `${siteUrl}/resume`, lastModified, priority: 0.8 },
    /* /honest is deliberately absent — it is linked from the nav for people who
       are already here, but it is not something a search for the name should
       surface. It also sets `robots: noindex` in its own metadata. */
    { url: `${siteUrl}/contact`, lastModified, priority: 0.7 },
  ];
}
