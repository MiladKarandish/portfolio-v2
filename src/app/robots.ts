import type { MetadataRoute } from "next";
import { person } from "@/data/profile";

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? person.site;

export default function robots(): MetadataRoute.Robots {
  return {
    rules: { userAgent: "*", allow: "/" },
    sitemap: `${siteUrl}/sitemap.xml`,
  };
}
