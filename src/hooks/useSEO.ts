import { useEffect } from "react";

type SEOProps = {
  title?: string;
  description?: string;
  keywords?: string;
  image?: string;
  url?: string;
  type?: string;
  movie?: {
    title: string;
    description: string;
    image?: string;
    releaseDate?: string;
    rating?: number;
    director?: string;
    actors?: string[];
  };
};

const DEFAULT_TITLE = "AmayStream - Streaming Film Gratis Tanpa Iklan";
const DEFAULT_DESCRIPTION =
  "Streaming film gratis tanpa iklan. Tonton film terbaru dan populer dengan kualitas HD. Platform streaming film Indonesia terbaik.";
const DEFAULT_IMAGE = "/og-image.jpg";
const BASE_URL = "https://amaystream.vercel.app";

export function useSEO({
  title,
  description,
  keywords,
  image,
  url,
  type = "website",
  movie,
}: SEOProps) {
  useEffect(() => {
    const fullTitle = title
      ? `${title} | AmayStream`
      : DEFAULT_TITLE;
    const metaDescription = description || DEFAULT_DESCRIPTION;
    const metaImage = image || DEFAULT_IMAGE;
    const metaUrl = url || BASE_URL;
    const metaKeywords = keywords || "streaming film, film gratis, nonton film, film indonesia, movie streaming";

    // Update document title
    document.title = fullTitle;

    // Remove existing meta tags
    const existingTags = document.querySelectorAll('meta[data-seo="true"]');
    existingTags.forEach((tag) => tag.remove());

    // Create and append meta tags
    const metaTags = [
      { name: "description", content: metaDescription },
      { name: "keywords", content: metaKeywords },
      { property: "og:title", content: fullTitle },
      { property: "og:description", content: metaDescription },
      { property: "og:image", content: metaImage.startsWith("http") ? metaImage : `${BASE_URL}${metaImage}` },
      { property: "og:url", content: metaUrl },
      { property: "og:type", content: type },
      { property: "og:site_name", content: "AmayStream" },
      { name: "twitter:card", content: "summary_large_image" },
      { name: "twitter:title", content: fullTitle },
      { name: "twitter:description", content: metaDescription },
      { name: "twitter:image", content: metaImage.startsWith("http") ? metaImage : `${BASE_URL}${metaImage}` },
    ];

    metaTags.forEach(({ name, property, content }) => {
      const tag = document.createElement("meta");
      if (name) tag.setAttribute("name", name);
      if (property) tag.setAttribute("property", property);
      tag.setAttribute("content", content);
      tag.setAttribute("data-seo", "true");
      document.head.appendChild(tag);
    });

    // Add canonical URL
    let canonical = document.querySelector('link[rel="canonical"]');
    if (!canonical) {
      canonical = document.createElement("link");
      canonical.setAttribute("rel", "canonical");
      document.head.appendChild(canonical);
    }
    canonical.setAttribute("href", metaUrl);

    // Add structured data
    let scriptTag = document.querySelector('script[type="application/ld+json"][data-seo="true"]');
    if (!scriptTag) {
      scriptTag = document.createElement("script");
      scriptTag.setAttribute("type", "application/ld+json");
      scriptTag.setAttribute("data-seo", "true");
      document.head.appendChild(scriptTag);
    }

    if (movie) {
      // Movie structured data
      const structuredData = {
        "@context": "https://schema.org",
        "@type": "Movie",
        name: movie.title,
        description: movie.description,
        image: movie.image || metaImage,
        datePublished: movie.releaseDate,
        aggregateRating: movie.rating
          ? {
              "@type": "AggregateRating",
              ratingValue: movie.rating,
              bestRating: "10",
              worstRating: "1",
            }
          : undefined,
        director: movie.director
          ? {
              "@type": "Person",
              name: movie.director,
            }
          : undefined,
        actor: movie.actors?.map((name) => ({
          "@type": "Person",
          name: name,
        })),
      };
      scriptTag.textContent = JSON.stringify(structuredData);
    } else {
      // Website structured data for homepage
      const structuredData = {
        "@context": "https://schema.org",
        "@type": "WebSite",
        name: "AmayStream",
        description: metaDescription,
        url: BASE_URL,
        potentialAction: {
          "@type": "SearchAction",
          target: {
            "@type": "EntryPoint",
            urlTemplate: `${BASE_URL}/?search={search_term_string}`,
          },
          "query-input": "required name=search_term_string",
        },
      };
      scriptTag.textContent = JSON.stringify(structuredData);
    }
  }, [title, description, keywords, image, url, type, movie]);
}

